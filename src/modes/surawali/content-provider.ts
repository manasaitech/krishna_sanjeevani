// ─────────────────────────────────────────────────────────────
// Surawali Mode — Content Mapping Provider
// Wraps the existing content retrieval logic from app-state /
// api so the same interface can be swapped for Emotion mode.
// ─────────────────────────────────────────────────────────────

import type { ContentMappingProvider, ContentItem } from "@/core/mode/types";
import { api, BASE_URL } from "@/lib/api";

export class SurawaliContentMappingProvider implements ContentMappingProvider {
  async getContent(category?: string, filters?: Record<string, unknown>): Promise<ContentItem[]> {
    const params: Record<string, string> = {};
    if (category) params.category = category;
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params[k] = String(v);
      });
    }

    const res = await api.tracks.list(params);
    if (!res.success || !res.data) return [];

    const list = Array.isArray(res.data) ? res.data : (res.data as any).data || [];
    return list.map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      category: t.category,
      tags: t.purposeTags?.map((tag: any) => tag.name) || [],
      artist: t.artist,
      subtitle: t.subtitle,
      duration: t.duration,
      thumbnailKey: t.thumbnailKey,
      art: t.thumbnailKey ? `${BASE_URL}/storage/file/${t.thumbnailKey}` : undefined,
      raga: t.subtitle || "",
      purpose: (t.purposeTags && t.purposeTags[0]?.name) || t.description || "Healing",
    }));
  }

  async mapContent(items: ContentItem[]): Promise<ContentItem[]> {
    // Surawali uses a pass-through mapping — content is already
    // in the correct shape from the API
    return items;
  }
}
