import { Context } from "hono";
import { ProgramService } from "./program.service";
import { ProgramRepository } from "./program.repository";
import { TrackRepository } from "../tracks/track.repository";
import {
  pregnancyUserInfoSchema,
  createPregnancyScheduleSchema,
  updatePregnancyScheduleSchema,
} from "./pregnancy.validator";
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

export class PregnancyController {
  // ── Public / User Endpoints ───────────────────────────

  /**
   * GET /pregnancy/programs — List all scheduled pregnancy programs.
   */
  static async list(c: Context<{ Bindings: Env }>) {
    const service = getProgramService(c.env);
    const result = await service.listAllPregnancySchedules();
    return ApiResponse.success(c, result, "Pregnancy programs list retrieved successfully");
  }

  /**
   * GET /pregnancy/today — Get today's program calculated dynamically from user's pregnancy week/day.
   */
  static async getToday(c: Context<{ Bindings: Env }>) {
    const userId = c.get("userId" as never) as string;
    const service = getProgramService(c.env);
    const result = await service.getTodayPregnancyProgram(userId);
    return ApiResponse.success(c, result, "Today's pregnancy program retrieved successfully");
  }

  /**
   * GET /pregnancy/week/:week — Get programs scheduled for a specific pregnancy week.
   */
  static async getByWeek(c: Context<{ Bindings: Env }>) {
    const weekStr = c.req.param("week") || "";
    const week = parseInt(weekStr, 10);

    if (isNaN(week) || week < 1 || week > 40) {
      throw new ValidationError("Week must be a valid number between 1 and 40");
    }

    const service = getProgramService(c.env);
    const result = await service.getPregnancyProgramForWeek(week);
    return ApiResponse.success(c, result, `Pregnancy programs for week ${week} retrieved successfully`);
  }

  /**
   * GET /pregnancy/month/:month — Get programs scheduled for a specific pregnancy month.
   */
  static async getByMonth(c: Context<{ Bindings: Env }>) {
    const monthStr = c.req.param("month") || "";
    const month = parseInt(monthStr, 10);

    if (isNaN(month) || month < 1 || month > 9) {
      throw new ValidationError("Month must be a valid number between 1 and 9");
    }

    const service = getProgramService(c.env);
    const result = await service.getPregnancyProgramForMonth(month);
    return ApiResponse.success(c, result, `Pregnancy programs for month ${month} retrieved successfully`);
  }

  /**
   * POST /pregnancy/user-info — Configure pregnancy calculation data (EDD or current week offset).
   */
  static async saveUserInfo(c: Context<{ Bindings: Env }>) {
    const body = await c.req.json().catch(() => ({}));
    const parsed = pregnancyUserInfoSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError("Validation failed", parsed.error.issues);
    }

    const userId = c.get("userId" as never) as string;
    const service = getProgramService(c.env);
    const result = await service.updateUserPregnancyInfo(userId, parsed.data);

    return ApiResponse.success(c, result, "Pregnancy calculation details configured successfully");
  }

  // ── Admin Endpoints ───────────────────────────────────

  /**
   * POST /pregnancy/schedule — Create a new schedule entry linking a pregnancy program to a week/day (Admin only).
   */
  static async createSchedule(c: Context<{ Bindings: Env }>) {
    const body = await c.req.json().catch(() => ({}));
    const parsed = createPregnancyScheduleSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError("Validation failed", parsed.error.issues);
    }

    const service = getProgramService(c.env);
    const result = await service.createPregnancySchedule(parsed.data);

    return ApiResponse.success(c, result, "Pregnancy schedule entry created successfully", 201);
  }

  /**
   * PATCH /pregnancy/schedule/:id — Update a schedule entry (Admin only).
   */
  static async updateSchedule(c: Context<{ Bindings: Env }>) {
    const id = c.req.param("id");
    if (!id) {
      throw new ValidationError("Schedule entry ID is required");
    }

    const body = await c.req.json().catch(() => ({}));
    const parsed = updatePregnancyScheduleSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError("Validation failed", parsed.error.issues);
    }

    const service = getProgramService(c.env);
    const result = await service.updatePregnancySchedule(id, parsed.data);

    return ApiResponse.success(c, result, "Pregnancy schedule entry updated successfully");
  }

  /**
   * DELETE /pregnancy/schedule/:id — Delete a schedule entry (Admin only).
   */
  static async removeSchedule(c: Context<{ Bindings: Env }>) {
    const id = c.req.param("id");
    if (!id) {
      throw new ValidationError("Schedule entry ID is required");
    }

    const service = getProgramService(c.env);
    await service.deletePregnancySchedule(id);

    return ApiResponse.success(c, null, "Pregnancy schedule entry deleted successfully");
  }
}
