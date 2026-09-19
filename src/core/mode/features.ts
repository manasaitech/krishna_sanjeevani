// ─────────────────────────────────────────────────────────────
// Core Mode Features — centralised feature-flag definitions
// for each application mode.
// ─────────────────────────────────────────────────────────────

import type { ModeFeatures } from "./types";

export const SURAWALI_FEATURES: ModeFeatures = {
  hasSanjeevaniSelection: true,
  hasKrishnaSanjeevani: true,
  hasArogyaSanjeevani: true,
  hasGarbhSanjeevani: true,
  hasEmotionRemediation: false,
  searchProvider: "surawali",
  contentProvider: "surawali",
  hasMultiCategoryPlayer: true,
  hasPregnancyJourney: true,
  hasDiscoverCatalog: true,
};

export const EMOTION_REMEDIATION_FEATURES: ModeFeatures = {
  hasSanjeevaniSelection: false,
  hasKrishnaSanjeevani: false,
  hasArogyaSanjeevani: false,
  hasGarbhSanjeevani: false,
  hasEmotionRemediation: true,
  searchProvider: "emotion_remediation",
  contentProvider: "emotion_remediation",
  hasMultiCategoryPlayer: false,
  hasPregnancyJourney: false,
  hasDiscoverCatalog: false,
};
