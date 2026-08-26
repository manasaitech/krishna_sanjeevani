import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Identity table — authentication only
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("user"), // 'guest' | 'user' | 'premium' | 'admin' | 'super_admin'
  status: text("status").notNull().default("active"), // 'active' | 'suspended' | 'deleted'
  emailVerified: integer("email_verified").notNull().default(0), // 0: false, 1: true
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

// Profile table — application-specific user data
export const userProfiles = sqliteTable("user_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  profileImage: text("profile_image"),
  category: text("category").notNull(), // chosen raga category
  language: text("language").default("en"),
  preferences: text("preferences"), // JSON string of user preferences
  
  // Pregnancy configuration columns
  pregnancyEdd: text("pregnancy_edd"), // Optional ISO date "YYYY-MM-DD"
  pregnancyWeekStart: integer("pregnancy_week_start"), // Timestamp when user set current pregnancy week
  pregnancyWeekStartWeek: integer("pregnancy_week_start_week"), // Starting week number when user set it
  
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

// Sessions table — refresh token storage
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  refreshTokenHash: text("refresh_token_hash").notNull(),
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at").notNull(),
});

// OTP verification table
export const otps = sqliteTable("otps", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  code: text("code").notNull(),
  purpose: text("purpose").notNull(), // 'verification' | 'reset_password'
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at").notNull(),
});
