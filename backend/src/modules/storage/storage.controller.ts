import { Context } from "hono";
import { StorageService } from "./storage.service";
import { STORAGE_CONSTANTS } from "./storage.constants";
import { deleteFileSchema } from "./storage.validator";
import { ApiResponse } from "../../shared/responses";
import { ValidationError } from "../../shared/errors";
import { Env } from "../../shared/config/env";
import { logger } from "../../shared/logger";

function getStorageService(env: Env): StorageService {
  return new StorageService(env.BUCKET);
}

export class StorageController {
  /**
   * Handles audio uploads from Admins (raw files to processed queue later).
   */
  static async uploadAudio(c: Context<{ Bindings: Env }>) {
    logger.info("StorageController: Starting audio upload request validation");

    const body = await c.req.parseBody();
    const file = body.file;

    if (!file || !(file instanceof File)) {
      throw new ValidationError("Audio file is required in 'file' field");
    }

    // Validate MIME type
    if (!STORAGE_CONSTANTS.AUDIO_MIME_TYPES.includes(file.type)) {
      throw new ValidationError(`Unsupported audio type: ${file.type}. Allowed: MP3.`);
    }

    // Validate File Size
    if (file.size > STORAGE_CONSTANTS.AUDIO_SIZE_LIMIT) {
      throw new ValidationError(
        `Audio file is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Max: 50MB.`
      );
    }

    // Generate unique key
    const extension = file.name.split(".").pop() || "mp3";
    const service = getStorageService(c.env);
    const key = service.generateObjectKey(STORAGE_CONSTANTS.PATHS.AUDIO_UPLOADS, extension);

    // Convert file to ArrayBuffer
    const buffer = await file.arrayBuffer();

    // Upload to R2
    const result = await service.uploadFile(key, buffer, file.type);

    // Publish event to Cloudflare Queue for async media processing (HLS/FFmpeg conversion)
    const trackId = crypto.randomUUID();
    await c.env.MEDIA_QUEUE.send({
      trackId,
      key: result.key,
      size: result.size,
      contentType: result.contentType,
      timestamp: Date.now(),
    });

    logger.info("Media Pipeline: Message sent to queue", { trackId, key });

    return ApiResponse.success(
      c,
      {
        key: result.key,
        size: result.size,
        contentType: result.contentType,
      },
      "Audio uploaded successfully to queue directory",
      201
    );
  }

  /**
   * Handles image uploads from Admins (thumbnails, art, avatars).
   */
  static async uploadImage(c: Context<{ Bindings: Env }>) {
    logger.info("StorageController: Starting image upload request validation");

    const body = await c.req.parseBody();
    const file = body.file;

    if (!file || !(file instanceof File)) {
      throw new ValidationError("Image file is required in 'file' field");
    }

    // Validate MIME type
    if (!STORAGE_CONSTANTS.IMAGE_MIME_TYPES.includes(file.type)) {
      throw new ValidationError(`Unsupported image type: ${file.type}. Allowed: JPEG, PNG, WEBP.`);
    }

    // Validate File Size
    if (file.size > STORAGE_CONSTANTS.IMAGE_SIZE_LIMIT) {
      throw new ValidationError(
        `Image file is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Max: 5MB.`
      );
    }

    // Generate unique key
    const extension = file.name.split(".").pop() || "jpg";
    const service = getStorageService(c.env);
    const key = service.generateObjectKey(STORAGE_CONSTANTS.PATHS.THUMBNAILS, extension);

    // Convert file to ArrayBuffer
    const buffer = await file.arrayBuffer();

    // Upload to R2
    const result = await service.uploadFile(key, buffer, file.type);

    return ApiResponse.success(
      c,
      {
        key: result.key,
        size: result.size,
        contentType: result.contentType,
      },
      "Image uploaded successfully",
      201
    );
  }

  /**
   * Handles object deletion from R2 (Admin only).
   */
  static async deleteFile(c: Context<{ Bindings: Env }>) {
    const body = await c.req.json();
    const parsed = deleteFileSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError("Validation failed", parsed.error.issues);
    }

    const service = getStorageService(c.env);
    await service.deleteFile(parsed.data.key);

    return ApiResponse.success(c, null, "File deleted successfully from storage");
  }
}
