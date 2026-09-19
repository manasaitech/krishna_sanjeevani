// ─────────────────────────────────────────────────────────────
// Core Mode Config — Master Application Mode Switch
//
// Controlled directly via code:
//   ACTIVE_APP_MODE = "emotion_remediation"  (Active Emotion Mode)
//   ACTIVE_APP_MODE = "surawali"             (Active Surawali Mode)
// ─────────────────────────────────────────────────────────────

import type { AppMode, ModeConfig } from "./types";
import { surawaliConfig } from "@/modes/surawali/config";
import { emotionRemediationConfig } from "@/modes/emotion-remediation/config";

/**
 * ─────────────────────────────────────────────────────────────
 * 🎯 MASTER APPLICATION MODE SWITCH
 * Change this single line to switch modes across the entire app!
 * ─────────────────────────────────────────────────────────────
 */
export const ACTIVE_APP_MODE: AppMode = "surawali";

/** Registry of all available mode configurations */
export const MODE_CONFIGS: Record<AppMode, ModeConfig> = {
  surawali: surawaliConfig,
  emotion_remediation: emotionRemediationConfig,
};

/**
 * Read the active application mode.
 * Evaluates the master code-level switch without depending on .env files.
 */
export function getActiveMode(): AppMode {
  return ACTIVE_APP_MODE;
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
