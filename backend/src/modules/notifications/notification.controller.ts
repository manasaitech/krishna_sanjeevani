import { Context } from "hono";
import { getDB } from "../../shared/db/client";
import { notifications } from "../../shared/db/schema/notification";
import { eq, and, desc, sql } from "drizzle-orm";
import { ApiResponse } from "../../shared/responses";
import { NotFoundError, ValidationError } from "../../shared/errors";

export class NotificationController {
  /**
   * GET /notifications?page=1&limit=20
   * Read-only: returns actual notifications for the authenticated user.
   * Never creates or seeds fake notifications.
   */
  static async list(c: Context) {
    const userId = c.get("userId" as never) as string;
    const db = getDB(c.env);

    // Pagination
    const page = Math.max(1, parseInt(c.req.query("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(c.req.query("limit") || "50", 10)));
    const offset = (page - 1) * limit;

    const results = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    // Convert numeric read status (0 or 1) to boolean for frontend
    const formatted = results.map((r) => ({
      ...r,
      read: r.read === 1,
    }));

    return ApiResponse.success(c, formatted, "Notifications retrieved successfully");
  }

  static async unreadCount(c: Context) {
    const userId = c.get("userId" as never) as string;
    const db = getDB(c.env);

    const results = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, 0)))
      .all();

    return ApiResponse.success(c, { count: results.length }, "Unread notification count retrieved");
  }

  static async markRead(c: Context) {
    const userId = c.get("userId" as never) as string;
    const id = c.req.param("id");
    if (!id) {
      throw new ValidationError("Notification ID is required");
    }
    const db = getDB(c.env);

    const existing = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .get();

    if (!existing) {
      throw new NotFoundError("Notification not found");
    }

    await db
      .update(notifications)
      .set({ read: 1 })
      .where(eq(notifications.id, id));

    return ApiResponse.success(c, { id, read: true }, "Notification marked as read");
  }

  static async markAllRead(c: Context) {
    const userId = c.get("userId" as never) as string;
    const db = getDB(c.env);

    await db
      .update(notifications)
      .set({ read: 1 })
      .where(eq(notifications.userId, userId));

    return ApiResponse.success(c, null, "All notifications marked as read");
  }
}
