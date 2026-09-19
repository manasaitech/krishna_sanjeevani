// ─────────────────────────────────────────────────────────────
// Emotion Remediation Mode — Content Mapping Provider
// Authoritative mapping based on the Google Sheet:
// 7 Transitional Trajectories across 3 Doshas (Kapha, Vata, Pitta).
// Zero dependency on Surawali modules.
// ─────────────────────────────────────────────────────────────

import type { ContentMappingProvider, ContentItem } from "@/core/mode/types";

export interface EmotionTrajectory {
  id: string;
  name: string;
  initialState: string;
  intermediateState?: string;
  targetState: string;
  type: "two-step" | "three-step";
  description: string;
}

export const AUTHORITATIVE_TRAJECTORIES: EmotionTrajectory[] = [
  {
    id: "kshobha-prashanti",
    name: "Kshobha --> Prashanti",
    initialState: "Kshobha",
    targetState: "Prashanti",
    type: "two-step",
    description: "Transforms agitation and emotional turbulence into deep stillness and peace.",
  },
  {
    id: "visada-prashanti",
    name: "Visada --> Prashanti",
    initialState: "Visada",
    targetState: "Prashanti",
    type: "two-step",
    description: "Transforms grief and sorrow into tranquil acceptance and inner calm.",
  },
  {
    id: "kshobha-utsaha",
    name: "Kshobha --> Utsaha",
    initialState: "Kshobha",
    targetState: "Utsaha",
    type: "two-step",
    description: "Channels restless agitated energy into purposeful, inspired vitality.",
  },
  {
    id: "visada-utsaha",
    name: "Visada --> Utsaha",
    initialState: "Visada",
    targetState: "Utsaha",
    type: "two-step",
    description: "Uplifts low vitality and discouragement into renewed enthusiasm.",
  },
  {
    id: "utsaha-prashanti",
    name: "Utsaha --> Prashanti",
    initialState: "Utsaha",
    targetState: "Prashanti",
    type: "two-step",
    description: "Stabilizes high enthusiasm into grounded peaceful equilibrium.",
  },
  {
    id: "kshobha-utsaha-prashanti",
    name: "Kshobha --> Utsaha --> Prashanti",
    initialState: "Kshobha",
    intermediateState: "Utsaha",
    targetState: "Prashanti",
    type: "three-step",
    description: "A 3-stage journey: channels acute agitation into enthusiasm, then settles into serenity.",
  },
  {
    id: "visada-utsaha-prashanti",
    name: "Visada --> Utsaha --> Prashanti",
    initialState: "Visada",
    intermediateState: "Utsaha",
    targetState: "Prashanti",
    type: "three-step",
    description: "A 3-stage journey: gently awakens from heavy despair into active enthusiasm, then arrives at deep peace.",
  },
];

export const AUTHORITATIVE_EMOTION_SONGS: ContentItem[] = [
  // Kshobha --> Prashanti
  {
    id: "em_song_001",
    title: "Together We Make an Offering",
    category: "kshobha-prashanti",
    dosha: "kapha",
    trajectory: "Kshobha --> Prashanti",
    tags: ["kapha", "kshobha", "prashanti"],
  },
  {
    id: "em_song_002",
    title: "Divine Treasure",
    category: "kshobha-prashanti",
    dosha: "vata",
    trajectory: "Kshobha --> Prashanti",
    tags: ["vata", "kshobha", "prashanti"],
  },
  {
    id: "em_song_003",
    title: "Hare Krishna Mantra – Raga Shiva Ranjani",
    category: "kshobha-prashanti",
    dosha: "pitta",
    trajectory: "Kshobha --> Prashanti",
    tags: ["pitta", "kshobha", "prashanti"],
  },

  // Visada --> Prashanti
  {
    id: "em_song_004",
    title: "Vibhavari Sesa",
    category: "visada-prashanti",
    dosha: "kapha",
    trajectory: "Visada --> Prashanti",
    tags: ["kapha", "visada", "prashanti"],
  },
  {
    id: "em_song_005",
    title: "Jaya Radha-Madhava",
    category: "visada-prashanti",
    dosha: "vata",
    trajectory: "Visada --> Prashanti",
    tags: ["vata", "visada", "prashanti"],
  },
  {
    id: "em_song_006",
    title: "I Trust You",
    category: "visada-prashanti",
    dosha: "pitta",
    trajectory: "Visada --> Prashanti",
    tags: ["pitta", "visada", "prashanti"],
  },

  // Kshobha --> Utsaha
  {
    id: "em_song_007",
    title: "Hare Krishna Vraja Mahamantra 4",
    category: "kshobha-utsaha",
    dosha: "kapha",
    trajectory: "Kshobha --> Utsaha",
    tags: ["kapha", "kshobha", "utsaha"],
  },
  {
    id: "em_song_008",
    title: "Mayapur Meltdown – Maha Sankirtan",
    category: "kshobha-utsaha",
    dosha: "vata",
    trajectory: "Kshobha --> Utsaha",
    tags: ["vata", "kshobha", "utsaha"],
  },
  {
    id: "em_song_009",
    title: "Searching for the Divine Love",
    category: "kshobha-utsaha",
    dosha: "pitta",
    trajectory: "Kshobha --> Utsaha",
    tags: ["pitta", "kshobha", "utsaha"],
  },

  // Visada --> Utsaha
  {
    id: "em_song_010",
    title: "Hare Krishna Mahamantra Version 14",
    category: "visada-utsaha",
    dosha: "kapha",
    trajectory: "Visada --> Utsaha",
    tags: ["kapha", "visada", "utsaha"],
  },
  {
    id: "em_song_011",
    title: "Jiv Jaago",
    category: "visada-utsaha",
    dosha: "vata",
    trajectory: "Visada --> Utsaha",
    tags: ["vata", "visada", "utsaha"],
  },
  {
    id: "em_song_012",
    title: "Sri Krishna Divya Nam",
    category: "visada-utsaha",
    dosha: "pitta",
    trajectory: "Visada --> Utsaha",
    tags: ["pitta", "visada", "utsaha"],
  },

  // Utsaha --> Prashanti
  {
    id: "em_song_013",
    title: "Hare Krishna Mahamantra Version 17",
    category: "utsaha-prashanti",
    dosha: "kapha",
    trajectory: "Utsaha --> Prashanti",
    tags: ["kapha", "utsaha", "prashanti"],
  },
  {
    id: "em_song_014",
    title: "Uplifting Hare Krishna Kirtan",
    category: "utsaha-prashanti",
    dosha: "vata",
    trajectory: "Utsaha --> Prashanti",
    tags: ["vata", "utsaha", "prashanti"],
  },
  {
    id: "em_song_015",
    title: "Hare Krishna Mantra – Raga Desi",
    category: "utsaha-prashanti",
    dosha: "pitta",
    trajectory: "Utsaha --> Prashanti",
    tags: ["pitta", "utsaha", "prashanti"],
  },

  // Kshobha --> Utsaha --> Prashanti
  {
    id: "em_song_016",
    title: "A Prayer in the Ether",
    category: "kshobha-utsaha-prashanti",
    dosha: "kapha",
    trajectory: "Kshobha --> Utsaha --> Prashanti",
    tags: ["kapha", "kshobha", "utsaha", "prashanti"],
  },
  {
    id: "em_song_017",
    title: "Tava Kathamritam / Maha Mantra",
    category: "kshobha-utsaha-prashanti",
    dosha: "vata",
    trajectory: "Kshobha --> Utsaha --> Prashanti",
    tags: ["vata", "kshobha", "utsaha", "prashanti"],
  },
  {
    id: "em_song_018",
    title: "Heart on Fire (Hari Hari Bifale)",
    category: "kshobha-utsaha-prashanti",
    dosha: "pitta",
    trajectory: "Kshobha --> Utsaha --> Prashanti",
    tags: ["pitta", "kshobha", "utsaha", "prashanti"],
  },

  // Visada --> Utsaha --> Prashanti
  {
    id: "em_song_019",
    title: "Mellows of a Mendicant",
    category: "visada-utsaha-prashanti",
    dosha: "kapha",
    trajectory: "Visada --> Utsaha --> Prashanti",
    tags: ["kapha", "visada", "utsaha", "prashanti"],
  },
  {
    id: "em_song_020",
    title: "Queen Kunti",
    category: "visada-utsaha-prashanti",
    dosha: "vata",
    trajectory: "Visada --> Utsaha --> Prashanti",
    tags: ["vata", "visada", "utsaha", "prashanti"],
  },
  {
    id: "em_song_021",
    title: "Guha Maha Mantra",
    category: "visada-utsaha-prashanti",
    dosha: "pitta",
    trajectory: "Visada --> Utsaha --> Prashanti",
    tags: ["pitta", "visada", "utsaha", "prashanti"],
  },
];

export class EmotionRemediationContentMappingProvider implements ContentMappingProvider {
  async getContent(category?: string, filters?: Record<string, unknown>): Promise<ContentItem[]> {
    let items = [...AUTHORITATIVE_EMOTION_SONGS];

    if (category && category !== "all") {
      items = items.filter((item) => item.category === category);
    }

    if (filters?.dosha) {
      const targetDosha = String(filters.dosha).toLowerCase();
      items = items.filter((item) => item.dosha === targetDosha);
    }

    return items;
  }

  async mapContent(items: ContentItem[]): Promise<ContentItem[]> {
    return items;
  }

  getTrajectories(): EmotionTrajectory[] {
    return AUTHORITATIVE_TRAJECTORIES;
  }
}
