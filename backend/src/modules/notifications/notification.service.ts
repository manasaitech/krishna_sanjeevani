import { eq, and, lt, gt } from "drizzle-orm";
import { notifications, notificationJobs } from "../../shared/db/schema/notification";
import { surawaliSubscriptions, surawalis, ailmentSurawalis, timings } from "../../shared/db/schema/surawali_catalog";
import { userProfiles } from "../../shared/db/schema/user";
import { NOTIFICATION_TYPES } from "./notification.types";
import { logger } from "../../shared/logger";

type DB = ReturnType<typeof import("../../shared/db/client").getDB>;

interface CreateNotificationInput {
  userId: string;
  eventId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  dateKey?: string;
}

export class NotificationService {
  /**
   * Core idempotent notification creator.
   * Checks for existing eventId before inserting. Returns true if created, false if already exists.
   */
  static async createNotification(db: DB, input: CreateNotificationInput): Promise<boolean> {
    const { userId, eventId, type, title, message, link, dateKey } = input;

    // Idempotency check: if eventId already exists, skip
    const existing = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(eq(notifications.eventId, eventId))
      .limit(1);

    if (existing.length > 0) {
      logger.info("Notification already exists, skipping", { eventId });
      return false;
    }

    const id = `notif_${crypto.randomUUID()}`;
    const now = Date.now();

    try {
      await db.insert(notifications).values({
        id,
        userId,
        eventId,
        title,
        message,
        read: 0,
        type,
        status: "sent",
        link: link || null,
        dateKey: dateKey || null,
        createdAt: now,
      });
      logger.info("Notification created", { id, eventId, type });
      return true;
    } catch (err: any) {
      // Handle UNIQUE constraint violation gracefully (concurrent requests)
      if (err.message?.includes("UNIQUE") || err.message?.includes("unique")) {
        logger.info("Notification creation blocked by unique constraint (concurrent duplicate)", { eventId });
        return false;
      }
      throw err;
    }
  }

  // ── Specific Notification Creators ──────────────────────

  static async createWelcomeNotification(db: DB, userId: string): Promise<boolean> {
    return this.createNotification(db, {
      userId,
      eventId: `WELCOME:${userId}`,
      type: NOTIFICATION_TYPES.WELCOME,
      title: "Welcome to Krishna Sanjeevani 🙏",
      message: "Hare Krishna! Begin your spiritual wellness journey with us. Explore Surawalis tailored for your well-being.",
      link: "/home",
    });
  }

  static async createFirstSurawaliCTA(db: DB, userId: string): Promise<boolean> {
    // Check if user already has active Surawali subscriptions
    const activeSubs = await db
      .select({ id: surawaliSubscriptions.id })
      .from(surawaliSubscriptions)
      .where(
        and(
          eq(surawaliSubscriptions.userId, userId),
          eq(surawaliSubscriptions.status, "active"),
          gt(surawaliSubscriptions.endDate, Date.now())
        )
      )
      .limit(1);

    if (activeSubs.length > 0) {
      logger.info("User already has active Surawali subscription, skipping CTA", { userId });
      return false;
    }

    return this.createNotification(db, {
      userId,
      eventId: `FIRST_SURAWALI_CTA:${userId}`,
      type: NOTIFICATION_TYPES.FIRST_SURAWALI_CTA,
      title: "Discover Your First Surawali 🎵",
      message: "Subscribe to a Surawali and begin your personalized listening journey. Explore Surawalis matched to your wellness needs.",
      link: "/home#explore-surawalis",
    });
  }

  static async createSubscriptionNotification(
    db: DB,
    userId: string,
    surawaliId: string,
    subscriptionId: string,
    surawaliName: string
  ): Promise<boolean> {
    return this.createNotification(db, {
      userId,
      eventId: `SURAWALI_SUBSCRIPTION:${userId}:${surawaliId}:${subscriptionId}`,
      type: NOTIFICATION_TYPES.SURAWALI_SUBSCRIPTION,
      title: "Surawali Subscribed 🙏",
      message: `You are now subscribed to ${surawaliName}. Your personalized listening sessions are ready.`,
      link: `/discover/surawalis/${surawaliId}`,
    });
  }

  static async createSurawaliReminder(
    db: DB,
    userId: string,
    surawaliId: string,
    surawaliName: string,
    dateKey: string
  ): Promise<boolean> {
    return this.createNotification(db, {
      userId,
      eventId: `SURAWALI_REMINDER:${userId}:${surawaliId}:${dateKey}`,
      type: NOTIFICATION_TYPES.SURAWALI_REMINDER,
      title: "It's time for your Surawali 🕉️",
      message: `Take a peaceful moment to listen to ${surawaliName}.`,
      link: `/discover/surawalis/${surawaliId}`,
      dateKey,
    });
  }

  // ── Job Scheduling ──────────────────────────────────────

  static async scheduleFirstSurawaliCTA(db: DB, userId: string): Promise<void> {
    const id = `job_${crypto.randomUUID()}`;
    const now = Date.now();
    const executeAt = now + 60_000; // 1 minute from now

    try {
      await db.insert(notificationJobs).values({
        id,
        userId,
        type: NOTIFICATION_TYPES.FIRST_SURAWALI_CTA,
        executeAt,
        status: "pending",
        createdAt: now,
      });
      logger.info("Scheduled first Surawali CTA job", { userId, executeAt: new Date(executeAt).toISOString() });
    } catch (err: any) {
      logger.error("Failed to schedule first Surawali CTA job", { userId, error: err.message });
    }
  }

  // ── Job Processing (called from scheduled handler) ─────

  static async processJobs(db: DB): Promise<void> {
    const now = Date.now();

    // Find all pending jobs whose executeAt has passed
    const pendingJobs = await db
      .select()
      .from(notificationJobs)
      .where(
        and(
          eq(notificationJobs.status, "pending"),
          lt(notificationJobs.executeAt, now)
        )
      )
      .limit(50);

    for (const job of pendingJobs) {
      try {
        if (job.type === NOTIFICATION_TYPES.FIRST_SURAWALI_CTA) {
          const created = await this.createFirstSurawaliCTA(db, job.userId);
          // Mark job as completed regardless (if user already subscribed, CTA is skipped)
          await db
            .update(notificationJobs)
            .set({ status: created ? "completed" : "cancelled", processedAt: now })
            .where(eq(notificationJobs.id, job.id));

          logger.info("Processed CTA job", { jobId: job.id, created });
        } else {
          // Unknown job type — mark completed to avoid infinite retries
          await db
            .update(notificationJobs)
            .set({ status: "completed", processedAt: now })
            .where(eq(notificationJobs.id, job.id));
          logger.warn("Unknown job type, marking completed", { jobId: job.id, type: job.type });
        }
      } catch (err: any) {
        logger.error("Failed to process notification job", { jobId: job.id, error: err.message });
      }
    }
  }

  // ── Surawali Reminder Scheduler (called from cron) ─────

  /**
   * Parse a human-readable timing string like "6 to 8 pm" to extract the start hour (0-23).
   * Returns null if the string cannot be parsed.
   */
  static parseTimingStartHour(timingName: string): number | null {
    const lower = timingName.toLowerCase().trim();

    // Handle non-time-specific entries
    if (lower === "any time" || lower === "anytime") return null;
    if (lower === "before sleep") return 21; // 9 PM
    if (lower === "after lunch") return 13; // 1 PM
    if (lower === "before lunch") return 11; // 11 AM

    // Match patterns like "6 to 8 pm", "6 pm-11 pm", "4 to 6 am", "8 to 10am"
    const rangeMatch = lower.match(/(\d{1,2})\s*(?:to|[-–])\s*\d{1,2}\s*(am|pm)/);
    if (rangeMatch) {
      let hour = parseInt(rangeMatch[1], 10);
      const period = rangeMatch[2];
      if (period === "pm" && hour < 12) hour += 12;
      if (period === "am" && hour === 12) hour = 0;
      return hour;
    }

    // Match simple "6 am" or "8 pm" patterns
    const simpleMatch = lower.match(/(\d{1,2})\s*(am|pm)/);
    if (simpleMatch) {
      let hour = parseInt(simpleMatch[1], 10);
      const period = simpleMatch[2];
      if (period === "pm" && hour < 12) hour += 12;
      if (period === "am" && hour === 12) hour = 0;
      return hour;
    }

    return null;
  }

  /**
   * Get the current hour in a given timezone.
   * Falls back to Asia/Kolkata if timezone is invalid.
   */
  static getCurrentHourInTimezone(timezone: string): number {
    try {
      const formatter = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        hour12: false,
        timeZone: timezone,
      });
      const parts = formatter.formatToParts(new Date());
      const hourPart = parts.find((p) => p.type === "hour");
      return parseInt(hourPart?.value || "0", 10);
    } catch {
      // Invalid timezone — fallback to Asia/Kolkata
      const formatter = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        hour12: false,
        timeZone: "Asia/Kolkata",
      });
      const parts = formatter.formatToParts(new Date());
      const hourPart = parts.find((p) => p.type === "hour");
      return parseInt(hourPart?.value || "0", 10);
    }
  }

  /**
   * Get today's date string in YYYY-MM-DD format for a given timezone.
   */
  static getTodayDateKey(timezone: string): string {
    try {
      const formatter = new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: timezone,
      });
      return formatter.format(new Date()); // Returns YYYY-MM-DD in en-CA locale
    } catch {
      const formatter = new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "Asia/Kolkata",
      });
      return formatter.format(new Date());
    }
  }

  /**
   * Generate Surawali reminders for all active subscriptions whose timing window is now.
   * Called from the scheduled/cron handler.
   */
  static async generateSurawaliReminders(db: DB): Promise<void> {
    // 1. Get all active Surawali subscriptions with user timezone and timing info
    const activeSubscriptions = await db
      .select({
        userId: surawaliSubscriptions.userId,
        surawaliId: surawaliSubscriptions.surawaliId,
        surawaliName: surawalis.name,
        timezone: userProfiles.timezone,
      })
      .from(surawaliSubscriptions)
      .innerJoin(surawalis, eq(surawaliSubscriptions.surawaliId, surawalis.id))
      .innerJoin(userProfiles, eq(surawaliSubscriptions.userId, userProfiles.userId))
      .where(
        and(
          eq(surawaliSubscriptions.status, "active"),
          gt(surawaliSubscriptions.endDate, Date.now())
        )
      );

    if (activeSubscriptions.length === 0) return;

    // 2. Get all timing mappings for Surawalis
    const allTimingMappings = await db
      .select({
        surawaliId: ailmentSurawalis.surawaliId,
        timingName: timings.name,
      })
      .from(ailmentSurawalis)
      .innerJoin(timings, eq(ailmentSurawalis.timingId, timings.id));

    // Build a lookup: surawaliId -> Set of start hours
    const surawaliTimingHours = new Map<string, Set<number>>();
    for (const mapping of allTimingMappings) {
      const hour = this.parseTimingStartHour(mapping.timingName);
      if (hour === null) continue;
      if (!surawaliTimingHours.has(mapping.surawaliId)) {
        surawaliTimingHours.set(mapping.surawaliId, new Set());
      }
      surawaliTimingHours.get(mapping.surawaliId)!.add(hour);
    }

    // 3. For each active subscription, check if it's time for a reminder
    for (const sub of activeSubscriptions) {
      const timezone = sub.timezone || "Asia/Kolkata";
      const currentHour = this.getCurrentHourInTimezone(timezone);
      const dateKey = this.getTodayDateKey(timezone);

      const targetHours = surawaliTimingHours.get(sub.surawaliId);
      if (!targetHours || targetHours.size === 0) continue;

      // Check if the current hour matches any of the Surawali's timing start hours
      if (!targetHours.has(currentHour)) continue;

      // Create reminder notification (idempotent — dateKey prevents duplicates for the same day)
      try {
        await this.createSurawaliReminder(
          db,
          sub.userId,
          sub.surawaliId,
          sub.surawaliName,
          dateKey
        );
      } catch (err: any) {
        logger.error("Failed to create Surawali reminder", {
          userId: sub.userId,
          surawaliId: sub.surawaliId,
          error: err.message,
        });
      }
    }
  }
}
