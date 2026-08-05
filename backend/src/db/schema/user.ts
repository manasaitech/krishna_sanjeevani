import {
  sqliteTable,
  text,
  integer,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  category: text("category").notNull(),
  role: text("role").default("user"),
  profileImage: text("profile_image"),
  isActive: integer("is_active").default(1),
  createdAt: integer("created_at"),
  updatedAt: integer("updated_at"),
});
