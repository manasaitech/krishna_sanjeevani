// ─────────────────────────────────────────────────────────────
// Emotion Remediation Mode — Theme
// Single unified theme (no Sanjeevani sub-themes).
// ─────────────────────────────────────────────────────────────

export interface EmotionThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  accent: string;
  accentHover: string;
}

export const emotionTheme: EmotionThemeColors = {
  primary: "#7C1C24",       // Krishna Sanjeevani Burgundy
  secondary: "#9E2A2B",     // Secondary burgundy
  background: "#F8F6F2",    // Warm cream background
  surface: "#FFFFFF",
  text: "#2D1810",          // Deep warm brown
  textMuted: "#6B7280",
  border: "#EADDCF",
  accent: "#7C1C24",
  accentHover: "#66161D",
};

export const emotionThemeConfig = {
  id: "emotion_remediation" as const,
  name: "Krishna Sanjeevani",
  subtitle: "Therapeutic Emotion Remediation",
  description: "Personalized emotion-aware therapeutic content to support mental and emotional well-being.",
  theme: emotionTheme,
  placeholderSearch: "Search emotions, remediation techniques...",
  greetingText: "ॐ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः।",
  bannerText: "Discover personalized remediation pathways for emotional balance and inner peace.",
  filters: ["All", "Anxiety", "Stress", "Grief", "Anger", "Loneliness", "Fear", "Overwhelm"],
};
