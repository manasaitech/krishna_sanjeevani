// ─────────────────────────────────────────────────────────────
// Core Mode Config — reads the active mode from environment
// and exposes the corresponding ModeConfig.
//
// The mode is determined ONLY from code/configuration:
//   VITE_APP_MODE=surawali           (default)
//   VITE_APP_MODE=emotion_remediation
//
// A normal user must NEVER know that another mode exists.
// ─────────────────────────────────────────────────────────────

import type { AppMode, ModeConfig } from "./types";
import { surawaliConfig } from "@/modes/surawali/config";
import { emotionRemediationConfig } from "@/modes/emotion-remediation/config";

/** Registry of all available mode configurations */
export const MODE_CONFIGS: Record<AppMode, ModeConfig> = {
  surawali: surawaliConfig,
  emotion_remediation: emotionRemediationConfig,
};

/**
 * Read the active application mode from the environment.
 * Falls back to "surawali" if not set or invalid.
 */
export function getActiveMode(): AppMode {
  const raw =
    typeof import.meta !== "undefined" && import.meta.env?.VITE_APP_MODE
      ? import.meta.env.VITE_APP_MODE
      : "surawali";

  if (raw === "surawali" || raw === "emotion_remediation") {
    return raw;
  }

  console.warn(
    `[mode] Unknown APP_MODE "${raw}", falling back to "surawali".`
  );
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

  // Allow paths that start with any of the allowed prefixes
  // (handles dynamic routes like /program/$programId)
  return allAllowed.some(
    (allowed) => pathname === allowed || pathname.startsWith(allowed + "/")
  );
}
