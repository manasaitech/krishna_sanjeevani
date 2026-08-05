import { Hono } from "hono";
import { SignJWT, jwtVerify } from "jose";
import { eq } from "drizzle-orm";
import { getDB } from "../shared/db/client";
import { tracks } from "../shared/db/schema/track";
import { StorageService } from "../modules/storage/storage.service";
import { requireAuth } from "../modules/auth/auth.middleware";
import { UnauthorizedError, ForbiddenError, NotFoundError, ValidationError } from "../shared/errors";
import { ApiResponse } from "../shared/responses";
import { Env } from "../shared/config/env";
import { logger } from "../shared/logger";

const stream = new Hono<{ Bindings: Env }>();

/**
 * Helper to sign a short-lived, track-specific streaming ticket.
 */
async function generateStreamTicket(
  userId: string,
  userRole: string,
  trackId: string,
  secret: string
): Promise<string> {
  const encSecret = new TextEncoder().encode(secret);
  return new SignJWT({
    sub: userId,
    role: userRole,
    trackId: trackId,
    stream: true,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h") // expires in 2 hours
    .sign(encSecret);
}

/**
 * Helper to verify a streaming ticket and ensure it matches the requested track.
 */
async function verifyStreamTicket(
  ticket: string | undefined,
  trackId: string,
  secret: string
) {
  if (!ticket) {
    throw new UnauthorizedError("Streaming ticket is required");
  }

  try {
    const encSecret = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(ticket, encSecret);

    if (payload.trackId !== trackId || !payload.stream) {
      throw new ForbiddenError("Invalid streaming ticket scope");
    }

    return {
      userId: payload.sub as string,
      role: payload.role as string,
    };
  } catch (err) {
    if (err instanceof ForbiddenError) throw err;
    logger.warn("Stream ticket verification failed", err);
    throw new UnauthorizedError("Expired or invalid streaming ticket");
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

// ── POST Request Playback Ticket (Bearer Auth) ──────────
stream.post("/:trackId/ticket", requireAuth(), async (c) => {
  const trackId = c.req.param("trackId");
  if (!trackId) {
    throw new ValidationError("Track ID is required");
  }
  const userId = c.get("userId" as never) as string;
  const userRole = c.get("userRole" as never) as string;

  logger.info("Generating streaming ticket for playback", { trackId, userId });

  // 1. Verify permissions
  await verifyTrackAccess(c, trackId, userRole);

  // 2. Generate short-lived streaming ticket
  const ticket = await generateStreamTicket(userId, userRole, trackId, c.env.JWT_ACCESS_SECRET);
  const streamUrl = `/api/v1/stream/${trackId}/master.m3u8?ticket=${encodeURIComponent(ticket)}`;

  return ApiResponse.success(c, {
    ticket,
    streamUrl,
  }, "Streaming ticket issued successfully");
});

// ── GET Playlists (master.m3u8) ─────────────────────────
stream.get("/:trackId/master.m3u8", async (c) => {
  const trackId = c.req.param("trackId");
  if (!trackId) {
    throw new ValidationError("Track ID is required");
  }
  const ticket = c.req.query("ticket");

  logger.info("Stream request: master playlist", { trackId });

  // 1. Verify Authentication & Track Scope
  await verifyStreamTicket(ticket, trackId, c.env.JWT_ACCESS_SECRET);

  // 2. Load Playlist from R2
  const storage = new StorageService(c.env.BUCKET);
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

  // 1. Verify Authentication & Track Scope
  await verifyStreamTicket(ticket, trackId, c.env.JWT_ACCESS_SECRET);

  // 2. Load Key from R2
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
  if (!trackId || !segmentName) {
    throw new ValidationError("Track ID and Segment Name are required");
  }
  const ticket = c.req.query("ticket");

  // 1. Verify Authentication & Track Scope
  await verifyStreamTicket(ticket, trackId, c.env.JWT_ACCESS_SECRET);

  // 2. Stream Segment from R2
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
