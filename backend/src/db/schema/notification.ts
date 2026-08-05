import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { users } from "./user";

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: integer("read").default(0), // 0: unread, 1: read
  type: text("type").default("system"), // 'system' | 'pregnancy' | 'track_alert'
  createdAt: integer("created_at").notNull(),
});
