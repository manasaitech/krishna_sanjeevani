import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { programs } from "./program";

export const pregnancySchedule = sqliteTable("pregnancy_schedule", {
  id: text("id").primaryKey(),
  programId: text("program_id")
    .notNull()
    .references(() => programs.id, { onDelete: "cascade" }),
  pregnancyMonth: integer("pregnancy_month").notNull(), // month number (1 to 9)
  week: integer("week").notNull(), // week number (1 to 40)
  day: integer("day").notNull(), // day number (1 to 7)
  unlockAfterDays: integer("unlock_after_days").default(0), // days since start/edd
  isRequired: integer("is_required").notNull().default(1), // 0: optional, 1: required
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
