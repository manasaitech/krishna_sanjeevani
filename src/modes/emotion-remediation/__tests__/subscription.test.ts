// ─────────────────────────────────────────────────────────────
// Emotion Remediation Subscription Configuration Tests
// Validates 20-day free trial and reduced subscription pricing.
// ─────────────────────────────────────────────────────────────

import { describe, it, expect } from "vitest";
import { emotionSubscriptionConfig } from "../subscription-config";

describe("Emotion Remediation Subscription Config", () => {
  it("should provide a 20-day free trial for all users", () => {
    expect(emotionSubscriptionConfig.freeTrialDays).toBe(20);
  });

  it("should have 1 unified subscription plan", () => {
    expect(emotionSubscriptionConfig.plans).toHaveLength(1);
    expect(emotionSubscriptionConfig.plans[0].id).toBe("emotion_remediation");
  });

  it("should have reduced affordable pricing tiers", () => {
    const plan = emotionSubscriptionConfig.plans[0];
    const prices = plan.durations.reduce(
      (acc, d) => ({ ...acc, [d.months]: d.price }),
      {} as Record<number, number>
    );

    // 1 Month: ₹199 (19900 paise)
    expect(prices[1]).toBe(19900);
    // 3 Months: ₹499 (49900 paise)
    expect(prices[3]).toBe(49900);
    // 6 Months: ₹899 (89900 paise)
    expect(prices[6]).toBe(89900);
    // 12 Months: ₹1,499 (149900 paise)
    expect(prices[12]).toBe(149900);
  });
});
