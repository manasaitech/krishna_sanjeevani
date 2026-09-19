// ─────────────────────────────────────────────────────────────
// Emotion Remediation — Admin Review & Moderation Route
// Dedicated review workflow for Emotion Remediation songs.
// Manages states: PENDING_REVIEW -> APPROVED -> PUBLISHED / REJECTED.
// Zero dependency on Surawali modules.
// ─────────────────────────────────────────────────────────────

import { Hono } from "hono";
import { Env } from "../../../shared/config/env";
import { ApiResponse } from "../../../shared/responses";
import { requireAuth } from "../../../modules/auth/auth.middleware";
import { getDB } from "../../../shared/db/client";
import { emotionSongs, ReviewStatusType } from "../../../shared/db/schema/emotion_song";
import { eq, and } from "drizzle-orm";

export const emotionReviewRoute = new Hono<{ Bindings: Env }>();

// All review routes require authentication
emotionReviewRoute.use("*", requireAuth());

/**
 * GET /api/v1/emotion/admin/review/list
 * List all songs with their review and publication status.
 */
emotionReviewRoute.get("/list", async (c) => {
  const db = getDB(c.env);
  const status = c.req.query("status") as ReviewStatusType | undefined;
  const dosha = c.req.query("dosha");

  try {
    let query = db.select().from(emotionSongs);
    const results = await query;

    const filtered = results.filter((song) => {
      if (status && song.reviewStatus !== status) return false;
      if (dosha && song.dosha !== dosha) return false;
      return true;
    });

    return ApiResponse.success(c, {
      total: filtered.length,
      songs: filtered,
    });
  } catch (err: any) {
    return ApiResponse.error(c, err.message || "Failed to retrieve review list", 500);
  }
});

/**
 * POST /api/v1/emotion/admin/review/:id/status
 * Transition review status for an Emotion Remediation song.
 */
emotionReviewRoute.post("/:id/status", async (c) => {
  const songId = c.req.param("id");
  const body = await c.req.json().catch(() => ({}));
  const { status, notes, rejectionReason } = body;

  const validStatuses = ["pending", "approved", "rejected", "published"];
  if (!validStatuses.includes(status)) {
    return ApiResponse.error(
      c,
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      400
    );
  }

  const user = c.get("user" as any);
  const db = getDB(c.env);

  try {
    const [existing] = await db
      .select()
      .from(emotionSongs)
      .where(eq(emotionSongs.id, songId))
      .limit(1);

    if (!existing) {
      return ApiResponse.error(c, "Emotion song not found", 404);
    }

    const now = Date.now();
    await db
      .update(emotionSongs)
      .set({
        reviewStatus: status,
        reviewNotes: notes || existing.reviewNotes,
        rejectionReason: status === "rejected" ? rejectionReason || "No reason specified" : null,
        reviewedBy: user?.userId || "admin",
        reviewedAt: now,
        updatedAt: now,
      })
      .where(eq(emotionSongs.id, songId));

    return ApiResponse.success(c, {
      songId,
      previousStatus: existing.reviewStatus,
      newStatus: status,
      reviewedAt: now,
    }, `Song status updated to ${status}`);
  } catch (err: any) {
    return ApiResponse.error(c, err.message || "Failed to update review status", 500);
  }
});

/**
 * POST /api/v1/emotion/admin/review/publish-all
 * Bulk publish all approved songs to make them user-accessible.
 */
emotionReviewRoute.post("/publish-all", async (c) => {
  const db = getDB(c.env);
  const user = c.get("user" as any);

  try {
    const approved = await db
      .select()
      .from(emotionSongs)
      .where(eq(emotionSongs.reviewStatus, "approved"));

    const now = Date.now();
    for (const song of approved) {
      await db
        .update(emotionSongs)
        .set({
          reviewStatus: "published",
          reviewedBy: user?.userId || "admin",
          reviewedAt: now,
          updatedAt: now,
        })
        .where(eq(emotionSongs.id, song.id));
    }

    return ApiResponse.success(c, {
      publishedCount: approved.length,
    }, `${approved.length} approved song(s) successfully published.`);
  } catch (err: any) {
    return ApiResponse.error(c, err.message || "Failed to bulk publish songs", 500);
  }
});
