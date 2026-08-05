import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { users } from "./user";

export const analyticsEvents = sqliteTable("analytics_events", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  eventType: text("event_type").notNull(), // 'play_start', 'search_query', 'page_view'
  payload: text("payload"), // JSON payload detailing the event metadata
  device: text("device"), // client client device: 'web' | 'ios' | 'android'
  createdAt: integer("created_at").notNull(),
});
