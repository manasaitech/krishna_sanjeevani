// ─────────────────────────────────────────────────────────────
// Emotion Remediation Mode — Route Configuration
// ─────────────────────────────────────────────────────────────

import type { ModeRouteConfig } from "@/core/mode/types";

export const emotionRemediationRoutes: ModeRouteConfig = {
  publicPaths: [
    "/",
    "/login",
    "/register",
    "/terms",
    "/privacy",
    "/about",
  ],
  defaultHomePath: "/home",
  // No category selection in Emotion Remediation — single theme
  modePaths: [
    "/home",
    "/search",
    "/subscription",
    "/browse",
    "/favorites",
    "/notifications",
    "/player",
    "/profile",
    "/programs",
    "/recent",
    "/session-complete",
    "/admin",
    "/about",
  ],
};
