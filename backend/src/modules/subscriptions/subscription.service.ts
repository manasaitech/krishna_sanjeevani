import { eq, and, desc, gt } from "drizzle-orm";
import { getDB } from "../../shared/db/client";
import { plans, subscriptions, payments, users } from "../../shared/db/schema";
import { Env } from "../../shared/config/env";
import { PaymentProviderFactory } from "./payment.provider";
import { NotFoundError, ForbiddenError, ValidationError } from "../../shared/errors";

export class SubscriptionService {
  constructor(private env: Env) {}

  async listPlans() {
    const db = getDB(this.env);
    return await db
      .select()
      .from(plans)
      .where(eq(plans.isActive, 1));
  }

  async getActiveSubscription(userId: string) {
    const db = getDB(this.env);
    const result = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, "active"),
          gt(subscriptions.currentPeriodEnd, Date.now())
        )
      )
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);

    return result[0] || null;
  }

  async createOrder(userId: string, planId: string) {
    const db = getDB(this.env);

    // 1. Retrieve and validate plan
    const planResult = await db
      .select()
      .from(plans)
      .where(and(eq(plans.id, planId), eq(plans.isActive, 1)))
      .limit(1);

    const plan = planResult[0];
    if (!plan) {
      throw new NotFoundError("Plan not found or inactive");
    }

    // 2. Initialize provider
    const provider = PaymentProviderFactory.getProvider(this.env);
    
    // Price comes strictly from D1 database configuration, never trusted from client inputs
    const amount = plan.price;
    const currency = plan.currency || "INR";

    const order = await provider.createOrder(planId, amount, currency);

    // 3. Store payment record with pending status
    const paymentId = `pay_${crypto.randomUUID()}`;
    await db.insert(payments).values({
      id: paymentId,
      userId,
      planId,
      amount,
      currency,
      status: "pending",
      orderId: order.orderId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return {
      orderId: order.orderId,
      paymentId,
      amount,
      currency,
      planName: plan.name,
      paymentMode: this.env.PAYMENT_MODE || "mock",
    };
  }

  async verifyPayment(userId: string, orderId: string, paymentId: string, signature: string) {
    const db = getDB(this.env);

    // 1. Safety check: Block mock checks in production unless mock mode is active
    if (signature === "mock_success" || signature === "fail") {
      if (this.env.PAYMENT_MODE !== "mock") {
        throw new ForbiddenError("Simulated payment mode is disabled in this environment.");
      }
    }

    // 2. Retrieve the pending payment order record
    const paymentResult = await db
      .select()
      .from(payments)
      .where(and(eq(payments.orderId, orderId), eq(payments.userId, userId)))
      .limit(1);

    const paymentRecord = paymentResult[0];
    if (!paymentRecord) {
      throw new NotFoundError("Transaction record not found");
    }

    if (paymentRecord.status !== "pending") {
      throw new ValidationError(`Transaction already finalized with status: ${paymentRecord.status}`);
    }

    // 3. Perform verification
    const provider = PaymentProviderFactory.getProvider(this.env);
    const verification = await provider.verifyPayment(orderId, paymentId, signature);

    // 4. Update transaction status
    await db
      .update(payments)
      .set({
        status: verification.status,
        updatedAt: Date.now(),
      })
      .where(eq(payments.id, paymentRecord.id));

    if (verification.status === "completed") {
      // Create or renew subscription period
      const durationMs = 30 * 24 * 60 * 60 * 1000; // 30 Days interval period
      const start = Date.now();
      const end = start + durationMs;

      const subId = `sub_${crypto.randomUUID()}`;
      await db.insert(subscriptions).values({
        id: subId,
        userId,
        planId: paymentRecord.planId,
        status: "active",
        currentPeriodStart: start,
        currentPeriodEnd: end,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Update user role to match the subscription tier (standard/premium)
      await db
        .update(users)
        .set({
          role: paymentRecord.planId, // 'standard' or 'premium'
        })
        .where(eq(users.id, userId));

      return {
        success: true,
        status: "active",
        validUntil: end,
      };
    }

    return {
      success: false,
      status: "failed",
    };
  }

  async listUserPayments(userId: string) {
    const db = getDB(this.env);
    return await db
      .select({
        id: payments.id,
        planId: payments.planId,
        amount: payments.amount,
        currency: payments.currency,
        status: payments.status,
        orderId: payments.orderId,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt));
  }
}
