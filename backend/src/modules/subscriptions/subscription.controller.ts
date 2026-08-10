import { Context } from "hono";
import { SubscriptionService } from "./subscription.service";
import { ValidationError } from "../../shared/errors";

export class SubscriptionController {
  static async listPlans(c: Context) {
    const service = new SubscriptionService(c.env);
    const plans = await service.listPlans();
    return c.json({ success: true, data: plans });
  }

  static async getMe(c: Context) {
    const userId = c.get("userId");
    const service = new SubscriptionService(c.env);
    const sub = await service.getActiveSubscription(userId);
    return c.json({ success: true, data: sub });
  }

  static async createOrder(c: Context) {
    const userId = c.get("userId");
    const body = await c.req.json().catch(() => ({}));
    const { planId } = body;

    if (!planId) {
      throw new ValidationError("Missing required parameter: planId");
    }

    const service = new SubscriptionService(c.env);
    const order = await service.createOrder(userId, planId);
    return c.json({ success: true, data: order });
  }

  static async verify(c: Context) {
    const userId = c.get("userId");
    const body = await c.req.json().catch(() => ({}));
    const { orderId, paymentId, signature } = body;

    if (!orderId || !signature) {
      throw new ValidationError("Missing required fields: orderId or signature");
    }

    const service = new SubscriptionService(c.env);
    const verification = await service.verifyPayment(userId, orderId, paymentId, signature);
    return c.json({ success: true, data: verification });
  }

  static async listPayments(c: Context) {
    const userId = c.get("userId");
    const service = new SubscriptionService(c.env);
    const payments = await service.listUserPayments(userId);
    return c.json({ success: true, data: payments });
  }
}
