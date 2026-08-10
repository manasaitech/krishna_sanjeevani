import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { users } from "./user";
import { tracks } from "./track";

export const programTypes = sqliteTable("program_types", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: integer("created_at").notNull(),
});

export const programs = sqliteTable("programs", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: text("description"),
  thumbnailKey: text("thumbnail_key"), // R2 key to cover artwork
  category: text("category").notNull(), // 'devotional' | 'secular' | 'pregnancy' | 'corporate'
  difficulty: text("difficulty").notNull().default("beginner"), // 'beginner' | 'intermediate' | 'advanced'
  estimatedDuration: integer("estimated_duration"), // total seconds (computed from tracks)
  language: text("language").notNull().default("hi"), // ISO 639-1 code
  tier: text("tier").notNull().default("free"), // 'free' | 'premium'
  status: text("status").notNull().default("draft"), // 'draft' | 'published' | 'archived' | 'deleted'
  programTypeId: text("program_type_id")
    .notNull()
    .references(() => programTypes.id)
    .default("1"), // default to '1' (Therapeutic)

  // Audit fields
  createdBy: text("created_by").notNull().references(() => users.id),
  updatedBy: text("updated_by").references(() => users.id),
  deletedAt: integer("deleted_at"), // soft delete timestamp
  deletedBy: text("deleted_by").references(() => users.id),

  // Timestamps
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const programTracks = sqliteTable(
  "program_tracks",
  {
    programId: text("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "cascade" }),
    trackId: text("track_id")
      .notNull()
      .references(() => tracks.id, { onDelete: "cascade" }),
    sequence: integer("sequence").notNull(), // ordering index (1-based)
    isRequired: integer("is_required").notNull().default(1), // 0: optional, 1: required
    createdAt: integer("created_at").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.programId, table.trackId] }),
  ]
);
