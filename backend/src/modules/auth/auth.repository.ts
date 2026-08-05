import { eq } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { users, userProfiles, sessions } from "../../shared/db/schema/user";
import * as schema from "../../shared/db/schema";

export class AuthRepository {
  constructor(private db: DrizzleD1Database<typeof schema>) {}

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
    category: string;
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
