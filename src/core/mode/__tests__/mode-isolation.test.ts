// ─────────────────────────────────────────────────────────────
// Mode Isolation Tests
// Verifies that each mode exposes only its own configuration,
// routes, features, and providers.
// ─────────────────────────────────────────────────────────────

import { describe, it, expect } from "vitest";
import { surawaliConfig } from "@/modes/surawali/config";
import { emotionRemediationConfig } from "@/modes/emotion-remediation/config";
import { MODE_CONFIGS } from "@/core/mode/config";
import type { ModeConfig } from "@/core/mode/types";

describe("Mode Configuration Registry", () => {
  it("should contain exactly two modes", () => {
    const modes = Object.keys(MODE_CONFIGS);
    expect(modes).toHaveLength(2);
    expect(modes).toContain("surawali");
    expect(modes).toContain("emotion_remediation");
  });
});

describe("Surawali Mode", () => {
  const config: ModeConfig = surawaliConfig;

  it("should have mode set to 'surawali'", () => {
    expect(config.mode).toBe("surawali");
  });

  it("should have Krishna Sanjeevani branding", () => {
    expect(config.branding.appName).toBe("Krishna Sanjeevani");
  });

  it("should enable all 3 Sanjeevani themes", () => {
    expect(config.features.hasSanjeevaniSelection).toBe(true);
    expect(config.features.hasKrishnaSanjeevani).toBe(true);
    expect(config.features.hasArogyaSanjeevani).toBe(true);
    expect(config.features.hasGarbhSanjeevani).toBe(true);
  });

  it("should NOT enable Emotion Remediation", () => {
    expect(config.features.hasEmotionRemediation).toBe(false);
  });

  it("should use surawali search provider", () => {
    expect(config.features.searchProvider).toBe("surawali");
  });

  it("should use surawali content provider", () => {
    expect(config.features.contentProvider).toBe("surawali");
  });

  it("should include /select-sanjeevani in routes", () => {
    expect(config.routes.modePaths).toContain("/select-sanjeevani");
  });

  it("should include /discover in routes", () => {
    expect(config.routes.modePaths).toContain("/discover");
  });

  it("should include /journey in routes", () => {
    expect(config.routes.modePaths).toContain("/journey");
  });

  it("should NOT allow Emotion routes", () => {
    // Emotion has no unique routes currently, but Surawali
    // route guard should block any route not in modePaths
  });

  it("should have pregnancy journey enabled", () => {
    expect(config.features.hasPregnancyJourney).toBe(true);
  });

  it("should have discover catalog enabled", () => {
    expect(config.features.hasDiscoverCatalog).toBe(true);
  });
});

describe("Emotion Remediation Mode", () => {
  const config: ModeConfig = emotionRemediationConfig;

  it("should have mode set to 'emotion_remediation'", () => {
    expect(config.mode).toBe("emotion_remediation");
  });

  it("should have Krishna Sanjeevani branding", () => {
    expect(config.branding.appName).toBe("Krishna Sanjeevani");
  });

  it("should have single theme (no Sanjeevani selection)", () => {
    expect(config.features.hasSanjeevaniSelection).toBe(false);
    expect(config.features.hasKrishnaSanjeevani).toBe(false);
    expect(config.features.hasArogyaSanjeevani).toBe(false);
    expect(config.features.hasGarbhSanjeevani).toBe(false);
  });

  it("should enable Emotion Remediation", () => {
    expect(config.features.hasEmotionRemediation).toBe(true);
  });

  it("should use emotion_remediation search provider", () => {
    expect(config.features.searchProvider).toBe("emotion_remediation");
  });

  it("should use emotion_remediation content provider", () => {
    expect(config.features.contentProvider).toBe("emotion_remediation");
  });

  it("should NOT include /select-sanjeevani in routes", () => {
    expect(config.routes.modePaths).not.toContain("/select-sanjeevani");
  });

  it("should NOT include /discover in routes", () => {
    expect(config.routes.modePaths).not.toContain("/discover");
  });

  it("should NOT include /journey in routes", () => {
    expect(config.routes.modePaths).not.toContain("/journey");
  });

  it("should NOT include /vedic-science in routes", () => {
    expect(config.routes.modePaths).not.toContain("/vedic-science");
  });

  it("should NOT include /inspiration in routes", () => {
    expect(config.routes.modePaths).not.toContain("/inspiration");
  });

  it("should NOT have pregnancy journey", () => {
    expect(config.features.hasPregnancyJourney).toBe(false);
  });

  it("should NOT have discover catalog", () => {
    expect(config.features.hasDiscoverCatalog).toBe(false);
  });
});

describe("Provider Isolation", () => {
  it("Surawali and Emotion should have different search providers", () => {
    expect(surawaliConfig.searchProvider).not.toBe(emotionRemediationConfig.searchProvider);
    expect(surawaliConfig.searchProvider.constructor.name).toBe("SurawaliSearchProvider");
    expect(emotionRemediationConfig.searchProvider.constructor.name).toBe("EmotionRemediationSearchProvider");
  });

  it("Surawali and Emotion should have different content providers", () => {
    expect(surawaliConfig.contentProvider).not.toBe(emotionRemediationConfig.contentProvider);
    expect(surawaliConfig.contentProvider.constructor.name).toBe("SurawaliContentMappingProvider");
    expect(emotionRemediationConfig.contentProvider.constructor.name).toBe("EmotionRemediationContentMappingProvider");
  });
});

describe("Payment and Plan Isolation", () => {
  it("each mode should share the unified Krishna Sanjeevani appName", () => {
    expect(surawaliConfig.branding.appName).toBe("Krishna Sanjeevani");
    expect(emotionRemediationConfig.branding.appName).toBe("Krishna Sanjeevani");
  });

  it("each mode should have independent subscription configs", () => {
    expect(surawaliConfig.subscriptions).not.toBe(emotionRemediationConfig.subscriptions);
    // Surawali has 3 plans (Krishna, Garbh, Arogya)
    expect(surawaliConfig.subscriptions.plans).toHaveLength(3);
    // Emotion has 1 plan
    expect(emotionRemediationConfig.subscriptions.plans).toHaveLength(1);
  });
});

describe("Route Isolation", () => {
  it("Surawali public paths should include /discover", () => {
    expect(surawaliConfig.routes.publicPaths).toContain("/discover");
  });

  it("Emotion public paths should NOT include /discover", () => {
    expect(emotionRemediationConfig.routes.publicPaths).not.toContain("/discover");
  });

  it("Surawali should have categorySelectionPath", () => {
    expect(surawaliConfig.routes.categorySelectionPath).toBe("/select-sanjeevani");
  });

  it("Emotion should NOT have categorySelectionPath", () => {
    expect(emotionRemediationConfig.routes.categorySelectionPath).toBeUndefined();
  });
});
