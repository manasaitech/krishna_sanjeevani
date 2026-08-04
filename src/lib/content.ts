import artDevotional from "@/assets/art-devotional.jpg";
import artSecular from "@/assets/art-secular.jpg";
import artPregnancy from "@/assets/art-pregnancy.jpg";
import artSleep from "@/assets/art-sleep.jpg";
import artFocus from "@/assets/art-focus.jpg";
import artHealing from "@/assets/art-healing.jpg";

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
  raga: string;
  subtitle: string;
  purpose: string;
  duration: number; // seconds
  category: CategoryId;
  art: string;
  premium?: boolean;
  frequency: string;
  instructions: string;
};

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

export const tracks: Track[] = [
  {
    id: "t1",
    title: "Sanjeevani Kalyani",
    raga: "Raga Kalyani",
    subtitle: "Surāvali · Version II",
    purpose: "Calm Mind",
    duration: 1140,
    category: "devotional",
    art: artDevotional,
    frequency: "Twice daily, morning and dusk",
    instructions:
      "Sit upright in a quiet room. Keep volume low and let the surāvali stay in the background of your breath. Avoid screens through the session.",
  },
  {
    id: "t2",
    title: "Nidra Sanjeevani",
    raga: "Raga Neelambari",
    subtitle: "Sleep Sequence · Version I",
    purpose: "Sleep",
    duration: 2400,
    category: "secular",
    art: artSleep,
    frequency: "Once nightly, before sleep",
    instructions:
      "Lie down with dim lights 20 minutes before bed. Use soft speakers rather than in-ear buds. The sequence fades on its own.",
  },
  {
    id: "t3",
    title: "Ekagrata Flow",
    raga: "Raga Hamsadhwani",
    subtitle: "Focus Cycle · Version III",
    purpose: "Focus",
    duration: 1500,
    category: "secular",
    art: artFocus,
    frequency: "Up to three work cycles a day",
    instructions:
      "Begin before your task, not during a break. Keep a single task open for the full cycle for best results.",
  },
  {
    id: "t4",
    title: "Shanti Bhairavi",
    raga: "Raga Bhairavi",
    subtitle: "Anxiety Relief · Version I",
    purpose: "Anxiety",
    duration: 960,
    category: "devotional",
    art: artHealing,
    premium: true,
    frequency: "As needed, up to twice daily",
    instructions:
      "Use seated, with slow exhales twice as long as inhales. Stop if you feel restless and resume the next day.",
  },
  {
    id: "t5",
    title: "Garbha Madhuram",
    raga: "Raga Madhuvanti",
    subtitle: "Month 5 · Pregnancy Journey",
    purpose: "Healing",
    duration: 1320,
    category: "pregnancy",
    art: artPregnancy,
    frequency: "Once daily, early evening",
    instructions:
      "Recline comfortably with support under the knees. Keep volume gentle. Share the session with your partner when possible.",
  },
  {
    id: "t6",
    title: "Ananda Surāvali",
    raga: "Raga Bilahari",
    subtitle: "Energy Rise · Version II",
    purpose: "Energy",
    duration: 780,
    category: "devotional",
    art: artDevotional,
    frequency: "Mornings, before sunrise practice",
    instructions:
      "Best used standing or walking slowly. Follow with warm water and a few minutes of silence.",
  },
  {
    id: "t7",
    title: "Sthira Meditation",
    raga: "Raga Charukesi",
    subtitle: "Meditation · Version I",
    purpose: "Meditation",
    duration: 1800,
    category: "secular",
    art: artSecular,
    premium: true,
    frequency: "Daily, same time each day",
    instructions:
      "Keep the same seat and time daily. Let attention rest on the drone rather than the melody.",
  },
  {
    id: "t8",
    title: "Manas Balance",
    raga: "Raga Abheri",
    subtitle: "Mood Balance · Version II",
    purpose: "Mood Balance",
    duration: 1020,
    category: "secular",
    art: artFocus,
    frequency: "Once daily, afternoon",
    instructions:
      "Use after work, before conversations that need patience. Sit near natural light if available.",
  },
  {
    id: "t9",
    title: "Nivarana Healing",
    raga: "Raga Shanmukhapriya",
    subtitle: "Therapeutic · Version I",
    purpose: "Healing",
    duration: 1680,
    category: "devotional",
    art: artHealing,
    frequency: "Alternate days for six weeks",
    instructions:
      "Part of a six-week therapeutic arc. Keep a short note after each session to track change.",
  },
  {
    id: "t10",
    title: "Garbha Nidra",
    raga: "Raga Neelambari",
    subtitle: "Month 7 · Pregnancy Journey",
    purpose: "Sleep",
    duration: 1980,
    category: "pregnancy",
    art: artPregnancy,
    frequency: "Nightly through the third trimester",
    instructions:
      "Left-side lying is recommended. Stop the session if you feel any discomfort and consult your doctor.",
  },
];

export type Program = {
  id: string;
  title: string;
  subtitle: string;
  category: CategoryId;
  art: string;
  sessions: number;
  days: number;
  premium?: boolean;
  description: string;
  benefits: string[];
  usage: string;
  trackIds: string[];
};

export const programs: Program[] = [
  {
    id: "p1",
    title: "Seven Days of Calm",
    subtitle: "Stress relief arc",
    category: "secular",
    art: artSecular,
    sessions: 7,
    days: 7,
    description:
      "A gentle week-long therapeutic arc built from Krishna Sanjeevani surāvalis, sequenced to lower baseline stress and restore steady breath.",
    benefits: [
      "Lower day-to-day stress response",
      "Steadier breathing and heart rhythm",
      "Improved evening wind-down",
      "Better emotional recovery after conflict",
    ],
    usage: "One session daily for seven days, ideally at the same hour.",
    trackIds: ["t1", "t8", "t3", "t7", "t4", "t2", "t9"],
  },
  {
    id: "p2",
    title: "Deep Sleep Restoration",
    subtitle: "Sleep improvement",
    category: "secular",
    art: artSleep,
    sessions: 14,
    days: 14,
    premium: true,
    description:
      "A fortnight of night sequences that gradually lengthen, easing the transition into deep sleep without stimulants.",
    benefits: [
      "Shorter time to fall asleep",
      "Fewer night wakings",
      "Calmer morning mood",
    ],
    usage: "Nightly, beginning 20 minutes before bed.",
    trackIds: ["t2", "t10", "t7", "t1"],
  },
  {
    id: "p3",
    title: "Nine Months of Nurture",
    subtitle: "Pregnancy journey",
    category: "pregnancy",
    art: artPregnancy,
    sessions: 36,
    days: 270,
    description:
      "A month-wise pregnancy wellness journey, with sequences chosen for each trimester and reviewed alongside clinical guidance.",
    benefits: [
      "Reduced prenatal anxiety",
      "Gentle bonding ritual with your baby",
      "Support for restful sleep in later months",
    ],
    usage: "One session daily, matched to your current month.",
    trackIds: ["t5", "t10", "t1", "t9"],
  },
  {
    id: "p4",
    title: "Devotional Healing Arc",
    subtitle: "Traditional therapy",
    category: "devotional",
    art: artDevotional,
    sessions: 21,
    days: 42,
    premium: true,
    description:
      "The traditional six-week Krishna Sanjeevani healing arc, presented in its classical order with listening guidance for each stage.",
    benefits: [
      "Grounded daily devotional rhythm",
      "Sustained emotional steadiness",
      "Deeper meditative absorption",
    ],
    usage: "Alternate days across six weeks, mornings preferred.",
    trackIds: ["t6", "t1", "t4", "t9", "t7"],
  },
];

export const trackById = (id: string) => tracks.find((t) => t.id === id);
export const programById = (id: string) => programs.find((p) => p.id === id);

export function formatTime(total: number) {
  const m = Math.floor(total / 60);
  const s = Math.floor(total % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatDuration(total: number) {
  return `${Math.round(total / 60)} min`;
}

export const recentSearches = ["Neelambari", "Sleep sequence", "Month 5", "Focus cycle"];
export const trendingSearches = [
  "Stress relief surāvali",
  "Raga Kalyani",
  "Deep sleep restoration",
  "Pregnancy month 7",
  "Morning energy",
];

export const notifications = [
  {
    id: "n1",
    group: "Today",
    title: "Your evening session is ready",
    body: "Shanti Bhairavi · 16 min · Anxiety relief",
    time: "6:30 PM",
    kind: "reminder" as const,
  },
  {
    id: "n2",
    group: "Today",
    title: "Weekly progress",
    body: "You completed 5 of 7 sessions. Two gentle days to go.",
    time: "9:00 AM",
    kind: "progress" as const,
  },
  {
    id: "n3",
    group: "Earlier",
    title: "New track added",
    body: "Nivarana Healing · Raga Shanmukhapriya is now streaming.",
    time: "Yesterday",
    kind: "new" as const,
  },
  {
    id: "n4",
    group: "Earlier",
    title: "Program update",
    body: "Deep Sleep Restoration now includes a 33-minute night sequence.",
    time: "2 days ago",
    kind: "update" as const,
  },
];

export const pregnancyTips = [
  "Gentle listening in the evening helps settle both your rhythm and the baby's.",
  "Keep volume below conversational level; the baby responds to vibration, not loudness.",
  "Pair today's session with five slow breaths before you begin.",
];

export const plans = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "forever",
    blurb: "A daily taste of the practice.",
    features: ["3 tracks per day", "Standard streaming", "One purpose chip"],
  },
  {
    id: "premium",
    name: "Premium",
    price: "₹399",
    period: "per month",
    blurb: "The full therapeutic library.",
    features: [
      "Unlimited streaming",
      "All therapeutic programs",
      "Sleep timer & playback speed",
      "Listening instructions & frequency",
    ],
    highlight: true,
  },
  {
    id: "family",
    name: "Family",
    price: "₹699",
    period: "per month",
    blurb: "Up to five gentle listeners.",
    features: ["Everything in Premium", "5 profiles", "Shared favourites"],
  },
  {
    id: "promo",
    name: "Care Plan",
    price: "₹2,999",
    period: "per year",
    blurb: "Clinician-supported annual plan.",
    features: ["Everything in Family", "Doctor note reviews", "Priority support"],
  },
];

export const comparison = [
  { label: "Unlimited streaming", free: false, premium: true, family: true },
  { label: "Therapeutic programs", free: false, premium: true, family: true },
  { label: "Sleep timer", free: false, premium: true, family: true },
  { label: "Pregnancy dashboard", free: true, premium: true, family: true },
  { label: "Multiple profiles", free: false, premium: false, family: true },
];
