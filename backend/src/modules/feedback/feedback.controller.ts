import { Context } from "hono";
import { getDB } from "../../shared/db/client";
import { feedbacks } from "../../shared/db/schema/feedback";
import { users } from "../../shared/db/schema/user";
import { userProfiles } from "../../shared/db/schema/user";
import { tracks } from "../../shared/db/schema/track";
import { emotionSongs } from "../../shared/db/schema/emotion_song";
import { eq, and, desc, sql, gte, lte, like, or } from "drizzle-orm";
import { ApiResponse } from "../../shared/responses";
import { ValidationError, NotFoundError } from "../../shared/errors";
import { Env } from "../../shared/config/env";

export class FeedbackController {
  /**
   * Submit session feedback (User endpoint)
   */
  static async submit(c: Context<{ Bindings: Env }>) {
    let userId = (c.get("userId" as never) as string) || "";
    const body = await c.req.json().catch(() => ({}));
    const { trackId, surawaliId, programId, mode, rating, mood, notes, sessionDuration } = body;

    if (!userId) {
      userId = body.userId || (body.userEmail ? `user_${body.userEmail.replace(/[^a-zA-Z0-9]/g, "_")}` : `guest_${Date.now()}`);
    }

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      throw new ValidationError("A rating between 1 and 5 is required");
    }

    const db = getDB(c.env);
    const now = Date.now();
    const activeMode = mode === "emotion_remediation" ? "emotion_remediation" : "surawali";
    const duration = typeof sessionDuration === "number" ? Math.max(0, Math.round(sessionDuration)) : 0;

    // Duplicate submission protection: Check if user submitted identical feedback in the last 15 seconds
    const fifteenSecondsAgo = now - 15000;
    const recentDuplicate = await db
      .select()
      .from(feedbacks)
      .where(
        and(
          eq(feedbacks.userId, userId),
          gte(feedbacks.createdAt, fifteenSecondsAgo),
          trackId ? eq(feedbacks.trackId, trackId) : sql`1=1`
        )
      )
      .get();

    if (recentDuplicate) {
      // Update the recent record instead of creating a duplicate row
      await db
        .update(feedbacks)
        .set({
          rating: numRating,
          mood: mood || recentDuplicate.mood,
          notes: notes !== undefined ? notes : recentDuplicate.notes,
          sessionDuration: duration || recentDuplicate.sessionDuration,
          updatedAt: now,
        })
        .where(eq(feedbacks.id, recentDuplicate.id));

      return ApiResponse.success(c, { ...recentDuplicate, rating: numRating, mood, notes, updatedAt: now }, "Feedback updated successfully");
    }

    const id = crypto.randomUUID();
    const newFeedback = {
      id,
      userId,
      userName: body.userName || null,
      userEmail: body.userEmail || null,
      trackId: trackId || null,
      trackTitle: body.trackTitle || null,
      surawaliId: surawaliId || null,
      programId: programId || null,
      mode: activeMode,
      rating: numRating,
      mood: mood ? String(mood).trim() : null,
      notes: notes ? String(notes).trim() : null,
      sessionDuration: duration,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(feedbacks).values(newFeedback);

    return ApiResponse.success(c, newFeedback, "Feedback submitted successfully", 201);
  }

  /**
   * List feedback for Admin Dashboard with pagination, filters, and summary metrics
   */
  static async listAdminFeedback(c: Context<{ Bindings: Env }>) {
    const db = getDB(c.env);
    const url = new URL(c.req.url);

    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "10", 10)));
    const offset = (page - 1) * limit;

    const modeFilter = url.searchParams.get("mode");
    const ratingFilter = url.searchParams.get("rating");
    const moodFilter = url.searchParams.get("mood");
    const searchFilter = url.searchParams.get("search")?.trim().toLowerCase();

    // Base conditions
    const conditions = [];

    if (modeFilter && modeFilter !== "all" && modeFilter !== "All") {
      conditions.push(eq(feedbacks.mode, modeFilter.toLowerCase().includes("emotion") ? "emotion_remediation" : "surawali"));
    }

    if (ratingFilter && ratingFilter !== "all" && ratingFilter !== "All") {
      const parsedRating = parseInt(ratingFilter, 10);
      if (!isNaN(parsedRating) && parsedRating >= 1 && parsedRating <= 5) {
        conditions.push(eq(feedbacks.rating, parsedRating));
      }
    }

    if (moodFilter && moodFilter !== "all" && moodFilter !== "All") {
      conditions.push(eq(feedbacks.mood, moodFilter));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // 1. Calculate Summary Metrics (all feedback records matching current general conditions)
    const now = Date.now();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayTimestamp = startOfToday.getTime();

    const [totalStats, todayStats] = await Promise.all([
      db
        .select({
          count: sql<number>`count(*)`,
          avgRating: sql<number>`avg(${feedbacks.rating})`,
        })
        .from(feedbacks)
        .get(),
      db
        .select({
          count: sql<number>`count(*)`,
        })
        .from(feedbacks)
        .where(gte(feedbacks.createdAt, todayTimestamp))
        .get(),
    ]);

    const totalCountAll = Number(totalStats?.count || 0);
    const avgRatingVal = totalStats?.avgRating ? Number(Number(totalStats.avgRating).toFixed(1)) : 5.0;
    const todayCountVal = Number(todayStats?.count || 0);

    // 2. Query Paginated Feedback with Joined User & Profile & Track info
    const query = db
      .select({
        id: feedbacks.id,
        userId: feedbacks.userId,
        trackId: feedbacks.trackId,
        surawaliId: feedbacks.surawaliId,
        programId: feedbacks.programId,
        mode: feedbacks.mode,
        rating: feedbacks.rating,
        mood: feedbacks.mood,
        notes: feedbacks.notes,
        sessionDuration: feedbacks.sessionDuration,
        createdAt: feedbacks.createdAt,
        updatedAt: feedbacks.updatedAt,
        userEmail: sql<string>`coalesce(${users.email}, ${feedbacks.userEmail}, '')`,
        userName: sql<string>`coalesce(${userProfiles.fullName}, ${feedbacks.userName}, ${users.email}, 'Listener')`,
        userAvatar: userProfiles.profileImage,
        trackTitle: sql<string>`coalesce(${tracks.title}, ${feedbacks.trackTitle}, ${feedbacks.surawaliId}, 'Session')`,
        trackSubtitle: tracks.subtitle,
      })
      .from(feedbacks)
      .leftJoin(users, eq(feedbacks.userId, users.id))
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .leftJoin(tracks, eq(feedbacks.trackId, tracks.id))
      .orderBy(desc(feedbacks.createdAt));

    const totalFiltered = await db
      .select({ count: sql<number>`count(*)` })
      .from(feedbacks)
      .where(whereClause)
      .get();

    const totalMatching = Number(totalFiltered?.count || 0);

    const rows = whereClause
      ? await query.where(whereClause).limit(limit).offset(offset).all()
      : await query.limit(limit).offset(offset).all();

    // Client search filter if email or name or note search was provided
    let finalItems = rows;
    if (searchFilter) {
      finalItems = rows.filter((r) => {
        const uEmail = (r.userEmail || "").toLowerCase();
        const uName = (r.userName || "").toLowerCase();
        const fNotes = (r.notes || "").toLowerCase();
        const tTitle = (r.trackTitle || "").toLowerCase();
        const sId = (r.surawaliId || "").toLowerCase();
        return (
          uEmail.includes(searchFilter) ||
          uName.includes(searchFilter) ||
          fNotes.includes(searchFilter) ||
          tTitle.includes(searchFilter) ||
          sId.includes(searchFilter)
        );
      });
    }

    return ApiResponse.success(c, {
      items: finalItems,
      pagination: {
        page,
        limit,
        total: totalMatching,
        totalPages: Math.max(1, Math.ceil(totalMatching / limit)),
      },
      summary: {
        totalCount: totalCountAll,
        averageRating: avgRatingVal,
        todayCount: todayCountVal,
      },
    });
  }

  /**
   * Get feedback details by ID (Admin endpoint)
   */
  static async getFeedbackDetails(c: Context<{ Bindings: Env }>) {
    const id = c.req.param("id");
    const db = getDB(c.env);

    const feedbackItem = await db
      .select({
        id: feedbacks.id,
        userId: feedbacks.userId,
        trackId: feedbacks.trackId,
        surawaliId: feedbacks.surawaliId,
        programId: feedbacks.programId,
        mode: feedbacks.mode,
        rating: feedbacks.rating,
        mood: feedbacks.mood,
        notes: feedbacks.notes,
        sessionDuration: feedbacks.sessionDuration,
        createdAt: feedbacks.createdAt,
        updatedAt: feedbacks.updatedAt,
        userEmail: users.email,
        userName: userProfiles.fullName,
        userAvatar: userProfiles.profileImage,
        trackTitle: tracks.title,
        trackSubtitle: tracks.subtitle,
      })
      .from(feedbacks)
      .leftJoin(users, eq(feedbacks.userId, users.id))
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .leftJoin(tracks, eq(feedbacks.trackId, tracks.id))
      .where(eq(feedbacks.id, id))
      .get();

    if (!feedbackItem) {
      throw new NotFoundError("Feedback record not found");
    }

    return ApiResponse.success(c, feedbackItem);
  }
}
