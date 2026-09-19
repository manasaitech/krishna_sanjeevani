// ─────────────────────────────────────────────────────────────
// Core Auth Module
// Re-exports authentication handlers, middleware, and services.
// Shared by both Surawali and Emotion Remediation modes.
// ─────────────────────────────────────────────────────────────

export { default as authRoute } from "../../modules/auth/auth.route";
export { AuthService } from "../../modules/auth/auth.service";
export { requireAuth, optionalAuth, requireRole } from "../../modules/auth/auth.middleware";
export { AuthRepository } from "../../modules/auth/auth.repository";

import authRoute from "../../modules/auth/auth.route";
export default authRoute;
