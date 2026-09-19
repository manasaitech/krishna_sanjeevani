// ─────────────────────────────────────────────────────────────
// Surawali Mode — Main Configuration
// Assembles all Surawali-specific modules into a ModeConfig.
// ─────────────────────────────────────────────────────────────

import type { ModeConfig } from "@/core/mode/types";
import { SURAWALI_FEATURES } from "@/core/mode/features";
import { surawaliRoutes } from "./routes";
import { surawaliSubscriptionConfig } from "./subscription-config";
import { SurawaliContentMappingProvider } from "./content-provider";
import { SurawaliSearchProvider } from "./search-provider";

export const surawaliConfig: ModeConfig = {
  mode: "surawali",

  branding: {
    appName: "Krishna Sanjeevani",
    tagline: "Therapeutic Raga Streaming",
    description:
      "A calm, premium therapeutic audio platform streaming Krishna Sanjeevani ragas for emotional wellness, sleep, focus and pregnancy care.",
    primaryColor: "#7C1C24",
    themeColor: "#F8F6F2",
    faviconUrl: "/favicon.png",
    ogImageUrl: "https://krishnasanjeevani.com/logo.webp",
  },

  features: SURAWALI_FEATURES,

  routes: surawaliRoutes,

  subscriptions: surawaliSubscriptionConfig,

  navigation: {
    sidebar: [
      { label: "Home", path: "/home", icon: "Home" },
      { label: "Discover", path: "/discover", icon: "Compass" },
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

  contentProvider: new SurawaliContentMappingProvider(),
  searchProvider: new SurawaliSearchProvider(),
};
