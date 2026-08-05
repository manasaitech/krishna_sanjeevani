import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  category: text("category").notNull(),
  role: text("role").default("user"), // 'user' | 'admin' | 'therapist'
  profileImage: text("profile_image"),
  isActive: integer("is_active").default(1), // 0: inactive, 1: active
  createdAt: integer("created_at"),
  updatedAt: integer("updated_at"),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at").notNull(),
});
