import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { users } from "./user";

export const tracks = sqliteTable("tracks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: text("description"),
  artist: text("artist").notNull(),
  duration: integer("duration"), // duration in seconds (set by processing pipeline)
  category: text("category").notNull(), // 'devotional' | 'secular' | 'pregnancy'
  language: text("language").notNull().default("hi"), // ISO 639-1 code: 'en', 'hi', 'sa', 'ta', etc.
  version: integer("version").notNull().default(1), // revision counter, incremented on updates
  tier: text("tier").notNull().default("free"), // 'free' | 'premium'

  // R2 storage keys (no URLs, only object references)
  playlistKey: text("playlist_key"), // R2 key to HLS playlist directory (e.g. songs/processed/:id)
  thumbnailKey: text("thumbnail_key"), // R2 key to thumbnail image

  // Lifecycle states
  processingStatus: text("processing_status").notNull().default("uploaded"), // 'uploaded' | 'processing' | 'ready' | 'failed'
  publishStatus: text("publish_status").notNull().default("draft"), // 'draft' | 'processing' | 'ready' | 'published' | 'archived' | 'deleted'

  // Audit fields
  createdBy: text("created_by").notNull().references(() => users.id),
  updatedBy: text("updated_by").references(() => users.id),
  deletedAt: integer("deleted_at"), // soft delete timestamp
  deletedBy: text("deleted_by").references(() => users.id), // who performed the soft delete

  // Timestamps
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
