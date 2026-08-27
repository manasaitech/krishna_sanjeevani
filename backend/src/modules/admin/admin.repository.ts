import { sql, eq, ne, and, gt, desc, or, like, isNull } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { users, userProfiles, tracks, programs, playHistory, subscriptions, payments, plans, favorites, surawaliSubscriptions, surawalis } from "../../shared/db/schema";
import * as schema from "../../shared/db/schema";
import { UserFilters } from "./admin.types";
import { SubscriptionFilters, PaymentFilters } from "./subscription.types";

export class AdminRepository {
  constructor(private db: DrizzleD1Database<typeof schema>) {}

  async getKpis() {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const [
      usersCountResult,
      activeUsersResult,
      tracksCountResult,
      programsCountResult,
      playsCountResult,
      activeSubsResult
    ] = await Promise.all([
      this.db.select({ count: sql<number>`count(*)` }).from(users).where(ne(users.status, "deleted")),
      this.db.select({ count: sql<number>`count(distinct user_id)` }).from(playHistory).where(gt(playHistory.createdAt, thirtyDaysAgo)),
      this.db.select({ count: sql<number>`count(*)` }).from(tracks).where(ne(tracks.publishStatus, "deleted")),
      this.db.select({ count: sql<number>`count(*)` }).from(programs).where(ne(programs.status, "deleted")),
      this.db.select({ count: sql<number>`count(*)` }).from(playHistory),
      this.db.select({ count: sql<number>`count(*)` }).from(surawaliSubscriptions).where(and(eq(surawaliSubscriptions.status, "active"), gt(surawaliSubscriptions.endDate, Date.now())))
    ]);

    return {
      totalUsers: usersCountResult[0]?.count ?? 0,
      activeUsers: activeUsersResult[0]?.count ?? 0,
      totalTracks: tracksCountResult[0]?.count ?? 0,
      totalPrograms: programsCountResult[0]?.count ?? 0,
      totalPlays: playsCountResult[0]?.count ?? 0,
      activeSubscriptions: activeSubsResult[0]?.count ?? 0,
    };
  }

  async getRecentActivity() {
    // 1. Fetch recent records from multiple source tables
    const [recentUsers, recentTracks, recentPrograms, recentPayments] = await Promise.all([
      this.db.select({ email: users.email, createdAt: users.createdAt }).from(users).orderBy(desc(users.createdAt)).limit(5),
      this.db.select({ title: tracks.title, createdAt: tracks.createdAt }).from(tracks).orderBy(desc(tracks.createdAt)).limit(5),
      this.db.select({ title: programs.title, createdAt: programs.createdAt }).from(programs).orderBy(desc(programs.createdAt)).limit(5),
      this.db.select({ planId: payments.planId, amount: payments.amount, status: payments.status, createdAt: payments.createdAt }).from(payments).orderBy(desc(payments.createdAt)).limit(5),
    ]);

    // 2. Map and translate rows to a unified activity event scheme
    const activities: Array<{
      who: string;
      what: string;
      createdAt: number;
    }> = [];

    recentUsers.forEach((u) => {
      activities.push({
        who: u.email,
        what: "registered a new account",
        createdAt: u.createdAt,
      });
    });

    recentTracks.forEach((t) => {
      activities.push({
        who: "Content Ops",
        what: `uploaded track "${t.title}"`,
        createdAt: t.createdAt,
      });
    });

    recentPrograms.forEach((p) => {
      activities.push({
        who: "Clinician Ops",
        what: `created therapeutic program "${p.title}"`,
        createdAt: p.createdAt,
      });
    });

    recentPayments.forEach((pay) => {
      activities.push({
        who: "Billing System",
        what: `recorded payment of ₹${Math.round(pay.amount / 100)} for ${pay.planId} tier (${pay.status})`,
        createdAt: pay.createdAt,
      });
    });

    // 3. Sort by timestamp descending and slice to top 10 events
    return activities.sort((a, b) => b.createdAt - a.createdAt).slice(0, 10);
  }

  // ── Users Management Endpoints Support ────────────────
  
  private buildUserConditions(filters: UserFilters) {
    const conditions = [];

    // Don't list deleted users
    conditions.push(ne(users.status, "deleted"));

    if (filters.status && filters.status !== "All") {
      conditions.push(eq(users.status, filters.status.toLowerCase()));
    }
    if (filters.role && filters.role !== "All") {
      conditions.push(eq(users.role, filters.role.toLowerCase()));
    }
    if (filters.search) {
      const pattern = `%${filters.search.toLowerCase()}%`;
      conditions.push(
        or(
          like(sql`lower(${users.email})`, pattern),
          like(sql`lower(${userProfiles.fullName})`, pattern)
        )
      );
    }
    return conditions;
  }

  async findUsers(filters: UserFilters) {
    const conditions = this.buildUserConditions(filters);
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;
    const now = Date.now();

    let query = this.db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        status: users.status,
        createdAt: users.createdAt,
        fullName: userProfiles.fullName,
        planName: plans.name,
      })
      .from(users)
      .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
      .leftJoin(subscriptions, and(eq(subscriptions.userId, users.id), eq(subscriptions.status, "active"), gt(subscriptions.currentPeriodEnd, now)))
      .leftJoin(plans, eq(plans.id, subscriptions.planId));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    if (filters.tier && filters.tier !== "All") {
      if (filters.tier.toLowerCase() === "free") {
        query = query.where(isNull(plans.name)) as any;
      } else {
        query = query.where(like(sql`lower(${plans.name})`, `%${filters.tier.toLowerCase()}%`)) as any;
      }
    }

    const data = await query
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    return data;
  }

  async countUsers(filters: UserFilters) {
    const conditions = this.buildUserConditions(filters);
    const now = Date.now();

    let query = this.db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
      .leftJoin(subscriptions, and(eq(subscriptions.userId, users.id), eq(subscriptions.status, "active"), gt(subscriptions.currentPeriodEnd, now)))
      .leftJoin(plans, eq(plans.id, subscriptions.planId));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    if (filters.tier && filters.tier !== "All") {
      if (filters.tier.toLowerCase() === "free") {
        query = query.where(isNull(plans.name)) as any;
      } else {
        query = query.where(like(sql`lower(${plans.name})`, `%${filters.tier.toLowerCase()}%`)) as any;
      }
    }

    const result = await query;
    return result[0]?.count ?? 0;
  }

  async getUserStats() {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();

    const [
      totalUsersRes,
      activeUsersRes,
      newUsersRes,
      premiumUsersRes
    ] = await Promise.all([
      this.db.select({ count: sql<number>`count(*)` }).from(users).where(ne(users.status, "deleted")),
      this.db.select({ count: sql<number>`count(distinct user_id)` }).from(playHistory).where(gt(playHistory.createdAt, thirtyDaysAgo)),
      this.db.select({ count: sql<number>`count(*)` }).from(users).where(and(ne(users.status, "deleted"), gt(users.createdAt, startOfMonth))),
      this.db.select({ count: sql<number>`count(*)` }).from(users).where(and(ne(users.status, "deleted"), eq(users.role, "premium")))
    ]);

    return {
      total: totalUsersRes[0]?.count ?? 0,
      active: activeUsersRes[0]?.count ?? 0,
      newThisMonth: newUsersRes[0]?.count ?? 0,
      premium: premiumUsersRes[0]?.count ?? 0,
    };
  }

  async getUserDetails(userId: string) {
    const userRes = await this.db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        status: users.status,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        fullName: userProfiles.fullName,
        profileImage: userProfiles.profileImage,
        category: userProfiles.category,
        language: userProfiles.language,
        preferences: userProfiles.preferences,
        pregnancyEdd: userProfiles.pregnancyEdd,
        pregnancyWeekStart: userProfiles.pregnancyWeekStart,
        pregnancyWeekStartWeek: userProfiles.pregnancyWeekStartWeek,
      })
      .from(users)
      .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
      .where(eq(users.id, userId))
      .limit(1);

    const userObj = userRes[0] ?? null;
    if (!userObj) return null;

    const subRes = await this.db
      .select({
        id: subscriptions.id,
        planId: subscriptions.planId,
        planName: plans.name,
        status: subscriptions.status,
        currentPeriodStart: subscriptions.currentPeriodStart,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
      })
      .from(subscriptions)
      .leftJoin(plans, eq(plans.id, subscriptions.planId))
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);

    const activeSub = subRes[0] ?? null;

    const [playsCount, completedCount, favoritesCount] = await Promise.all([
      this.db.select({ count: sql<number>`count(*)` }).from(playHistory).where(eq(playHistory.userId, userId)),
      this.db.select({ count: sql<number>`count(*)` }).from(playHistory).where(and(eq(playHistory.userId, userId), eq(playHistory.completed, 1))),
      this.db.select({ count: sql<number>`count(*)` }).from(favorites).where(eq(favorites.userId, userId))
    ]);

    const historyRes = await this.db
      .select({
        id: playHistory.id,
        trackId: playHistory.trackId,
        title: tracks.title,
        artist: tracks.artist,
        thumbnailKey: tracks.thumbnailKey,
        durationListened: playHistory.durationListened,
        completed: playHistory.completed,
        createdAt: playHistory.createdAt,
      })
      .from(playHistory)
      .leftJoin(tracks, eq(tracks.id, playHistory.trackId))
      .where(eq(playHistory.userId, userId))
      .orderBy(desc(playHistory.createdAt))
      .limit(10);

    return {
      user: userObj,
      subscription: activeSub,
      stats: {
        tracksPlayed: playsCount[0]?.count ?? 0,
        tracksCompleted: completedCount[0]?.count ?? 0,
        favoritesCount: favoritesCount[0]?.count ?? 0,
      },
      history: historyRes,
    };
  }

  async updateUserStatus(userId: string, status: "active" | "suspended") {
    await this.db
      .update(users)
      .set({ status, updatedAt: Date.now() })
      .where(eq(users.id, userId));
  }

  // ── Subscriptions & Billing CMS support ────────────────

  private buildSubscriptionConditions(filters: SubscriptionFilters) {
    const conditions = [];

    if (filters.status && filters.status !== "All") {
      if (filters.status.toLowerCase() === "canceled") {
        conditions.push(or(
          eq(surawaliSubscriptions.status, "canceled"),
          eq(surawaliSubscriptions.status, "cancelled")
        ));
      } else {
        conditions.push(eq(surawaliSubscriptions.status, filters.status.toLowerCase()));
      }
    }
    if (filters.planId && filters.planId !== "All") {
      conditions.push(eq(surawaliSubscriptions.plan, filters.planId.toLowerCase()));
    }
    if (filters.search) {
      const pattern = `%${filters.search.toLowerCase()}%`;
      conditions.push(
        or(
          like(sql`lower(${users.email})`, pattern),
          like(sql`lower(${userProfiles.fullName})`, pattern),
          like(sql`lower(${surawalis.name})`, pattern)
        )
      );
    }
    return conditions;
  }

  async findSubscriptions(filters: SubscriptionFilters) {
    const conditions = this.buildSubscriptionConditions(filters);
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

    let query = this.db
      .select({
        id: surawaliSubscriptions.id,
        status: surawaliSubscriptions.status,
        currentPeriodStart: surawaliSubscriptions.startDate,
        currentPeriodEnd: surawaliSubscriptions.endDate,
        userId: users.id,
        email: users.email,
        fullName: userProfiles.fullName,
        planName: surawaliSubscriptions.plan,
        planId: surawaliSubscriptions.plan,
        surawaliName: surawalis.name,
      })
      .from(surawaliSubscriptions)
      .leftJoin(users, eq(users.id, surawaliSubscriptions.userId))
      .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
      .leftJoin(surawalis, eq(surawalis.id, surawaliSubscriptions.surawaliId));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const data = await query
      .orderBy(desc(surawaliSubscriptions.createdAt))
      .limit(limit)
      .offset(offset);

    return data;
  }

  async countSubscriptions(filters: SubscriptionFilters) {
    const conditions = this.buildSubscriptionConditions(filters);

    let query = this.db
      .select({ count: sql<number>`count(*)` })
      .from(surawaliSubscriptions)
      .leftJoin(users, eq(users.id, surawaliSubscriptions.userId))
      .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
      .leftJoin(surawalis, eq(surawalis.id, surawaliSubscriptions.surawaliId));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const result = await query;
    return result[0]?.count ?? 0;
  }

  async getSubscriptionStats() {
    const now = Date.now();
    const sevenDaysLater = now + 7 * 24 * 60 * 60 * 1000;

    const [
      activeSubsRes,
      standardSubsRes,
      premiumSubsRes,
      expiringSoonRes
    ] = await Promise.all([
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(surawaliSubscriptions)
        .where(and(eq(surawaliSubscriptions.status, "active"), gt(surawaliSubscriptions.endDate, now))),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(surawaliSubscriptions)
        .where(
          and(
            eq(surawaliSubscriptions.status, "active"),
            eq(surawaliSubscriptions.plan, "monthly"),
            gt(surawaliSubscriptions.endDate, now)
          )
        ),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(surawaliSubscriptions)
        .where(
          and(
            eq(surawaliSubscriptions.status, "active"),
            eq(surawaliSubscriptions.plan, "premium"),
            gt(surawaliSubscriptions.endDate, now)
          )
        ),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(surawaliSubscriptions)
        .where(
          and(
            eq(surawaliSubscriptions.status, "active"),
            gt(surawaliSubscriptions.endDate, now),
            sql`${surawaliSubscriptions.endDate} <= ${sevenDaysLater}`
          )
        )
    ]);

    return {
      activeSubscriptions: activeSubsRes[0]?.count ?? 0,
      standardSubscribers: standardSubsRes[0]?.count ?? 0,
      premiumSubscribers: premiumSubsRes[0]?.count ?? 0,
      expiringSoon: expiringSoonRes[0]?.count ?? 0,
    };
  }

  async findSubscriptionDetails(subId: string) {
    const subRes = await this.db
      .select({
        id: surawaliSubscriptions.id,
        status: surawaliSubscriptions.status,
        currentPeriodStart: surawaliSubscriptions.startDate,
        currentPeriodEnd: surawaliSubscriptions.endDate,
        createdAt: surawaliSubscriptions.createdAt,
        userId: surawaliSubscriptions.userId,
        email: users.email,
        fullName: userProfiles.fullName,
        role: users.role,
        planId: surawaliSubscriptions.plan,
        planName: surawaliSubscriptions.plan,
        price: sql<number>`0`,
        currency: sql<string>`'INR'`,
        surawaliName: surawalis.name,
      })
      .from(surawaliSubscriptions)
      .leftJoin(users, eq(users.id, surawaliSubscriptions.userId))
      .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
      .leftJoin(surawalis, eq(surawalis.id, surawaliSubscriptions.surawaliId))
      .where(eq(surawaliSubscriptions.id, subId))
      .limit(1);

    const subscription = subRes[0] ?? null;
    if (!subscription) return null;

    const paymentsHistory = await this.db
      .select()
      .from(payments)
      .where(eq(payments.userId, subscription.userId))
      .orderBy(desc(payments.createdAt))
      .limit(10);

    return {
      subscription,
      paymentsHistory,
    };
  }

  async cancelSubscription(subId: string) {
    await this.db
      .update(surawaliSubscriptions)
      .set({ status: "cancelled", updatedAt: Date.now() })
      .where(eq(surawaliSubscriptions.id, subId));
  }

  async extendSubscription(subId: string, days: number) {
    const sub = await this.db
      .select()
      .from(surawaliSubscriptions)
      .where(eq(surawaliSubscriptions.id, subId))
      .limit(1);
    
    if (sub[0]) {
      const currentEnd = Math.max(Date.now(), sub[0].endDate);
      const newEnd = currentEnd + days * 24 * 60 * 60 * 1000;
      await this.db
        .update(surawaliSubscriptions)
        .set({
          endDate: newEnd,
          status: "active",
          updatedAt: Date.now(),
        })
        .where(eq(surawaliSubscriptions.id, subId));
    }
  }

  async findAllPlans() {
    return await this.db
      .select()
      .from(plans)
      .orderBy(plans.price);
  }

  async updatePlan(planId: string, name: string, price: number, interval: string, isActive: number) {
    await this.db
      .update(plans)
      .set({
        name,
        price,
        interval,
        isActive,
        updatedAt: Date.now(),
      })
      .where(eq(plans.id, planId));
  }

  private buildPaymentConditions(filters: PaymentFilters) {
    const conditions = [];

    if (filters.status && filters.status !== "All") {
      conditions.push(eq(payments.status, filters.status.toLowerCase()));
    }
    if (filters.search) {
      const pattern = `%${filters.search.toLowerCase()}%`;
      conditions.push(
        or(
          like(sql`lower(${payments.orderId})`, pattern),
          like(sql`lower(${users.email})`, pattern),
          like(sql`lower(${userProfiles.fullName})`, pattern)
        )
      );
    }
    return conditions;
  }

  async findPayments(filters: PaymentFilters) {
    const conditions = this.buildPaymentConditions(filters);
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

    let query = this.db
      .select({
        id: payments.id,
        amount: payments.amount,
        currency: payments.currency,
        status: payments.status,
        orderId: payments.orderId,
        createdAt: payments.createdAt,
        userId: users.id,
        email: users.email,
        fullName: userProfiles.fullName,
        planName: plans.name,
      })
      .from(payments)
      .leftJoin(users, eq(users.id, payments.userId))
      .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
      .leftJoin(plans, eq(plans.id, payments.planId));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const data = await query
      .orderBy(desc(payments.createdAt))
      .limit(limit)
      .offset(offset);

    return data;
  }

  async countPayments(filters: PaymentFilters) {
    const conditions = this.buildPaymentConditions(filters);

    let query = this.db
      .select({ count: sql<number>`count(*)` })
      .from(payments)
      .leftJoin(users, eq(users.id, payments.userId))
      .leftJoin(userProfiles, eq(userProfiles.userId, users.id));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const result = await query;
    return result[0]?.count ?? 0;
  }

  // ── Analytics CMS Queries ──────────────────────────────────────────

  async getOverviewKPIs(startTime: number, endTime: number) {
    const activeUsersRes = await this.db
      .select({ count: sql<number>`count(distinct ${playHistory.userId})` })
      .from(playHistory)
      .where(and(sql`${playHistory.createdAt} >= ${startTime}`, sql`${playHistory.createdAt} <= ${endTime}`));

    const totalPlaysRes = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(playHistory)
      .where(and(sql`${playHistory.createdAt} >= ${startTime}`, sql`${playHistory.createdAt} <= ${endTime}`));

    const totalListeningTimeRes = await this.db
      .select({ sum: sql<number>`sum(${playHistory.durationListened})` })
      .from(playHistory)
      .where(and(sql`${playHistory.createdAt} >= ${startTime}`, sql`${playHistory.createdAt} <= ${endTime}`));

    const completedPlaysRes = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(playHistory)
      .where(
        and(
          sql`${playHistory.createdAt} >= ${startTime}`,
          sql`${playHistory.createdAt} <= ${endTime}`,
          eq(playHistory.completed, 1)
        )
      );

    const totalPlays = totalPlaysRes[0]?.count ?? 0;
    const completedPlays = completedPlaysRes[0]?.count ?? 0;
    const completionRate = totalPlays > 0 ? Math.round((completedPlays / totalPlays) * 100) : 0;
    const listeningTimeHours = totalListeningTimeRes[0]?.sum ? Math.round(totalListeningTimeRes[0].sum / 3600) : 0;

    return {
      activeUsers: activeUsersRes[0]?.count ?? 0,
      totalPlays,
      listeningTimeHours,
      completionRate,
    };
  }

  async getUserAnalytics(startTime: number, endTime: number) {
    const newUsersRes = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(and(sql`${users.createdAt} >= ${startTime}`, sql`${users.createdAt} <= ${endTime}`));

    const activeUsersRes = await this.db
      .select({ count: sql<number>`count(distinct ${playHistory.userId})` })
      .from(playHistory)
      .where(and(sql`${playHistory.createdAt} >= ${startTime}`, sql`${playHistory.createdAt} <= ${endTime}`));

    const returningUsersRes = await this.db
      .select({ count: sql<number>`count(distinct ${playHistory.userId})` })
      .from(playHistory)
      .where(
        and(
          sql`${playHistory.createdAt} >= ${startTime}`,
          sql`${playHistory.createdAt} <= ${endTime}`,
          sql`${playHistory.userId} in (select user_id from play_history where created_at < ${startTime})`
        )
      );

    const registrationTrend = await this.db
      .select({
        date: sql<string>`strftime('%Y-%m-%d', datetime(${users.createdAt}/1000, 'unixepoch'))`,
        count: sql<number>`count(*)`
      })
      .from(users)
      .where(and(sql`${users.createdAt} >= ${startTime}`, sql`${users.createdAt} <= ${endTime}`))
      .groupBy(sql`date`)
      .orderBy(sql`date`);

    return {
      newRegistrations: newUsersRes[0]?.count ?? 0,
      activeUsers: activeUsersRes[0]?.count ?? 0,
      returningUsers: returningUsersRes[0]?.count ?? 0,
      userGrowthTrend: registrationTrend,
    };
  }

  async getListeningAnalytics(startTime: number, endTime: number) {
    const listeningTrend = await this.db
      .select({
        date: sql<string>`strftime('%Y-%m-%d', datetime(${playHistory.createdAt}/1000, 'unixepoch'))`,
        hours: sql<number>`round(sum(${playHistory.durationListened}) / 3600, 1)`,
        plays: sql<number>`count(*)`
      })
      .from(playHistory)
      .where(and(sql`${playHistory.createdAt} >= ${startTime}`, sql`${playHistory.createdAt} <= ${endTime}`))
      .groupBy(sql`date`)
      .orderBy(sql`date`);

    return {
      listeningTrend,
    };
  }

  async getPopularTracks(startTime: number, endTime: number) {
    const data = await this.db
      .select({
        trackId: playHistory.trackId,
        title: tracks.title,
        artist: tracks.artist,
        plays: sql<number>`count(*)`.as("plays"),
        completions: sql<number>`sum(case when ${playHistory.completed} = 1 then 1 else 0 end)`.as("completions"),
      })
      .from(playHistory)
      .leftJoin(tracks, eq(tracks.id, playHistory.trackId))
      .where(and(sql`${playHistory.createdAt} >= ${startTime}`, sql`${playHistory.createdAt} <= ${endTime}`))
      .groupBy(playHistory.trackId)
      .orderBy(desc(sql`plays`))
      .limit(10);

    return data.map(d => ({
      ...d,
      completionRate: d.plays > 0 ? Math.round((d.completions / d.plays) * 100) : 0,
    }));
  }

  async getProgramPerformance(startTime: number, endTime: number) {
    const data = await this.db
      .select({
        programId: playHistory.programId,
        title: programs.title,
        starts: sql<number>`count(*)`.as("starts"),
        completions: sql<number>`sum(case when ${playHistory.completed} = 1 then 1 else 0 end)`.as("completions"),
      })
      .from(playHistory)
      .innerJoin(programs, eq(programs.id, playHistory.programId))
      .where(and(sql`${playHistory.createdAt} >= ${startTime}`, sql`${playHistory.createdAt} <= ${endTime}`))
      .groupBy(playHistory.programId)
      .orderBy(desc(sql`starts`))
      .limit(10);

    return data.map(d => ({
      ...d,
      completionRate: d.starts > 0 ? Math.round((d.completions / d.starts) * 100) : 0,
    }));
  }

  async getCategoryDistribution(startTime: number, endTime: number) {
    const data = await this.db
      .select({
        category: tracks.category,
        plays: sql<number>`count(*)`.as("plays"),
        durationHours: sql<number>`round(sum(${playHistory.durationListened}) / 3600, 1)`.as("durationHours"),
      })
      .from(playHistory)
      .leftJoin(tracks, eq(tracks.id, playHistory.trackId))
      .where(and(sql`${playHistory.createdAt} >= ${startTime}`, sql`${playHistory.createdAt} <= ${endTime}`))
      .groupBy(tracks.category)
      .orderBy(desc(sql`plays`));

    return data;
  }

  async getPregnancyAnalytics(startTime: number, endTime: number) {
    const activePregRes = await this.db
      .select({ count: sql<number>`count(distinct ${playHistory.userId})` })
      .from(playHistory)
      .innerJoin(programs, eq(programs.id, playHistory.programId))
      .where(
        and(
          sql`${playHistory.createdAt} >= ${startTime}`,
          sql`${playHistory.createdAt} <= ${endTime}`,
          eq(programs.category, "pregnancy")
        )
      );

    const startedPregRes = await this.db
      .select({ count: sql<number>`count(distinct ${playHistory.userId} || '-' || ${playHistory.programId})` })
      .from(playHistory)
      .innerJoin(programs, eq(programs.id, playHistory.programId))
      .where(
        and(
          sql`${playHistory.createdAt} >= ${startTime}`,
          sql`${playHistory.createdAt} <= ${endTime}`,
          eq(programs.category, "pregnancy")
        )
      );

    const completedPregRes = await this.db
      .select({ count: sql<number>`count(distinct ${playHistory.userId} || '-' || ${playHistory.programId})` })
      .from(playHistory)
      .innerJoin(programs, eq(programs.id, playHistory.programId))
      .where(
        and(
          sql`${playHistory.createdAt} >= ${startTime}`,
          sql`${playHistory.createdAt} <= ${endTime}`,
          eq(programs.category, "pregnancy"),
          eq(playHistory.completed, 1)
        )
      );

    const pregPlayDetails = await this.db
      .select({
        createdAt: playHistory.createdAt,
        pregnancyEdd: userProfiles.pregnancyEdd,
      })
      .from(playHistory)
      .innerJoin(userProfiles, eq(userProfiles.userId, playHistory.userId))
      .where(
        and(
          sql`${playHistory.createdAt} >= ${startTime}`,
          sql`${playHistory.createdAt} <= ${endTime}`,
          sql`${userProfiles.pregnancyEdd} is not null`
        )
      );

    const weekCounts: Record<number, number> = {};
    for (const record of pregPlayDetails) {
      if (!record.pregnancyEdd) continue;
      try {
        const edd = new Date(record.pregnancyEdd);
        const lmp = new Date(edd.getTime() - 280 * 24 * 60 * 60 * 1000);
        const listenDate = new Date(record.createdAt);
        const diffMs = listenDate.getTime() - lmp.getTime();
        const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
        const week = Math.max(1, Math.min(42, Math.floor(diffDays / 7) + 1));
        weekCounts[week] = (weekCounts[week] || 0) + 1;
      } catch {}
    }

    const weekEngagement = Object.entries(weekCounts)
      .map(([week, plays]) => ({
        week: Number(week),
        plays,
      }))
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 5);

    return {
      activeUsers: activePregRes[0]?.count ?? 0,
      programsStarted: startedPregRes[0]?.count ?? 0,
      programsCompleted: completedPregRes[0]?.count ?? 0,
      weekEngagement,
    };
  }

  async getFavoritesAnalytics(startTime: number, endTime: number) {
    const totalFavRes = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(favorites)
      .where(and(sql`${favorites.createdAt} >= ${startTime}`, sql`${favorites.createdAt} <= ${endTime}`));

    const popularFavRes = await this.db
      .select({
        trackId: favorites.itemId,
        title: tracks.title,
        artist: tracks.artist,
        favoritesCount: sql<number>`count(*)`,
      })
      .from(favorites)
      .innerJoin(tracks, eq(tracks.id, favorites.itemId))
      .where(
        and(
          sql`${favorites.createdAt} >= ${startTime}`,
          sql`${favorites.createdAt} <= ${endTime}`,
          eq(favorites.itemType, "track")
        )
      )
      .groupBy(favorites.itemId)
      .orderBy(desc(sql`favoritesCount`))
      .limit(10);

    return {
      totalFavorites: totalFavRes[0]?.count ?? 0,
      topFavoritedTracks: popularFavRes,
    };
  }

  async getSubscriptionAnalytics(startTime: number, endTime: number) {
    const [
      activeSubs,
      newSubs,
      expiredSubs,
      cancelledSubs
    ] = await Promise.all([
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(subscriptions)
        .where(eq(subscriptions.status, "active")),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(subscriptions)
        .where(and(sql`${subscriptions.createdAt} >= ${startTime}`, sql`${subscriptions.createdAt} <= ${endTime}`)),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.status, "expired"),
            sql`${subscriptions.updatedAt} >= ${startTime}`,
            sql`${subscriptions.updatedAt} <= ${endTime}`
          )
        ),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.status, "canceled"),
            sql`${subscriptions.updatedAt} >= ${startTime}`,
            sql`${subscriptions.updatedAt} <= ${endTime}`
          )
        )
    ]);

    const planDistribution = await this.db
      .select({
        planId: subscriptions.planId,
        count: sql<number>`count(*)`
      })
      .from(subscriptions)
      .where(eq(subscriptions.status, "active"))
      .groupBy(subscriptions.planId);

    return {
      activeSubscriptions: activeSubs[0]?.count ?? 0,
      newSubscriptions: newSubs[0]?.count ?? 0,
      expiredSubscriptions: expiredSubs[0]?.count ?? 0,
      cancelledSubscriptions: cancelledSubs[0]?.count ?? 0,
      planDistribution,
    };
  }

  async cancelUserSubscriptions(userId: string) {
    await this.db
      .update(subscriptions)
      .set({ status: "canceled", updatedAt: Date.now() })
      .where(eq(subscriptions.userId, userId));
  }

  async createUserSubscription(data: typeof subscriptions.$inferInsert) {
    await this.db.insert(subscriptions).values(data);
  }

  async checkDatabaseHealth(): Promise<boolean> {
    try {
      await this.db.run(sql`SELECT 1`);
      return true;
    } catch {
      return false;
    }
  }
}
