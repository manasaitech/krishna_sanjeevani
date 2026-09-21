// ─────────────────────────────────────────────────────────────
// Core Mode Context — React context + hook for accessing
// the active mode configuration throughout the component tree.
// ─────────────────────────────────────────────────────────────

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useLocation } from "@tanstack/react-router";
import type { AppMode, ModeConfig, ModeFeatures, ModeBranding, ContentMappingProvider, ContentSearchProvider, ModeSubscriptionConfig, ModeRouteConfig, NavItem } from "./types";
import { getActiveMode, getModeConfig, MODE_CONFIGS } from "./config";

export interface ModeContextValue {
  mode: AppMode;
  isEmotionMode: boolean;
  isSurawaliMode: boolean;
  config: ModeConfig;
  branding: ModeBranding;
  features: ModeFeatures;
  routes: ModeRouteConfig;
  subscriptions: ModeSubscriptionConfig;
  navigation: { sidebar: NavItem[]; bottomNav: NavItem[] };
  contentProvider: ContentMappingProvider;
  searchProvider: ContentSearchProvider;
  /** Check a specific feature flag */
  hasFeature: (key: keyof ModeFeatures) => boolean;
}

const ModeContext = createContext<ModeContextValue | null>(null);

export function ModeProvider({ children }: { children: ReactNode }) {
  const location = useLocation();

  const mode = useMemo(() => {
    const res = getActiveMode(location.search || location.searchStr);
    console.log("[ModeProvider memo]", { locationSearch: location.search, locationSearchStr: location.searchStr, res });
    return res;
  }, [location.search, location.searchStr]);

  const config = useMemo(() => {
    return MODE_CONFIGS[mode];
  }, [mode]);

  const value = useMemo<ModeContextValue>(() => {
    return {
      mode,
      isEmotionMode: mode === "emotion_remediation",
      isSurawaliMode: mode === "surawali",
      config,
      branding: config.branding,
      features: config.features,
      routes: config.routes,
      subscriptions: config.subscriptions,
      navigation: config.navigation,
      contentProvider: config.contentProvider,
      searchProvider: config.searchProvider,
      hasFeature: (key: keyof ModeFeatures) => !!config.features[key],
    };
  }, [mode, config]);

  return (
    <ModeContext.Provider value={value}>
      {children}
    </ModeContext.Provider>
  );
}

/**
 * Access the active mode configuration from any component.
 *
 * Usage:
 *   const { mode, isEmotionMode, isSurawaliMode, branding, features, hasFeature } = useMode();
 */
export function useMode(): ModeContextValue {
  const ctx = useContext(ModeContext);
  if (!ctx) {
    const fallbackMode = getActiveMode();
    const fallbackConfig = getModeConfig();
    return {
      mode: fallbackMode,
      isEmotionMode: fallbackMode === "emotion_remediation",
      isSurawaliMode: fallbackMode === "surawali",
      config: fallbackConfig,
      branding: fallbackConfig.branding,
      features: fallbackConfig.features,
      routes: fallbackConfig.routes,
      subscriptions: fallbackConfig.subscriptions,
      navigation: fallbackConfig.navigation,
      contentProvider: fallbackConfig.contentProvider,
      searchProvider: fallbackConfig.searchProvider,
      hasFeature: (key: keyof ModeFeatures) => !!fallbackConfig.features[key],
    };
  }
  return ctx;
}
