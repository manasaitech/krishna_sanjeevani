import { Hono } from "hono";
import { eq, and, gt } from "drizzle-orm";
import { getDB } from "../shared/db/client";
import { tracks } from "../shared/db/schema/track";
import { streamSessions } from "../shared/db/schema/stream";
import { subscriptions } from "../shared/db/schema/subscription";
import { StorageService } from "../modules/storage/storage.service";
import { requireAuth } from "../modules/auth/auth.middleware";
import { UnauthorizedError, ForbiddenError, NotFoundError, ValidationError } from "../shared/errors";
import { ApiResponse } from "../shared/responses";
import { Env } from "../shared/config/env";
import { logger } from "../shared/logger";

const stream = new Hono<{ Bindings: Env }>();

const SESSION_LIFETIME_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Verifies a streaming session ticket and extends its expiration (sliding window).
 */
async function verifyAndExtendSession(
  c: any,
  ticket: string | undefined,
  trackId: string
) {
  if (!ticket) {
    throw new UnauthorizedError("Streaming ticket is required");
  }

  // Validate Referer and Sec-Fetch-Site to prevent direct link pasting/downloading in browser
  const referer = c.req.header("Referer");
  const secFetchSite = c.req.header("Sec-Fetch-Site");
  const userAgent = c.req.header("User-Agent") || "";

  // Check if browser request
  const isBrowser = userAgent.includes("Mozilla") || userAgent.includes("Chrome") || userAgent.includes("Safari");
  if (isBrowser) {
    const isValidReferer = referer && (
      referer.includes("localhost") || 
      referer.includes("127.0.0.1") || 
      referer.includes("astrosutraai") || 
      referer.includes("krishna-sanjeevani")
    );
    const isValidFetchSite = secFetchSite && secFetchSite !== "none";

    if (!isValidReferer && !isValidFetchSite) {
      throw new ForbiddenError("Direct access of streaming resources is not allowed");
    }
  }

  const db = getDB(c.env);
  // Find active streaming session
  const result = await db
    .select()
    .from(streamSessions)
    .where(eq(streamSessions.id, ticket))
    .limit(1);

  const session = result[0];

  if (!session) {
    throw new UnauthorizedError("Invalid streaming session");
  }

  // Check if session belongs to the correct track
  if (session.trackId !== trackId) {
    throw new ForbiddenError("Streaming ticket is not scoped for this track");
  }

  // Verify expiry
  const now = Date.now();
  if (session.expiresAt < now) {
    // Clean up expired session
    await db.delete(streamSessions).where(eq(streamSessions.id, ticket));
    throw new UnauthorizedError("Streaming session has expired");
  }

  // Slide expiration window: extend by another 5 minutes
  const newExpiry = now + SESSION_LIFETIME_MS;
  await db
    .update(streamSessions)
    .set({ expiresAt: newExpiry })
    .where(eq(streamSessions.id, ticket));

  return session;
}

/**
 * Helper to verify user permissions for a given track.
 */
async function verifyTrackAccess(c: any, trackId: string, userRole: string) {
  const db = getDB(c.env);
  const result = await db.select().from(tracks).where(eq(tracks.id, trackId)).limit(1);
  const track = result[0];

  if (!track) {
    throw new NotFoundError("Track not found");
  }

  // Only published tracks can be streamed (unless requested by an admin/super_admin)
  if (track.publishStatus !== "published" && !["admin", "super_admin"].includes(userRole)) {
    throw new ForbiddenError("This track is not available for streaming");
  }

  // Premium validation:
  const isPremiumTrack = track.tier === "premium";

  if (isPremiumTrack) {
    if (!["admin", "super_admin"].includes(userRole)) {
      const userId = c.get("userId");
      if (!userId) {
        throw new ForbiddenError("Authentication required to access premium tracks");
      }
      const activeSub = await db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.userId, userId),
            eq(subscriptions.status, "active"),
            gt(subscriptions.currentPeriodEnd, Date.now())
          )
        )
        .limit(1);

      if (activeSub.length === 0) {
        throw new ForbiddenError("Premium subscription required to access this track");
      }
    }
  }

  return track;
}

// ── POST Create Playback Session (Bearer Auth) ──────────
stream.post("/:trackId/ticket", requireAuth(), async (c) => {
  const trackId = c.req.param("trackId");
  if (!trackId) {
    throw new ValidationError("Track ID is required");
  }
  const userId = c.get("userId" as never) as string;
  const userRole = c.get("userRole" as never) as string;

  logger.info("Creating stream session for playback", { trackId, userId });

  // 1. Verify permissions
  await verifyTrackAccess(c, trackId, userRole);

  // 2. Clear old sessions for this user on this track to prevent spam/abuse
  const db = getDB(c.env);
  await db
    .delete(streamSessions)
    .where(and(eq(streamSessions.userId, userId), eq(streamSessions.trackId, trackId)));

  // 3. Generate secure random session token
  const ticket = crypto.randomUUID();
  const now = Date.now();
  const expiresAt = now + SESSION_LIFETIME_MS;

  // 4. Save session to D1
  await db.insert(streamSessions).values({
    id: ticket,
    userId,
    trackId,
    expiresAt,
    createdAt: now,
  });

  const streamUrl = `/api/v1/stream/${trackId}/master.m3u8?ticket=${encodeURIComponent(ticket)}`;

  return ApiResponse.success(c, {
    ticket,
    streamUrl,
  }, "Streaming session created successfully");
});

// ── GET Playlists (master.m3u8) ─────────────────────────
stream.get("/:trackId/master.m3u8", async (c) => {
  const trackId = c.req.param("trackId");
  if (!trackId) {
    throw new ValidationError("Track ID is required");
  }
  const ticket = c.req.query("ticket");

  logger.info("Stream request: master playlist", { trackId });

  // 1. Verify & Extend session
  await verifyAndExtendSession(c, ticket, trackId);

  // 2. Load Playlist from R2
  const storage = new StorageService(c.env.SONG_BUCKET);
  const fileKey = `songs/processed/${trackId}/master.m3u8`;
  const file = await storage.getFile(fileKey);

  if (!file) {
    throw new NotFoundError("Streaming playlist not found");
  }

  // Convert R2 stream to text to dynamically inject ticket
  const textDecoder = new TextDecoder();
  const responseBuffer = await new Response(file.body).arrayBuffer();
  const playlistText = textDecoder.decode(responseBuffer);

  // Rewrite segment and key paths to carry the ticket query parameter
  const lines = playlistText.split("\n");
  const rewrittenLines = lines.map((line) => {
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) return line;

    // Rewrite decryption key tag path
    if (trimmed.includes('#EXT-X-KEY:METHOD=AES-128,URI="')) {
      // Replace URI="keys/aes.key" with URI="keys/aes.key?ticket=TICKET"
      return line.replace(
        /URI="([^"]+)"/,
        (_, path) => `URI="${path}?ticket=${encodeURIComponent(ticket || "")}"`
      );
    }

    // Rewrite relative segment paths (typically audio/segment000.ts)
    if (!trimmed.startsWith("#")) {
      return `${trimmed}?ticket=${encodeURIComponent(ticket || "")}`;
    }

    return line;
  });

  const modifiedPlaylist = rewrittenLines.join("\n");
  const textEncoder = new TextEncoder();
  const modifiedBytes = textEncoder.encode(modifiedPlaylist);

  return new Response(modifiedBytes, {
    headers: {
      "Content-Type": "application/x-mpegURL",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
});

// ── GET Decryption Keys ─────────────────────────────────
stream.get("/:trackId/keys/:keyName", async (c) => {
  const trackId = c.req.param("trackId");
  const keyName = c.req.param("keyName");
  if (!trackId || !keyName) {
    throw new ValidationError("Track ID and Key Name are required");
  }
  const ticket = c.req.query("ticket");

  logger.info("Stream request: decryption key", { trackId, keyName });

  // 1. Verify & Extend session
  await verifyAndExtendSession(c, ticket, trackId);

  // 2. Load Key from R2
  const storage = new StorageService(c.env.SONG_BUCKET);
  const fileKey = `songs/processed/${trackId}/keys/${keyName}`;
  const file = await storage.getFile(fileKey);

  if (!file) {
    throw new NotFoundError("Decryption key not found");
  }

  return new Response(file.body, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
});

// ── GET Audio Segments ──────────────────────────────────
stream.get("/:trackId/audio/:segmentName", async (c) => {
  const trackId = c.req.param("trackId");
  const segmentName = c.req.param("segmentName");
  if (!trackId || !segmentName) {
    throw new ValidationError("Track ID and Segment Name are required");
  }
  const ticket = c.req.query("ticket");

  // 1. Verify & Extend session
  await verifyAndExtendSession(c, ticket, trackId);

  // 2. Stream Segment from R2
  const storage = new StorageService(c.env.SONG_BUCKET);
  const fileKey = `songs/processed/${trackId}/audio/${segmentName}`;
  const file = await storage.getFile(fileKey);

  if (!file) {
    throw new NotFoundError("Audio segment not found");
  }

  const contentType = segmentName.endsWith(".mp3")
    ? "audio/mpeg"
    : segmentName.endsWith(".aac")
    ? "audio/aac"
    : "video/MP2T";

  return new Response(file.body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400", // cache segment files safely
    },
  });
});

export default stream;
