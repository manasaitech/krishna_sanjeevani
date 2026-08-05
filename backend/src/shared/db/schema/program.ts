import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { tracks } from "./track";

export const programs = sqliteTable("programs", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  description: text("description"),
  art: text("art"), // program cover artwork URL
  category: text("category").notNull(), // 'devotional', 'secular', 'pregnancy'
  sessionsCount: integer("sessions_count").notNull(),
  daysCount: integer("days_count").notNull(),
  premium: integer("premium").default(0), // 0: free, 1: premium
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const programTracks = sqliteTable("program_tracks", {
  id: text("id").primaryKey(),
  programId: text("program_id").notNull().references(() => programs.id, { onDelete: "cascade" }),
  trackId: text("track_id").notNull().references(() => tracks.id, { onDelete: "cascade" }),
  sequence: integer("sequence").notNull(), // sequence order index inside the program playlist
  createdAt: integer("created_at").notNull(),
});
