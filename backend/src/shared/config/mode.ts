// ─────────────────────────────────────────────────────────────
// Backend Mode Configuration Helper
//
// Controlled directly via code:
//   ACTIVE_BACKEND_MODE = "emotion_remediation"
//   ACTIVE_BACKEND_MODE = "surawali"
// ─────────────────────────────────────────────────────────────

import type { Env, AppMode } from "./env";

/**
 * ─────────────────────────────────────────────────────────────
 * 🎯 MASTER BACKEND APPLICATION MODE SWITCH
 * Change this single line to switch modes across the entire backend!
 * ─────────────────────────────────────────────────────────────
 */
export const ACTIVE_BACKEND_MODE: AppMode = "surawali";

/**
 * Read the active application mode.
 * Evaluates the master code-level switch without depending on .env files.
 */
export function getAppMode(env?: Env): AppMode {
  return ACTIVE_BACKEND_MODE;
}

/**
 * Get the payment credentials for the active mode.
 * Returns key and secret for the correct product.
 */
export function getPaymentCredentials(env: Env): {
  key: string | undefined;
  secret: string | undefined;
} {
  const mode = getAppMode(env);
  if (mode === "emotion_remediation") {
    return {
      key: env.EMOTION_PAYMENT_KEY,
      secret: env.EMOTION_PAYMENT_SECRET,
    };
  }
  return {
    key: env.SURAWALI_PAYMENT_KEY,
    secret: env.SURAWALI_PAYMENT_SECRET,
  };
}

/**
 * Check whether a given app mode is the active mode.
 */
export function isMode(env: Env, mode: AppMode): boolean {
  return getAppMode(env) === mode;
}
