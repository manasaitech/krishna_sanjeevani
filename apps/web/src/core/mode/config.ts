// ─────────────────────────────────────────────────────────────
// Core Mode Config — Runtime URL-Based Mode Switch
//
// The active mode is determined by the URL query parameter:
//   ?flag=1  → emotion_remediation
//   (default / anything else) → surawali
//
// The same production build supports both modes.
// ─────────────────────────────────────────────────────────────

import type { AppMode, ModeConfig } from "./types";
import { surawaliConfig } from "@/modes/surawali/config";
import { emotionRemediationConfig } from "@/modes/emotion-remediation/config";

/**
 * SSR / module-level fallback.
 * Kept for compatibility with code that imports the constant directly
 * (e.g. module-level head-meta in __root.tsx). Always resolves to
 * "surawali" because Surawali is the default mode.
 */
export const ACTIVE_APP_MODE: AppMode = "surawali";

/** Registry of all available mode configurations */
export const MODE_CONFIGS: Record<AppMode, ModeConfig> = {
  surawali: surawaliConfig,
  emotion_remediation: emotionRemediationConfig,
};

/**
 * Read the active application mode at runtime.
 *
 * Can receive an explicit search string or search record (e.g. from TanStack Router useLocation).
 * On the client, reads the `flag` query parameter from window.location.search if not provided.
 *   ?flag=1  → "emotion_remediation"
 *   anything else / missing → "surawali"
 *
 * During SSR (window is undefined), defaults to "surawali".
 */
export function getActiveMode(search?: string | Record<string, unknown>): AppMode {
  if (typeof search === "string" && search.trim().length > 0) {
    const flag = new URLSearchParams(search.startsWith("?") ? search : `?${search}`).get("flag");
    if (flag === "1") return "emotion_remediation";
    if (flag !== null) return "surawali";
  }
  if (search && typeof search === "object") {
    if (search.flag === "1" || search.flag === 1) return "emotion_remediation";
    if (search.flag !== undefined && search.flag !== null && search.flag !== "") return "surawali";
  }
  if (typeof window !== "undefined" && window.location.search) {
    const flag = new URLSearchParams(window.location.search).get("flag");
    if (flag === "1") return "emotion_remediation";
  }
  return "surawali";
}

/**
 * Get the full mode configuration for the currently active mode.
 */
export function getModeConfig(search?: string | Record<string, unknown>): ModeConfig {
  return MODE_CONFIGS[getActiveMode(search)];
}

/**
 * Check whether a given pathname is accessible in the current mode.
 */
export function isRouteAllowedForMode(pathname: string, search?: string | Record<string, unknown>): boolean {
  const config = getModeConfig(search);
  const allAllowed = [
    ...config.routes.publicPaths,
    ...config.routes.modePaths,
  ];

  return allAllowed.some(
    (allowed) => pathname === allowed || pathname.startsWith(allowed + "/")
  );
}
