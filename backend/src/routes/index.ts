import { Hono } from "hono";
import { Env } from "../shared/config/env";
import healthRoute from "./health.route";
import authRoute from "../core/auth";
import userRoute from "../core/users";
import usageRoute from "../core/usage";
import adminRoute from "../modules/admin/admin.route";
import storageRoute from "../modules/storage/storage.route";
import surawaliRoutes from "../modes/surawali/routes";
import emotionRoutes from "../modes/emotion-remediation/routes";
import { requireMode } from "../core/middleware/mode-guard";

const routes = new Hono<{ Bindings: Env }>();

// ── Shared Core Routes (Available in all modes) ──
routes.route("/", healthRoute);
routes.route("/auth", authRoute);
routes.route("/users", userRoute);
routes.route("/usage", usageRoute);
routes.route("/admin", adminRoute);
routes.route("/storage", storageRoute);

// ── Surawali Mode Routes (Protected by mode guard) ──
routes.use("/surawali/*", requireMode("surawali"));
routes.route("/surawali", surawaliRoutes);

// Surawali top-level route aliases (for backward-compatibility with Surawali frontend)
routes.use("/tracks/*", requireMode("surawali"));
routes.use("/programs/*", requireMode("surawali"));
routes.use("/pregnancy/*", requireMode("surawali"));
routes.use("/discover/*", requireMode("surawali"));
routes.use("/favorites/*", requireMode("surawali"));
routes.use("/progress/*", requireMode("surawali"));
routes.use("/subscriptions/*", requireMode("surawali"));
routes.use("/notifications/*", requireMode("surawali"));
routes.use("/stream/*", requireMode("surawali"));
routes.route("/", surawaliRoutes);

// ── Emotion Remediation Mode Routes (Protected by mode guard) ──
routes.use("/emotion/*", requireMode("emotion_remediation"));
routes.route("/emotion", emotionRoutes);

export default routes;

