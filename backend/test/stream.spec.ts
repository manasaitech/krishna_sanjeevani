import { env } from "cloudflare:test";
import { describe, it, expect, beforeAll } from "vitest";
import worker from "../src/index";
import { getDB } from "../src/shared/db/client";
import { users } from "../src/shared/db/schema/user";
import { tracks } from "../src/shared/db/schema/track";
import { streamSessions } from "../src/shared/db/schema/stream";
import { subscriptions, plans } from "../src/shared/db/schema/subscription";

// Import raw SQL files using Vite's ?raw loader
import sql0 from "../drizzle/0000_lumpy_arclight.sql?raw";
import sql1 from "../drizzle/0001_icy_thunderball.sql?raw";
import sql2 from "../drizzle/0002_clammy_sunset_bain.sql?raw";
import sql3 from "../drizzle/0003_phase4_track_management.sql?raw";
import sql4 from "../drizzle/0004_phase5_program_management.sql?raw";
import sql5 from "../drizzle/0005_phase6_pregnancy_engine.sql?raw";
import sql6 from "../drizzle/0006_user_listening_progress.sql?raw";
import sql7 from "../drizzle/0007_user_billing_and_payments.sql?raw";

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe("Phase A: Stream Security and Authorization Tests", () => {
  const userFreeId = "user-free-id";
  const userPremiumId = "user-premium-id";
  const trackFreeId = "track-free-id";
  const trackPremiumId = "track-premium-id";

  const ticketValidFree = "ticket-valid-free-uuid";
  const ticketExpiredFree = "ticket-expired-free-uuid";
  const ticketTrackAMismatch = "ticket-track-a-mismatch-uuid";
  const ticketPremiumDenied = "ticket-premium-denied-uuid";
  const ticketPremiumAllowed = "ticket-premium-allowed-uuid";

  beforeAll(async () => {
    // 1. Manually apply D1 migrations to the in-memory test DB by splitting on breakpoints
    const migrations = [sql0, sql1, sql2, sql3, sql4, sql5, sql6, sql7];
    for (const sql of migrations) {
      const statements = sql
        .split("--> statement-breakpoint")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        // Strip SQL comments and convert to single line
        const cleanStmt = statement
          .replace(/--.*$/gm, "")
          .replace(/\r?\n/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        if (cleanStmt) {
          await env.DB.exec(cleanStmt);
        }
      }
    }

    const db = getDB(env as any);

    // 2. Seed D1 users
    await db.insert(users).values([
      { id: userFreeId, email: "free@example.com", passwordHash: "hash", role: "user", createdAt: Date.now(), updatedAt: Date.now() },
      { id: userPremiumId, email: "premium@example.com", passwordHash: "hash", role: "user", createdAt: Date.now(), updatedAt: Date.now() },
    ]);

    // 3. Seed D1 tracks
    await db.insert(tracks).values([
      {
        id: trackFreeId,
        title: "Free Track",
        artist: "Artist A",
        category: "stress",
        duration: 120,
        tier: "free",
        publishStatus: "published",
        processingStatus: "ready",
        createdBy: userFreeId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: trackPremiumId,
        title: "Premium Track",
        artist: "Artist B",
        category: "focus",
        duration: 240,
        tier: "premium",
        publishStatus: "published",
        processingStatus: "ready",
        createdBy: userFreeId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]);

    // 4. Seed subscription plan
    await db.insert(plans).values([
      {
        id: "plan-premium",
        name: "Premium Plan",
        price: 999,
        currency: "INR",
        interval: "month",
        isActive: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
    ]);

    // 5. Seed premium subscription for premium user (valid for 1 hour)
    await db.insert(subscriptions).values([
      {
        id: "sub-1",
        userId: userPremiumId,
        status: "active",
        planId: "plan-premium",
        currentPeriodStart: Date.now() - 1000,
        currentPeriodEnd: Date.now() + 3600 * 1000,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]);

    // 6. Seed stream sessions
    await db.insert(streamSessions).values([
      // Valid session for free track and free user
      { id: ticketValidFree, userId: userFreeId, trackId: trackFreeId, expiresAt: Date.now() + 300 * 1000, createdAt: Date.now() },
      // Expired session for free track and free user
      { id: ticketExpiredFree, userId: userFreeId, trackId: trackFreeId, expiresAt: Date.now() - 1000, createdAt: Date.now() },
      // Session for track-free-id but will be used to access track-premium-id
      { id: ticketTrackAMismatch, userId: userFreeId, trackId: trackFreeId, expiresAt: Date.now() + 300 * 1000, createdAt: Date.now() },
      // Session for premium track by free user
      { id: ticketPremiumDenied, userId: userFreeId, trackId: trackPremiumId, expiresAt: Date.now() + 300 * 1000, createdAt: Date.now() },
      // Session for premium track by premium user
      { id: ticketPremiumAllowed, userId: userPremiumId, trackId: trackPremiumId, expiresAt: Date.now() + 300 * 1000, createdAt: Date.now() },
    ]);

    // 7. Seed SONG_BUCKET object storage
    await env.SONG_BUCKET.put(`songs/processed/${trackFreeId}/audio/segment000.mp3`, "free-segment-data");
    await env.SONG_BUCKET.put(`songs/processed/${trackPremiumId}/audio/segment000.mp3`, "premium-segment-data");
    await env.SONG_BUCKET.put(`songs/uploads/raw.mp3`, "raw-mp3-data");
    await env.SONG_BUCKET.put("images/thumbnails/artwork.jpg", "image-bytes-data");
  });

  it("1. Valid stream ticket -> segment succeeds", async () => {
    const request = new IncomingRequest(`http://example.com/api/v1/stream/${trackFreeId}/audio/segment000.mp3?ticket=${ticketValidFree}`);
    const response = await worker.fetch(request, env as any, {} as any);
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("free-segment-data");
  });

  it("2. Missing ticket -> 401 Unauthorized", async () => {
    const request = new IncomingRequest(`http://example.com/api/v1/stream/${trackFreeId}/audio/segment000.mp3`);
    const response = await worker.fetch(request, env as any, {} as any);
    expect(response.status).toBe(401);
  });

  it("3. Invalid ticket -> 401 Unauthorized", async () => {
    const request = new IncomingRequest(`http://example.com/api/v1/stream/${trackFreeId}/audio/segment000.mp3?ticket=non-existent-ticket`);
    const response = await worker.fetch(request, env as any, {} as any);
    expect(response.status).toBe(401);
  });

  it("4. Expired ticket -> 401 Unauthorized", async () => {
    const request = new IncomingRequest(`http://example.com/api/v1/stream/${trackFreeId}/audio/segment000.mp3?ticket=${ticketExpiredFree}`);
    const response = await worker.fetch(request, env as any, {} as any);
    expect(response.status).toBe(401);
  });

  it("5. Track A ticket accessing Track B -> 403 Forbidden", async () => {
    const request = new IncomingRequest(`http://example.com/api/v1/stream/${trackPremiumId}/audio/segment000.mp3?ticket=${ticketTrackAMismatch}`);
    const response = await worker.fetch(request, env as any, {} as any);
    expect(response.status).toBe(403);
  });

  it("6. Premium track + free user -> 403 Forbidden", async () => {
    const request = new IncomingRequest(`http://example.com/api/v1/stream/${trackPremiumId}/audio/segment000.mp3?ticket=${ticketPremiumDenied}`);
    const response = await worker.fetch(request, env as any, {} as any);
    expect(response.status).toBe(403);
  });

  it("7. Premium track + authorized user -> allowed", async () => {
    const request = new IncomingRequest(`http://example.com/api/v1/stream/${trackPremiumId}/audio/segment000.mp3?ticket=${ticketPremiumAllowed}`);
    const response = await worker.fetch(request, env as any, {} as any);
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("premium-segment-data");
  });

  it("8. Generic storage route accessing audio -> 403 Forbidden", async () => {
    const request = new IncomingRequest(`http://example.com/api/v1/storage/file/songs/processed/${trackFreeId}/audio/segment000.mp3`);
    const response = await worker.fetch(request, env as any, {} as any);
    expect(response.status).toBe(403);
  });

  it("9. Generic storage route accessing raw upload -> 403 Forbidden", async () => {
    const request = new IncomingRequest(`http://example.com/api/v1/storage/file/songs/uploads/raw.mp3`);
    const response = await worker.fetch(request, env as any, {} as any);
    expect(response.status).toBe(403);
  });

  it("10. Legitimate artwork access -> works", async () => {
    const request = new IncomingRequest(`http://example.com/api/v1/storage/file/images/thumbnails/artwork.jpg`);
    const response = await worker.fetch(request, env as any, {} as any);
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("image-bytes-data");
  });
});
