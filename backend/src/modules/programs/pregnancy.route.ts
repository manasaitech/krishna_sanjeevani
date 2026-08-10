import { Hono } from "hono";
import { PregnancyController } from "./pregnancy.controller";
import { requireAuth, requireRole } from "../auth/auth.middleware";
import { Env } from "../../shared/config/env";

const pregnancyRoutes = new Hono<{ Bindings: Env }>();

// ── Public / User Routes ────────────────────────────────
pregnancyRoutes.get("/programs", PregnancyController.list);
pregnancyRoutes.get("/today", requireAuth(), PregnancyController.getToday);
pregnancyRoutes.get("/week/:week", PregnancyController.getByWeek);
pregnancyRoutes.get("/month/:month", PregnancyController.getByMonth);
pregnancyRoutes.post("/user-info", requireAuth(), PregnancyController.saveUserInfo);

// ── Admin Routes ────────────────────────────────────────
pregnancyRoutes.post("/schedule", requireRole("admin", "super_admin"), PregnancyController.createSchedule);
pregnancyRoutes.patch("/schedule/:id", requireRole("admin", "super_admin"), PregnancyController.updateSchedule);
pregnancyRoutes.delete("/schedule/:id", requireRole("admin", "super_admin"), PregnancyController.removeSchedule);

export default pregnancyRoutes;
