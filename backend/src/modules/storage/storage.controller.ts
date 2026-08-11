import { Context } from "hono";
import { StorageService } from "./storage.service";
import { STORAGE_CONSTANTS } from "./storage.constants";
import { deleteFileSchema } from "./storage.validator";
import { ApiResponse } from "../../shared/responses";
import { ValidationError, NotFoundError, ForbiddenError } from "../../shared/errors";
import { Env } from "../../shared/config/env";
import { logger } from "../../shared/logger";

function getStorageService(env: Env): StorageService {
  return new StorageService(env.SONG_BUCKET);
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
    const trackId = typeof body.trackId === "string" ? body.trackId : crypto.randomUUID();
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
        trackId,
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

  /**
   * Serves public files (like thumbnails/art) from R2.
   */
  static async getFile(c: Context<{ Bindings: Env }>) {
    const path = c.req.path;
    const marker = "/storage/file/";
    const markerIndex = path.indexOf(marker);
    if (markerIndex === -1) {
      throw new ValidationError("File key is required");
    }
    const key = decodeURIComponent(path.substring(markerIndex + marker.length));
    if (!key) {
      throw new ValidationError("File key is required");
    }

    if (!key.startsWith("images/")) {
      throw new ForbiddenError("Access to this file key is restricted");
    }

    logger.info("StorageController: Serving public file", { key });

    const service = getStorageService(c.env);
    const file = await service.getFile(key);

    if (!file) {
      throw new NotFoundError("File not found");
    }

    // Set appropriate content type headers
    const contentType = file.contentType || "application/octet-stream";

    return new Response(file.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000", // cache statically for 1 year
      },
    });
  }

  /**
   * Start R2 Multipart Upload
   */
  static async startMultipartUpload(c: Context<{ Bindings: Env }>) {
    logger.info("StorageController: Starting multipart upload");
    const body = await c.req.json();
    const { filename, contentType } = body;

    if (!filename) {
      throw new ValidationError("Filename is required");
    }

    const type = contentType || "audio/mpeg";
    if (!STORAGE_CONSTANTS.AUDIO_MIME_TYPES.includes(type)) {
      throw new ValidationError(`Unsupported audio type: ${type}. Allowed: MP3.`);
    }

    const extension = filename.split(".").pop() || "mp3";
    const service = getStorageService(c.env);
    const key = service.generateObjectKey(STORAGE_CONSTANTS.PATHS.AUDIO_UPLOADS, extension);

    const multipart = await service.startMultipartUpload(key, type);

    return ApiResponse.success(
      c,
      {
        uploadId: multipart.uploadId,
        key: multipart.key,
      },
      "Multipart upload started",
      201
    );
  }

  /**
   * Upload Part
   */
  static async uploadPart(c: Context<{ Bindings: Env }>) {
    const uploadId = c.req.query("uploadId");
    const key = c.req.query("key");
    const partNumberStr = c.req.query("partNumber");

    if (!uploadId || !key || !partNumberStr) {
      throw new ValidationError("uploadId, key, and partNumber are required in query params");
    }

    const partNumber = parseInt(partNumberStr, 10);
    if (isNaN(partNumber) || partNumber < 1 || partNumber > 10000) {
      throw new ValidationError("Invalid partNumber. Must be between 1 and 10000.");
    }

    // Read chunk from request body as ArrayBuffer
    const buffer = await c.req.arrayBuffer();
    if (!buffer || buffer.byteLength === 0) {
      throw new ValidationError("Request body is empty; part content is required");
    }

    const service = getStorageService(c.env);
    const multipart = service.resumeMultipartUpload(key, uploadId);

    logger.info("StorageController: Uploading part", { key, partNumber, size: buffer.byteLength });
    const uploadedPart = await multipart.uploadPart(partNumber, buffer);

    return ApiResponse.success(
      c,
      {
        partNumber: uploadedPart.partNumber,
        etag: uploadedPart.etag,
      },
      "Part uploaded successfully"
    );
  }

  /**
   * Complete Multipart Upload
   */
  static async completeMultipartUpload(c: Context<{ Bindings: Env }>) {
    logger.info("StorageController: Completing multipart upload");
    const body = await c.req.json();
    const { uploadId, key, parts, trackId } = body;

    if (!uploadId || !key || !parts || !Array.isArray(parts)) {
      throw new ValidationError("uploadId, key, and parts array are required");
    }

    const service = getStorageService(c.env);
    const multipart = service.resumeMultipartUpload(key, uploadId);

    // Complete the upload in R2
    const object = await multipart.complete(parts);
    logger.info("Multipart upload complete, R2 object created", { key: object.key, size: object.size });

    // Publish event to Cloudflare Queue for async media processing
    const generatedTrackId = typeof trackId === "string" ? trackId : crypto.randomUUID();
    await c.env.MEDIA_QUEUE.send({
      trackId: generatedTrackId,
      key: object.key,
      size: object.size,
      contentType: "audio/mpeg",
      timestamp: Date.now(),
    });

    return ApiResponse.success(
      c,
      {
        trackId: generatedTrackId,
        key: object.key,
        size: object.size,
      },
      "Multipart upload completed and queue triggered",
      200
    );
  }

  /**
   * Abort Multipart Upload
   */
  static async abortMultipartUpload(c: Context<{ Bindings: Env }>) {
    logger.info("StorageController: Aborting multipart upload");
    const body = await c.req.json();
    const { uploadId, key } = body;

    if (!uploadId || !key) {
      throw new ValidationError("uploadId and key are required");
    }

    const service = getStorageService(c.env);
    const multipart = service.resumeMultipartUpload(key, uploadId);

    await multipart.abort();
    logger.info("Multipart upload aborted", { key, uploadId });

    return ApiResponse.success(c, null, "Multipart upload aborted successfully");
  }
}
