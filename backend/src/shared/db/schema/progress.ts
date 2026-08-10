import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { users } from "./user";
import { programs } from "./program";

export const programProgress = sqliteTable("program_progress", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  programId: text("program_id")
    .notNull()
    .references(() => programs.id, { onDelete: "cascade" }),
  completedTracks: text("completed_tracks").notNull().default("[]"), // JSON stringified array of completed track IDs
  progressPercentage: integer("progress_percentage").notNull().default(0), // progress calculation 0-100
  startedAt: integer("started_at").notNull(),
  completedAt: integer("completed_at"), // timestamp when 100% complete
  updatedAt: integer("updated_at").notNull(),
});
