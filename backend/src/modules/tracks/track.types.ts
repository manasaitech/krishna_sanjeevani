import { TrackCategory, TrackTier } from "./track.constants";

export interface CreateTrackInput {
  id?: string;
  title: string;
  subtitle?: string;
  description?: string;
  artist: string;
  duration?: number;
  category: TrackCategory;
  language: string;
  tier?: TrackTier;
  playlistKey?: string;
  thumbnailKey?: string;
  purposeTagIds?: string[];
}

export interface UpdateTrackInput {
  title?: string;
  subtitle?: string;
  description?: string;
  artist?: string;
  duration?: number;
  category?: TrackCategory;
  language?: string;
  tier?: TrackTier;
  playlistKey?: string;
  thumbnailKey?: string;
  purposeTagIds?: string[];
}

export interface TrackFilters {
  search?: string;
  category?: string;
  language?: string;
  purpose?: string; // tag slug
  tier?: string;
  status?: string;
  processingStatus?: string;
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateTagInput {
  name: string;
  description?: string;
}
