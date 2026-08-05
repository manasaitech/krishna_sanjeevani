import { hash, compare } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { AuthRepository } from "./auth.repository";
import { AUTH_CONSTANTS } from "./auth.constants";
import { RegisterInput, LoginInput, AuthTokens, TokenPayload } from "./auth.types";
import { ConflictError, UnauthorizedError, NotFoundError, ValidationError } from "../../shared/errors";
import { logger } from "../../shared/logger";

export class AuthService {
  constructor(
    private repo: AuthRepository,
    private accessSecret: string,
    private refreshSecret: string
  ) {}

  // ── Sprint 1: Core Utilities ──────────────────────────

  private async hashPassword(password: string): Promise<string> {
    return hash(password, AUTH_CONSTANTS.SALT_ROUNDS);
  }

  private async verifyPassword(password: string, passwordHash: string): Promise<boolean> {
    return compare(password, passwordHash);
  }

  private async generateAccessToken(payload: TokenPayload): Promise<string> {
    const secret = new TextEncoder().encode(this.accessSecret);
    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(AUTH_CONSTANTS.ACCESS_TOKEN_EXPIRY)
      .sign(secret);
  }

  private async generateRefreshToken(payload: TokenPayload): Promise<string> {
    const secret = new TextEncoder().encode(this.refreshSecret);
    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRY)
      .sign(secret);
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    const secret = new TextEncoder().encode(this.accessSecret);
    const { payload } = await jwtVerify(token, secret);
    return {
      sub: payload.sub as string,
      role: payload.role as string,
      email: payload.email as string,
    };
  }

  private async verifyRefreshToken(token: string): Promise<TokenPayload> {
    const secret = new TextEncoder().encode(this.refreshSecret);
    const { payload } = await jwtVerify(token, secret);
    return {
      sub: payload.sub as string,
      role: payload.role as string,
      email: payload.email as string,
    };
  }

  private async hashToken(token: string): Promise<string> {
    // Use Web Crypto API (available in Workers) to hash the refresh token
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  private generateId(): string {
    return crypto.randomUUID();
  }

  private async generateTokens(payload: TokenPayload): Promise<AuthTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload),
    ]);
    return { accessToken, refreshToken };
  }

  // ── Sprint 2: Register ────────────────────────────────

  async register(input: RegisterInput) {
    logger.info("Registration attempt", { email: input.email });

    // Check if email already exists
    const existing = await this.repo.findUserByEmail(input.email);
    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }

    const now = Date.now();
    const userId = this.generateId();
    const profileId = this.generateId();
    const sessionId = this.generateId();

    // Hash password
    const passwordHash = await this.hashPassword(input.password);

    // Create user (identity)
    await this.repo.createUser({
      id: userId,
      email: input.email.toLowerCase().trim(),
      passwordHash,
      role: "user",
      createdAt: now,
      updatedAt: now,
    });

    // Create profile
    await this.repo.createProfile({
      id: profileId,
      userId,
      fullName: input.fullName,
      category: input.category,
      createdAt: now,
      updatedAt: now,
    });

    // Generate tokens
    const tokenPayload: TokenPayload = { sub: userId, role: "user", email: input.email };
    const tokens = await this.generateTokens(tokenPayload);

    // Store hashed refresh token in sessions
    const refreshTokenHash = await this.hashToken(tokens.refreshToken);
    await this.repo.createSession({
      id: sessionId,
      userId,
      refreshTokenHash,
      expiresAt: now + AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRY_MS,
      createdAt: now,
    });

    logger.info("Registration successful", { userId });

    return {
      user: { id: userId, email: input.email, role: "user" },
      tokens,
    };
  }

  // ── Sprint 3: Login ───────────────────────────────────

  async login(input: LoginInput) {
    logger.info("Login attempt", { email: input.email });

    // Find user — generic error to prevent email enumeration
    const user = await this.repo.findUserByEmail(input.email.toLowerCase().trim());
    if (!user) {
      throw new UnauthorizedError(AUTH_CONSTANTS.GENERIC_LOGIN_ERROR);
    }

    // Check status
    if (user.status !== "active") {
      throw new UnauthorizedError("Account is suspended or deleted");
    }

    // Verify password
    const valid = await this.verifyPassword(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError(AUTH_CONSTANTS.GENERIC_LOGIN_ERROR);
    }

    // Generate tokens
    const tokenPayload: TokenPayload = { sub: user.id, role: user.role, email: user.email };
    const tokens = await this.generateTokens(tokenPayload);

    // Delete old session and create new one (single session per user)
    await this.repo.deleteSessionByUserId(user.id);

    const refreshTokenHash = await this.hashToken(tokens.refreshToken);
    await this.repo.createSession({
      id: this.generateId(),
      userId: user.id,
      refreshTokenHash,
      expiresAt: Date.now() + AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRY_MS,
      createdAt: Date.now(),
    });

    logger.info("Login successful", { userId: user.id });

    return {
      user: { id: user.id, email: user.email, role: user.role },
      tokens,
    };
  }

  // ── Sprint 4: Refresh ─────────────────────────────────

  async refresh(refreshToken: string) {
    logger.info("Token refresh attempt");

    // Verify the refresh token signature
    let payload: TokenPayload;
    try {
      payload = await this.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    // Find existing session
    const session = await this.repo.findSessionByUserId(payload.sub);
    if (!session) {
      throw new UnauthorizedError("Session not found. Please login again");
    }

    // Compare stored hash with incoming token hash
    const incomingHash = await this.hashToken(refreshToken);
    if (incomingHash !== session.refreshTokenHash) {
      // Possible token reuse attack — delete all sessions for this user
      await this.repo.deleteSessionByUserId(payload.sub);
      logger.warn("Refresh token mismatch — possible reuse attack", { userId: payload.sub });
      throw new UnauthorizedError("Session invalidated. Please login again");
    }

    // Check expiry
    if (session.expiresAt < Date.now()) {
      await this.repo.deleteSessionByUserId(payload.sub);
      throw new UnauthorizedError("Session expired. Please login again");
    }

    // Rotate refresh token
    const newTokens = await this.generateTokens(payload);
    const newRefreshHash = await this.hashToken(newTokens.refreshToken);

    await this.repo.updateSessionToken(
      payload.sub,
      newRefreshHash,
      Date.now() + AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRY_MS
    );

    logger.info("Token refresh successful", { userId: payload.sub });

    return {
      user: { id: payload.sub, email: payload.email, role: payload.role },
      tokens: newTokens,
    };
  }

  // ── Sprint 5: Logout ──────────────────────────────────

  async logout(userId: string) {
    logger.info("Logout attempt", { userId });
    await this.repo.deleteSessionByUserId(userId);
    logger.info("Logout successful", { userId });
  }

  // ── Get Me ────────────────────────────────────────────

  async getMe(userId: string) {
    const user = await this.repo.findUserById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const profile = await this.repo.findProfileByUserId(userId);

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      profile: profile
        ? {
            fullName: profile.fullName,
            profileImage: profile.profileImage,
            category: profile.category,
            language: profile.language,
          }
        : null,
    };
  }

  // ── Change Password ───────────────────────────────────

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.repo.findUserById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const valid = await this.verifyPassword(currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    const newHash = await this.hashPassword(newPassword);
    await this.repo.updateUserPassword(userId, newHash);

    // Invalidate all sessions so user must re-login
    await this.repo.deleteSessionByUserId(userId);

    logger.info("Password changed successfully", { userId });
  }
}
