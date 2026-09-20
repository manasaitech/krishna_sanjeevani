// ─────────────────────────────────────────────────────────────
// Surawali Mode — Search Provider
// Wraps the existing client-side search logic from search.tsx.
// ─────────────────────────────────────────────────────────────

import type { ContentSearchProvider, SearchContext, SearchResult } from "@/core/mode/types";
import { tracks, programs, trendingSearches } from "@/lib/content";

export class SurawaliSearchProvider implements ContentSearchProvider {
  async search(query: string, context?: SearchContext): Promise<SearchResult[]> {
    const needle = query.trim().toLowerCase();
    const results: SearchResult[] = [];

    // Search tracks
    const matchedTracks = tracks.filter((t) => {
      const matchesPurpose = context?.filters?.purpose
        ? t.purposeTags?.some(
            (tag: any) => tag.name && tag.name.toLowerCase().trim() === String(context.filters!.purpose).toLowerCase().trim()
          ) || (t.purpose && t.purpose.toLowerCase().trim() === String(context.filters!.purpose).toLowerCase().trim())
        : true;

      if (!needle) return matchesPurpose && !!context?.filters?.purpose;

      const searchFields = [
        t.title,
        t.raga,
        t.purpose,
        t.subtitle,
        ...(t.purposeTags?.map((tag: any) => tag.name) || []),
      ];

      return (
        matchesPurpose &&
        searchFields.filter(Boolean).some((f) => f!.toLowerCase().includes(needle))
      );
    });

    for (const t of matchedTracks) {
      results.push({
        id: t.id,
        title: t.title,
        description: t.purpose || t.subtitle,
        type: "track",
        data: t,
      });
    }

    // Search programs
    if (needle) {
      const matchedPrograms = programs.filter((p) =>
        [p.title, p.subtitle, p.description]
          .filter(Boolean)
          .some((f) => f!.toLowerCase().includes(needle))
      );

      for (const p of matchedPrograms) {
        results.push({
          id: p.id,
          title: p.title,
          description: p.description || p.subtitle,
          type: "program",
          data: p,
        });
      }
    }

    // Apply limit/offset
    const offset = context?.offset || 0;
    const limit = context?.limit || results.length;
    return results.slice(offset, offset + limit);
  }

  async getSuggestions(): Promise<string[]> {
    return [...trendingSearches];
  }
}
