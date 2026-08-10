import { Hono } from "hono";
import { AuthController } from "./auth.controller";
import { requireAuth } from "./auth.middleware";
import { Env } from "../../shared/config/env";

const auth = new Hono<{ Bindings: Env }>();

// ── Public Routes ───────────────────────────────────────
auth.post("/register", AuthController.register);
auth.post("/login", AuthController.login);
auth.post("/refresh", AuthController.refresh);
auth.post("/google", AuthController.loginWithGoogle);

// ── Protected Routes ────────────────────────────────────
auth.post("/logout", requireAuth(), AuthController.logout);
auth.get("/me", requireAuth(), AuthController.getMe);
auth.patch("/change-password", requireAuth(), AuthController.changePassword);

export default auth;
