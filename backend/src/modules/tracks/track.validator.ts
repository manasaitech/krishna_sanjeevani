import { z } from "zod";
import { TRACK_CONSTANTS } from "./track.constants";

// ── Create Track Schema ─────────────────────────────────

export const createTrackSchema = z.object({
  id: z.string().uuid("Invalid track ID format").optional(),
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  subtitle: z.string().max(255, "Subtitle is too long").optional(),
  description: z.string().max(2000, "Description is too long").optional(),
  artist: z.string().min(1, "Artist is required").max(255, "Artist name is too long"),
  duration: z.number().int().positive("Duration must be a positive integer").optional(),
  category: z.enum(TRACK_CONSTANTS.CATEGORIES, {
    message: `Category must be one of: ${TRACK_CONSTANTS.CATEGORIES.join(", ")}`,
  }),
  language: z.string().min(2, "Language code is required").max(10, "Language code is too long"),
  tier: z.enum(TRACK_CONSTANTS.TIERS).default("free"),
  playlistKey: z.string().min(1).optional(),
  thumbnailKey: z.string().min(1).optional(),
  purposeTagIds: z.array(z.string().min(1)).optional(),
});

// ── Update Track Schema ─────────────────────────────────

export const updateTrackSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").max(255).optional(),
  subtitle: z.string().max(255).optional(),
  description: z.string().max(2000).optional(),
  artist: z.string().min(1, "Artist cannot be empty").max(255).optional(),
  duration: z.number().int().positive().optional(),
  category: z.enum(TRACK_CONSTANTS.CATEGORIES).optional(),
  language: z.string().min(2).max(10).optional(),
  tier: z.enum(TRACK_CONSTANTS.TIERS).optional(),
  playlistKey: z.string().min(1).optional(),
  thumbnailKey: z.string().min(1).optional(),
  purposeTagIds: z.array(z.string().min(1)).optional(),
});

// ── Track Filters Schema (Query Params) ─────────────────

export const trackFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  language: z.string().optional(),
  purpose: z.string().optional(), // tag slug
  tier: z.string().optional(),
  status: z.string().optional(),
  processingStatus: z.string().optional(),
  page: z.coerce
    .number()
    .int()
    .positive()
    .default(TRACK_CONSTANTS.PAGINATION.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(TRACK_CONSTANTS.PAGINATION.MAX_LIMIT)
    .default(TRACK_CONSTANTS.PAGINATION.DEFAULT_LIMIT),
});

// ── Create Tag Schema ───────────────────────────────────

export const createTagSchema = z.object({
  name: z.string().min(1, "Tag name is required").max(100, "Tag name is too long"),
  description: z.string().max(500, "Tag description is too long").optional(),
});
