// ─────────────────────────────────────────────────────────────
// Surawali Mode — Theme definitions
// Extracted from the original content.ts sanjeevaniConfigs.
// ─────────────────────────────────────────────────────────────

import artDevotional from "@/assets/art-devotional.webp";
import artSecular from "@/assets/art-secular.webp";
import artPregnancy from "@/assets/art-pregnancy.webp";

export type SurawaliCategoryId = "devotional" | "secular" | "pregnancy" | "unset";

export interface SurawaliCategory {
  id: SurawaliCategoryId;
  name: string;
  tagline: string;
  description: string;
  art: string;
}

export const surawaliCategories: SurawaliCategory[] = [
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

export interface SanjeevaniThemeColors {
  primary: string;
  bgGrad: string;
  bgSolid: string;
  text: string;
  border: string;
  accent: string;
  hover: string;
  tint: string;
}

export interface SanjeevaniThemeConfig {
  id: SurawaliCategoryId;
  name: string;
  subtitle: string;
  description: string;
  theme: SanjeevaniThemeColors;
  placeholderSearch: string;
  greetingText: string;
  bannerText: string;
  filters: string[];
}

export const surawaliThemes: Record<Exclude<SurawaliCategoryId, "unset">, SanjeevaniThemeConfig> = {
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
    filters: ["All", "Month 1-3", "Month 4-6", "Month 7-9"],
  },
};
