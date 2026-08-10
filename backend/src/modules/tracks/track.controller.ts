import { Context } from "hono";
import { TrackService } from "./track.service";
import { TrackRepository } from "./track.repository";
import { createTrackSchema, updateTrackSchema, trackFiltersSchema, createTagSchema } from "./track.validator";
import { ApiResponse } from "../../shared/responses";
import { ValidationError } from "../../shared/errors";
import { getDB } from "../../shared/db/client";
import { Env } from "../../shared/config/env";

function getTrackService(env: Env): TrackService {
  const db = getDB(env);
  const repo = new TrackRepository(db);
  return new TrackService(repo);
}

export class TrackController {
  // ── Public Endpoints ──────────────────────────────────

  /**
   * GET /tracks — Paginated list of published tracks with search/filter.
   */
  static async list(c: Context<{ Bindings: Env }>) {
    const query = c.req.query();
    const parsed = trackFiltersSchema.safeParse(query);

    if (!parsed.success) {
      throw new ValidationError("Invalid query parameters", parsed.error.issues);
    }

    const service = getTrackService(c.env);
    const result = await service.listTracks(parsed.data, true); // publishedOnly = true

    return ApiResponse.success(c, result, "Tracks retrieved successfully");
  }

  /**
   * GET /tracks/admin/list — Paginated list of all tracks (including drafts) for admin content management.
   */
  static async listAdmin(c: Context<{ Bindings: Env }>) {
    const query = c.req.query();
    const parsed = trackFiltersSchema.safeParse(query);

    if (!parsed.success) {
      throw new ValidationError("Invalid query parameters", parsed.error.issues);
    }

    const service = getTrackService(c.env);
    const result = await service.listTracks(parsed.data, false); // publishedOnly = false

    return ApiResponse.success(c, result, "All tracks retrieved successfully");
  }

  /**
   * GET /tracks/:id — Single track with full metadata and tags.
   */
  static async getById(c: Context<{ Bindings: Env }>) {
    const id = c.req.param("id");
    if (!id) {
      throw new ValidationError("Track ID is required");
    }

    const service = getTrackService(c.env);
    const track = await service.getTrack(id);

    return ApiResponse.success(c, track, "Track retrieved successfully");
  }

  // ── Admin Endpoints ───────────────────────────────────

  /**
   * POST /tracks — Create new track metadata.
   */
  static async create(c: Context<{ Bindings: Env }>) {
    const body = await c.req.json();
    const parsed = createTrackSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError("Validation failed", parsed.error.issues);
    }

    const userId = c.get("userId" as never) as string;
    const service = getTrackService(c.env);
    const track = await service.createTrack(parsed.data, userId);

    return ApiResponse.success(c, track, "Track created successfully", 201);
  }

  /**
   * PATCH /tracks/:id — Update track metadata.
   */
  static async update(c: Context<{ Bindings: Env }>) {
    const id = c.req.param("id");
    if (!id) {
      throw new ValidationError("Track ID is required");
    }

    const body = await c.req.json();
    const parsed = updateTrackSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError("Validation failed", parsed.error.issues);
    }

    const userId = c.get("userId" as never) as string;
    const service = getTrackService(c.env);
    const track = await service.updateTrack(id, parsed.data, userId);

    return ApiResponse.success(c, track, "Track updated successfully");
  }

  /**
   * PATCH /tracks/:id/publish — Publish a track (validates prerequisites).
   */
  static async publish(c: Context<{ Bindings: Env }>) {
    const id = c.req.param("id");
    if (!id) {
      throw new ValidationError("Track ID is required");
    }

    const userId = c.get("userId" as never) as string;
    const service = getTrackService(c.env);
    const track = await service.publishTrack(id, userId);

    return ApiResponse.success(c, track, "Track published successfully");
  }

  /**
   * PATCH /tracks/:id/archive — Archive a track.
   */
  static async archive(c: Context<{ Bindings: Env }>) {
    const id = c.req.param("id");
    if (!id) {
      throw new ValidationError("Track ID is required");
    }

    const userId = c.get("userId" as never) as string;
    const service = getTrackService(c.env);
    const track = await service.archiveTrack(id, userId);

    return ApiResponse.success(c, track, "Track archived successfully");
  }

  /**
   * PATCH /tracks/:id/unpublish — Unpublish a track (revert to draft).
   */
  static async unpublish(c: Context<{ Bindings: Env }>) {
    const id = c.req.param("id");
    if (!id) {
      throw new ValidationError("Track ID is required");
    }

    const userId = c.get("userId" as never) as string;
    const service = getTrackService(c.env);
    const track = await service.unpublishTrack(id, userId);

    return ApiResponse.success(c, track, "Track reverted to draft successfully");
  }

  /**
   * DELETE /tracks/:id — Soft delete a track.
   */
  static async remove(c: Context<{ Bindings: Env }>) {
    const id = c.req.param("id");
    if (!id) {
      throw new ValidationError("Track ID is required");
    }

    const userId = c.get("userId" as never) as string;
    const service = getTrackService(c.env);
    await service.deleteTrack(id, userId);

    return ApiResponse.success(c, null, "Track deleted successfully");
  }

  // ── Tag Endpoints ─────────────────────────────────────

  /**
   * GET /tracks/tags — List all tags.
   */
  static async listTags(c: Context<{ Bindings: Env }>) {
    const service = getTrackService(c.env);
    const result = await service.listTags();

    return ApiResponse.success(c, result, "Tags retrieved successfully");
  }

  /**
   * POST /tracks/tags — Create a new tag (admin only).
   */
  static async createTag(c: Context<{ Bindings: Env }>) {
    const body = await c.req.json();
    const parsed = createTagSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError("Validation failed", parsed.error.issues);
    }

    const service = getTrackService(c.env);
    const tag = await service.createTag(parsed.data);

    return ApiResponse.success(c, tag, "Tag created successfully", 201);
  }

  /**
   * GET /tracks/admin/stats — Retrieve track counts by state.
   */
  static async getStats(c: Context<{ Bindings: Env }>) {
    const service = getTrackService(c.env);
    const stats = await service.getTrackStats();
    return ApiResponse.success(c, stats, "Track stats retrieved successfully");
  }
}
