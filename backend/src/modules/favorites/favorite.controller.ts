import { Context } from "hono";
import { getDB } from "../../shared/db/client";
import { favorites } from "../../shared/db/schema/favorite";
import { tracks } from "../../shared/db/schema/track";
import { programs } from "../../shared/db/schema/program";
import { eq, and, desc } from "drizzle-orm";
import { ApiResponse } from "../../shared/responses";
import { ValidationError, NotFoundError } from "../../shared/errors";

export class FavoriteController {
  static async list(c: Context) {
    const userId = c.get("userId" as never) as string;
    const itemType = c.req.query("itemType") as "track" | "program" | undefined;

    const db = getDB(c.env);

    if (itemType === "track") {
      const results = await db
        .select({
          favoriteId: favorites.id,
          createdAt: favorites.createdAt,
          item: tracks,
        })
        .from(favorites)
        .innerJoin(tracks, eq(favorites.itemId, tracks.id))
        .where(and(eq(favorites.userId, userId), eq(favorites.itemType, "track")))
        .orderBy(desc(favorites.createdAt))
        .all();

      const items = results.map((r) => ({
        ...r.item,
        art: r.item.thumbnailKey ? `${new URL(c.req.url).origin}/api/v1/storage/file/${r.item.thumbnailKey}` : undefined,
        raga: r.item.subtitle || "",
        purpose: r.item.description || "Healing",
        favoriteId: r.favoriteId,
        favorited: true,
      }));

      return ApiResponse.success(c, items, "Track favorites retrieved successfully");
    } else if (itemType === "program") {
      const results = await db
        .select({
          favoriteId: favorites.id,
          createdAt: favorites.createdAt,
          item: programs,
        })
        .from(favorites)
        .innerJoin(programs, eq(favorites.itemId, programs.id))
        .where(and(eq(favorites.userId, userId), eq(favorites.itemType, "program")))
        .orderBy(desc(favorites.createdAt))
        .all();

      const items = results.map((r) => ({
        ...r.item,
        favoriteId: r.favoriteId,
        favorited: true,
      }));

      return ApiResponse.success(c, items, "Program favorites retrieved successfully");
    } else {
      // Return raw favorites list
      const results = await db
        .select()
        .from(favorites)
        .where(eq(favorites.userId, userId))
        .orderBy(desc(favorites.createdAt))
        .all();

      return ApiResponse.success(c, results, "Favorites retrieved successfully");
    }
  }

  static async add(c: Context) {
    const userId = c.get("userId" as never) as string;
    const body = await c.req.json().catch(() => ({}));
    const { itemId, itemType } = body;

    if (!itemId || !itemType || !["track", "program"].includes(itemType)) {
      throw new ValidationError("Item ID and valid Item Type ('track' | 'program') are required");
    }

    const db = getDB(c.env);

    // 1. Verify item exists
    if (itemType === "track") {
      const trackExists = await db.select().from(tracks).where(eq(tracks.id, itemId)).get();
      if (!trackExists) {
        throw new NotFoundError("Track not found");
      }
    } else {
      const programExists = await db.select().from(programs).where(eq(programs.id, itemId)).get();
      if (!programExists) {
        throw new NotFoundError("Program not found");
      }
    }

    // 2. Check if already favorited (idempotent addition)
    const existing = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.itemId, itemId),
          eq(favorites.itemType, itemType)
        )
      )
      .get();

    if (existing) {
      return ApiResponse.success(c, existing, "Item is already favorited");
    }

    // 3. Insert favorite record
    const record = {
      id: crypto.randomUUID(),
      userId,
      itemId,
      itemType,
      createdAt: Date.now(),
    };

    await db.insert(favorites).values(record);

    return ApiResponse.success(c, record, "Added to favorites successfully");
  }

  static async remove(c: Context) {
    const userId = c.get("userId" as never) as string;
    const itemId = c.req.param("itemId");

    if (!itemId) {
      throw new ValidationError("Item ID is required");
    }

    const db = getDB(c.env);

    // Idempotent deletion
    await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.itemId, itemId)));

    return ApiResponse.success(c, null, "Removed from favorites successfully");
  }

  static async status(c: Context) {
    const userId = c.get("userId" as never) as string;
    const itemId = c.req.param("itemId");

    if (!itemId) {
      throw new ValidationError("Item ID is required");
    }

    const db = getDB(c.env);

    const record = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.itemId, itemId)))
      .get();

    return ApiResponse.success(c, { favorited: !!record }, "Favorite status checked");
  }
}
