import { Hono } from "hono";
import { ProgramController } from "./program.controller";
import { requireAuth, requireRole } from "../auth/auth.middleware";
import { Env } from "../../shared/config/env";

const programRoutes = new Hono<{ Bindings: Env }>();

// ── Public / User Routes ────────────────────────────────
programRoutes.get("/", ProgramController.list);
programRoutes.get("/:id", ProgramController.getById);
programRoutes.get("/:id/tracks", ProgramController.getTracks);
programRoutes.get("/:id/progress", requireAuth(), ProgramController.getProgress);
programRoutes.post("/:id/tracks/:trackId/complete", requireAuth(), ProgramController.completeTrack);

// ── Admin Routes ────────────────────────────────────────
programRoutes.get("/admin/list", requireRole("admin", "super_admin"), ProgramController.listAdmin);
programRoutes.get("/admin/stats", requireRole("admin", "super_admin"), ProgramController.getStats);
programRoutes.post("/", requireRole("admin", "super_admin"), ProgramController.create);
programRoutes.patch("/:id", requireRole("admin", "super_admin"), ProgramController.update);
programRoutes.delete("/:id", requireRole("admin", "super_admin"), ProgramController.remove);
programRoutes.patch("/:id/publish", requireRole("admin", "super_admin"), ProgramController.publish);
programRoutes.patch("/:id/unpublish", requireRole("admin", "super_admin"), ProgramController.unpublish);
programRoutes.patch("/:id/archive", requireRole("admin", "super_admin"), ProgramController.archive);
programRoutes.get("/:id/pregnancy-schedules", requireRole("admin", "super_admin"), ProgramController.getPregnancySchedules);
programRoutes.post("/:id/tracks", requireRole("admin", "super_admin"), ProgramController.addTrack);
programRoutes.delete("/:id/tracks/:trackId", requireRole("admin", "super_admin"), ProgramController.removeTrack);
programRoutes.patch("/:id/tracks/reorder", requireRole("admin", "super_admin"), ProgramController.reorderTracks);
programRoutes.post("/:id/duplicate", requireRole("admin", "super_admin"), ProgramController.duplicate);

export default programRoutes;
