import { Context } from "hono";
import { DiscoverService } from "./discover.service";
import { ValidationError } from "../../shared/errors";

export class DiscoverController {
  static async getCatalog(c: Context) {
    const service = new DiscoverService(c.env);
    const catalog = await service.getCatalog();
    return c.json({ success: true, data: catalog });
  }

  static async getSurawaliDetails(c: Context) {
    const id = c.req.param("id");
    if (!id) throw new ValidationError("Missing required parameter: id");
    const service = new DiscoverService(c.env);
    const details = await service.getSurawaliDetails(id);
    return c.json({ success: true, data: details });
  }

  static async createSubscription(c: Context) {
    const userId = c.get("userId");
    const body = await c.req.json().catch(() => ({}));
    const { surawaliId, plan, paymentId } = body;

    if (!surawaliId || !plan || !paymentId) {
      throw new ValidationError("Missing required fields: surawaliId, plan, or paymentId");
    }

    const service = new DiscoverService(c.env);
    const result = await service.createSubscription(userId, surawaliId, plan, paymentId);
    return c.json({ success: true, data: result });
  }

  static async listSubscriptions(c: Context) {
    const userId = c.get("userId");
    const service = new DiscoverService(c.env);
    const result = await service.listUserSubscriptions(userId);
    return c.json({ success: true, data: result });
  }

  static async cancelSubscription(c: Context) {
    const userId = c.get("userId");
    const id = c.req.param("id");
    if (!id) throw new ValidationError("Missing required parameter: id");
    const service = new DiscoverService(c.env);
    const result = await service.cancelSubscription(userId, id);
    return c.json({ success: true, data: result });
  }

}
