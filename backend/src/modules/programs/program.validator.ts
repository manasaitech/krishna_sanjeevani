import { z } from "zod";
import { PROGRAM_CONSTANTS } from "./program.constants";

// ── Create Program Schema ───────────────────────────────

export const createProgramSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  subtitle: z.string().max(255, "Subtitle is too long").optional(),
  description: z.string().max(5000, "Description is too long").optional(),
  thumbnailKey: z.string().min(1).optional(),
  category: z.enum(PROGRAM_CONSTANTS.CATEGORIES, {
    message: `Category must be one of: ${PROGRAM_CONSTANTS.CATEGORIES.join(", ")}`,
  }),
  difficulty: z.enum(PROGRAM_CONSTANTS.DIFFICULTIES).default("beginner"),
  language: z.string().min(2, "Language code is required").max(10, "Language code is too long").default("hi"),
  tier: z.enum(PROGRAM_CONSTANTS.TIERS).default("free"),
  programTypeId: z.string().min(1).optional(),
});

// ── Update Program Schema ───────────────────────────────

export const updateProgramSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").max(255).optional(),
  subtitle: z.string().max(255).optional(),
  description: z.string().max(5000).optional(),
  thumbnailKey: z.string().min(1).optional(),
  category: z.enum(PROGRAM_CONSTANTS.CATEGORIES).optional(),
  difficulty: z.enum(PROGRAM_CONSTANTS.DIFFICULTIES).optional(),
  language: z.string().min(2).max(10).optional(),
  tier: z.enum(PROGRAM_CONSTANTS.TIERS).optional(),
  programTypeId: z.string().min(1).optional(),
});

// ── Program Filters Schema (Query Params) ───────────────

export const programFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.string().optional(),
  language: z.string().optional(),
  tier: z.string().optional(),
  programTypeId: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce
    .number()
    .int()
    .positive()
    .default(PROGRAM_CONSTANTS.PAGINATION.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(PROGRAM_CONSTANTS.PAGINATION.MAX_LIMIT)
    .default(PROGRAM_CONSTANTS.PAGINATION.DEFAULT_LIMIT),
});

// ── Add Track to Program Schema ─────────────────────────

export const addTrackSchema = z.object({
  trackId: z.string().min(1, "Track ID is required"),
  sequence: z.number().int().positive("Sequence must be a positive integer"),
  isRequired: z.boolean().default(true),
});

// ── Reorder Tracks Schema ───────────────────────────────

export const reorderTracksSchema = z.object({
  tracks: z
    .array(
      z.object({
        trackId: z.string().min(1, "Track ID is required"),
        sequence: z.number().int().positive("Sequence must be a positive integer"),
      })
    )
    .min(1, "At least one track must be provided"),
});
