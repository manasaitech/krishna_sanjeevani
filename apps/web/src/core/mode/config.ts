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
 * On the client, reads the `flag` query parameter from the current URL:
 *   ?flag=1  → "emotion_remediation"
 *   anything else / missing → "surawali"
 *
 * During SSR (window is undefined), defaults to "surawali".
 */
export function getActiveMode(): AppMode {
  if (typeof window !== "undefined") {
    const flag = new URLSearchParams(window.location.search).get("flag");
    if (flag === "1") return "emotion_remediation";
  }
  return "surawali";
}

/**
 * Get the full mode configuration for the currently active mode.
 */
export function getModeConfig(): ModeConfig {
  return MODE_CONFIGS[getActiveMode()];
}

/**
 * Check whether a given pathname is accessible in the current mode.
 */
export function isRouteAllowedForMode(pathname: string): boolean {
  const config = getModeConfig();
  const allAllowed = [
    ...config.routes.publicPaths,
    ...config.routes.modePaths,
  ];

  return allAllowed.some(
    (allowed) => pathname === allowed || pathname.startsWith(allowed + "/")
  );
}
