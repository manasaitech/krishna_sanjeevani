// ─────────────────────────────────────────────────────────────
// Core Mode Context — React context + hook for accessing
// the active mode configuration throughout the component tree.
// ─────────────────────────────────────────────────────────────

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { AppMode, ModeConfig, ModeFeatures, ModeBranding, ContentMappingProvider, ContentSearchProvider, ModeSubscriptionConfig, ModeRouteConfig, NavItem } from "./types";
import { getActiveMode, getModeConfig } from "./config";

interface ModeContextValue {
  mode: AppMode;
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
  const value = useMemo<ModeContextValue>(() => {
    const mode = getActiveMode();
    const config = getModeConfig();

    return {
      mode,
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
  }, []);

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
 *   const { mode, branding, features, hasFeature } = useMode();
 *   if (hasFeature("hasSanjeevaniSelection")) { ... }
 */
export function useMode(): ModeContextValue {
  const ctx = useContext(ModeContext);
  if (!ctx) {
    throw new Error("useMode() must be used within <ModeProvider>.");
  }
  return ctx;
}
