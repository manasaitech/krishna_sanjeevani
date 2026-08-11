import { Hono } from "hono";
import { StorageController } from "./storage.controller";
import { requireRole } from "../auth/auth.middleware";
import { Env } from "../../shared/config/env";

const storage = new Hono<{ Bindings: Env }>();

// ── Admin Protected Storage Routes ──────────────────────
storage.post("/upload/audio", requireRole("admin", "super_admin"), StorageController.uploadAudio);
storage.post("/upload/audio/multipart/start", requireRole("admin", "super_admin"), StorageController.startMultipartUpload);
storage.post("/upload/audio/multipart/part", requireRole("admin", "super_admin"), StorageController.uploadPart);
storage.post("/upload/audio/multipart/complete", requireRole("admin", "super_admin"), StorageController.completeMultipartUpload);
storage.post("/upload/audio/multipart/abort", requireRole("admin", "super_admin"), StorageController.abortMultipartUpload);
storage.post("/upload/image", requireRole("admin", "super_admin"), StorageController.uploadImage);
storage.delete("/file", requireRole("admin", "super_admin"), StorageController.deleteFile);

// ── Public Storage Routes ───────────────────────────────
storage.get("/file/*", StorageController.getFile);

export default storage;
