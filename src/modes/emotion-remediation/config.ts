// ─────────────────────────────────────────────────────────────
// Emotion Remediation Mode — Main Configuration
// Assembles all Emotion-specific modules into a ModeConfig.
// ─────────────────────────────────────────────────────────────

import type { ModeConfig } from "@/core/mode/types";
import { EMOTION_REMEDIATION_FEATURES } from "@/core/mode/features";
import { emotionRemediationRoutes } from "./routes";
import { emotionSubscriptionConfig } from "./subscription-config";
import { EmotionRemediationContentMappingProvider } from "./content-provider";
import { EmotionRemediationSearchProvider } from "./search-provider";

export const emotionRemediationConfig: ModeConfig = {
  mode: "emotion_remediation",

  branding: {
    appName: "Krishna Sanjeevani",
    tagline: "Therapeutic Raga Streaming & Emotion Remediation",
    description:
      "A calm, premium therapeutic audio platform streaming Krishna Sanjeevani ragas for emotional wellness, sleep, focus, and inner balance.",
    primaryColor: "#7C1C24",
    themeColor: "#F8F6F2",
    faviconUrl: "/favicon.png",
    ogImageUrl: "https://krishnasanjeevani.com/logo.webp",
  },

  features: EMOTION_REMEDIATION_FEATURES,

  routes: emotionRemediationRoutes,

  subscriptions: emotionSubscriptionConfig,

  navigation: {
    sidebar: [
      { label: "Home", path: "/home", icon: "Home" },
      { label: "Search", path: "/search", icon: "Search" },
      { label: "Browse", path: "/browse", icon: "Library" },
      { label: "Programs", path: "/programs", icon: "ListMusic" },
      { label: "Favorites", path: "/favorites", icon: "Heart" },
      { label: "Subscription", path: "/subscription", icon: "CreditCard" },
      { label: "Profile", path: "/profile", icon: "User" },
    ],
    bottomNav: [
      { label: "Home", path: "/home", icon: "Home" },
      { label: "Search", path: "/search", icon: "Search" },
      { label: "Browse", path: "/browse", icon: "Library" },
      { label: "Profile", path: "/profile", icon: "User" },
    ],
  },

  contentProvider: new EmotionRemediationContentMappingProvider(),
  searchProvider: new EmotionRemediationSearchProvider(),
};
