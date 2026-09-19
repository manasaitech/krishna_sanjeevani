// ─────────────────────────────────────────────────────────────
// Surawali Mode — Route Configuration
// ─────────────────────────────────────────────────────────────

import type { ModeRouteConfig } from "@/core/mode/types";

export const surawaliRoutes: ModeRouteConfig = {
  publicPaths: [
    "/",
    "/login",
    "/register",
    "/vedic-science",
    "/inspiration",
    "/the-beginning",
    "/about",
    "/team",
    "/terms",
    "/privacy",
    "/discover",
  ],
  defaultHomePath: "/home",
  categorySelectionPath: "/select-sanjeevani",
  modePaths: [
    "/home",
    "/discover",
    "/search",
    "/subscription",
    "/select-sanjeevani",
    "/journey",
    "/vedic-science",
    "/inspiration",
    "/the-beginning",
    "/about",
    "/team",
    "/browse",
    "/favorites",
    "/notifications",
    "/player",
    "/profile",
    "/programs",
    "/recent",
    "/session-complete",
    "/admin",
  ],
};
