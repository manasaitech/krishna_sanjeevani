import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { users } from "./user";

// Normalized Ailments (Sheet 2)
export const ailments = sqliteTable("ailments", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

// Normalized Surawalis (Sheet 2 & 3)
export const surawalis = sqliteTable("surawalis", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

// Normalized Timings (Sheet 2, 3, 4)
export const timings = sqliteTable("timings", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

// Junction Table: Ailment -> Surawali -> Timing (Sheet 2 Mapping)
export const ailmentSurawalis = sqliteTable("ailment_surawalis", {
  id: text("id").primaryKey(),
  ailmentId: text("ailment_id")
    .notNull()
    .references(() => ailments.id, { onDelete: "cascade" }),
  surawaliId: text("surawali_id")
    .notNull()
    .references(() => surawalis.id, { onDelete: "cascade" }),
  timingId: text("timing_id")
    .notNull()
    .references(() => timings.id, { onDelete: "cascade" }),
  createdAt: integer("created_at").notNull(),
});

// Pregnancy mapping (Sheet 3 Mapping)
export const pregnancyMappings = sqliteTable("pregnancy_mappings", {
  id: text("id").primaryKey(),
  pregnancyMonth: integer("pregnancy_month").notNull(),
  surawaliId: text("surawali_id")
    .notNull()
    .references(() => surawalis.id, { onDelete: "cascade" }),
  timingId: text("timing_id")
    .notNull()
    .references(() => timings.id, { onDelete: "cascade" }),
  musicTrack: text("music_track").notNull(), // e.g. "2nd month  MP3"
  createdAt: integer("created_at").notNull(),
});

// Corporate wellness mapping (Sheet 4 Mapping)
export const corporateRagas = sqliteTable("corporate_ragas", {
  id: text("id").primaryKey(),
  ragaName: text("raga_name").notNull(), // e.g. "Hindol"
  weekDay: text("week_day").notNull(), // e.g. "Sunday" or "daily"
  timingId: text("timing_id")
    .notNull()
    .references(() => timings.id, { onDelete: "cascade" }),
  createdAt: integer("created_at").notNull(),
});

// Surawali-specific persistent user subscriptions
export const surawaliSubscriptions = sqliteTable("surawali_subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  surawaliId: text("surawali_id")
    .notNull()
    .references(() => surawalis.id, { onDelete: "cascade" }),
  plan: text("plan").notNull(), // e.g. "monthly"
  status: text("status").notNull(), // "active" | "cancelled" | "expired"
  startDate: integer("start_date").notNull(),
  endDate: integer("end_date").notNull(),
  paymentId: text("payment_id").notNull(), // Mock transaction ID
  paymentProvider: text("payment_provider").notNull(), // "mock"
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
