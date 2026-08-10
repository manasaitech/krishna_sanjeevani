import { Hono } from "hono";
import { TrackController } from "./track.controller";
import { requireRole } from "../auth/auth.middleware";
import { Env } from "../../shared/config/env";

const trackRoutes = new Hono<{ Bindings: Env }>();

// ── Public Routes ───────────────────────────────────────
trackRoutes.get("/", TrackController.list);
trackRoutes.get("/tags", TrackController.listTags);

// ── Admin Routes ────────────────────────────────────────
trackRoutes.get("/admin/list", requireRole("admin", "super_admin"), TrackController.listAdmin);
trackRoutes.get("/admin/stats", requireRole("admin", "super_admin"), TrackController.getStats);
trackRoutes.post("/", requireRole("admin", "super_admin"), TrackController.create);
trackRoutes.post("/tags", requireRole("admin", "super_admin"), TrackController.createTag);
trackRoutes.patch("/:id", requireRole("admin", "super_admin"), TrackController.update);
trackRoutes.patch("/:id/publish", requireRole("admin", "super_admin"), TrackController.publish);
trackRoutes.patch("/:id/archive", requireRole("admin", "super_admin"), TrackController.archive);
trackRoutes.patch("/:id/unpublish", requireRole("admin", "super_admin"), TrackController.unpublish);
trackRoutes.delete("/:id", requireRole("admin", "super_admin"), TrackController.remove);

// ── Public Detail Route ─────────────────────────────────
trackRoutes.get("/:id", TrackController.getById);

export default trackRoutes;
