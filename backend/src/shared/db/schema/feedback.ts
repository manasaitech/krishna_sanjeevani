import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const feedbacks = sqliteTable("feedbacks", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  userName: text("user_name"),
  userEmail: text("user_email"),
  trackId: text("track_id"),
  trackTitle: text("track_title"),
  surawaliId: text("surawali_id"),
  programId: text("program_id"),
  mode: text("mode").notNull().default("surawali"), // "surawali" | "emotion_remediation"
  rating: integer("rating").notNull(), // 1 to 5
  mood: text("mood"), // "Calmer" | "Rested" | "Neutral" | "Heavy"
  notes: text("notes"),
  sessionDuration: integer("session_duration").notNull().default(0), // in seconds
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
