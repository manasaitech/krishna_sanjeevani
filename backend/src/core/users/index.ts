// ─────────────────────────────────────────────────────────────
// Core Users Module
// Provides user profile and account utilities.
// Shared by both Surawali and Emotion Remediation modes.
// ─────────────────────────────────────────────────────────────

import { Hono } from "hono";
import { Env } from "../../shared/config/env";
import { requireAuth } from "../../modules/auth/auth.middleware";
import { ApiResponse } from "../../shared/responses";
import { getDB } from "../../shared/db/client";
import { users } from "../../shared/db/schema/user";
import { eq } from "drizzle-orm";

const userRoute = new Hono<{ Bindings: Env }>();

// Get current user profile
userRoute.get("/me", requireAuth(), async (c) => {
  const user = c.get("user" as any);
  if (!user) {
    return ApiResponse.error(c, "User not authenticated", 401);
  }
  const db = getDB(c.env);
  const [profile] = await db.select().from(users).where(eq(users.id, user.userId)).limit(1);
  if (!profile) {
    return ApiResponse.error(c, "User profile not found", 404);
  }
  return ApiResponse.success(c, {
    id: profile.id,
    email: profile.email,
    phone: profile.phone,
    name: profile.name,
    avatarUrl: profile.avatarUrl,
    createdAt: profile.createdAt,
  });
});

export default userRoute;
