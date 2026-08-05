import { R2Bucket } from "@cloudflare/workers-types";
import { StorageFile, UploadResult } from "./storage.types";
import { NotFoundError } from "../../shared/errors";
import { logger } from "../../shared/logger";

export class StorageService {
  constructor(private bucket: R2Bucket) {}

  /**
   * Uploads a file (audio, image, etc.) directly to Cloudflare R2.
   */
  async uploadFile(
    key: string,
    body: ReadableStream | ArrayBuffer | string,
    contentType: string
  ): Promise<UploadResult> {
    logger.info("Uploading file to R2", { key, contentType });

    const object = await this.bucket.put(key, body, {
      httpMetadata: { contentType },
    });

    if (!object) {
      throw new Error(`Failed to upload object: ${key}`);
    }

    logger.info("Upload to R2 successful", { key, size: object.size });

    return {
      key: object.key,
      size: object.size,
      contentType: object.httpMetadata?.contentType || contentType,
      etag: object.etag,
    };
  }

  /**
   * Retrieves a file's body and metadata from Cloudflare R2.
   */
  async getFile(key: string): Promise<StorageFile | null> {
    logger.info("Fetching file from R2", { key });

    const object = await this.bucket.get(key);
    if (!object) {
      return null;
    }

    return {
      body: object.body,
      contentType: object.httpMetadata?.contentType || "application/octet-stream",
      size: object.size,
      etag: object.etag,
    };
  }

  /**
   * Deletes a file from Cloudflare R2.
   */
  async deleteFile(key: string): Promise<void> {
    logger.info("Deleting file from R2", { key });

    const object = await this.bucket.get(key);
    if (!object) {
      throw new NotFoundError(`File not found: ${key}`);
    }

    await this.bucket.delete(key);
    logger.info("File deleted from R2", { key });
  }

  /**
   * Generates a unique secure storage key using random UUID.
   */
  generateObjectKey(prefix: string, extension: string): string {
    const uuid = crypto.randomUUID();
    const cleanExt = extension.replace(/^\./, "");
    return `${prefix}/${uuid}.${cleanExt}`;
  }
}
