// ─────────────────────────────────────────────────────────────
// Core Mode Config — Runtime URL-Based Mode Switch
//
// The active mode is determined SOLELY by the current URL query parameter:
//   ?flag=1  → emotion_remediation
//   anything else / absent / ?flag=2 / ?flag=abc → surawali
//
// Purely stateless: No localStorage, no sessionStorage, no cookies.
// When flag=1 disappears from the URL, the mode immediately reverts to surawali.
// ─────────────────────────────────────────────────────────────

import type { AppMode, ModeConfig } from "./types";
import { surawaliConfig } from "@/modes/surawali/config";
import { emotionRemediationConfig } from "@/modes/emotion-remediation/config";

/**
 * SSR / module-level fallback.
 * Always resolves to "surawali" because Surawali is the default mode.
 */
export const ACTIVE_APP_MODE: AppMode = "surawali";

/** Registry of all available mode configurations */
export const MODE_CONFIGS: Record<AppMode, ModeConfig> = {
  surawali: surawaliConfig,
  emotion_remediation: emotionRemediationConfig,
};

/**
 * Check whether a string value corresponds to the Emotion Remediation flag.
 * Only ?flag=1 (or ?flag=1/home, ?flag=1?home) resolves to emotion_remediation.
 * ?flag=2, ?flag=abc, etc. resolve to false (surawali).
 */
export function isEmotionFlagValue(val: unknown): boolean {
  if (val === undefined || val === null) return false;
  let str = String(val).trim().toLowerCase();
  try {
    str = decodeURIComponent(str);
  } catch {
    // ignore
  }
  if (!str) return false;
  return str === "1" || str.startsWith("1/") || str.startsWith("1?") || str.startsWith("1#");
}

/**
 * Read the active application mode at runtime from the provided search params or browser URL.
 *
 * Current URL determines the mode:
 *   flag === "1"  → "emotion_remediation"
 *   anything else → "surawali"
 */
export function getActiveMode(search?: string | Record<string, unknown>): AppMode {
  let flagValue: string | null = null;

  // 1. Check explicit search argument (from TanStack Router)
  if (typeof search === "string" && search.trim().length > 0) {
    try {
      const q = search.startsWith("?") ? search : `?${search}`;
      const params = new URLSearchParams(q);
      if (params.has("flag")) {
        flagValue = params.get("flag");
      }
    } catch {
      // ignore
    }
  } else if (search && typeof search === "object") {
    if ("flag" in search && search.flag !== undefined && search.flag !== null && search.flag !== "") {
      flagValue = String(search.flag);
    }
  }

  // 2. Check window.location.search fallback on client if no search arg provided
  if (flagValue === null && typeof window !== "undefined" && window.location?.search) {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.has("flag")) {
        flagValue = params.get("flag");
      }
    } catch {
      // ignore
    }
  }

  // 3. Resolve mode: only flag=1 triggers emotion_remediation
  if (flagValue !== null && isEmotionFlagValue(flagValue)) {
    return "emotion_remediation";
  }

  return "surawali";
}

/**
 * No-op helper for backwards compatibility.
 */
export function clearModeFlag(): void {
  // Stateless mode: no persistent storage to clear.
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
