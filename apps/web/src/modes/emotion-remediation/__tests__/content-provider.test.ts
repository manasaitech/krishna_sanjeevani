// ─────────────────────────────────────────────────────────────
// Emotion Remediation Content & Search Provider Tests
// Validates 7 trajectories, 21 songs, dosha alignment, and search.
// ─────────────────────────────────────────────────────────────

import { describe, it, expect } from "vitest";
import {
  EmotionRemediationContentMappingProvider,
  AUTHORITATIVE_TRAJECTORIES,
  AUTHORITATIVE_EMOTION_SONGS,
} from "../content-provider";
import { EmotionRemediationSearchProvider } from "../search-provider";

describe("Emotion Remediation Content Mapping Provider", () => {
  const provider = new EmotionRemediationContentMappingProvider();

  it("should have all 7 authoritative trajectories", () => {
    expect(AUTHORITATIVE_TRAJECTORIES).toHaveLength(7);
    const ids = AUTHORITATIVE_TRAJECTORIES.map((t) => t.id);
    expect(ids).toContain("kshobha-prashanti");
    expect(ids).toContain("visada-prashanti");
    expect(ids).toContain("kshobha-utsaha");
    expect(ids).toContain("visada-utsaha");
    expect(ids).toContain("utsaha-prashanti");
    expect(ids).toContain("kshobha-utsaha-prashanti");
    expect(ids).toContain("visada-utsaha-prashanti");
  });

  it("should contain exactly 21 authoritative songs (7 trajectories x 3 doshas)", () => {
    expect(AUTHORITATIVE_EMOTION_SONGS).toHaveLength(21);
  });

  it("should have exactly 7 songs for each Dosha (Kapha, Vata, Pitta)", () => {
    const kapha = AUTHORITATIVE_EMOTION_SONGS.filter((s) => s.dosha === "kapha");
    const vata = AUTHORITATIVE_EMOTION_SONGS.filter((s) => s.dosha === "vata");
    const pitta = AUTHORITATIVE_EMOTION_SONGS.filter((s) => s.dosha === "pitta");

    expect(kapha).toHaveLength(7);
    expect(vata).toHaveLength(7);
    expect(pitta).toHaveLength(7);
  });

  it("should filter songs by dosha", async () => {
    const kaphaSongs = await provider.getContent(undefined, { dosha: "kapha" });
    expect(kaphaSongs).toHaveLength(7);
    kaphaSongs.forEach((song) => {
      expect(song.dosha).toBe("kapha");
    });
  });

  it("should filter songs by trajectory category", async () => {
    const songs = await provider.getContent("kshobha-prashanti");
    expect(songs).toHaveLength(3);
    const doshas = songs.map((s) => s.dosha);
    expect(doshas).toContain("kapha");
    expect(doshas).toContain("vata");
    expect(doshas).toContain("pitta");
  });
});

describe("Emotion Remediation Search Provider", () => {
  const searchProvider = new EmotionRemediationSearchProvider();

  it("should search and match trajectories by state keywords", async () => {
    const results = await searchProvider.search("Prashanti");
    expect(results.length).toBeGreaterThan(0);
    const trajectories = results.filter((r) => r.type === "program");
    expect(trajectories.length).toBeGreaterThan(0);
  });

  it("should search and match songs by song title", async () => {
    const results = await searchProvider.search("Divine Treasure");
    const track = results.find((r) => r.title === "Divine Treasure");
    expect(track).toBeDefined();
    expect(track?.type).toBe("track");
  });

  it("should return trending search suggestions", async () => {
    const suggestions = await searchProvider.getSuggestions();
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions).toContain("Kshobha --> Prashanti");
    expect(suggestions).toContain("Kapha Dosha");
  });
});
