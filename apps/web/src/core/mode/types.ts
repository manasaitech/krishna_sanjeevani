// ─────────────────────────────────────────────────────────────
// Core Mode Types — shared type definitions for the pluggable
// dual-mode architecture (Surawali / Emotion Remediation).
// ─────────────────────────────────────────────────────────────

/** The two application modes, controlled exclusively by configuration. */
export type AppMode = "surawali" | "emotion_remediation";

// ── Branding ──────────────────────────────────────────────────

export interface ModeBranding {
  /** Display name shown in title bar, metadata, etc. */
  appName: string;
  /** Short tagline / subtitle */
  tagline: string;
  /** SEO / OG description */
  description: string;
  /** Path to logo asset (relative to public/ or imported module) */
  logoUrl?: string;
  /** Favicon path */
  faviconUrl?: string;
  /** Primary hex colour for the mode */
  primaryColor: string;
  /** Theme-color meta tag value */
  themeColor: string;
  /** OG image URL */
  ogImageUrl?: string;
}

// ── Feature Flags ─────────────────────────────────────────────

export interface ModeFeatures {
  /** Show the 3-Sanjeevani selector (Krishna / Arogya / Garbh) */
  hasSanjeevaniSelection: boolean;
  hasKrishnaSanjeevani: boolean;
  hasArogyaSanjeevani: boolean;
  hasGarbhSanjeevani: boolean;
  hasEmotionRemediation: boolean;
  /** Identifier for the active search provider */
  searchProvider: string;
  /** Identifier for the active content provider */
  contentProvider: string;
  /** Whether multi-category audio player is enabled */
  hasMultiCategoryPlayer: boolean;
  /** Whether pregnancy journey features are enabled */
  hasPregnancyJourney: boolean;
  /** Whether the discover / surawali catalog is enabled */
  hasDiscoverCatalog: boolean;
}

// ── Content & Search Provider Interfaces ──────────────────────

export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface SearchContext {
  category?: string;
  filters?: Record<string, unknown>;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  score?: number;
  type: "track" | "program" | "content";
  data?: unknown;
}

export interface ContentMappingProvider {
  /** Retrieve content items, optionally filtered */
  getContent(category?: string, filters?: Record<string, unknown>): Promise<ContentItem[]>;
  /** Map / transform raw content into display-ready format */
  mapContent(items: ContentItem[]): Promise<ContentItem[]>;
}

export interface ContentSearchProvider {
  /** Execute a search query against the content index */
  search(query: string, context?: SearchContext): Promise<SearchResult[]>;
  /** Return suggested / trending searches */
  getSuggestions?(): Promise<string[]>;
}

// ── Subscription Configuration ────────────────────────────────

export interface SubscriptionDuration {
  months: number;
  label: string;
  /** Price in smallest currency unit (e.g. paise) */
  price: number;
  /** Currency code */
  currency: string;
}

export interface InstallmentConfig {
  count: number;
  /** For Garbh: window for second installment */
  secondInstallmentWindow?: {
    minMonth: number;
    maxMonth: number;
  };
}

export interface SanjeevaniSubscriptionConfig {
  id: string;
  name: string;
  durations: SubscriptionDuration[];
  installments?: InstallmentConfig;
  /** Discount rate (0-1) when subscribing to additional Sanjeevani services */
  multiSanjeevaniDiscount?: number;
}

export interface ModeSubscriptionConfig {
  /** All available subscription plans for this mode */
  plans: SanjeevaniSubscriptionConfig[];
  /** Optional free trial period in days (e.g., 20 days for Emotion Remediation) */
  freeTrialDays?: number;
}

// ── Route Configuration ───────────────────────────────────────

export interface ModeRouteConfig {
  /** Paths accessible without authentication */
  publicPaths: string[];
  /** Default redirect path after login */
  defaultHomePath: string;
  /** Paths that belong exclusively to this mode */
  modePaths: string[];
  /** Path shown when user needs to select a category/theme (Surawali only) */
  categorySelectionPath?: string;
}

// ── Navigation ────────────────────────────────────────────────

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  /** Only show when authenticated */
  requiresAuth?: boolean;
}

// ── Top-Level Mode Configuration ──────────────────────────────

export interface ModeConfig {
  mode: AppMode;
  branding: ModeBranding;
  features: ModeFeatures;
  routes: ModeRouteConfig;
  subscriptions: ModeSubscriptionConfig;
  navigation: {
    sidebar: NavItem[];
    bottomNav: NavItem[];
  };
  /** The content mapping provider instance for this mode */
  contentProvider: ContentMappingProvider;
  /** The search provider instance for this mode */
  searchProvider: ContentSearchProvider;
}
