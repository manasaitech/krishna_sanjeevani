// ─────────────────────────────────────────────────────────────
// Backend Mode Guard Middleware
// Enforces server-side route isolation. If a client attempts to
// access routes belonging to an inactive mode, returns 404 Not Found.
// ─────────────────────────────────────────────────────────────

import { MiddlewareHandler } from "hono";
import { Env, AppMode } from "../../shared/config/env";
import { getAppMode } from "../../shared/config/mode";
import { ApiResponse } from "../../shared/responses";

/**
 * Middleware that restricts route access to a specific mode.
 * If the active backend Worker mode does not match `requiredMode`,
 * the request is rejected with a 404 Not Found (as if the route does not exist).
 */
export function requireMode(requiredMode: AppMode): MiddlewareHandler<{ Bindings: Env }> {
  return async (c, next) => {
    const activeMode = getAppMode(c.env);
    if (activeMode !== requiredMode) {
      return ApiResponse.error(
        c,
        `Route not available in ${activeMode} mode`,
        404
      );
    }
    await next();
  };
}
