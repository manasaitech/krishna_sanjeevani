import { Hono } from "hono";
import { jwtVerify } from "jose";
import { eq } from "drizzle-orm";
import { getDB } from "../shared/db/client";
import { tracks } from "../shared/db/schema/track";
import { StorageService } from "../modules/storage/storage.service";
import { UnauthorizedError, ForbiddenError, NotFoundError } from "../shared/errors";
import { Env } from "../shared/config/env";
import { logger } from "../shared/logger";

const stream = new Hono<{ Bindings: Env }>();

/**
 * Helper to verify JWT token from query string.
 */
async function verifyToken(token: string | undefined, secret: string) {
  if (!token) {
    throw new UnauthorizedError("Authentication token is required");
  }

  try {
    const encSecret = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, encSecret);
    return {
      userId: payload.sub as string,
      role: payload.role as string,
    };
  } catch (err) {
    logger.warn("Stream auth token verification failed", err);
    throw new UnauthorizedError("Invalid or expired stream token");
  }
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

  // Premium validation:
  // Allowed roles for premium tracks: 'premium', 'admin', 'super_admin'
  const isPremiumTrack = track.premium === 1;
  const isAllowedRole = ["premium", "admin", "super_admin"].includes(userRole);

  if (isPremiumTrack && !isAllowedRole) {
    throw new ForbiddenError("Premium subscription required to access this track");
  }

  return track;
}

// ── GET Playlists (master.m3u8) ─────────────────────────
stream.get("/:trackId/master.m3u8", async (c) => {
  const trackId = c.req.param("trackId");
  const token = c.req.query("token");

  logger.info("Stream request: master playlist", { trackId });

  // 1. Verify Authentication
  const user = await verifyToken(token, c.env.JWT_ACCESS_SECRET);

  // 2. Verify Track Access & Permissions
  await verifyTrackAccess(c, trackId, user.role);

  // 3. Load Playlist from R2
  const storage = new StorageService(c.env.BUCKET);
  const fileKey = `songs/processed/${trackId}/master.m3u8`;
  const file = await storage.getFile(fileKey);

  if (!file) {
    throw new NotFoundError("Streaming playlist not found");
  }

  // Convert R2 stream to text to dynamically inject JWT tokens into paths
  const textDecoder = new TextDecoder();
  const responseBuffer = await new Response(file.body).arrayBuffer();
  const playlistText = textDecoder.decode(responseBuffer);

  // Rewrite segment and key paths to carry the token query parameter
  const lines = playlistText.split("\n");
  const rewrittenLines = lines.map((line) => {
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) return line;

    // Rewrite decryption key tag path
    if (trimmed.includes('#EXT-X-KEY:METHOD=AES-128,URI="')) {
      // Replace URI="keys/aes.key" with URI="keys/aes.key?token=JWT"
      return line.replace(
        /URI="([^"]+)"/,
        (_, path) => `URI="${path}?token=${encodeURIComponent(token || "")}"`
      );
    }

    // Rewrite relative segment paths (typically audio/segment000.ts)
    if (!trimmed.startsWith("#")) {
      return `${trimmed}?token=${encodeURIComponent(token || "")}`;
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
  const token = c.req.query("token");

  logger.info("Stream request: decryption key", { trackId, keyName });

  // 1. Verify Authentication
  const user = await verifyToken(token, c.env.JWT_ACCESS_SECRET);

  // 2. Verify Track Access & Permissions
  await verifyTrackAccess(c, trackId, user.role);

  // 3. Load Key from R2
  const storage = new StorageService(c.env.BUCKET);
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
  const token = c.req.query("token");

  // 1. Verify Authentication
  const user = await verifyToken(token, c.env.JWT_ACCESS_SECRET);

  // 2. Verify Track Access & Permissions
  await verifyTrackAccess(c, trackId, user.role);

  // 3. Stream Segment from R2
  const storage = new StorageService(c.env.BUCKET);
  const fileKey = `songs/processed/${trackId}/audio/${segmentName}`;
  const file = await storage.getFile(fileKey);

  if (!file) {
    throw new NotFoundError("Audio segment not found");
  }

  return new Response(file.body, {
    headers: {
      "Content-Type": "video/MP2T",
      "Cache-Control": "public, max-age=86400", // cache segment files safely
    },
  });
});

export default stream;
