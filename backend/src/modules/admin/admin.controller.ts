import { Context } from "hono";
import { AdminService } from "./admin.service";
import { getDB } from "../../shared/db/client";
import { userFiltersSchema, analyticsQuerySchema } from "./admin.validator";
import { subscriptionFiltersSchema, paymentFiltersSchema } from "./subscription.validator";

export class AdminController {
  static async getOverview(c: Context) {
    const db = getDB(c.env);
    const service = new AdminService(db);
    const data = await service.getOverview();
    return c.json({ success: true, data });
  }

  static async listUsers(c: Context) {
    const db = getDB(c.env);
    const service = new AdminService(db);
    
    const query = c.req.query();
    const parsed = userFiltersSchema.safeParse(query);
    if (!parsed.success) {
      return c.json({ success: false, message: "Invalid query filter parameters", errors: parsed.error.format() }, 400);
    }

    try {
      const data = await service.listUsers(parsed.data);
      return c.json({ success: true, data });
    } catch (err: any) {
      return c.json({ success: false, message: err.message || "Failed to list users" }, 500);
    }
  }

  static async getUserStats(c: Context) {
    const db = getDB(c.env);
    const service = new AdminService(db);
    try {
      const data = await service.getUserStats();
      return c.json({ success: true, data });
    } catch (err: any) {
      return c.json({ success: false, message: err.message || "Failed to load user statistics" }, 500);
    }
  }

  static async getUserDetails(c: Context) {
    const db = getDB(c.env);
    const service = new AdminService(db);
    const userId = c.req.param("id");
    if (!userId) {
      return c.json({ success: false, message: "User ID is required" }, 400);
    }

    try {
      const data = await service.getUserDetails(userId);
      if (!data) {
        return c.json({ success: false, message: "User not found" }, 404);
      }
      return c.json({ success: true, data });
    } catch (err: any) {
      return c.json({ success: false, message: err.message || "Failed to load user details" }, 500);
    }
  }

  static async deactivateUser(c: Context) {
    const db = getDB(c.env);
    const service = new AdminService(db);
    const userId = c.req.param("id");
    if (!userId) {
      return c.json({ success: false, message: "User ID is required" }, 400);
    }
    const actorRole = c.get("userRole");

    try {
      // Security Check: Only super_admin or admin can deactivate. Check performed by middleware.
      await service.deactivateUser(userId);
      return c.json({ success: true, message: "User account deactivated successfully" });
    } catch (err: any) {
      return c.json({ success: false, message: err.message || "Failed to deactivate user" }, 400);
    }
  }

  static async reactivateUser(c: Context) {
    const db = getDB(c.env);
    const service = new AdminService(db);
    const userId = c.req.param("id");
    if (!userId) {
      return c.json({ success: false, message: "User ID is required" }, 400);
    }

    try {
      await service.reactivateUser(userId);
      return c.json({ success: true, message: "User account reactivated successfully" });
    } catch (err: any) {
      return c.json({ success: false, message: err.message || "Failed to reactivate user" }, 400);
    }
  }

  static async listSubscriptions(c: Context) {
    const db = getDB(c.env);
    const service = new AdminService(db);
    try {
      const queryParams = c.req.query();
      const parsed = subscriptionFiltersSchema.parse(queryParams);
      const result = await service.listSubscriptions(parsed);
      return c.json({ success: true, data: result });
    } catch (err: any) {
      return c.json({ success: false, message: err.message || "Failed to list subscriptions" }, 400);
    }
  }

  static async getSubscriptionStats(c: Context) {
    const db = getDB(c.env);
    const service = new AdminService(db);
    try {
      const stats = await service.getSubscriptionStats();
      const paymentMode = c.env.PAYMENT_MODE || "mock";
      return c.json({ success: true, data: { ...stats, paymentMode } });
    } catch (err: any) {
      return c.json({ success: false, message: err.message || "Failed to load subscription statistics" }, 500);
    }
  }

  static async getSubscriptionDetails(c: Context) {
    const db = getDB(c.env);
    const service = new AdminService(db);
    const subId = c.req.param("id");
    if (!subId) {
      return c.json({ success: false, message: "Subscription ID is required" }, 400);
    }
    try {
      const data = await service.getSubscriptionDetails(subId);
      return c.json({ success: true, data });
    } catch (err: any) {
      return c.json({ success: false, message: err.message || "Failed to load subscription details" }, 500);
    }
  }

  static async cancelSubscription(c: Context) {
    const db = getDB(c.env);
    const service = new AdminService(db);
    const subId = c.req.param("id");
    if (!subId) {
      return c.json({ success: false, message: "Subscription ID is required" }, 400);
    }
    try {
      await service.cancelSubscription(subId);
      return c.json({ success: true, message: "Subscription cancelled successfully" });
    } catch (err: any) {
      return c.json({ success: false, message: err.message || "Failed to cancel subscription" }, 400);
    }
  }

  static async extendSubscription(c: Context) {
    const db = getDB(c.env);
    const service = new AdminService(db);
    const subId = c.req.param("id");
    if (!subId) {
      return c.json({ success: false, message: "Subscription ID is required" }, 400);
    }
    try {
      const body = await c.req.json();
      const days = Number(body.days);
      if (isNaN(days) || days <= 0) {
        return c.json({ success: false, message: "Days must be a positive integer" }, 400);
      }
      await service.extendSubscription(subId, days);
      return c.json({ success: true, message: "Subscription extended successfully" });
    } catch (err: any) {
      return c.json({ success: false, message: err.message || "Failed to extend subscription" }, 400);
    }
  }

  static async changeUserSubscriptionTier(c: Context) {
    const db = getDB(c.env);
    const service = new AdminService(db);
    const userId = c.req.param("id");
    if (!userId) {
      return c.json({ success: false, message: "User ID is required" }, 400);
    }
    try {
      const body = await c.req.json();
      const planId = String(body.planId || "free");
      const durationDays = Number(body.durationDays || 30);

      const result = await service.changeUserSubscriptionTier(userId, planId, durationDays);
      return c.json({ success: true, message: `User subscription updated to ${planId}`, data: result });
    } catch (err: any) {
      return c.json({ success: false, message: err.message || "Failed to update user subscription tier" }, 400);
    }
  }

  static async listPlans(c: Context) {
    const db = getDB(c.env);
    const service = new AdminService(db);
    try {
      const data = await service.listPlansAdmin();
      return c.json({ success: true, data });
    } catch (err: any) {
      return c.json({ success: false, message: err.message || "Failed to list plans" }, 500);
    }
  }

  static async updatePlan(c: Context) {
    const db = getDB(c.env);
    const service = new AdminService(db);
    const planId = c.req.param("id");
    if (!planId) {
      return c.json({ success: false, message: "Plan ID is required" }, 400);
    }
    try {
      const body = await c.req.json();
      const name = String(body.name);
      const price = Number(body.price); // in cents/paise
      const interval = String(body.interval || "month");
      const isActive = Number(body.isActive !== undefined ? body.isActive : 1);

      if (!name) {
        return c.json({ success: false, message: "Plan name is required" }, 400);
      }
      if (isNaN(price) || price < 0) {
        return c.json({ success: false, message: "Price must be a non-negative number" }, 400);
      }

      await service.updatePlanAdmin(planId, name, price, interval, isActive);
      return c.json({ success: true, message: "Plan updated successfully" });
    } catch (err: any) {
      return c.json({ success: false, message: err.message || "Failed to update plan" }, 400);
    }
  }

  static async listPayments(c: Context) {
    const db = getDB(c.env);
    const service = new AdminService(db);
    try {
      const queryParams = c.req.query();
      const parsed = paymentFiltersSchema.parse(queryParams);
      const result = await service.listPaymentsAdmin(parsed);
      return c.json({ success: true, data: result });
    } catch (err: any) {
      return c.json({ success: false, message: err.message || "Failed to list payments history" }, 400);
    }
  }

  static async getAnalytics(c: Context) {
    const db = getDB(c.env);
    const service = new AdminService(db);
    try {
      const queryParams = c.req.query();
      const parsed = analyticsQuerySchema.parse(queryParams);
      const data = await service.getAnalyticsDashboard(parsed);
      return c.json({ success: true, data });
    } catch (err: any) {
      return c.json({ success: false, message: err.message || "Failed to compile analytics dashboard data" }, 400);
    }
  }

  static async getHealth(c: Context) {
    const db = getDB(c.env);
    const service = new AdminService(db);
    try {
      const data = await service.checkHealth();
      return c.json({ success: true, data });
    } catch (err: any) {
      return c.json({ success: false, message: err.message || "Failed to check system health status" }, 400);
    }
  }
}
