import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { users } from "./user";

export const plans = sqliteTable("plans", {
  id: text("id").primaryKey(),
  name: text("name").notNull(), // subscription tier name (e.g. 'Monthly Premium')
  price: integer("price").notNull(), // price in cents (e.g. 999 for $9.99)
  currency: text("currency").default("INR"),
  interval: text("interval").notNull(), // billing frequency: 'month' | 'year' | 'lifetime'
  isActive: integer("is_active").default(1), // 0: inactive, 1: active
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const subscriptions = sqliteTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  planId: text("plan_id").notNull().references(() => plans.id),
  status: text("status").notNull(), // active, canceled, expired, trial
  currentPeriodStart: integer("current_period_start").notNull(),
  currentPeriodEnd: integer("current_period_end").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const payments = sqliteTable("payments", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  planId: text("plan_id").notNull().references(() => plans.id),
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").notNull().default("INR"),
  status: text("status").notNull(), // pending, completed, failed, refunded
  orderId: text("order_id"), // Mock order ID / Razorpay order ID
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
