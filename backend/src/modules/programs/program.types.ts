import { ProgramCategory, ProgramDifficulty, ProgramTier } from "./program.constants";

export interface CreateProgramInput {
  title: string;
  subtitle?: string;
  description?: string;
  thumbnailKey?: string;
  category: ProgramCategory;
  difficulty?: ProgramDifficulty;
  language?: string;
  tier?: ProgramTier;
  programTypeId?: string;
}

export interface UpdateProgramInput {
  title?: string;
  subtitle?: string;
  description?: string;
  thumbnailKey?: string;
  category?: ProgramCategory;
  difficulty?: ProgramDifficulty;
  language?: string;
  tier?: ProgramTier;
  programTypeId?: string;
}

export interface ProgramFilters {
  search?: string;
  category?: string;
  difficulty?: string;
  language?: string;
  tier?: string;
  programTypeId?: string;
  status?: string;
  page: number;
  limit: number;
}

export interface AddTrackInput {
  trackId: string;
  sequence: number;
  isRequired?: boolean;
}

export interface ReorderTracksInput {
  tracks: Array<{ trackId: string; sequence: number }>;
}

// Re-export the generic PaginatedResult from tracks to avoid duplication
export type { PaginatedResult } from "../tracks/track.types";
