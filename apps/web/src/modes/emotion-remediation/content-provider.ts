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
  // ── Kshobha --> Prashanti ──
  {
    id: "em_song_001",
    title: "Together We Make an Offering",
    category: "kshobha-prashanti",
    dosha: "kapha",
    trajectory: "Kshobha --> Prashanti",
    initialState: "Kshobha",
    targetState: "Prashanti",
    description: "Transforms heaviness and emotional agitation into grounded stillness through meditative Kapha harmonization.",
    duration: 171,
    tags: ["kapha", "kshobha", "prashanti", "offering", "calm"],
  },
  {
    id: "em_song_002",
    title: "Divine Treasure",
    category: "kshobha-prashanti",
    dosha: "vata",
    trajectory: "Kshobha --> Prashanti",
    initialState: "Kshobha",
    targetState: "Prashanti",
    description: "Soothes erratic Vata restlessness and nervous agitation into deep tranquility and mental peace.",
    duration: 419,
    tags: ["vata", "kshobha", "prashanti", "peace", "divine"],
  },
  {
    id: "em_song_003",
    title: "Hare Krishna Mantra – Raga Shiva Ranjani",
    category: "kshobha-prashanti",
    dosha: "pitta",
    trajectory: "Kshobha --> Prashanti",
    initialState: "Kshobha",
    targetState: "Prashanti",
    description: "Cools intense fiery agitation and irritation into serenity using restorative Shiva Ranjani raga resonances.",
    duration: 863,
    tags: ["pitta", "kshobha", "prashanti", "shiva ranjani", "mantra"],
  },

  // ── Visada --> Prashanti ──
  {
    id: "em_song_004",
    title: "Vibhavari Sesa",
    category: "visada-prashanti",
    dosha: "kapha",
    trajectory: "Visada --> Prashanti",
    initialState: "Visada",
    targetState: "Prashanti",
    description: "Awakens the soul from sorrow and grief into tranquil morning clarity and spiritual acceptance.",
    duration: 512,
    tags: ["kapha", "visada", "prashanti", "vibhavari", "grief relief"],
  },
  {
    id: "em_song_005",
    title: "Jaya Radha-Madhava",
    dosha: "vata",
    trajectory: "Visada --> Prashanti",
    initialState: "Visada",
    targetState: "Prashanti",
    description: "Harmonizes deep sadness and existential grief into comforting emotional solace and loving security.",
    duration: 468,
    tags: ["vata", "visada", "prashanti", "radha madhava", "solace"],
  },
  {
    id: "em_song_006",
    title: "I Trust You",
    category: "visada-prashanti",
    dosha: "pitta",
    trajectory: "Visada --> Prashanti",
    initialState: "Visada",
    targetState: "Prashanti",
    description: "Releases disappointment, grief, and emotional strain into unconditional surrender and restful serenity.",
    duration: 317,
    tags: ["pitta", "visada", "prashanti", "trust", "surrender"],
  },

  // ── Kshobha --> Utsaha ──
  {
    id: "em_song_007",
    title: "Hare Krishna Vraja Mahamantra 4",
    category: "kshobha-utsaha",
    dosha: "kapha",
    trajectory: "Kshobha --> Utsaha",
    initialState: "Kshobha",
    targetState: "Utsaha",
    description: "Channels restless agitated energy into purposeful, inspired vitality and devotional vigor.",
    duration: 1215,
    tags: ["kapha", "kshobha", "utsaha", "vraja", "vitality"],
  },
  {
    id: "em_song_008",
    title: "Mayapur Meltdown – Maha Sankirtan",
    dosha: "vata",
    trajectory: "Kshobha --> Utsaha",
    initialState: "Kshobha",
    targetState: "Utsaha",
    description: "Grounds erratic nervous agitation and transmutes it into dynamic joyful enthusiasm and focus.",
    duration: 461,
    tags: ["vata", "kshobha", "utsaha", "mayapur", "sankirtan"],
  },
  {
    id: "em_song_009",
    title: "Searching for the Divine Love",
    dosha: "pitta",
    trajectory: "Kshobha --> Utsaha",
    initialState: "Kshobha",
    targetState: "Utsaha",
    description: "Refocuses fiery frustration and tension into radiant aspiration and elevated creative drive.",
    duration: 437,
    tags: ["pitta", "kshobha", "utsaha", "divine love", "aspiration"],
  },

  // ── Visada --> Utsaha ──
  {
    id: "em_song_010",
    title: "Hare Krishna Mahamantra Version 14",
    category: "visada-utsaha",
    dosha: "kapha",
    trajectory: "Visada --> Utsaha",
    initialState: "Visada",
    targetState: "Utsaha",
    description: "Lifts heavy lethargy and sadness, infusing positive rhythmic momentum and mental brightness.",
    duration: 794,
    tags: ["kapha", "visada", "utsaha", "upliftment", "vitality"],
  },
  {
    id: "em_song_011",
    title: "Jiv Jaago",
    dosha: "vata",
    trajectory: "Visada --> Utsaha",
    initialState: "Visada",
    targetState: "Utsaha",
    description: "Gently awakens the spirit from despair and dejection into joyous consciousness and vibrant enthusiasm.",
    duration: 491,
    tags: ["vata", "visada", "utsaha", "jiv jaago", "awakening"],
  },
  {
    id: "em_song_012",
    title: "Sri Krishna Divya Nam",
    dosha: "pitta",
    trajectory: "Visada --> Utsaha",
    initialState: "Visada",
    targetState: "Utsaha",
    description: "Dissolves feelings of defeat and melancholy into righteous purpose, inspiration, and renewed zeal.",
    duration: 637,
    tags: ["pitta", "visada", "utsaha", "divya nam", "zeal"],
  },

  // ── Utsaha --> Prashanti ──
  {
    id: "em_song_013",
    title: "Hare Krishna Mahamantra Version 17",
    category: "utsaha-prashanti",
    dosha: "kapha",
    trajectory: "Utsaha --> Prashanti",
    initialState: "Utsaha",
    targetState: "Prashanti",
    description: "Stabilizes high enthusiasm into deep, nourishing, and enduring inner peace.",
    duration: 757,
    tags: ["kapha", "utsaha", "prashanti", "peace", "balance"],
  },
  {
    id: "em_song_014",
    title: "Uplifting Hare Krishna Kirtan",
    dosha: "vata",
    trajectory: "Utsaha --> Prashanti",
    initialState: "Utsaha",
    targetState: "Prashanti",
    description: "Harmonizes airy exhilaration into grounded, meditative quietude and centered mindfulness.",
    duration: 443,
    tags: ["vata", "utsaha", "prashanti", "kirtan", "centered"],
  },
  {
    id: "em_song_015",
    title: "Hare Krishna Mantra – Raga Desi",
    dosha: "pitta",
    trajectory: "Utsaha --> Prashanti",
    initialState: "Utsaha",
    targetState: "Prashanti",
    description: "Gentle raga structure calms intense exuberance into pristine, blissful serenity.",
    duration: 863,
    tags: ["pitta", "utsaha", "prashanti", "raga desi", "bliss"],
  },

  // ── Kshobha --> Utsaha --> Prashanti (3-Step) ──
  {
    id: "em_song_016",
    title: "A Prayer in the Ether",
    category: "kshobha-utsaha-prashanti",
    dosha: "kapha",
    trajectory: "Kshobha --> Utsaha --> Prashanti",
    initialState: "Kshobha",
    intermediateState: "Utsaha",
    targetState: "Prashanti",
    description: "Complete 3-stage journey: dissolves mental turbidity into vitality, then settles into profound silence.",
    duration: 150,
    tags: ["kapha", "kshobha", "utsaha", "prashanti", "3-step", "ether"],
  },
  {
    id: "em_song_017",
    title: "Tava Kathamritam / Maha Mantra",
    category: "kshobha-utsaha-prashanti",
    dosha: "vata",
    trajectory: "Kshobha --> Utsaha --> Prashanti",
    initialState: "Kshobha",
    intermediateState: "Utsaha",
    targetState: "Prashanti",
    description: "Complete 3-stage journey: soothes acute agitation into inspired enthusiasm, then delivers serene peace.",
    duration: 833,
    tags: ["vata", "kshobha", "utsaha", "prashanti", "3-step", "kathamritam"],
  },
  {
    id: "em_song_018",
    title: "Heart on Fire (Hari Hari Bifale)",
    category: "kshobha-utsaha-prashanti",
    dosha: "pitta",
    trajectory: "Kshobha --> Utsaha --> Prashanti",
    initialState: "Kshobha",
    intermediateState: "Utsaha",
    targetState: "Prashanti",
    description: "Complete 3-stage journey: transforms burning inner agitation into spiritual fervor, then cool tranquility.",
    duration: 521,
    tags: ["pitta", "kshobha", "utsaha", "prashanti", "3-step", "heart on fire"],
  },

  // ── Visada --> Utsaha --> Prashanti (3-Step) ──
  {
    id: "em_song_019",
    title: "Mellows of a Mendicant",
    category: "visada-utsaha-prashanti",
    dosha: "kapha",
    trajectory: "Visada --> Utsaha --> Prashanti",
    initialState: "Visada",
    intermediateState: "Utsaha",
    targetState: "Prashanti",
    description: "Complete 3-stage journey: lifts profound sorrow into heartfelt joy, settling into unshakeable contentment.",
    duration: 617,
    tags: ["kapha", "visada", "utsaha", "prashanti", "3-step", "mellows"],
  },
  {
    id: "em_song_020",
    title: "Queen Kunti",
    dosha: "vata",
    trajectory: "Visada --> Utsaha --> Prashanti",
    initialState: "Visada",
    intermediateState: "Utsaha",
    targetState: "Prashanti",
    description: "Complete 3-stage journey: heals feelings of helplessness and grief into courageous vitality and peace.",
    duration: 501,
    tags: ["vata", "visada", "utsaha", "prashanti", "3-step", "queen kunti"],
  },
  {
    id: "em_song_021",
    title: "Guha Maha Mantra",
    category: "visada-utsaha-prashanti",
    dosha: "pitta",
    trajectory: "Visada --> Utsaha --> Prashanti",
    initialState: "Visada",
    intermediateState: "Utsaha",
    targetState: "Prashanti",
    description: "Complete 3-stage journey: dissolves existential gloom into radiant devotion and deep contemplative peace.",
    duration: 562,
    tags: ["pitta", "visada", "utsaha", "prashanti", "3-step", "guha"],
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
