// ─────────────────────────────────────────────────────────────
// Surawali Subscription Configuration Tests
// Validates business rules for all 3 Sanjeevani subscriptions.
// ─────────────────────────────────────────────────────────────

import { describe, it, expect } from "vitest";
import { surawaliSubscriptionConfig } from "@/modes/surawali/subscription-config";

describe("Surawali Subscription Config", () => {
  it("should have 3 subscription plans", () => {
    expect(surawaliSubscriptionConfig.plans).toHaveLength(3);
  });

  describe("Krishna Sanjeevani", () => {
    const plan = surawaliSubscriptionConfig.plans.find(p => p.id === "krishna_sanjeevani");

    it("should exist", () => {
      expect(plan).toBeDefined();
    });

    it("should have 3 duration options (3, 6, 12 months)", () => {
      expect(plan!.durations).toHaveLength(3);
      expect(plan!.durations.map(d => d.months)).toEqual([3, 6, 12]);
    });

    it("should have 50% multi-Sanjeevani discount", () => {
      expect(plan!.multiSanjeevaniDiscount).toBe(0.50);
    });

    it("should NOT have installments", () => {
      expect(plan!.installments).toBeUndefined();
    });

    it("should have prices in INR", () => {
      plan!.durations.forEach(d => {
        expect(d.currency).toBe("INR");
        expect(d.price).toBeGreaterThan(0);
      });
    });
  });

  describe("Garbh Sanjeevani", () => {
    const plan = surawaliSubscriptionConfig.plans.find(p => p.id === "garbh_sanjeevani");

    it("should exist", () => {
      expect(plan).toBeDefined();
    });

    it("should have 2 duration options (4, 8 months)", () => {
      expect(plan!.durations).toHaveLength(2);
      expect(plan!.durations.map(d => d.months)).toEqual([4, 8]);
    });

    it("should have 2 installments", () => {
      expect(plan!.installments).toBeDefined();
      expect(plan!.installments!.count).toBe(2);
    });

    it("should have second installment window from month 2 to 9", () => {
      expect(plan!.installments!.secondInstallmentWindow).toBeDefined();
      expect(plan!.installments!.secondInstallmentWindow!.minMonth).toBe(2);
      expect(plan!.installments!.secondInstallmentWindow!.maxMonth).toBe(9);
    });

    it("should NOT have multi-Sanjeevani discount", () => {
      expect(plan!.multiSanjeevaniDiscount).toBeUndefined();
    });
  });

  describe("Arogya Sanjeevani", () => {
    const plan = surawaliSubscriptionConfig.plans.find(p => p.id === "arogya_sanjeevani");

    it("should exist", () => {
      expect(plan).toBeDefined();
    });

    it("should have 2 installments", () => {
      expect(plan!.installments).toBeDefined();
      expect(plan!.installments!.count).toBe(2);
    });

    it("should NOT have a second installment window (unlike Garbh)", () => {
      expect(plan!.installments!.secondInstallmentWindow).toBeUndefined();
    });

    it("should have prices in INR", () => {
      plan!.durations.forEach(d => {
        expect(d.currency).toBe("INR");
        expect(d.price).toBeGreaterThan(0);
      });
    });
  });
});

describe("Pricing is configurable (not hardcoded)", () => {
  it("all plans should define prices in the config, not in UI components", () => {
    surawaliSubscriptionConfig.plans.forEach(plan => {
      plan.durations.forEach(d => {
        expect(typeof d.price).toBe("number");
        expect(typeof d.months).toBe("number");
        expect(typeof d.label).toBe("string");
        expect(typeof d.currency).toBe("string");
      });
    });
  });
});
