import { Hono } from "hono";
import { StorageController } from "./storage.controller";
import { requireRole } from "../auth/auth.middleware";
import { Env } from "../../shared/config/env";

const storage = new Hono<{ Bindings: Env }>();

// ── Admin Protected Storage Routes ──────────────────────
storage.post("/upload/audio", requireRole("admin", "super_admin"), StorageController.uploadAudio);
storage.post("/upload/image", requireRole("admin", "super_admin"), StorageController.uploadImage);
storage.delete("/file", requireRole("admin", "super_admin"), StorageController.deleteFile);

export default storage;
