// ─────────────────────────────────────────────────────────────
// Backend Mode Configuration Helper
// Reads APP_MODE from the Cloudflare Worker env and provides
// mode-specific settings.
// ─────────────────────────────────────────────────────────────

import type { Env, AppMode } from "./env";

/**
 * Read the active application mode from the Worker env.
 * Defaults to "surawali" if not set.
 */
export function getAppMode(env: Env): AppMode {
  const raw = env.APP_MODE;
  if (raw === "surawali" || raw === "emotion_remediation") {
    return raw;
  }
  return "surawali";
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
