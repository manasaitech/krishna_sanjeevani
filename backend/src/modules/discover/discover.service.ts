import { eq, and, gt } from "drizzle-orm";
import { getDB } from "../../shared/db/client";
import { Env } from "../../shared/config/env";
import { 
  ailments, 
  surawalis, 
  timings, 
  ailmentSurawalis, 
  pregnancyMappings, 
  corporateRagas, 
  surawaliSubscriptions 
} from "../../shared/db/schema";
import { ValidationError, NotFoundError } from "../../shared/errors";

export class DiscoverService {
  constructor(private env: Env) {}

  // Fetch the full normalized catalogue to support instant, client-side bidirectional filters
  async getCatalog() {
    const db = getDB(this.env);

    const [
      allAilments,
      allSurawalis,
      allTimings,
      mappings,
      pregnancy,
      corporate
    ] = await Promise.all([
      db.select().from(ailments),
      db.select().from(surawalis),
      db.select().from(timings),
      db.select().from(ailmentSurawalis),
      db.select().from(pregnancyMappings),
      db.select().from(corporateRagas)
    ]);

    return {
      ailments: allAilments,
      surawalis: allSurawalis,
      timings: allTimings,
      ailmentSurawalis: mappings,
      pregnancyMappings: pregnancy,
      corporateRagas: corporate
    };
  }

  async getSurawaliDetails(id: string) {
    const db = getDB(this.env);

    const surawaliResult = await db
      .select()
      .from(surawalis)
      .where(eq(surawalis.id, id))
      .limit(1);

    const surawali = surawaliResult[0];
    if (!surawali) {
      throw new NotFoundError("Surawali not found");
    }

    // Find all mapped ailments
    const mappedAilments = await db
      .select({
        id: ailments.id,
        name: ailments.name,
        timingName: timings.name
      })
      .from(ailmentSurawalis)
      .innerJoin(ailments, eq(ailmentSurawalis.ailmentId, ailments.id))
      .innerJoin(timings, eq(ailmentSurawalis.timingId, timings.id))
      .where(eq(ailmentSurawalis.surawaliId, id));

    return {
      ...surawali,
      ailments: mappedAilments
    };
  }

  async createSubscription(userId: string, surawaliId: string, plan: string, paymentId: string) {
    const db = getDB(this.env);
    const now = Date.now();

    // 1. Verify Surawali exists
    const surawaliResult = await db
      .select()
      .from(surawalis)
      .where(eq(surawalis.id, surawaliId))
      .limit(1);

    if (surawaliResult.length === 0) {
      throw new NotFoundError("Surawali not found");
    }

    // 2. Check for existing active subscription
    const existing = await db
      .select()
      .from(surawaliSubscriptions)
      .where(
        and(
          eq(surawaliSubscriptions.userId, userId),
          eq(surawaliSubscriptions.surawaliId, surawaliId),
          eq(surawaliSubscriptions.status, "active"),
          gt(surawaliSubscriptions.endDate, now)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      throw new ValidationError(`You already have an active subscription to ${surawaliResult[0].name}.`);
    }

    // 3. Create active subscription
    const id = `ssub_${crypto.randomUUID()}`;
    const durationDays = plan.toLowerCase() === "yearly" ? 365 : 30;
    const endDate = now + durationDays * 24 * 60 * 60 * 1000;

    await db.insert(surawaliSubscriptions).values({
      id,
      userId,
      surawaliId,
      plan,
      status: "active",
      startDate: now,
      endDate,
      paymentId,
      paymentProvider: "mock",
      createdAt: now,
      updatedAt: now
    });

    return {
      subscriptionId: id,
      status: "active",
      endDate
    };
  }

  async listUserSubscriptions(userId: string) {
    const db = getDB(this.env);

    // List all subscriptions for this user joined with Surawali name
    const results = await db
      .select({
        id: surawaliSubscriptions.id,
        surawaliId: surawaliSubscriptions.surawaliId,
        surawaliName: surawalis.name,
        plan: surawaliSubscriptions.plan,
        status: surawaliSubscriptions.status,
        startDate: surawaliSubscriptions.startDate,
        endDate: surawaliSubscriptions.endDate,
        paymentId: surawaliSubscriptions.paymentId,
        createdAt: surawaliSubscriptions.createdAt
      })
      .from(surawaliSubscriptions)
      .innerJoin(surawalis, eq(surawaliSubscriptions.surawaliId, surawalis.id))
      .where(eq(surawaliSubscriptions.userId, userId));

    return results;
  }

  async cancelSubscription(userId: string, id: string) {
    const db = getDB(this.env);

    const existing = await db
      .select()
      .from(surawaliSubscriptions)
      .where(
        and(
          eq(surawaliSubscriptions.id, id),
          eq(surawaliSubscriptions.userId, userId)
        )
      )
      .limit(1);

    const sub = existing[0];
    if (!sub) {
      throw new NotFoundError("Subscription not found");
    }

    const now = Date.now();
    await db
      .update(surawaliSubscriptions)
      .set({
        status: "cancelled",
        updatedAt: now
      })
      .where(eq(surawaliSubscriptions.id, id));

    return {
      success: true,
      message: "Subscription cancelled successfully"
    };
  }
}
