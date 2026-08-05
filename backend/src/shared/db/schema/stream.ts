import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { users } from "./user";
import { tracks } from "./track";

export const streamSessions = sqliteTable("stream_sessions", {
  id: text("id").primaryKey(), // secure token UUID
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  trackId: text("track_id").notNull().references(() => tracks.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at").notNull(),
});
