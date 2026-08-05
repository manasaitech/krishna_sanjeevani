import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { users } from "./user";

export const favorites = sqliteTable("favorites", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  itemId: text("item_id").notNull(), // tracks.id or programs.id
  itemType: text("item_type").notNull(), // 'track' | 'program'
  createdAt: integer("created_at").notNull(),
});
