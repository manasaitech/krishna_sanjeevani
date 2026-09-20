// ─────────────────────────────────────────────────────────────
// Emotion Remediation Mode — Search Provider
// Search implementation for 7 Emotional Transition Trajectories,
// Dosha-aligned remediation songs, and emotional states.
// Zero dependency on Surawali modules.
// ─────────────────────────────────────────────────────────────

import type {
  ContentSearchProvider,
  SearchResult,
  SearchContext,
} from "@/core/mode/types";
import {
  AUTHORITATIVE_EMOTION_SONGS,
  AUTHORITATIVE_TRAJECTORIES,
} from "./content-provider";

export class EmotionRemediationSearchProvider implements ContentSearchProvider {
  async search(query: string, context?: SearchContext): Promise<SearchResult[]> {
    const q = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    // 1. Search matching transition trajectories
    const matchedTrajectories = AUTHORITATIVE_TRAJECTORIES.filter((traj) => {
      if (!q) return true;
      return (
        traj.name.toLowerCase().includes(q) ||
        traj.initialState.toLowerCase().includes(q) ||
        traj.targetState.toLowerCase().includes(q) ||
        (traj.intermediateState && traj.intermediateState.toLowerCase().includes(q)) ||
        traj.description.toLowerCase().includes(q)
      );
    });

    for (const traj of matchedTrajectories) {
      results.push({
        id: traj.id,
        title: traj.name,
        description: traj.description,
        type: "program",
        score: traj.name.toLowerCase().includes(q) ? 1.0 : 0.8,
        data: traj,
      });
    }

    // 2. Search matching songs
    const matchedSongs = AUTHORITATIVE_EMOTION_SONGS.filter((song) => {
      if (context?.category && song.category !== context.category) {
        return false;
      }
      if (context?.filters?.dosha && song.dosha !== context.filters.dosha) {
        return false;
      }
      if (!q) return true;

      return (
        song.title.toLowerCase().includes(q) ||
        String(song.dosha || "").toLowerCase().includes(q) ||
        String(song.trajectory || "").toLowerCase().includes(q) ||
        (song.tags as string[] || []).some((tag) => tag.toLowerCase().includes(q))
      );
    });

    for (const song of matchedSongs) {
      results.push({
        id: song.id,
        title: song.title,
        description: `Dosha: ${String(song.dosha).toUpperCase()} · Trajectory: ${song.trajectory}`,
        type: "track",
        score: song.title.toLowerCase().includes(q) ? 1.0 : 0.7,
        data: song,
      });
    }

    return results;
  }

  async getSuggestions(): Promise<string[]> {
    return [
      "Kshobha --> Prashanti",
      "Visada --> Prashanti",
      "Kshobha --> Utsaha",
      "Visada --> Utsaha",
      "Kapha Dosha",
      "Vata Dosha",
      "Pitta Dosha",
      "Prashanti (Serenity)",
      "Utsaha (Enthusiasm)",
    ];
  }
}
