import artDevotional from "@/assets/art-devotional.jpg";
import artSecular from "@/assets/art-secular.jpg";
import artPregnancy from "@/assets/art-pregnancy.jpg";

export type CategoryId = "devotional" | "secular" | "pregnancy";

export type Category = {
  id: CategoryId;
  name: string;
  tagline: string;
  description: string;
  art: string;
};

export const categories: Category[] = [
  {
    id: "devotional",
    name: "Devotional",
    tagline: "Rich maroon · golden light",
    description: "Traditional Krishna Sanjeevani healing.",
    art: artDevotional,
  },
  {
    id: "secular",
    name: "Secular & Corporate",
    tagline: "Elegant teal · clear mind",
    description: "Stress reduction, productivity, emotional wellness.",
    art: artSecular,
  },
  {
    id: "pregnancy",
    name: "Pregnancy",
    tagline: "Soft rose · gentle care",
    description: "Month-wise pregnancy wellness journey.",
    art: artPregnancy,
  },
];

export type Track = {
  id: string;
  title: string;
  artist: string;
  subtitle?: string;
  description?: string;
  duration: number; // seconds
  category: string;
  thumbnailKey?: string;
  playlistKey?: string;
  premium?: boolean;
  tier?: string;
  processingStatus?: string;
  publishStatus?: string;
  
  // Backward compatibility properties
  art?: string;
  raga?: string;
  purpose?: string;
  frequency?: string;
  instructions?: string;
};

export type Program = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  thumbnailKey?: string;
  category: string;
  difficulty?: string;
  estimatedDuration?: number;
  language?: string;
  tier?: string;
  status?: string;
  trackCount?: number;

  // Backward compatibility properties
  art?: string;
  sessions?: number;
  days?: number;
  premium?: boolean;
  benefits: string[];
  usage: string;
  trackIds: string[];
};

// Dynamic live-bindable content arrays (populated via App State Provider at runtime)
export const tracks: Track[] = [];
export const programs: Program[] = [];

export function programById(id: string): Program | undefined {
  return programs.find((p) => p.id === id);
}

export function trackById(id: string): Track | undefined {
  return tracks.find((t) => t.id === id);
}

export const purposes = [
  "Stress Relief",
  "Focus",
  "Sleep",
  "Anxiety",
  "Energy",
  "Meditation",
  "Healing",
  "Calm Mind",
  "Mood Balance",
];

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0 min";
  const m = Math.round(seconds / 60);
  return `${m} min`;
}

// ── Static Layout Elements ──

export const pregnancyTips = [
  "Baby's vocal cords are starting to form. Listening to gentle surāvalis can reduce maternal cortisol levels, fostering a peaceful environment.",
  "Baby's ears are fully developed and they can now hear your heartbeat and background audio. Play soft classical ragas daily.",
  "Baby is developing sleep-wake cycles. Play soothing Neelambari tracks around bedtime to establish positive circadian associations.",
];

export const notifications = [
  {
    id: "n1",
    kind: "reminder",
    title: "Evening Wind-Down",
    time: "8:00 PM",
    body: "Your evening meditation is scheduled in 15 minutes. Prepare a quiet space.",
    unread: true,
    group: "Today",
  },
  {
    id: "n2",
    kind: "new",
    title: "New Program Available",
    time: "Yesterday",
    body: "Stress Relief Arc for Corporate Professionals is now available in Secular.",
    unread: false,
    group: "Earlier",
  },
  {
    id: "n3",
    kind: "progress",
    title: "Trimester Transition!",
    time: "3 days ago",
    body: "You've entered Week 28. Your pregnancy journey programs have updated to Third Trimester.",
    unread: false,
    group: "Earlier",
  },
];

export const recentSearches = [
  "Raga Neelambari",
  "Sleep Sequence",
  "Stress Relief",
  "Focus",
];

export const trendingSearches = [
  "Sanjeevani Kalyani",
  "Garbha Madhuram",
  "Focus Cycle",
  "Raga Bhairavi",
];

export const plans = [
  {
    id: "free",
    name: "Sanjeevani Free",
    price: "₹0",
    period: "/ forever",
    blurb: "Start your wellness journey with basic therapeutic access.",
    features: [
      "Access to standard healing ragas",
      "Dynamic category-switching UI",
      "Daily recommended tracks",
      "Support for Web & Mobile playback",
    ],
    cta: "Current Plan",
    current: true,
    highlight: false,
  },
  {
    id: "premium",
    name: "Sanjeevani Premium",
    price: "₹299",
    period: "/ month",
    blurb: "Complete access to the full curative audio library.",
    features: [
      "Unlock all premium sessions & schedules",
      "AES-128 secure HLS high-fidelity streaming",
      "Custom pregnancy week-by-week journeys",
      "Offline caching & background playback support",
      "Priority customer care",
    ],
    cta: "Upgrade to Premium",
    current: false,
    highlight: true,
  },
];

export const comparison = [
  { label: "Therapeutic Ragas", free: true, premium: true, family: true },
  { label: "HLS Secure Streaming", free: true, premium: true, family: true },
  { label: "Pregnancy Calendar", free: false, premium: true, family: true },
  { label: "Offline Listening", free: false, premium: true, family: true },
  { label: "Corporate Tracks", free: false, premium: true, family: true },
];
