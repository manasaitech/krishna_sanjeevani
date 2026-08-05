import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { users } from "./user";

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  actorId: text("actor_id").notNull().references(() => users.id),
  action: text("action").notNull(), // 'track_upload', 'user_ban', 'settings_change'
  details: text("details"), // JSON payload metadata
  ipAddress: text("ip_address"),
  createdAt: integer("created_at").notNull(),
});
