import { Context } from "hono";
import { getDB } from "../../shared/db/client";
import { playHistory } from "../../shared/db/schema/history";
import { tracks } from "../../shared/db/schema/track";
import { eq, and, desc } from "drizzle-orm";
import { ApiResponse } from "../../shared/responses";
import { ValidationError } from "../../shared/errors";
import { ProgramService } from "../programs/program.service";
import { ProgramRepository } from "../programs/program.repository";
import { TrackRepository } from "../tracks/track.repository";
import { Env } from "../../shared/config/env";

function getProgramService(env: Env): ProgramService {
  const db = getDB(env);
  const programRepo = new ProgramRepository(db);
  const trackRepo = new TrackRepository(db);
  return new ProgramService(programRepo, trackRepo);
}

export class ProgressController {
  static async update(c: Context<{ Bindings: Env }>) {
    const userId = c.get("userId" as never) as string;
    const body = await c.req.json().catch(() => ({}));
    const { trackId, position, duration, completed, programId } = body;

    if (!trackId || position === undefined || !duration) {
      throw new ValidationError("Track ID, position, and duration are required");
    }

    const db = getDB(c.env);
    const now = Date.now();

    // Check completion threshold: completed flag or >= 90% of duration
    const isCompleted = completed || (position / duration) >= 0.90;

    // 1. Fetch existing history/progress record
    const existing = await db
      .select()
      .from(playHistory)
      .where(and(eq(playHistory.userId, userId), eq(playHistory.trackId, trackId)))
      .get();

    let recordId = "";

    if (existing) {
      recordId = existing.id;
      await db
        .update(playHistory)
        .set({
          durationListened: Math.max(existing.durationListened, position), // or total accumulated duration
          lastPosition: isCompleted ? 0 : position, // reset to 0 if completed, else current
          completed: isCompleted ? 1 : existing.completed,
          programId: programId || existing.programId,
          updatedAt: now,
        })
        .where(eq(playHistory.id, existing.id));
    } else {
      recordId = crypto.randomUUID();
      await db.insert(playHistory).values({
        id: recordId,
        userId,
        trackId,
        programId: programId || null,
        durationListened: position,
        lastPosition: isCompleted ? 0 : position,
        completed: isCompleted ? 1 : 0,
        createdAt: now,
        updatedAt: now,
      });
    }

    // 2. If program context is provided and completed, update D1 program progress
    if (programId && isCompleted) {
      try {
        const programService = getProgramService(c.env);
        await programService.completeTrackInProgram(userId, programId, trackId, true);
      } catch (err) {
        console.warn("ProgressController: Failed to update program progress", err);
      }
    }

    return ApiResponse.success(c, { recordId, completed: isCompleted }, "Playback progress updated successfully");
  }

  static async getContinueListening(c: Context<{ Bindings: Env }>) {
    const userId = c.get("userId" as never) as string;
    const db = getDB(c.env);

    // Fetch tracks started but not completed (completed = 0 and lastPosition > 0)
    const results = await db
      .select({
        position: playHistory.lastPosition,
        updatedAt: playHistory.updatedAt,
        programId: playHistory.programId,
        track: tracks,
      })
      .from(playHistory)
      .innerJoin(tracks, eq(playHistory.trackId, tracks.id))
      .where(and(eq(playHistory.userId, userId), eq(playHistory.completed, 0)))
      .orderBy(desc(playHistory.updatedAt))
      .all();

    const items = results.map((r) => ({
      track: {
        ...r.track,
        art: r.track.thumbnailKey ? `${new URL(c.req.url).origin}/api/v1/storage/file/${r.track.thumbnailKey}` : undefined,
        raga: r.track.subtitle || "",
        purpose: r.track.description || "Healing",
      },
      position: r.position,
      duration: r.track.duration || 0,
      progressPercentage: r.track.duration ? Math.round((r.position / r.track.duration) * 100) : 0,
      lastPlayedAt: r.updatedAt,
      programId: r.programId,
    }));

    return ApiResponse.success(c, items, "Continue listening tracks retrieved successfully");
  }

  static async getHistory(c: Context<{ Bindings: Env }>) {
    const userId = c.get("userId" as never) as string;
    const db = getDB(c.env);

    const results = await db
      .select({
        position: playHistory.lastPosition,
        completed: playHistory.completed,
        updatedAt: playHistory.updatedAt,
        programId: playHistory.programId,
        track: tracks,
      })
      .from(playHistory)
      .innerJoin(tracks, eq(playHistory.trackId, tracks.id))
      .where(eq(playHistory.userId, userId))
      .orderBy(desc(playHistory.updatedAt))
      .all();

    const items = results.map((r) => ({
      track: {
        ...r.track,
        art: r.track.thumbnailKey ? `${new URL(c.req.url).origin}/api/v1/storage/file/${r.track.thumbnailKey}` : undefined,
        raga: r.track.subtitle || "",
        purpose: r.track.description || "Healing",
      },
      position: r.position,
      completed: r.completed === 1,
      lastPlayedAt: r.updatedAt,
      programId: r.programId,
    }));

    return ApiResponse.success(c, items, "Listening history retrieved successfully");
  }

  static async getTrackProgress(c: Context<{ Bindings: Env }>) {
    const userId = c.get("userId" as never) as string;
    const trackId = c.req.param("trackId");

    if (!trackId) {
      throw new ValidationError("Track ID is required");
    }

    const db = getDB(c.env);

    const record = await db
      .select()
      .from(playHistory)
      .where(and(eq(playHistory.userId, userId), eq(playHistory.trackId, trackId)))
      .get();

    if (!record) {
      return ApiResponse.success(c, { position: 0, completed: false, programId: null }, "No progress found for track");
    }

    return ApiResponse.success(
      c,
      {
        position: record.lastPosition,
        completed: record.completed === 1,
        programId: record.programId,
      },
      "Track progress retrieved successfully"
    );
  }
}
