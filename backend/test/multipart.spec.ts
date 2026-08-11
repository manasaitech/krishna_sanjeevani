import { env } from "cloudflare:test";
import { describe, it, expect, beforeAll } from "vitest";
import { SignJWT } from "jose";
import worker from "../src/index";
import { getDB } from "../src/shared/db/client";
import { users } from "../src/shared/db/schema/user";

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

async function createTestToken(sub: string, role: string, email: string, secretKey: string): Promise<string> {
  const secret = new TextEncoder().encode(secretKey);
  return new SignJWT({ sub, role, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
}

describe("Phase B: Cloudflare R2 Multipart Upload Tests", () => {
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    // 1. Apply database migrations
    const migrations = [sql0, sql1, sql2, sql3, sql4, sql5, sql6, sql7];
    for (const sql of migrations) {
      const statements = sql
        .split("--> statement-breakpoint")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
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

    // 2. Seed admin and user
    const adminId = "admin-user-id";
    const userId = "regular-user-id";
    await db.insert(users).values([
      { id: adminId, email: "admin@example.com", passwordHash: "hash", role: "admin", createdAt: Date.now(), updatedAt: Date.now() },
      { id: userId, email: "user@example.com", passwordHash: "hash", role: "user", createdAt: Date.now(), updatedAt: Date.now() },
    ]);

    // 3. Generate JWT tokens
    const secret = env.JWT_ACCESS_SECRET as string;
    adminToken = await createTestToken(adminId, "admin", "admin@example.com", secret);
    userToken = await createTestToken(userId, "user", "user@example.com", secret);
  });

  it("1. Start multipart upload (Unauthorized) -> 401", async () => {
    const request = new IncomingRequest("http://example.com/api/v1/storage/upload/audio/multipart/start", {
      method: "POST",
      body: JSON.stringify({ filename: "test.mp3", contentType: "audio/mpeg" }),
    });
    const response = await worker.fetch(request, env as any, {} as any);
    expect(response.status).toBe(401);
  });

  it("2. Start multipart upload (Non-admin) -> 403", async () => {
    const request = new IncomingRequest("http://example.com/api/v1/storage/upload/audio/multipart/start", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filename: "test.mp3", contentType: "audio/mpeg" }),
    });
    const response = await worker.fetch(request, env as any, {} as any);
    expect(response.status).toBe(403);
  });

  it("3. Start multipart upload (Admin - Invalid Type) -> 400", async () => {
    const request = new IncomingRequest("http://example.com/api/v1/storage/upload/audio/multipart/start", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filename: "test.png", contentType: "image/png" }),
    });
    const response = await worker.fetch(request, env as any, {} as any);
    expect(response.status).toBe(400);
  });

  it("4. Start multipart upload (Admin - Valid Type) -> 201 Created", async () => {
    const request = new IncomingRequest("http://example.com/api/v1/storage/upload/audio/multipart/start", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filename: "raga_bhairavi.mp3", contentType: "audio/mpeg" }),
    });
    const response = await worker.fetch(request, env as any, {} as any);
    expect(response.status).toBe(201);
    const body = await response.json() as any;
    expect(body.success).toBe(true);
    expect(body.data.uploadId).toBeTypeOf("string");
    expect(body.data.key).toBeTypeOf("string");
  });

  it("5. Full multipart lifecycle (Start -> Upload Parts -> Complete) -> 200 Complete", async () => {
    // 5a. Start
    const startRequest = new IncomingRequest("http://example.com/api/v1/storage/upload/audio/multipart/start", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filename: "lifecycle.mp3", contentType: "audio/mpeg" }),
    });
    const startRes = await worker.fetch(startRequest, env as any, {} as any);
    const startData = (await startRes.json() as any).data;
    const { uploadId, key } = startData;

    // 5b. Upload Part 1 (5MB to satisfy R2 part size limit)
    const p1Data = new Uint8Array(5 * 1024 * 1024);
    p1Data[0] = 1; p1Data[1] = 2;
    const part1Request = new IncomingRequest(
      `http://example.com/api/v1/storage/upload/audio/multipart/part?uploadId=${uploadId}&key=${encodeURIComponent(key)}&partNumber=1`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${adminToken}`,
          "Content-Type": "application/octet-stream",
        },
        body: p1Data.buffer,
      }
    );
    const p1Res = await worker.fetch(part1Request, env as any, {} as any);
    expect(p1Res.status).toBe(200);
    const p1ResData = (await p1Res.json() as any).data;
    expect(p1ResData.partNumber).toBe(1);
    expect(p1ResData.etag).toBeTypeOf("string");

    // 5c. Upload Part 2 (10 bytes - last part can be small)
    const p2Data = new Uint8Array([6, 7, 8, 9, 10]);
    const part2Request = new IncomingRequest(
      `http://example.com/api/v1/storage/upload/audio/multipart/part?uploadId=${uploadId}&key=${encodeURIComponent(key)}&partNumber=2`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${adminToken}`,
          "Content-Type": "application/octet-stream",
        },
        body: p2Data.buffer,
      }
    );
    const p2Res = await worker.fetch(part2Request, env as any, {} as any);
    expect(p2Res.status).toBe(200);
    const p2ResData = (await p2Res.json() as any).data;
    expect(p2ResData.partNumber).toBe(2);
    expect(p2ResData.etag).toBeTypeOf("string");

    // 5d. Complete
    const completeRequest = new IncomingRequest("http://example.com/api/v1/storage/upload/audio/multipart/complete", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uploadId,
        key,
        parts: [
          { partNumber: 1, etag: p1ResData.etag },
          { partNumber: 2, etag: p2ResData.etag },
        ],
        trackId: "lifecycle-track-id",
      }),
    });
    const completeRes = await worker.fetch(completeRequest, env as any, {} as any);
    expect(completeRes.status).toBe(200);
    const completeData = (await completeRes.json() as any).data;
    expect(completeData.key).toBe(key);
  });

  it("6. Multipart lifecycle (Start -> Abort) -> Success", async () => {
    // 6a. Start
    const startRequest = new IncomingRequest("http://example.com/api/v1/storage/upload/audio/multipart/start", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filename: "abort_test.mp3", contentType: "audio/mpeg" }),
    });
    const startRes = await worker.fetch(startRequest, env as any, {} as any);
    const startData = (await startRes.json() as any).data;
    const { uploadId, key } = startData;

    // 6b. Abort
    const abortRequest = new IncomingRequest("http://example.com/api/v1/storage/upload/audio/multipart/abort", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uploadId, key }),
    });
    const abortRes = await worker.fetch(abortRequest, env as any, {} as any);
    expect(abortRes.status).toBe(200);
  });
});
