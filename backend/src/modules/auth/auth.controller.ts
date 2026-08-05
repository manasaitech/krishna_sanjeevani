import { Context } from "hono";
import { AuthService } from "./auth.service";
import { AuthRepository } from "./auth.repository";
import { registerSchema, loginSchema, refreshSchema, changePasswordSchema } from "./auth.validator";
import { ApiResponse } from "../../shared/responses";
import { ValidationError } from "../../shared/errors";
import { getDB } from "../../shared/db/client";
import { Env } from "../../shared/config/env";

function getAuthService(env: Env): AuthService {
  const db = getDB(env);
  const repo = new AuthRepository(db);
  return new AuthService(repo, env.JWT_ACCESS_SECRET, env.JWT_REFRESH_SECRET);
}

export class AuthController {
  static async register(c: Context<{ Bindings: Env }>) {
    const body = await c.req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError("Validation failed", parsed.error.issues);
    }

    const service = getAuthService(c.env);
    const result = await service.register(parsed.data);

    return ApiResponse.success(c, result, "Account created successfully", 201);
  }

  static async login(c: Context<{ Bindings: Env }>) {
    const body = await c.req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError("Validation failed", parsed.error.issues);
    }

    const service = getAuthService(c.env);
    const result = await service.login(parsed.data);

    return ApiResponse.success(c, result, "Login successful");
  }

  static async refresh(c: Context<{ Bindings: Env }>) {
    const body = await c.req.json();
    const parsed = refreshSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError("Validation failed", parsed.error.issues);
    }

    const service = getAuthService(c.env);
    const result = await service.refresh(parsed.data.refreshToken);

    return ApiResponse.success(c, result, "Token refreshed successfully");
  }

  static async logout(c: Context<{ Bindings: Env }>) {
    const userId = c.get("userId" as never) as string;
    const service = getAuthService(c.env);
    await service.logout(userId);

    return ApiResponse.success(c, null, "Logged out successfully");
  }

  static async getMe(c: Context<{ Bindings: Env }>) {
    const userId = c.get("userId" as never) as string;
    const service = getAuthService(c.env);
    const result = await service.getMe(userId);

    return ApiResponse.success(c, result, "Profile fetched successfully");
  }

  static async changePassword(c: Context<{ Bindings: Env }>) {
    const userId = c.get("userId" as never) as string;
    const body = await c.req.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError("Validation failed", parsed.error.issues);
    }

    const service = getAuthService(c.env);
    await service.changePassword(userId, parsed.data.currentPassword, parsed.data.newPassword);

    return ApiResponse.success(c, null, "Password changed successfully");
  }
}
