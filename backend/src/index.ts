import app from "./app";
import { Env } from "./shared/config/env";
import { logger } from "./shared/logger";

export default {
  // Serve incoming HTTP/API requests
  fetch: app.fetch,

  // Listen to queue messages for asynchronous processing
  async queue(batch: any, env: Env, ctx: any) {
    logger.info("Media Pipeline Queue: Received batch", { messagesCount: batch.messages?.length });

    for (const message of batch.messages) {
      const { trackId, key, size } = message.body || {};
      logger.info("Media Pipeline Queue: Ingesting track file", {
        messageId: message.id,
        trackId,
        key,
        size,
      });

      // ── Media Pipeline Flow ───────────────────────────────
      // In a full production environment, this is where:
      // 1. A Media processing microservice receives this event.
      // 2. Transcodes raw MP3 to segmented TS (using FFmpeg).
      // 3. Encrypts segment files with AES-128.
      // 4. Uploads them to R2 bucket under `songs/processed/:trackId/`.
      // 5. Updates track metadata in D1 database (`is_active` set to 1).
      // 6. Deletes the original raw upload from `songs/uploads/`.
      // ──────────────────────────────────────────────────────

      // Acknowledge processing completion to empty the queue
      message.ack();
    }
  },
};
