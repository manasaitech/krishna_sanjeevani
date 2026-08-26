import { Context, Next } from "hono";
import { AuthService } from "./auth.service";
import { AuthRepository } from "./auth.repository";
import { UnauthorizedError, ForbiddenError } from "../../shared/errors";
import { getDB } from "../../shared/db/client";
import { Env } from "../../shared/config/env";
import { logger } from "../../shared/logger";

function extractBearerToken(c: Context): string | null {
  const header = c.req.header("Authorization");
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.slice(7);
}

/**
 * Requires a valid access token. Sets `userId`, `userRole`, and `userEmail` on context.
 */
export function requireAuth() {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const token = extractBearerToken(c);
    if (!token) {
      throw new UnauthorizedError("Authentication required");
    }

    try {
      const db = getDB(c.env);
      const repo = new AuthRepository(db);
      const service = new AuthService(c.env, repo, c.env.JWT_ACCESS_SECRET, c.env.JWT_REFRESH_SECRET);

      const payload = await service.verifyAccessToken(token);
      c.set("userId" as never, payload.sub as never);
      c.set("userRole" as never, payload.role as never);
      c.set("userEmail" as never, payload.email as never);
    } catch (err) {
      logger.warn("Auth middleware: invalid token", err);
      throw new UnauthorizedError("Invalid or expired token");
    }

    await next();
  };
}

/**
 * Optionally extracts token payload. Does NOT throw if no token is present.
 */
export function optionalAuth() {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const token = extractBearerToken(c);
    if (token) {
      try {
        const db = getDB(c.env);
        const repo = new AuthRepository(db);
        const service = new AuthService(c.env, repo, c.env.JWT_ACCESS_SECRET, c.env.JWT_REFRESH_SECRET);

        const payload = await service.verifyAccessToken(token);
        c.set("userId" as never, payload.sub as never);
        c.set("userRole" as never, payload.role as never);
        c.set("userEmail" as never, payload.email as never);
      } catch {
        // Token invalid — continue as guest
      }
    }

    await next();
  };
}

/**
 * Requires authentication AND a specific role.
 */
export function requireRole(...roles: string[]) {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    // First enforce auth
    const token = extractBearerToken(c);
    if (!token) {
      throw new UnauthorizedError("Authentication required");
    }

    try {
      const db = getDB(c.env);
      const repo = new AuthRepository(db);
      const service = new AuthService(c.env, repo, c.env.JWT_ACCESS_SECRET, c.env.JWT_REFRESH_SECRET);

      const payload = await service.verifyAccessToken(token);
      c.set("userId" as never, payload.sub as never);
      c.set("userRole" as never, payload.role as never);
      c.set("userEmail" as never, payload.email as never);

      // Check role
      if (!roles.includes(payload.role)) {
        throw new ForbiddenError(`Role '${payload.role}' does not have access to this resource`);
      }
    } catch (err) {
      if (err instanceof ForbiddenError) throw err;
      throw new UnauthorizedError("Invalid or expired token");
    }

    await next();
  };
}
