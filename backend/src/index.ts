import app from "./app";
import { Env } from "./shared/config/env";
import { logger } from "./shared/logger";
import { getDB } from "./shared/db/client";
import { tracks } from "./shared/db/schema/track";
import { eq } from "drizzle-orm";
import { StorageService } from "./modules/storage/storage.service";
import { segmentMp3 } from "./shared/audio/segmenter";

export default {
  // Serve incoming HTTP/API requests
  fetch: app.fetch,

  // Listen to queue messages for asynchronous processing
  async queue(batch: any, env: Env, ctx: any) {
    logger.info("Media Pipeline Queue: Received batch", { messagesCount: batch.messages?.length });
    const db = getDB(env);
    const storage = new StorageService(env.SONG_BUCKET);

    for (const message of batch.messages) {
      const { trackId, key, size } = message.body || {};
      logger.info("Media Pipeline Queue: Ingesting track file", {
        messageId: message.id,
        trackId,
        key,
        size,
      });

      try {
        // 1. Update processing status to 'processing'
        await db.update(tracks).set({ processingStatus: "processing" }).where(eq(tracks.id, trackId));

        // 2. Download the uploaded MP3 file from R2
        const rawFile = await storage.getFile(key);
        if (!rawFile) {
          throw new Error(`Media Pipeline: Uploaded MP3 file not found in R2 for key ${key}`);
        }

        const arrayBuffer = await new Response(rawFile.body).arrayBuffer();

        // 3. Update processing status to 'transcoding' and run segmenter
        await db.update(tracks).set({ processingStatus: "transcoding" }).where(eq(tracks.id, trackId));
        
        const { segments, totalDuration } = segmentMp3(arrayBuffer, 6);

        // 4. Update status to 'uploading' and begin uploading HLS chunks
        await db.update(tracks).set({ processingStatus: "uploading" }).where(eq(tracks.id, trackId));

        // Generate random AES key and IV
        const aesKey = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(16));

        // Import key into Web Crypto format
        const cryptoKey = await crypto.subtle.importKey(
          "raw",
          aesKey,
          { name: "AES-CBC", length: 128 },
          false,
          ["encrypt"]
        );

        // Upload HLS segment files encrypted with AES-CBC
        for (let i = 0; i < segments.length; i++) {
          const encryptedBuffer = await crypto.subtle.encrypt(
            {
              name: "AES-CBC",
              iv: iv,
            },
            cryptoKey,
            segments[i].data
          );

          const segmentKey = `songs/processed/${trackId}/audio/segment${String(i).padStart(3, "0")}.mp3`;
          await storage.uploadFile(segmentKey, encryptedBuffer, "audio/mpeg");
        }

        // Upload decryption key privately to R2
        const keyKey = `songs/processed/${trackId}/keys/aes.key`;
        const keyBuffer = aesKey.buffer.slice(aesKey.byteOffset, aesKey.byteOffset + aesKey.byteLength);
        await storage.uploadFile(keyKey, keyBuffer, "application/octet-stream");

        // Generate IV hex representation
        const ivHex = Array.from(iv)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        // Generate master.m3u8 index file with #EXT-X-KEY definition
        const maxSegmentDuration = Math.ceil(Math.max(...segments.map((s) => s.duration)));
        let m3u8 = `#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:${maxSegmentDuration}\n#EXT-X-MEDIA-SEQUENCE:0\n`;
        m3u8 += `#EXT-X-KEY:METHOD=AES-128,URI="keys/aes.key",IV=0x${ivHex}\n`;
        for (let i = 0; i < segments.length; i++) {
          m3u8 += `#EXTINF:${segments[i].duration.toFixed(3)},\naudio/segment${String(i).padStart(3, "0")}.mp3\n`;
        }
        m3u8 += "#EXT-X-ENDLIST\n";

        const playlistKey = `songs/processed/${trackId}/master.m3u8`;
        const textEncoder = new TextEncoder();
        const m3u8Bytes = textEncoder.encode(m3u8);
        const m3u8Buffer = m3u8Bytes.buffer.slice(
          m3u8Bytes.byteOffset,
          m3u8Bytes.byteOffset + m3u8Bytes.byteLength
        );
        await storage.uploadFile(playlistKey, m3u8Buffer as ArrayBuffer, "application/x-mpegURL");

        // 5. Update DB track entry to 'ready'
        await db
          .update(tracks)
          .set({
            processingStatus: "ready",
            publishStatus: "draft", // Start as draft after transcoding completes
            playlistKey,
            duration: Math.round(totalDuration),
            updatedAt: Date.now(),
          })
          .where(eq(tracks.id, trackId));

        // 6. Delete original raw uploaded MP3 from R2 to save space
        await storage.deleteFile(key);
        logger.info("Media Pipeline Queue: Track processed successfully", { trackId });

        // Acknowledge processing completion to empty the queue
        // message.ack();
      } catch (err) {
        logger.error("Media Pipeline Queue: Transcoding job failed", err, { trackId });
        try {
          await db.update(tracks).set({ processingStatus: "failed" }).where(eq(tracks.id, trackId));
        } catch (dbErr) {
          logger.error("Media Pipeline Queue: Failed to write failure status to DB", dbErr);
        }
        // Throw the error so the queue system knows it failed and retries it
        throw err;
      }
    }
  },
};
