import { Context } from "hono";
import { getDB } from "../../shared/db/client";
import { notifications } from "../../shared/db/schema/notification";
import { eq, and, desc } from "drizzle-orm";
import { ApiResponse } from "../../shared/responses";
import { NotFoundError, ValidationError } from "../../shared/errors";

export class NotificationController {
  static async list(c: Context) {
    const userId = c.get("userId" as never) as string;
    const db = getDB(c.env);

    let results = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .all();

    if (results.length === 0) {
      // Seed initial notifications for rich user-testing
      const initialNotes = [
        {
          id: crypto.randomUUID(),
          userId,
          title: "Welcome to Krishna Sanjeevani",
          message: "Hare Krishna! Thank you for starting your wellness and devotion path with us.",
          read: 0,
          type: "system",
          createdAt: Date.now(),
        },
        {
          id: crypto.randomUUID(),
          userId,
          title: "Daily Listening Reminder",
          message: "Your devotional music session for healing is ready for playback today.",
          read: 0,
          type: "track_alert",
          createdAt: Date.now() - 3600000, // 1 hour ago
        },
        {
          id: crypto.randomUUID(),
          userId,
          title: "Pregnancy Tips Loaded",
          message: "Check out the new healthy lifestyle recommendations in the pregnancy section.",
          read: 0,
          type: "pregnancy",
          createdAt: Date.now() - 7200000, // 2 hours ago
        }
      ];

      for (const note of initialNotes) {
        await db.insert(notifications).values(note);
      }

      results = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt))
        .all();
    }

    // Convert numeric read status (0 or 1) to boolean for easy frontend mapping
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
