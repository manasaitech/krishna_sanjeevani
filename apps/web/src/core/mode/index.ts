// Core Mode — barrel export
export type { AppMode, ModeConfig, ModeFeatures, ModeBranding, ModeRouteConfig, ModeSubscriptionConfig, NavItem, ContentMappingProvider, ContentSearchProvider, ContentItem, SearchContext, SearchResult, SubscriptionDuration, InstallmentConfig, SanjeevaniSubscriptionConfig } from "./types";
export { getActiveMode, getModeConfig, isRouteAllowedForMode, clearModeFlag, MODE_CONFIGS } from "./config";
export { ModeProvider, useMode } from "./context";
export { SURAWALI_FEATURES, EMOTION_REMEDIATION_FEATURES } from "./features";
