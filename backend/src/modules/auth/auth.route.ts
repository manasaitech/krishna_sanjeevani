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
auth.get("/google/mobile", AuthController.serveGoogleMobilePage);
auth.post("/verify-otp", AuthController.verifyOtp);
auth.post("/resend-otp", AuthController.resendOtp);
auth.post("/forgot-password", AuthController.forgotPassword);
auth.post("/reset-password", AuthController.resetPassword);

// ── Protected Routes ────────────────────────────────────
auth.post("/logout", requireAuth(), AuthController.logout);
auth.get("/me", requireAuth(), AuthController.getMe);
auth.patch("/change-password", requireAuth(), AuthController.changePassword);
auth.patch("/profile", requireAuth(), AuthController.updateProfile);
auth.delete("/account", requireAuth(), AuthController.deleteAccount);
auth.delete("/delete-account", requireAuth(), AuthController.deleteAccount);

export default auth;

