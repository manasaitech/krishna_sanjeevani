import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { users } from "./user";

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  eventId: text("event_id").notNull().unique(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: integer("read").default(0), // 0: unread, 1: read
  type: text("type").default("system"), // 'welcome' | 'first_surawali_cta' | 'surawali_subscription' | 'surawali_reminder' | 'system'
  status: text("status").default("sent"), // 'pending' | 'sent' | 'failed' | 'cancelled'
  link: text("link"),
  dateKey: text("date_key"),
  createdAt: integer("created_at").notNull(),
});

export const notificationJobs = sqliteTable("notification_jobs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  executeAt: integer("execute_at").notNull(),
  status: text("status").notNull().default("pending"), // 'pending' | 'completed' | 'cancelled'
  payload: text("payload"), // JSON string for extra data
  createdAt: integer("created_at").notNull(),
  processedAt: integer("processed_at"),
});
