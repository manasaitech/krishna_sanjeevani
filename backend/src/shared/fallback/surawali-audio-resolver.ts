// ─────────────────────────────────────────────────────────────
// Surawali Audio Resolver & Deterministic Emotion Fallback Engine
// Provides clean, reversible audio asset resolution:
// Priority 1: Actual Surawali Audio (SONG_BUCKET)
// Priority 2: Temporary Emotion Fallback Audio (EMOTION_SONGS_BUCKET)
// Priority 3: Unavailable
// ─────────────────────────────────────────────────────────────

import { Env } from "../config/env";
import { getDB } from "../db/client";
import { tracks } from "../db/schema/track";
import { surawalis } from "../db/schema/surawali_catalog";
import { emotionSongs } from "../db/schema/emotion_song";
import { eq, or } from "drizzle-orm";

/**
 * Deterministic mapping table from Surawali Name / ID / Corporate Raga
 * to authoritative Emotion Remediation song IDs.
 * Stable, 1-to-1 mapped across the 21 Emotion songs.
 */
export const SURAWALI_EMOTION_FALLBACK_MAP: Record<string, { songId: string; songTitle: string }> = {
  // ── Core Surawalis ──
  "aagman": { songId: "em_song_001", songTitle: "Together We Make an Offering" },
  "anand mohini": { songId: "em_song_002", songTitle: "Divine Treasure" },
  "bhaas haari": { songId: "em_song_003", songTitle: "Hare Krishna Mantra – Raga Shiva Ranjani" },
  "dwaimadhyam": { songId: "em_song_004", songTitle: "Vibhavari Sesa" },
  "greeshma": { songId: "em_song_005", songTitle: "Jaya Radha-Madhava" },
  "jwarankush": { songId: "em_song_006", songTitle: "I Trust You" },
  "karnawati": { songId: "em_song_007", songTitle: "Hare Krishna Vraja Mahamantra 4" },
  "madhuparna": { songId: "em_song_008", songTitle: "Mayapur Meltdown – Maha Sankirtan" },
  "marut": { songId: "em_song_009", songTitle: "Searching for the Divine Love" },
  "nidra mohini": { songId: "em_song_010", songTitle: "Hare Krishna Mahamantra Version 14" },
  "pad dukh harini": { songId: "em_song_011", songTitle: "Jiv Jaago" },
  "parjanya": { songId: "em_song_012", songTitle: "Sri Krishna Divya Nam" },
  "prabhaati": { songId: "em_song_013", songTitle: "Hare Krishna Mahamantra Version 17" },
  "prabhati": { songId: "em_song_014", songTitle: "Uplifting Hare Krishna Kirtan" },
  "santul": { songId: "em_song_015", songTitle: "Hare Krishna Mantra – Raga Desi" },
  "smrutigandha": { songId: "em_song_016", songTitle: "A Prayer in the Ether" },
  "sthairya": { songId: "em_song_017", songTitle: "Tava Kathamritam / Maha Mantra" },

  // ── Corporate Ragas ──
  "hindol": { songId: "em_song_018", songTitle: "Heart on Fire (Hari Hari Bifale)" },
  "madhuprabhat": { songId: "em_song_019", songTitle: "Mellows of a Mendicant" },
  "ahir bhairav": { songId: "em_song_020", songTitle: "Queen Kunti" },
  "miyan kee todi": { songId: "em_song_021", songTitle: "Guha Maha Mantra" },
  "bairagi bhairav": { songId: "em_song_001", songTitle: "Together We Make an Offering" },
  "madhmaad sarang": { songId: "em_song_002", songTitle: "Divine Treasure" },
  "bhairavi": { songId: "em_song_003", songTitle: "Hare Krishna Mantra – Raga Shiva Ranjani" },
  "mishra bhairavi": { songId: "em_song_004", songTitle: "Vibhavari Sesa" },
  "mood elevating rag": { songId: "em_song_005", songTitle: "Jaya Radha-Madhava" },
};

/**
 * Normalized lookup helper for Surawali names or IDs
 */
export function getFallbackForSurawali(identifier: string): { songId: string; songTitle: string } | null {
  if (!identifier) return null;
  const clean = identifier.toLowerCase().replace(/^(session_|preview_|mock_|sur_)/, "").trim();

  // 1. Direct name lookup
  if (SURAWALI_EMOTION_FALLBACK_MAP[clean]) {
    return SURAWALI_EMOTION_FALLBACK_MAP[clean];
  }

  // 2. Partial match (e.g. "nidra" in "nidra mohini")
  for (const [key, mapping] of Object.entries(SURAWALI_EMOTION_FALLBACK_MAP)) {
    if (clean.includes(key) || key.includes(clean)) {
      return mapping;
    }
  }

  // 3. Fallback deterministic hash index into 21 songs
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  const songIndex = (Math.abs(hash) % 21) + 1;
  const songId = `em_song_${String(songIndex).padStart(3, "0")}`;
  
  return {
    songId,
    songTitle: `Emotion Remediation Track ${songIndex}`,
  };
}

export interface AudioResolutionResult {
  status: "actual" | "fallback" | "unavailable";
  sourceBucket: "SONG_BUCKET" | "EMOTION_SONGS_BUCKET" | null;
  r2Key: string | null;
  fallbackSongId?: string;
  fallbackSongTitle?: string;
  isHls?: boolean;
  mimeType?: string;
  duration?: number;
}

/**
 * Resolves the audio source for a given track or surawali ID.
 * Priority 1: Actual client-provided audio in SONG_BUCKET
 * Priority 2: Temporary Emotion Remediation fallback from EMOTION_SONGS_BUCKET
 * Priority 3: Unavailable
 */
export async function resolveSurawaliAudio(
  env: Env,
  trackOrSurawaliId: string,
  surawaliNameHint?: string
): Promise<AudioResolutionResult> {
  const db = env?.DB ? getDB(env) : null;

  // ── Priority 1: Check for Actual Surawali Audio in SONG_BUCKET ──
  try {
    // 1a. If DB is available, check tracks table for actualAudioKey or playlistKey
    if (db) {
      const trackResult = await db
        .select()
        .from(tracks)
        .where(eq(tracks.id, trackOrSurawaliId))
        .limit(1);

      const track = trackResult[0];
      if (track) {
        if (track.actualAudioKey && env.SONG_BUCKET) {
          const actualFile = await env.SONG_BUCKET.get(track.actualAudioKey);
          if (actualFile) {
            return {
              status: "actual",
              sourceBucket: "SONG_BUCKET",
              r2Key: track.actualAudioKey,
              isHls: false,
              mimeType: "audio/mpeg",
              duration: track.duration || 0,
            };
          }
        }

        // Check for HLS master playlist in SONG_BUCKET
        if (env.SONG_BUCKET) {
          const hlsKey = track.playlistKey || `songs/processed/${trackOrSurawaliId}/master.m3u8`;
          const hlsFile = await env.SONG_BUCKET.get(hlsKey);
          if (hlsFile) {
            return {
              status: "actual",
              sourceBucket: "SONG_BUCKET",
              r2Key: hlsKey,
              isHls: true,
              mimeType: "application/x-mpegURL",
              duration: track.duration || 0,
            };
          }
        }
      }

      // Check surawalis catalog table for actualAudioKey
      const surawaliResult = await db
        .select()
        .from(surawalis)
        .where(or(eq(surawalis.id, trackOrSurawaliId), eq(surawalis.name, trackOrSurawaliId)))
        .limit(1);

      const surawali = surawaliResult[0];
      if (surawali?.actualAudioKey && env.SONG_BUCKET) {
        const actualFile = await env.SONG_BUCKET.get(surawali.actualAudioKey);
        if (actualFile) {
          return {
            status: "actual",
            sourceBucket: "SONG_BUCKET",
            r2Key: surawali.actualAudioKey,
            isHls: surawali.actualAudioKey.endsWith(".m3u8"),
            mimeType: surawali.actualAudioKey.endsWith(".m3u8") ? "application/x-mpegURL" : "audio/mpeg",
          };
        }
      }
    }

    // 1b. Direct check in SONG_BUCKET for HLS or direct audio asset
    if (env.SONG_BUCKET) {
      const candidates = [
        `songs/processed/${trackOrSurawaliId}/master.m3u8`,
        `songs/${trackOrSurawaliId}/audio.mp3`,
        trackOrSurawaliId,
      ];
      for (const key of candidates) {
        const file = await env.SONG_BUCKET.get(key);
        if (file) {
          return {
            status: "actual",
            sourceBucket: "SONG_BUCKET",
            r2Key: key,
            isHls: key.endsWith(".m3u8"),
            mimeType: key.endsWith(".m3u8") ? "application/x-mpegURL" : "audio/mpeg",
          };
        }
      }
    }
  } catch (err) {
    console.warn("Error checking actual audio presence in DB/R2:", err);
  }

  // ── Priority 2: Deterministic Temporary Emotion Fallback ──
  const lookupKey = surawaliNameHint || trackOrSurawaliId;
  const fallback = getFallbackForSurawali(lookupKey);

  if (fallback) {
    try {
      let songTitle = fallback.songTitle;
      let duration = 0;

      if (db) {
        const [emSong] = await db
          .select()
          .from(emotionSongs)
          .where(eq(emotionSongs.id, fallback.songId))
          .limit(1);

        if (emSong) {
          songTitle = emSong.title;
          duration = emSong.duration || 0;
        }
      }

      const r2Key = `songs/${fallback.songId}/audio.mp3`;

      // Check if file exists in Emotion R2 bucket
      if (env.EMOTION_SONGS_BUCKET) {
        const emFile = await env.EMOTION_SONGS_BUCKET.get(r2Key);
        if (emFile) {
          return {
            status: "fallback",
            sourceBucket: "EMOTION_SONGS_BUCKET",
            r2Key,
            fallbackSongId: fallback.songId,
            fallbackSongTitle: songTitle,
            isHls: false,
            mimeType: "audio/mpeg",
            duration,
          };
        }
      }

      return {
        status: "fallback",
        sourceBucket: "EMOTION_SONGS_BUCKET",
        r2Key,
        fallbackSongId: fallback.songId,
        fallbackSongTitle: songTitle,
        isHls: false,
        mimeType: "audio/mpeg",
        duration,
      };
    } catch (err) {
      console.warn("Error resolving fallback emotion audio from R2:", err);
    }
  }

  // ── Priority 3: Unavailable ──
  return {
    status: "unavailable",
    sourceBucket: null,
    r2Key: null,
  };
}
