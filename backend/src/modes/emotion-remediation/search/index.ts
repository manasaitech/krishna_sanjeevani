// ─────────────────────────────────────────────────────────────
// Emotion Remediation Mode — Search Endpoint
// Search by emotional states, transition trajectories, and Doshas.
// Zero dependencies on Surawali modules.
// ─────────────────────────────────────────────────────────────

import { Hono } from "hono";
import { Env } from "../../../shared/config/env";
import { ApiResponse } from "../../../shared/responses";
import { getDB } from "../../../shared/db/client";
import { emotionSongs } from "../../../shared/db/schema/emotion_song";
import { EMOTION_TRAJECTORIES } from "../content";

export const emotionSearchRoute = new Hono<{ Bindings: Env }>();

emotionSearchRoute.get("/", async (c) => {
  const query = (c.req.query("q") || "").toLowerCase().trim();
  const dosha = (c.req.query("dosha") || "").toLowerCase().trim();
  const trajectoryId = (c.req.query("trajectory") || "").toLowerCase().trim();

  const db = getDB(c.env);

  try {
    const allSongs = await db.select().from(emotionSongs);

    const filtered = allSongs.filter((song) => {
      // Must not be rejected
      if (song.reviewStatus === "rejected") return false;

      // Filter by dosha if provided
      if (dosha && song.dosha.toLowerCase() !== dosha) return false;

      // Filter by trajectory if provided
      if (trajectoryId && !song.trajectory.toLowerCase().includes(trajectoryId.replace(/-/g, " "))) {
        return false;
      }

      // Query text match
      if (!query) return true;

      const titleMatch = song.title.toLowerCase().includes(query);
      const trajectoryMatch = song.trajectory.toLowerCase().includes(query);
      const stateMatch =
        song.initialState.toLowerCase().includes(query) ||
        song.targetState.toLowerCase().includes(query) ||
        (song.intermediateState && song.intermediateState.toLowerCase().includes(query));
      const doshaMatch = song.dosha.toLowerCase().includes(query);

      return titleMatch || trajectoryMatch || stateMatch || doshaMatch;
    });

    // Also find matching trajectories
    const matchedTrajectories = EMOTION_TRAJECTORIES.filter((t) => {
      if (!query) return true;
      return (
        t.name.toLowerCase().includes(query) ||
        t.initialState.toLowerCase().includes(query) ||
        t.targetState.toLowerCase().includes(query) ||
        (t.intermediateState && t.intermediateState.toLowerCase().includes(query))
      );
    });

    return ApiResponse.success(c, {
      query,
      totalSongs: filtered.length,
      trajectories: matchedTrajectories,
      songs: filtered,
    });
  } catch (err: any) {
    return ApiResponse.success(c, {
      query,
      totalSongs: 0,
      trajectories: EMOTION_TRAJECTORIES,
      songs: [],
      fallback: true,
    });
  }
});
