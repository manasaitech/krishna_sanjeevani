import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { users } from "./user";
import { tracks } from "./track";
import { programs } from "./program";

export const playHistory = sqliteTable("play_history", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  trackId: text("track_id").notNull().references(() => tracks.id, { onDelete: "cascade" }),
  programId: text("program_id").references(() => programs.id, { onDelete: "cascade" }),
  durationListened: integer("duration_listened").notNull(), // duration listened in seconds
  lastPosition: integer("last_position").notNull().default(0), // last playback position in seconds
  completed: integer("completed").default(0), // 0: false, 1: true
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
