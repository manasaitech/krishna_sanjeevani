import { eq, and, like, or, sql, ne, isNull, inArray } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { tracks } from "../../shared/db/schema/track";
import { tags, trackTags } from "../../shared/db/schema/tag";
import * as schema from "../../shared/db/schema";
import { TrackFilters } from "./track.types";

export class TrackRepository {
  constructor(private db: DrizzleD1Database<typeof schema>) {}

  // ── Tracks ────────────────────────────────────────────

  async createTrack(data: {
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    artist: string;
    duration?: number;
    category: string;
    language: string;
    version: number;
    tier: string;
    playlistKey?: string;
    thumbnailKey?: string;
    processingStatus: string;
    publishStatus: string;
    createdBy: string;
    createdAt: number;
    updatedAt: number;
  }) {
    await this.db.insert(tracks).values(data);
  }

  async findTrackById(id: string) {
    const result = await this.db
      .select()
      .from(tracks)
      .where(and(eq(tracks.id, id), isNull(tracks.deletedAt)))
      .limit(1);
    return result[0] ?? null;
  }

  /**
   * Find a track by ID including soft-deleted tracks (for admin operations).
   */
  async findTrackByIdIncludeDeleted(id: string) {
    const result = await this.db
      .select()
      .from(tracks)
      .where(eq(tracks.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async findTracks(filters: TrackFilters, publishedOnly: boolean) {
    const conditions = this.buildFilterConditions(filters, publishedOnly);

    let query = this.db.select().from(tracks);

    // If filtering by purpose tag, join with track_tags and tags
    if (filters.purpose) {
      query = this.db
        .select({
          id: tracks.id,
          title: tracks.title,
          subtitle: tracks.subtitle,
          description: tracks.description,
          artist: tracks.artist,
          duration: tracks.duration,
          category: tracks.category,
          language: tracks.language,
          version: tracks.version,
          tier: tracks.tier,
          playlistKey: tracks.playlistKey,
          thumbnailKey: tracks.thumbnailKey,
          processingStatus: tracks.processingStatus,
          publishStatus: tracks.publishStatus,
          createdBy: tracks.createdBy,
          updatedBy: tracks.updatedBy,
          deletedAt: tracks.deletedAt,
          deletedBy: tracks.deletedBy,
          createdAt: tracks.createdAt,
          updatedAt: tracks.updatedAt,
        })
        .from(tracks)
        .innerJoin(trackTags, eq(tracks.id, trackTags.trackId))
        .innerJoin(tags, eq(trackTags.tagId, tags.id)) as any;
    }

    const offset = (filters.page - 1) * filters.limit;

    const result = await (query as any)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(filters.limit)
      .offset(offset)
      .orderBy(sql`${tracks.createdAt} DESC`);

    return result;
  }

  async countTracks(filters: TrackFilters, publishedOnly: boolean): Promise<number> {
    const conditions = this.buildFilterConditions(filters, publishedOnly);

    let baseQuery;

    if (filters.purpose) {
      baseQuery = this.db
        .select({ count: sql<number>`count(DISTINCT ${tracks.id})` })
        .from(tracks)
        .innerJoin(trackTags, eq(tracks.id, trackTags.trackId))
        .innerJoin(tags, eq(trackTags.tagId, tags.id));
    } else {
      baseQuery = this.db
        .select({ count: sql<number>`count(*)` })
        .from(tracks);
    }

    const result = await (baseQuery as any)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return Number(result[0]?.count ?? 0);
  }

  async updateTrack(
    id: string,
    data: Partial<{
      title: string;
      subtitle: string;
      description: string;
      artist: string;
      duration: number;
      category: string;
      language: string;
      version: number;
      tier: string;
      playlistKey: string;
      thumbnailKey: string;
      processingStatus: string;
      publishStatus: string;
      updatedBy: string;
      updatedAt: number;
    }>
  ) {
    await this.db.update(tracks).set(data).where(eq(tracks.id, id));
  }

  async softDeleteTrack(id: string, deletedBy: string) {
    const now = Date.now();
    await this.db
      .update(tracks)
      .set({
        deletedAt: now,
        deletedBy,
        publishStatus: "deleted",
        updatedBy: deletedBy,
        updatedAt: now,
      })
      .where(eq(tracks.id, id));
  }

  // ── Tags ──────────────────────────────────────────────

  async createTag(data: { id: string; name: string; slug: string; description?: string; createdAt: number }) {
    await this.db.insert(tags).values(data);
  }

  async findTagById(id: string) {
    const result = await this.db.select().from(tags).where(eq(tags.id, id)).limit(1);
    return result[0] ?? null;
  }

  async findTagBySlug(slug: string) {
    const result = await this.db.select().from(tags).where(eq(tags.slug, slug)).limit(1);
    return result[0] ?? null;
  }

  async findTagByName(name: string) {
    const result = await this.db.select().from(tags).where(eq(tags.name, name)).limit(1);
    return result[0] ?? null;
  }

  async findAllTags() {
    return this.db.select().from(tags).orderBy(sql`${tags.name} ASC`);
  }

  async findTagsByIds(ids: string[]) {
    if (ids.length === 0) return [];
    return this.db.select().from(tags).where(inArray(tags.id, ids));
  }

  // ── Track-Tag Junction ────────────────────────────────

  async addTagsToTrack(trackId: string, tagIds: string[]) {
    if (tagIds.length === 0) return;
    const values = tagIds.map((tagId) => ({ trackId, tagId }));
    await this.db.insert(trackTags).values(values);
  }

  async removeAllTagsFromTrack(trackId: string) {
    await this.db.delete(trackTags).where(eq(trackTags.trackId, trackId));
  }

  async findTagsByTrackId(trackId: string) {
    const result = await this.db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        description: tags.description,
        createdAt: tags.createdAt,
      })
      .from(trackTags)
      .innerJoin(tags, eq(trackTags.tagId, tags.id))
      .where(eq(trackTags.trackId, trackId));
    return result;
  }

  // ── Private Helpers ───────────────────────────────────

  private buildFilterConditions(filters: TrackFilters, publishedOnly: boolean) {
    const conditions: any[] = [];

    // Always exclude soft-deleted tracks
    conditions.push(isNull(tracks.deletedAt));

    // Public endpoints only see published tracks
    if (publishedOnly) {
      conditions.push(eq(tracks.publishStatus, "published"));
    }

    // Search across title, artist, description
    if (filters.search) {
      const searchPattern = `%${filters.search}%`;
      conditions.push(
        or(
          like(tracks.title, searchPattern),
          like(tracks.artist, searchPattern),
          like(tracks.description, searchPattern)
        )
      );
    }

    // Category filter
    if (filters.category) {
      conditions.push(eq(tracks.category, filters.category));
    }

    // Language filter
    if (filters.language) {
      conditions.push(eq(tracks.language, filters.language));
    }

    // Tier filter
    if (filters.tier) {
      conditions.push(eq(tracks.tier, filters.tier));
    }

    // Publish status filter
    if (filters.status) {
      conditions.push(eq(tracks.publishStatus, filters.status));
    }

    // Processing status filter
    if (filters.processingStatus) {
      conditions.push(eq(tracks.processingStatus, filters.processingStatus));
    }

    // Purpose filter (tag slug) — applied via JOIN
    if (filters.purpose) {
      conditions.push(eq(tags.slug, filters.purpose));
    }

    return conditions;
  }

  async getTrackStats() {
    const [
      totalCount,
      publishedCount,
      draftCount,
      processingCount,
      failedCount
    ] = await Promise.all([
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(tracks)
        .where(isNull(tracks.deletedAt)),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(tracks)
        .where(and(isNull(tracks.deletedAt), eq(tracks.publishStatus, "published"))),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(tracks)
        .where(and(isNull(tracks.deletedAt), eq(tracks.publishStatus, "draft"))),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(tracks)
        .where(
          and(
            isNull(tracks.deletedAt),
            inArray(tracks.processingStatus, ["uploaded", "processing", "transcoding", "uploading"])
          )
        ),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(tracks)
        .where(and(isNull(tracks.deletedAt), eq(tracks.processingStatus, "failed"))),
    ]);

    return {
      total: Number(totalCount[0]?.count ?? 0),
      published: Number(publishedCount[0]?.count ?? 0),
      draft: Number(draftCount[0]?.count ?? 0),
      processing: Number(processingCount[0]?.count ?? 0),
      failed: Number(failedCount[0]?.count ?? 0),
    };
  }
}
