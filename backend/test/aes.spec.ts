import { env } from "cloudflare:test";
import { describe, it, expect, beforeAll } from "vitest";
import worker from "../src/index";
import { getDB } from "../src/shared/db/client";
import { users } from "../src/shared/db/schema/user";
import { tracks } from "../src/shared/db/schema/track";
import { segmentMp3 } from "../src/shared/audio/segmenter";

// Import raw SQL files using Vite's ?raw loader
import sql0 from "../drizzle/0000_lumpy_arclight.sql?raw";
import sql1 from "../drizzle/0001_icy_thunderball.sql?raw";
import sql2 from "../drizzle/0002_clammy_sunset_bain.sql?raw";
import sql3 from "../drizzle/0003_phase4_track_management.sql?raw";
import sql4 from "../drizzle/0004_phase5_program_management.sql?raw";
import sql5 from "../drizzle/0005_phase6_pregnancy_engine.sql?raw";
import sql6 from "../drizzle/0006_user_listening_progress.sql?raw";
import sql7 from "../drizzle/0007_user_billing_and_payments.sql?raw";

function generateMockMp3(): Uint8Array {
  // Each frame: 104 bytes.
  // Samples per frame: 1152. Sample rate: 44100.
  // Duration per frame = 1152 / 44100 = 0.02612s (26.12ms).
  // 100 frames will give 2.61 seconds of audio, which triggers a segment flush (target 2s)
  const frameCount = 100;
  const frameSize = 104;
  const mp3Bytes = new Uint8Array(frameCount * frameSize);

  for (let i = 0; i < frameCount; i++) {
    const offset = i * frameSize;
    mp3Bytes[offset] = 0xFF;     // Syncword byte 1
    mp3Bytes[offset + 1] = 0xFA; // Syncword + MPEG-1 + Layer III + No Protection
    mp3Bytes[offset + 2] = 0x10; // 32kbps + 44.1kHz + No Padding
    mp3Bytes[offset + 3] = 0x00; // Private + Mode + Mode extension + Copy + Original + Emphasis
  }
  return mp3Bytes;
}

describe("Phase C: AES-128 HLS Segment Encryption Tests", () => {
  const trackId = "aes-test-track-id";
  let mockMp3Data: Uint8Array;

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

    // 2. Seed a user
    const userId = "aes-user-id";
    await db.insert(users).values([
      { id: userId, email: "aes@example.com", passwordHash: "hash", role: "admin", createdAt: Date.now(), updatedAt: Date.now() },
    ]);

    // 3. Seed a track in 'uploaded' state
    await db.insert(tracks).values([
      {
        id: trackId,
        title: "AES Track",
        artist: "Artist C",
        category: "stress",
        duration: 0,
        tier: "free",
        publishStatus: "draft",
        processingStatus: "uploaded",
        createdBy: userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]);

    // 4. Put the mock MP3 file into R2 uploads
    mockMp3Data = generateMockMp3();
    await env.SONG_BUCKET.put(`songs/uploads/raw.mp3`, mockMp3Data);
  });

  it("1. Run queue transcoding worker and verify encryption correctness", async () => {
    // 1a. Trigger the queue worker method
    const batch = {
      messages: [
        {
          id: "msg-transcode",
          body: {
            trackId: trackId,
            key: "songs/uploads/raw.mp3",
            size: mockMp3Data.byteLength,
          },
          ack() {},
        },
      ],
    };

    await worker.queue(batch, env as any, {} as any);

    // 1b. Check database track processingStatus -> 'ready'
    const db = getDB(env as any);
    const trackRows = await db.select().from(tracks).where(eq(tracks.id, trackId)).limit(1);
    expect(trackRows.length).toBe(1);
    expect(trackRows[0].processingStatus).toBe("ready");

    // 1c. Load and verify master.m3u8
    const m3u8Obj = await env.SONG_BUCKET.get(`songs/processed/${trackId}/master.m3u8`);
    expect(m3u8Obj).not.toBeNull();
    const m3u8Text = await m3u8Obj!.text();
    expect(m3u8Text).toContain('#EXT-X-KEY:METHOD=AES-128,URI="keys/aes.key",IV=0x');

    // 1d. Extract IV from the playlist manifest
    const match = m3u8Text.match(/IV=0x([0-9a-fA-F]+)/);
    expect(match).not.toBeNull();
    const ivHex = match![1];
    expect(ivHex.length).toBe(32); // 16 bytes = 32 hex chars

    const ivBytes = new Uint8Array(
      ivHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
    );
    expect(ivBytes.length).toBe(16);

    // 1e. Load decryption key from R2 and verify size
    const keyObj = await env.SONG_BUCKET.get(`songs/processed/${trackId}/keys/aes.key`);
    expect(keyObj).not.toBeNull();
    const keyBytes = new Uint8Array(await keyObj!.arrayBuffer());
    expect(keyBytes.length).toBe(16);

    // 1f. Fetch the encrypted segment and decrypt it
    const segmentObj = await env.SONG_BUCKET.get(`songs/processed/${trackId}/audio/segment000.mp3`);
    expect(segmentObj).not.toBeNull();
    const encryptedData = await segmentObj!.arrayBuffer();

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "AES-CBC", length: 128 },
      false,
      ["decrypt"]
    );

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-CBC",
        iv: ivBytes,
      },
      cryptoKey,
      encryptedData
    );

    const decryptedBytes = new Uint8Array(decryptedBuffer);

    // 1g. Run the same segmenter on the original mock MP3 to get raw segment bytes
    const localResult = segmentMp3(mockMp3Data.buffer, 6);
    expect(localResult.segments.length).toBeGreaterThan(0);
    const originalSegmentBytes = new Uint8Array(localResult.segments[0].data);

    // 1h. Verify decrypted matches original bytes losslessly!
    expect(decryptedBytes.length).toBe(originalSegmentBytes.length);
    expect(decryptedBytes).toEqual(originalSegmentBytes);
  });
});

// Import eq operator for track query
import { eq } from "drizzle-orm";
