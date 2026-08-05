import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const tracks = sqliteTable("tracks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  raga: text("raga").notNull(),
  purpose: text("purpose").notNull(), // 'stress', 'sleep', 'focus', 'pregnancy', etc.
  category: text("category").notNull(), // 'devotional', 'secular', 'pregnancy'
  duration: integer("duration").notNull(), // duration in seconds
  art: text("art"), // artwork asset URL
  url: text("url").notNull(), // secure streaming audio url
  instructions: text("instructions"), // listening guidance
  frequency: text("frequency"), // specific healing frequency (e.g. 432Hz)
  premium: integer("premium").default(0), // 0: free, 1: premium
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
