import { DrizzleD1Database } from "drizzle-orm/d1";
import { AdminRepository } from "./admin.repository";
import * as schema from "../../shared/db/schema";
import { UserFilters } from "./admin.types";
import { SubscriptionFilters, PaymentFilters } from "./subscription.types";
import { AnalyticsQuery } from "./analytics.types";

export class AdminService {
  private repo: AdminRepository;

  constructor(db: DrizzleD1Database<typeof schema>) {
    this.repo = new AdminRepository(db);
  }

  async getOverview() {
    const [kpis, recentActivity] = await Promise.all([
      this.repo.getKpis(),
      this.repo.getRecentActivity(),
    ]);

    return {
      kpis,
      recentActivity,
    };
  }

  async listUsers(filters: UserFilters) {
    const [data, total] = await Promise.all([
      this.repo.findUsers(filters),
      this.repo.countUsers(filters),
    ]);

    return {
      data,
      meta: {
        page: filters.page || 1,
        limit: filters.limit || 10,
        total,
        totalPages: Math.ceil(total / (filters.limit || 10)),
      },
    };
  }

  async getUserStats() {
    return this.repo.getUserStats();
  }

  async getUserDetails(userId: string) {
    return this.repo.getUserDetails(userId);
  }

  async deactivateUser(userId: string) {
    // Audit check: Verify target user exists
    const details = await this.repo.getUserDetails(userId);
    if (!details) {
      throw new Error("User not found");
    }
    // Prevent modifying super_admin users arbitrarily
    if (details.user.role === "super_admin") {
      throw new Error("Cannot modify status of a super administrator");
    }
    await this.repo.updateUserStatus(userId, "suspended");
  }

  async reactivateUser(userId: string) {
    const details = await this.repo.getUserDetails(userId);
    if (!details) {
      throw new Error("User not found");
    }
    if (details.user.role === "super_admin") {
      throw new Error("Cannot modify status of a super administrator");
    }
    await this.repo.updateUserStatus(userId, "active");
  }

  async listSubscriptions(filters: SubscriptionFilters) {
    const [data, total] = await Promise.all([
      this.repo.findSubscriptions(filters),
      this.repo.countSubscriptions(filters),
    ]);

    const limit = filters.limit || 10;
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page: filters.page || 1,
        limit,
        totalPages,
      },
    };
  }

  async getSubscriptionStats() {
    return await this.repo.getSubscriptionStats();
  }

  async getSubscriptionDetails(subId: string) {
    const details = await this.repo.findSubscriptionDetails(subId);
    if (!details) {
      throw new Error("Subscription not found");
    }
    return details;
  }

  async cancelSubscription(subId: string) {
    const details = await this.repo.findSubscriptionDetails(subId);
    if (!details) {
      throw new Error("Subscription not found");
    }
    if (details.subscription.role === "super_admin") {
      throw new Error("Cannot cancel subscription of a super administrator");
    }
    await this.repo.cancelSubscription(subId);
  }

  async extendSubscription(subId: string, days: number) {
    if (days <= 0 || days > 365) {
      throw new Error("Days to extend must be between 1 and 365");
    }
    const details = await this.repo.findSubscriptionDetails(subId);
    if (!details) {
      throw new Error("Subscription not found");
    }
    await this.repo.extendSubscription(subId, days);
  }

  async changeUserSubscriptionTier(userId: string, planId: string, durationDays: number = 30) {
    const userDetails = await this.repo.getUserDetails(userId);
    if (!userDetails) {

      throw new Error("User not found");
    }

    if (userDetails.user.role === "super_admin") {
      throw new Error("Cannot change subscription tier for super administrator");
    }

    const now = Date.now();

    if (planId === "free" || planId === "canceled" || planId === "none") {
      await this.repo.cancelUserSubscriptions(userId);
      return { status: "canceled", planId: "free" };
    }

    // Cancel existing active subscriptions first
    await this.repo.cancelUserSubscriptions(userId);

    const periodEnd = now + (durationDays || 30) * 24 * 60 * 60 * 1000;
    const subId = crypto.randomUUID();

    await this.repo.createUserSubscription({
      id: subId,
      userId,
      planId,
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      createdAt: now,
      updatedAt: now,
    });

    return { subId, status: "active", planId, periodEnd };
  }

  async listPlansAdmin() {
    return await this.repo.findAllPlans();
  }

  async updatePlanAdmin(planId: string, name: string, price: number, interval: string, isActive: number) {
    if (price < 0) {
      throw new Error("Plan price cannot be negative");
    }
    await this.repo.updatePlan(planId, name, price, interval, isActive);
  }

  async listPaymentsAdmin(filters: PaymentFilters) {
    const [data, total] = await Promise.all([
      this.repo.findPayments(filters),
      this.repo.countPayments(filters),
    ]);

    const limit = filters.limit || 10;
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page: filters.page || 1,
        limit,
        totalPages,
      },
    };
  }

  async getAnalyticsDashboard(query: AnalyticsQuery) {
    const endTime = query.endDate || Date.now();
    let startTime = Date.now() - 7 * 24 * 60 * 60 * 1000;

    if (query.period === "30d") {
      startTime = endTime - 30 * 24 * 60 * 60 * 1000;
    } else if (query.period === "90d") {
      startTime = endTime - 90 * 24 * 60 * 60 * 1000;
    } else if (query.period === "this_year") {
      const currentYear = new Date().getFullYear();
      startTime = new Date(currentYear, 0, 1).getTime();
    } else if (query.period === "custom" && query.startDate) {
      startTime = query.startDate;
    }

    const [
      overview,
      users,
      listening,
      popularTracks,
      programPerformance,
      categoryDistribution,
      pregnancy,
      favorites,
      subscriptions,
    ] = await Promise.all([
      this.repo.getOverviewKPIs(startTime, endTime),
      this.repo.getUserAnalytics(startTime, endTime),
      this.repo.getListeningAnalytics(startTime, endTime),
      this.repo.getPopularTracks(startTime, endTime),
      this.repo.getProgramPerformance(startTime, endTime),
      this.repo.getCategoryDistribution(startTime, endTime),
      this.repo.getPregnancyAnalytics(startTime, endTime),
      this.repo.getFavoritesAnalytics(startTime, endTime),
      this.repo.getSubscriptionAnalytics(startTime, endTime),
    ]);

    return {
      overview,
      users,
      listening,
      popularTracks,
      programPerformance,
      categoryDistribution,
      pregnancy,
      favorites,
      subscriptions,
    };
  }

  async checkHealth() {
    const isDbConnected = await this.repo.checkDatabaseHealth();
    return {
      dbConnected: isDbConnected,
      workerOperational: true,
      storageOperational: true,
      queueOperational: true,
      hlsOperational: true,
      authOperational: true,
    };
  }
}
