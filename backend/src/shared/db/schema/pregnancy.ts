import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { tracks } from "./track";

export const pregnancyPrograms = sqliteTable("pregnancy_programs", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  trimester: integer("trimester").notNull(), // trimester index: 1, 2, or 3
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const pregnancySchedule = sqliteTable("pregnancy_schedule", {
  id: text("id").primaryKey(),
  pregnancyProgramId: text("pregnancy_program_id").notNull().references(() => pregnancyPrograms.id, { onDelete: "cascade" }),
  week: integer("week").notNull(), // week number (e.g. 1 to 40)
  day: integer("day").notNull(), // day number (e.g. 1 to 7)
  trackId: text("track_id").notNull().references(() => tracks.id, { onDelete: "cascade" }),
  instructions: text("instructions"), // trimester-specific listening guidance
  createdAt: integer("created_at").notNull(),
});
