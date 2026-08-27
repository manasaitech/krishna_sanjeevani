import artDevotional from "@/assets/art-devotional.webp";
import artSecular from "@/assets/art-secular.webp";
import artPregnancy from "@/assets/art-pregnancy.webp";

export type CategoryId = "devotional" | "secular" | "pregnancy" | "unset";

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
    name: "Arogya Sanjeevani",
    tagline: "Elegant teal · clear mind",
    description: "Stress reduction, productivity, emotional wellness.",
    art: artSecular,
  },
  {
    id: "pregnancy",
    name: "Garbh Sanjeevani",
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
  purposeTags?: any[];
  audioUrl?: string;
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



export const recentSearches = ["Raga Neelambari", "Sleep Sequence", "Stress Relief", "Focus"];

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

export interface SanjeevaniConfig {
  id: CategoryId;
  name: string;
  subtitle: string;
  description: string;
  theme: {
    primary: string;
    bgGrad: string;
    bgSolid: string;
    text: string;
    border: string;
    accent: string;
    hover: string;
    tint: string;
  };
  placeholderSearch: string;
  greetingText: string;
  bannerText: string;
  filters: string[];
}

export const sanjeevaniConfigs: Record<Exclude<CategoryId, "unset">, SanjeevaniConfig> = {
  devotional: {
    id: "devotional",
    name: "Krishna Sanjeevani",
    subtitle: "Therapeutic Sound Healing",
    description: "Therapeutic sound frequencies calibrated to support physical and neurological conditions naturally through Raga Chikitsa.",
    theme: {
      primary: "#7C1C24",
      bgGrad: "from-[#FFF5F5] to-[#FDF4F4]",
      bgSolid: "#FFF5F5",
      text: "text-[#7C1C24]",
      border: "border-[#F2D6D6]",
      accent: "#7C1C24",
      hover: "hover:bg-[#66161D]",
      tint: "bg-[#7C1C24]/10 text-[#7C1C24]",
    },
    placeholderSearch: "Search surawalis, ragas, ailments...",
    greetingText: "ॐ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः।",
    bannerText: "Your personalized healing journey is in progress. Keep listening daily to experience the full benefits of Raga Chikitsa.",
    filters: ["All", "Disorder Relief", "Stress Relief", "Focus", "Sleep", "Energy", "Anxiety", "Meditation", "Healing"],
  },
  secular: {
    id: "secular",
    name: "Arogya Sanjeevani",
    subtitle: "Corporate Wellness & Productivity",
    description: "Circadian-aligned sound therapy designed to reduce stress, boost focus, and enhance well-being in the workplace.",
    theme: {
      primary: "#0F766E",
      bgGrad: "from-[#F4F8F6] to-[#ECF2EF]",
      bgSolid: "#F4F8F6",
      text: "text-[#0F766E]",
      border: "border-[#DDEBE4]",
      accent: "#0F766E",
      hover: "hover:bg-[#0D635C]",
      tint: "bg-[#0F766E]/10 text-[#0F766E]",
    },
    placeholderSearch: "Search surawalis, wellness programs...",
    greetingText: "स्वस्थस्य स्वास्थ्य रक्षणं, आतुरस्य विकार प्रशमनं च।",
    bannerText: "Workplace wellness and productivity programs active. Listen daily for optimal circadian rhythm alignment.",
    filters: ["All", "Workplace Stress", "Focus Boost", "Mental Clarity", "Burnout Relief", "Rest & Reset", "Meditation", "Energy"],
  },
  pregnancy: {
    id: "pregnancy",
    name: "Garbh Sanjeevani",
    subtitle: "Pregnancy Care • Garbha Sanskar",
    description: "Sacred sound guidance for a harmonious pregnancy journey and positive fetal development based on Garbha Sanskar.",
    theme: {
      primary: "#D01C5C",
      bgGrad: "from-[#FFF0F5] to-[#FDF2F4]",
      bgSolid: "#FFF0F5",
      text: "text-[#D01C5C]",
      border: "border-[#FAD2E1]",
      accent: "#D01C5C",
      hover: "hover:bg-[#A90F43]",
      tint: "bg-[#D01C5C]/10 text-[#D01C5C]",
    },
    placeholderSearch: "Search surawalis, pregnancy themes...",
    greetingText: "पुत्रं कुरु प्रवरं कुलवर्धनम्, गर्भं रक्ष सुशोभनम्।",
    bannerText: "Nurturing Garbha Sanskar sound frequencies active. Connect with your baby and support healthy fetal development.",
    filters: ["All", "Month 1-3", "Month 4-6", "Month 7-9", "Maternal Calm", "Baby Bond", "Sleep", "Meditation"],
  },
};
