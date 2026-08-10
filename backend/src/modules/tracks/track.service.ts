import { TrackRepository } from "./track.repository";
import { CreateTrackInput, UpdateTrackInput, TrackFilters, PaginatedResult, CreateTagInput } from "./track.types";
import { NotFoundError, ValidationError, ConflictError } from "../../shared/errors";
import { logger } from "../../shared/logger";

export class TrackService {
  constructor(private repo: TrackRepository) {}

  // ── Track CRUD ────────────────────────────────────────

  async createTrack(input: CreateTrackInput, userId: string) {
    logger.info("Creating new track metadata", { title: input.title, userId });

    const now = Date.now();
    const trackId = input.id || crypto.randomUUID();

    const existing = await this.repo.findTrackByIdIncludeDeleted(trackId);

    if (existing) {
      const updateData: Record<string, any> = {
        title: input.title,
        subtitle: input.subtitle,
        description: input.description,
        artist: input.artist,
        category: input.category,
        language: input.language,
        tier: input.tier ?? "free",
        updatedBy: userId,
        updatedAt: now,
      };

      if (input.duration !== undefined) updateData.duration = input.duration;
      if (input.playlistKey !== undefined) updateData.playlistKey = input.playlistKey;
      if (input.thumbnailKey !== undefined) updateData.thumbnailKey = input.thumbnailKey;

      await this.repo.updateTrack(trackId, updateData);
    } else {
      await this.repo.createTrack({
        id: trackId,
        title: input.title,
        subtitle: input.subtitle,
        description: input.description,
        artist: input.artist,
        duration: input.duration,
        category: input.category,
        language: input.language,
        version: 1,
        tier: input.tier ?? "free",
        playlistKey: input.playlistKey,
        thumbnailKey: input.thumbnailKey,
        processingStatus: "uploaded",
        publishStatus: "draft",
        createdBy: userId,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Attach purpose tags if provided
    if (input.purposeTagIds && input.purposeTagIds.length > 0) {
      await this.validateTagIds(input.purposeTagIds);
      await this.repo.removeAllTagsFromTrack(trackId);
      await this.repo.addTagsToTrack(trackId, input.purposeTagIds);
    }

    logger.info("Track metadata created successfully", { trackId });

    const track = await this.repo.findTrackById(trackId);
    const trackTags = await this.repo.findTagsByTrackId(trackId);

    return { ...track, purposeTags: trackTags };
  }

  async getTrack(id: string) {
    const track = await this.repo.findTrackById(id);
    if (!track) {
      throw new NotFoundError("Track not found");
    }

    const trackTags = await this.repo.findTagsByTrackId(id);

    return { ...track, purposeTags: trackTags };
  }

  async listTracks(filters: TrackFilters, publishedOnly: boolean): Promise<PaginatedResult<any>> {
    const [data, total] = await Promise.all([
      this.repo.findTracks(filters, publishedOnly),
      this.repo.countTracks(filters, publishedOnly),
    ]);

    // Fetch tags for each track
    const tracksWithTags = await Promise.all(
      data.map(async (track: any) => {
        const trackTags = await this.repo.findTagsByTrackId(track.id);
        return { ...track, purposeTags: trackTags };
      })
    );

    const totalPages = Math.ceil(total / filters.limit);

    return {
      data: tracksWithTags,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages,
      },
    };
  }

  async updateTrack(id: string, input: UpdateTrackInput, userId: string) {
    logger.info("Updating track metadata", { trackId: id, userId });

    const existing = await this.repo.findTrackById(id);
    if (!existing) {
      throw new NotFoundError("Track not found");
    }

    // Build update payload (only include provided fields)
    const updateData: Record<string, any> = {
      updatedBy: userId,
      updatedAt: Date.now(),
      version: existing.version + 1, // bump version on every update
    };

    if (input.title !== undefined) updateData.title = input.title;
    if (input.subtitle !== undefined) updateData.subtitle = input.subtitle;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.artist !== undefined) updateData.artist = input.artist;
    if (input.duration !== undefined) updateData.duration = input.duration;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.language !== undefined) updateData.language = input.language;
    if (input.tier !== undefined) updateData.tier = input.tier;
    if (input.playlistKey !== undefined) updateData.playlistKey = input.playlistKey;
    if (input.thumbnailKey !== undefined) updateData.thumbnailKey = input.thumbnailKey;

    await this.repo.updateTrack(id, updateData);

    // Update purpose tags if provided
    if (input.purposeTagIds !== undefined) {
      await this.validateTagIds(input.purposeTagIds);
      await this.repo.removeAllTagsFromTrack(id);
      if (input.purposeTagIds.length > 0) {
        await this.repo.addTagsToTrack(id, input.purposeTagIds);
      }
    }

    logger.info("Track metadata updated successfully", { trackId: id, newVersion: updateData.version });

    const track = await this.repo.findTrackById(id);
    const trackTags = await this.repo.findTagsByTrackId(id);

    return { ...track, purposeTags: trackTags };
  }

  // ── Publishing Workflow ───────────────────────────────

  async publishTrack(id: string, userId: string) {
    logger.info("Publishing track", { trackId: id, userId });

    const track = await this.repo.findTrackById(id);
    if (!track) {
      throw new NotFoundError("Track not found");
    }

    // Validate publishing prerequisites
    const errors: string[] = [];

    if (track.processingStatus !== "ready") {
      errors.push(`Processing must be complete (current: '${track.processingStatus}'). processing_status must be 'ready'.`);
    }

    if (!track.thumbnailKey) {
      errors.push("Thumbnail is required before publishing. Set thumbnail_key.");
    }

    if (!track.playlistKey) {
      errors.push("Playlist is required before publishing. Set playlist_key.");
    }

    if (!track.title || !track.artist || !track.category || !track.language) {
      errors.push("Required metadata is incomplete. title, artist, category, and language are required.");
    }

    if (errors.length > 0) {
      throw new ValidationError("Track cannot be published. Resolve the following issues:", errors);
    }

    await this.repo.updateTrack(id, {
      publishStatus: "published",
      updatedBy: userId,
      updatedAt: Date.now(),
    });

    logger.info("Track published successfully", { trackId: id });

    const updated = await this.repo.findTrackById(id);
    const trackTags = await this.repo.findTagsByTrackId(id);

    return { ...updated, purposeTags: trackTags };
  }

  // ── Archive Workflow ──────────────────────────────────

  async archiveTrack(id: string, userId: string) {
    logger.info("Archiving track", { trackId: id, userId });

    const track = await this.repo.findTrackById(id);
    if (!track) {
      throw new NotFoundError("Track not found");
    }

    await this.repo.updateTrack(id, {
      publishStatus: "archived",
      updatedBy: userId,
      updatedAt: Date.now(),
    });

    logger.info("Track archived successfully", { trackId: id });

    const updated = await this.repo.findTrackById(id);
    const trackTags = await this.repo.findTagsByTrackId(id);

    return { ...updated, purposeTags: trackTags };
  }

  // ── Unpublish Workflow ─────────────────────────────────

  async unpublishTrack(id: string, userId: string) {
    logger.info("Unpublishing track", { trackId: id, userId });

    const track = await this.repo.findTrackById(id);
    if (!track) {
      throw new NotFoundError("Track not found");
    }

    await this.repo.updateTrack(id, {
      publishStatus: "draft",
      updatedBy: userId,
      updatedAt: Date.now(),
    });

    logger.info("Track reverted to draft successfully", { trackId: id });

    const updated = await this.repo.findTrackById(id);
    const trackTags = await this.repo.findTagsByTrackId(id);

    return { ...updated, purposeTags: trackTags };
  }

  // ── Soft Delete ───────────────────────────────────────

  async deleteTrack(id: string, userId: string) {
    logger.info("Soft-deleting track", { trackId: id, userId });

    const track = await this.repo.findTrackById(id);
    if (!track) {
      throw new NotFoundError("Track not found");
    }

    await this.repo.softDeleteTrack(id, userId);

    logger.info("Track soft-deleted successfully", { trackId: id });
  }

  // ── Tag Management ────────────────────────────────────

  async createTag(input: CreateTagInput) {
    logger.info("Creating new tag", { name: input.name });

    const slug = this.generateSlug(input.name);

    // Check for duplicate name or slug
    const existingByName = await this.repo.findTagByName(input.name);
    if (existingByName) {
      throw new ConflictError(`A tag with the name '${input.name}' already exists`);
    }

    const existingBySlug = await this.repo.findTagBySlug(slug);
    if (existingBySlug) {
      throw new ConflictError(`A tag with the slug '${slug}' already exists`);
    }

    const tagId = crypto.randomUUID();
    const now = Date.now();

    await this.repo.createTag({
      id: tagId,
      name: input.name,
      slug,
      description: input.description,
      createdAt: now,
    });

    logger.info("Tag created successfully", { tagId, slug });

    return this.repo.findTagById(tagId);
  }

  async listTags() {
    return this.repo.findAllTags();
  }

  // ── Private Helpers ───────────────────────────────────

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // remove non-word chars (except spaces and hyphens)
      .replace(/\s+/g, "-") // replace spaces with hyphens
      .replace(/-+/g, "-"); // collapse multiple hyphens
  }

  /**
   * Validates that all provided tag IDs exist in the database.
   */
  private async validateTagIds(tagIds: string[]) {
    if (tagIds.length === 0) return;

    const existingTags = await this.repo.findTagsByIds(tagIds);
    const existingIds = new Set(existingTags.map((t) => t.id));

    const missingIds = tagIds.filter((id) => !existingIds.has(id));
    if (missingIds.length > 0) {
      throw new ValidationError(`The following tag IDs do not exist: ${missingIds.join(", ")}`);
    }
  }

  async getTrackStats() {
    return this.repo.getTrackStats();
  }
}
