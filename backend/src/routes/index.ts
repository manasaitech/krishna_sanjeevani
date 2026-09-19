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

const routes = new Hono<{ Bindings: Env }>();

// ── Shared Core Routes (Available in all modes) ──
routes.route("/", healthRoute);
routes.route("/auth", authRoute);
routes.route("/users", userRoute);
routes.route("/usage", usageRoute);
routes.route("/admin", adminRoute);
routes.route("/storage", storageRoute);

// ── Surawali Mode Routes (Always available) ──
routes.route("/surawali", surawaliRoutes);

// Surawali top-level route aliases (backward-compatible)
routes.route("/", surawaliRoutes);

// ── Emotion Remediation Mode Routes (Always available) ──
routes.route("/emotion", emotionRoutes);

export default routes;
