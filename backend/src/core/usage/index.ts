// ─────────────────────────────────────────────────────────────
// Core Usage Module
// Shared usage tracking service and endpoint for monitoring feature usage,
// query counts, and active listening time across both modes.
// ─────────────────────────────────────────────────────────────

import { Hono } from "hono";
import { Env } from "../../shared/config/env";
import { requireAuth, optionalAuth } from "../../modules/auth/auth.middleware";
import { ApiResponse } from "../../shared/responses";
import { getDB } from "../../shared/db/client";
import { getAppMode } from "../../shared/config/mode";

const usageRoute = new Hono<{ Bindings: Env }>();

// Record a usage event (e.g. search query, track play, remediation session)
usageRoute.post("/track", optionalAuth(), async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const user = c.get("user" as any);
  const mode = getAppMode(c.env);

  const event = {
    userId: user?.userId || "anonymous",
    mode,
    feature: body.feature || "general",
    action: body.action || "view",
    metadata: body.metadata || {},
    timestamp: Date.now(),
  };

  // Optional: write to KV / analytics if configured
  if (c.env.CACHE) {
    const key = `usage:${event.userId}:${event.timestamp}`;
    await c.env.CACHE.put(key, JSON.stringify(event), { expirationTtl: 86400 * 30 });
  }

  return ApiResponse.success(c, { recorded: true, event });
});

export default usageRoute;
