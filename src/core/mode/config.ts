// ─────────────────────────────────────────────────────────────
// Core Mode Config — Runtime URL-Based Mode Switch
//
// The active mode is determined by the URL query parameter:
//   ?flag=1 (or ?flag=1/home, ?flag=emotion, ?flag=true)  → emotion_remediation
//   (default / anything else / ?flag=0 / ?flag=surawali) → surawali
//
// When an emotion flag is detected, it is persisted to
// sessionStorage and localStorage so the mode survives route transitions,
// login redirects, and TanStack Router's search param serialization quirks.
//
// The same production build supports both modes simultaneously.
// ─────────────────────────────────────────────────────────────

import type { AppMode, ModeConfig } from "./types";
import { surawaliConfig } from "@/modes/surawali/config";
import { emotionRemediationConfig } from "@/modes/emotion-remediation/config";

const MODE_STORAGE_KEY = "ks_active_mode_flag";

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
 * Check whether a string value corresponds to the Emotion Remediation flag.
 * Handles variations like "1", "1/home", "1?home", "1%2fhome", "true", "emotion".
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
  return (
    str === "1" ||
    str.startsWith("1") ||
    str === "true" ||
    str === "emotion" ||
    str === "emotion_remediation"
  );
}

/**
 * Check whether a string value explicitly requests Surawali mode.
 */
export function isSurawaliFlagValue(val: unknown): boolean {
  if (val === undefined || val === null) return false;
  const str = String(val).trim().toLowerCase();
  return (
    str === "0" ||
    str === "false" ||
    str === "surawali" ||
    str === "default"
  );
}

/**
 * Read the active application mode at runtime.
 *
 * Resolution order:
 *   1. Explicit `search` argument (string or object from TanStack Router)
 *   2. `window.location.search` (browser URL bar)
 *   3. `window.location.href` (URL parsing fallback for path/hash quirks)
 *   4. `sessionStorage` & `localStorage` (persisted from earlier flagged visits)
 *
 * During SSR (window is undefined), defaults to "surawali".
 */
export function getActiveMode(search?: string | Record<string, unknown>): AppMode {
  let explicitFlag: string | null = null;

  // 1. Check explicit search argument
  if (typeof search === "string" && search.trim().length > 0) {
    try {
      const q = search.startsWith("?") ? search : `?${search}`;
      const params = new URLSearchParams(q);
      if (params.has("flag")) {
        explicitFlag = params.get("flag");
      }
    } catch {
      // ignore
    }
  } else if (search && typeof search === "object") {
    if ("flag" in search && search.flag !== undefined && search.flag !== null && search.flag !== "") {
      explicitFlag = String(search.flag);
    }
  }

  // 2. Check window.location.search (most reliable on client)
  if (explicitFlag === null && typeof window !== "undefined" && window.location.search) {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.has("flag")) {
        explicitFlag = params.get("flag");
      }
    } catch {
      // ignore
    }
  }

  // 3. Check window.location.href fallback (e.g. if query was encoded or in hash)
  if (explicitFlag === null && typeof window !== "undefined" && window.location.href) {
    try {
      const href = window.location.href;
      const match = href.match(/[?&]flag=([^&#]*)/i);
      if (match && match[1] !== undefined) {
        explicitFlag = decodeURIComponent(match[1]);
      } else if (/[?&]flag(?=[&#]|$)/i.test(href)) {
        explicitFlag = "1";
      }
    } catch {
      // ignore
    }
  }

  // Handle explicit flag in current URL
  if (explicitFlag !== null) {
    if (isEmotionFlagValue(explicitFlag)) {
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(MODE_STORAGE_KEY, "1");
          localStorage.setItem(MODE_STORAGE_KEY, "1");
        } catch {
          // ignore
        }
      }
      return "emotion_remediation";
    } else if (isSurawaliFlagValue(explicitFlag)) {
      if (typeof window !== "undefined") {
        try {
          sessionStorage.removeItem(MODE_STORAGE_KEY);
          localStorage.removeItem(MODE_STORAGE_KEY);
        } catch {
          // ignore
        }
      }
      return "surawali";
    }
  }

  // 4. Check sessionStorage & localStorage (persisted from previous navigation)
  if (typeof window !== "undefined") {
    try {
      const sessionVal = sessionStorage.getItem(MODE_STORAGE_KEY);
      const localVal = localStorage.getItem(MODE_STORAGE_KEY);
      if (isEmotionFlagValue(sessionVal) || isEmotionFlagValue(localVal)) {
        return "emotion_remediation";
      }
    } catch {
      // ignore
    }
  }

  return "surawali";
}

/**
 * Explicitly clear the persisted mode flag.
 * Call this when the user logs out or explicitly switches to Surawali mode.
 */
export function clearModeFlag(): void {
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem(MODE_STORAGE_KEY);
      localStorage.removeItem(MODE_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
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
