import { Context } from "hono";
import { AuthService } from "./auth.service";
import { AuthRepository } from "./auth.repository";
import { registerSchema, loginSchema, refreshSchema, changePasswordSchema, verifyOtpSchema, resendOtpSchema, forgotPasswordSchema, resetPasswordSchema } from "./auth.validator";
import { ApiResponse } from "../../shared/responses";
import { ValidationError } from "../../shared/errors";
import { getDB } from "../../shared/db/client";
import { Env } from "../../shared/config/env";
import { userProfiles } from "../../shared/db/schema/user";
import { eq } from "drizzle-orm";

function getAuthService(env: Env): AuthService {
  const db = getDB(env);
  const repo = new AuthRepository(db);
  return new AuthService(env, repo, env.JWT_ACCESS_SECRET, env.JWT_REFRESH_SECRET);
}

export class AuthController {
  static async register(c: Context<{ Bindings: Env }>) {
    const body = await c.req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      console.error("Zod validation errors on register body:", JSON.stringify(body), parsed.error.issues);
      throw new ValidationError("Validation failed", parsed.error.issues);
    }

    const service = getAuthService(c.env);
    const result = await service.register(
      parsed.data,
      c.executionCtx?.waitUntil ? c.executionCtx.waitUntil.bind(c.executionCtx) : undefined
    );

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

  static async loginWithGoogle(c: Context<{ Bindings: Env }>) {
    const body = await c.req.json();
    const idToken = body.idToken;
    const defaultCategory = body.category || "unset";

    if (!idToken) {
      throw new ValidationError("Google ID token (idToken) is required");
    }

    const service = getAuthService(c.env);
    const result = await service.loginWithGoogle(idToken, defaultCategory, c.env.GOOGLE_CLIENT_ID);

    return ApiResponse.success(c, result, "Google login successful");
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

  static async updateProfile(c: Context<{ Bindings: Env }>) {
    const userId = c.get("userId" as never) as string;
    const body = await c.req.json().catch(() => ({}));
    const { fullName, language, category } = body;

    if (!fullName && !language && !category) {
      throw new ValidationError("At least one field (fullName, language, or category) is required to update");
    }

    const db = getDB(c.env);
    const now = Date.now();

    await db
      .update(userProfiles)
      .set({
        ...(fullName && { fullName }),
        ...(language && { language }),
        ...(category && { category }),
        updatedAt: now,
      })
      .where(eq(userProfiles.userId, userId));

    const updated = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .get();

    return ApiResponse.success(c, updated, "Profile updated successfully");
  }

  static async serveGoogleMobilePage(c: Context<{ Bindings: Env }>) {
    const redirectUri = c.req.query("redirect_uri") || "krishna-sanjeevani://redirect";
    const googleClientId = c.env.GOOGLE_CLIENT_ID || "29791277131-umh14qed3e0k4n3kotqum64r7br67dh9.apps.googleusercontent.com";
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Google Sign-In</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://accounts.google.com/gsi/client" async defer></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      background-color: #FAF8F4;
    }
    .container {
      text-align: center;
      padding: 32px 24px;
      background: white;
      border-radius: 24px;
      border: 1px solid #E8E4DC;
      box-shadow: 0 4px 20px rgba(0,0,0,0.04);
      max-width: 320px;
      width: 90%;
    }
    h2 { color: #1A1A1A; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 8px; }
    p { color: #7C7A85; font-size: 13px; margin-bottom: 28px; line-height: 18px; }
    .btn-wrap {
      display: flex;
      justify-content: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Krishna Sanjeevani</h2>
    <p>Sign in with your Google account to tune into your listening path.</p>
    <div class="btn-wrap">
      <div id="g_id_onload"
           data-client_id="${googleClientId}"
           data-callback="handleCredentialResponse"
           data-auto_prompt="false">
      </div>
      <div class="g_id_signin"
           data-type="standard"
           data-size="large"
           data-theme="outline"
           data-text="continue_with"
           data-shape="pill"
           data-logo_alignment="left">
      </div>
    </div>
  </div>
  <script>
    function handleCredentialResponse(response) {
      const idToken = response.credential;
      if (idToken) {
        window.location.href = "${redirectUri}#id_token=" + encodeURIComponent(idToken);
      }
    }
  </script>
</body>
</html>
    `;
    c.header("Content-Type", "text/html");
    return c.html(html);
  }

  static async verifyOtp(c: Context<{ Bindings: Env }>) {
    const body = await c.req.json();
    const parsed = verifyOtpSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError("Validation failed", parsed.error.issues);
    }

    const service = getAuthService(c.env);
    await service.verifyOtp(parsed.data.email, parsed.data.code, parsed.data.purpose);

    return ApiResponse.success(c, null, "Verification code verified successfully");
  }

  static async resendOtp(c: Context<{ Bindings: Env }>) {
    const body = await c.req.json();
    const parsed = resendOtpSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError("Validation failed", parsed.error.issues);
    }

    const service = getAuthService(c.env);
    await service.sendOtp(parsed.data.email, parsed.data.purpose);

    return ApiResponse.success(c, null, "Verification code resent successfully");
  }

  static async forgotPassword(c: Context<{ Bindings: Env }>) {
    const body = await c.req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError("Validation failed", parsed.error.issues);
    }

    const service = getAuthService(c.env);
    await service.forgotPassword(parsed.data.email);

    return ApiResponse.success(c, null, "Password reset code sent successfully");
  }

  static async resetPassword(c: Context<{ Bindings: Env }>) {
    const body = await c.req.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError("Validation failed", parsed.error.issues);
    }

    const service = getAuthService(c.env);
    await service.resetPassword(parsed.data.email, parsed.data.code, parsed.data.newPassword);

    return ApiResponse.success(c, null, "Password reset successfully");
  }

  static async deleteAccount(c: Context<{ Bindings: Env }>) {
    const userId = c.get("userId" as never) as string;
    if (!userId) {
      throw new ValidationError("Authenticated user ID missing");
    }

    const service = getAuthService(c.env);
    await service.deleteAccount(userId);

    return ApiResponse.success(c, null, "Account and associated data deleted successfully");
  }
}

