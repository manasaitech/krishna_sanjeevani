import { Context } from "hono";
import { ProgramService } from "./program.service";
import { ProgramRepository } from "./program.repository";
import { TrackRepository } from "../tracks/track.repository";
import {
  createProgramSchema,
  updateProgramSchema,
  programFiltersSchema,
  addTrackSchema,
  reorderTracksSchema,
} from "./program.validator";
import { ApiResponse } from "../../shared/responses";
import { ValidationError } from "../../shared/errors";
import { getDB } from "../../shared/db/client";
import { Env } from "../../shared/config/env";

function getProgramService(env: Env): ProgramService {
  const db = getDB(env);
  const programRepo = new ProgramRepository(db);
  const trackRepo = new TrackRepository(db);
  return new ProgramService(programRepo, trackRepo);
}

export class ProgramController {
  // ── Public Endpoints ──────────────────────────────────

  /**
   * GET /programs — Paginated list of published programs with search/filter.
   */
  static async list(c: Context<{ Bindings: Env }>) {
    const query = c.req.query();
    const parsed = programFiltersSchema.safeParse(query);

    if (!parsed.success) {
      throw new ValidationError("Invalid query parameters", parsed.error.issues);
    }

    const service = getProgramService(c.env);
    const result = await service.listPrograms(parsed.data, true); // publishedOnly = true

    return ApiResponse.success(c, result, "Programs retrieved successfully");
  }

  /**
   * GET /programs/:id — Single program with full metadata.
   */
  static async getById(c: Context<{ Bindings: Env }>) {
    const id = c.req.param("id");
    if (!id) {
      throw new ValidationError("Program ID is required");
    }

    const service = getProgramService(c.env);
    const program = await service.getProgram(id);

    return ApiResponse.success(c, program, "Program retrieved successfully");
  }

  /**
   * GET /programs/:id/tracks — List all tracks in a program, ordered by sequence.
   */
  static async getTracks(c: Context<{ Bindings: Env }>) {
    const id = c.req.param("id");
    if (!id) {
      throw new ValidationError("Program ID is required");
    }

    const service = getProgramService(c.env);
    const tracks = await service.getProgramTracks(id);

    return ApiResponse.success(c, tracks, "Program tracks retrieved successfully");
  }

  // ── Admin Endpoints ───────────────────────────────────

  /**
   * POST /programs — Create new program.
   */
  static async create(c: Context<{ Bindings: Env }>) {
    const body = await c.req.json();
    const parsed = createProgramSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError("Validation failed", parsed.error.issues);
    }

    const userId = c.get("userId" as never) as string;
    const service = getProgramService(c.env);
    const program = await service.createProgram(parsed.data, userId);

    return ApiResponse.success(c, program, "Program created successfully", 201);
  }

  /**
   * PATCH /programs/:id — Update program metadata.
   */
  static async update(c: Context<{ Bindings: Env }>) {
    const id = c.req.param("id");
    if (!id) {
      throw new ValidationError("Program ID is required");
    }

    const body = await c.req.json();
    const parsed = updateProgramSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError("Validation failed", parsed.error.issues);
    }

    const userId = c.get("userId" as never) as string;
    const service = getProgramService(c.env);
    const program = await service.updateProgram(id, parsed.data, userId);

    return ApiResponse.success(c, program, "Program updated successfully");
  }

  /**
   * PATCH /programs/:id/publish — Publish a program (validates prerequisites).
   */
  static async publish(c: Context<{ Bindings: Env }>) {
    const id = c.req.param("id");
    if (!id) {
      throw new ValidationError("Program ID is required");
    }

    const userId = c.get("userId" as never) as string;
    const service = getProgramService(c.env);
    const program = await service.publishProgram(id, userId);

    return ApiResponse.success(c, program, "Program published successfully");
  }

  /**
   * PATCH /programs/:id/archive — Archive a program.
   */
  static async archive(c: Context<{ Bindings: Env }>) {
    const id = c.req.param("id");
    if (!id) {
      throw new ValidationError("Program ID is required");
    }

    const userId = c.get("userId" as never) as string;
    const service = getProgramService(c.env);
    const program = await service.archiveProgram(id, userId);

    return ApiResponse.success(c, program, "Program archived successfully");
  }

  /**
   * GET /programs/admin/list — List all programs (including drafts) for admin dashboard.
   */
  static async listAdmin(c: Context<{ Bindings: Env }>) {
    const query = c.req.query();
    const parsed = programFiltersSchema.safeParse(query);

    if (!parsed.success) {
      throw new ValidationError("Invalid query parameters", parsed.error.issues);
    }

    const service = getProgramService(c.env);
    const result = await service.listPrograms(parsed.data, false); // publishedOnly = false

    return ApiResponse.success(c, result, "All programs retrieved successfully");
  }

  /**
   * GET /programs/admin/stats — Get count of programs by status.
   */
  static async getStats(c: Context<{ Bindings: Env }>) {
    const service = getProgramService(c.env);
    const stats = await service.getProgramStats();
    return ApiResponse.success(c, stats, "Program stats retrieved successfully");
  }

  /**
   * PATCH /programs/:id/unpublish — Revert a program to draft status.
   */
  static async unpublish(c: Context<{ Bindings: Env }>) {
    const id = c.req.param("id");
    if (!id) {
      throw new ValidationError("Program ID is required");
    }

    const userId = c.get("userId" as never) as string;
    const service = getProgramService(c.env);
    const program = await service.unpublishProgram(id, userId);

    return ApiResponse.success(c, program, "Program reverted to draft successfully");
  }

  /**
   * GET /programs/:id/pregnancy-schedules — Get pregnancy schedule entries for this program.
   */
  static async getPregnancySchedules(c: Context<{ Bindings: Env }>) {
    const id = c.req.param("id");
    if (!id) {
      throw new ValidationError("Program ID is required");
    }

    const service = getProgramService(c.env);
    const schedules = await service.getPregnancySchedulesForProgram(id);

    return ApiResponse.success(c, schedules, "Program pregnancy schedules retrieved successfully");
  }

  /**
   * DELETE /programs/:id — Soft delete a program.
   */
  static async remove(c: Context<{ Bindings: Env }>) {
    const id = c.req.param("id");
    if (!id) {
      throw new ValidationError("Program ID is required");
    }

    const userId = c.get("userId" as never) as string;
    const service = getProgramService(c.env);
    await service.deleteProgram(id, userId);

    return ApiResponse.success(c, null, "Program deleted successfully");
  }

  // ── Track Management Endpoints ────────────────────────

  /**
   * POST /programs/:id/tracks — Add a track to a program.
   */
  static async addTrack(c: Context<{ Bindings: Env }>) {
    const id = c.req.param("id");
    if (!id) {
      throw new ValidationError("Program ID is required");
    }

    const body = await c.req.json();
    const parsed = addTrackSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError("Validation failed", parsed.error.issues);
    }

    const userId = c.get("userId" as never) as string;
    const service = getProgramService(c.env);
    const tracks = await service.addTrack(id, parsed.data, userId);

    return ApiResponse.success(c, tracks, "Track added to program successfully", 201);
  }

  /**
   * DELETE /programs/:id/tracks/:trackId — Remove a track from a program.
   */
  static async removeTrack(c: Context<{ Bindings: Env }>) {
    const programId = c.req.param("id");
    const trackId = c.req.param("trackId");

    if (!programId) {
      throw new ValidationError("Program ID is required");
    }
    if (!trackId) {
      throw new ValidationError("Track ID is required");
    }

    const userId = c.get("userId" as never) as string;
    const service = getProgramService(c.env);
    await service.removeTrack(programId, trackId, userId);

    return ApiResponse.success(c, null, "Track removed from program successfully");
  }

  /**
   * PATCH /programs/:id/tracks/reorder — Reorder tracks in a program.
   */
  static async reorderTracks(c: Context<{ Bindings: Env }>) {
    const id = c.req.param("id");
    if (!id) {
      throw new ValidationError("Program ID is required");
    }

    const body = await c.req.json();
    const parsed = reorderTracksSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError("Validation failed", parsed.error.issues);
    }

    const userId = c.get("userId" as never) as string;
    const service = getProgramService(c.env);
    const tracks = await service.reorderTracks(id, parsed.data, userId);

    return ApiResponse.success(c, tracks, "Program tracks reordered successfully");
  }

  /**
   * POST /programs/:id/duplicate — Duplicate a program.
   */
  static async duplicate(c: Context<{ Bindings: Env }>) {
    const id = c.req.param("id");
    if (!id) {
      throw new ValidationError("Program ID is required");
    }

    const userId = c.get("userId" as never) as string;
    const service = getProgramService(c.env);
    const program = await service.duplicateProgram(id, userId);

    return ApiResponse.success(c, program, "Program duplicated successfully", 201);
  }

  // ── Progress Endpoints ────────────────────────────────

  /**
   * GET /programs/:id/progress — Get authenticated user's progress.
   */
  static async getProgress(c: Context<{ Bindings: Env }>) {
    const id = c.req.param("id");
    if (!id) {
      throw new ValidationError("Program ID is required");
    }

    const userId = c.get("userId" as never) as string;
    const service = getProgramService(c.env);
    const progress = await service.getProgramProgress(userId, id);

    return ApiResponse.success(c, progress, "Program progress retrieved successfully");
  }

  /**
   * POST /programs/:id/tracks/:trackId/complete — Mark a track complete or incomplete in the program.
   */
  static async completeTrack(c: Context<{ Bindings: Env }>) {
    const programId = c.req.param("id");
    const trackId = c.req.param("trackId");

    if (!programId || !trackId) {
      throw new ValidationError("Program ID and Track ID are required");
    }

    const body = await c.req.json().catch(() => ({}));
    const complete = body.complete !== false; // defaults to true

    const userId = c.get("userId" as never) as string;
    const service = getProgramService(c.env);
    const progress = await service.completeTrackInProgram(userId, programId, trackId, complete);

    return ApiResponse.success(c, progress, "Track completion status updated successfully");
  }
}
