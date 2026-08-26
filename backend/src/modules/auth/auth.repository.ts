import { eq, and } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { users, userProfiles, sessions, otps } from "../../shared/db/schema/user";
import * as schema from "../../shared/db/schema";

export class AuthRepository {
  constructor(public db: DrizzleD1Database<typeof schema>) {}

  // ── OTP & Verification ────────────────────────────────

  async verifyUserEmail(userId: string) {
    await this.db
      .update(users)
      .set({ emailVerified: 1, updatedAt: Date.now() })
      .where(eq(users.id, userId));
  }

  async createOtp(data: {
    id: string;
    email: string;
    code: string;
    purpose: string;
    expiresAt: number;
    createdAt: number;
  }) {
    // Delete any existing OTPs for the same email and purpose
    await this.db
      .delete(otps)
      .where(
        and(
          eq(otps.email, data.email),
          eq(otps.purpose, data.purpose)
        )
      );
    await this.db.insert(otps).values(data);
  }

  async findOtp(email: string, code: string, purpose: string) {
    const result = await this.db
      .select()
      .from(otps)
      .where(
        and(
          eq(otps.email, email),
          eq(otps.code, code),
          eq(otps.purpose, purpose)
        )
      )
      .limit(1);
    return result[0] ?? null;
  }

  async deleteOtp(otpId: string) {
    await this.db.delete(otps).where(eq(otps.id, otpId));
  }

  // ── Users ─────────────────────────────────────────────

  async findUserByEmail(email: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0] ?? null;
  }

  async findUserById(id: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async createUser(data: {
    id: string;
    email: string;
    passwordHash: string;
    role: string;
    emailVerified?: number;
    createdAt: number;
    updatedAt: number;
  }) {
    await this.db.insert(users).values(data);
  }

  async updateUserPassword(userId: string, passwordHash: string) {
    await this.db
      .update(users)
      .set({ passwordHash, updatedAt: Date.now() })
      .where(eq(users.id, userId));
  }

  // ── Profiles ──────────────────────────────────────────

  async createProfile(data: {
    id: string;
    userId: string;
    fullName: string;
    profileImage?: string | null;
    category: string;
    language?: string | null;
    createdAt: number;
    updatedAt: number;
  }) {
    await this.db.insert(userProfiles).values(data);
  }

  async findProfileByUserId(userId: string) {
    const result = await this.db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);
    return result[0] ?? null;
  }

  // ── Sessions ──────────────────────────────────────────

  async createSession(data: {
    id: string;
    userId: string;
    refreshTokenHash: string;
    expiresAt: number;
    createdAt: number;
  }) {
    await this.db.insert(sessions).values(data);
  }

  async findSessionByUserId(userId: string) {
    const result = await this.db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, userId))
      .limit(1);
    return result[0] ?? null;
  }

  async deleteSessionByUserId(userId: string) {
    await this.db.delete(sessions).where(eq(sessions.userId, userId));
  }

  async updateSessionToken(userId: string, refreshTokenHash: string, expiresAt: number) {
    await this.db
      .update(sessions)
      .set({ refreshTokenHash, expiresAt })
      .where(eq(sessions.userId, userId));
  }
}
