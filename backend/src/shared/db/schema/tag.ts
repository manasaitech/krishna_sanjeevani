import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { tracks } from "./track";

// Tags table — flexible, admin-manageable therapeutic classifications
export const tags = sqliteTable("tags", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(), // Human-readable: "Stress Relief", "Deep Sleep"
  slug: text("slug").notNull().unique(), // URL-safe: "stress-relief", "deep-sleep"
  description: text("description"),
  createdAt: integer("created_at").notNull(),
});

// Junction table — many-to-many relationship between tracks and tags
export const trackTags = sqliteTable(
  "track_tags",
  {
    trackId: text("track_id")
      .notNull()
      .references(() => tracks.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.trackId, table.tagId] }),
  ]
);
