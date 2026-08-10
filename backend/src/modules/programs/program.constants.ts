export const PROGRAM_CONSTANTS = {
  CATEGORIES: ["devotional", "secular", "pregnancy", "corporate"] as const,
  DIFFICULTIES: ["beginner", "intermediate", "advanced"] as const,
  TIERS: ["free", "premium"] as const,
  STATUSES: ["draft", "published", "archived", "deleted"] as const,
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
  MAX_TRACKS_PER_PROGRAM: 50,
} as const;

export type ProgramCategory = (typeof PROGRAM_CONSTANTS.CATEGORIES)[number];
export type ProgramDifficulty = (typeof PROGRAM_CONSTANTS.DIFFICULTIES)[number];
export type ProgramTier = (typeof PROGRAM_CONSTANTS.TIERS)[number];
export type ProgramStatus = (typeof PROGRAM_CONSTANTS.STATUSES)[number];
