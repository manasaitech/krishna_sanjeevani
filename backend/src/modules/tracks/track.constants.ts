export const TRACK_CONSTANTS = {
  CATEGORIES: ["devotional", "secular", "pregnancy"] as const,
  TIERS: ["free", "premium"] as const,
  PROCESSING_STATUSES: ["uploaded", "processing", "ready", "failed"] as const,
  PUBLISH_STATUSES: ["draft", "processing", "ready", "published", "archived", "deleted"] as const,
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
} as const;

export type TrackCategory = (typeof TRACK_CONSTANTS.CATEGORIES)[number];
export type TrackTier = (typeof TRACK_CONSTANTS.TIERS)[number];
export type ProcessingStatus = (typeof TRACK_CONSTANTS.PROCESSING_STATUSES)[number];
export type PublishStatus = (typeof TRACK_CONSTANTS.PUBLISH_STATUSES)[number];
