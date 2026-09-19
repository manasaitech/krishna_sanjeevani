// ─────────────────────────────────────────────────────────────
// Surawali Mode — Subscription Configuration
// All pricing and business rules are defined here, never
// hardcoded inside UI components.
// ─────────────────────────────────────────────────────────────

import type { ModeSubscriptionConfig } from "@/core/mode/types";

export const surawaliSubscriptionConfig: ModeSubscriptionConfig = {
  plans: [
    // ── Krishna Sanjeevani ──
    {
      id: "krishna_sanjeevani",
      name: "Krishna Sanjeevani",
      durations: [
        { months: 3, label: "3 Months", price: 89700, currency: "INR" },   // ₹897
        { months: 6, label: "6 Months", price: 149700, currency: "INR" },  // ₹1,497
        { months: 12, label: "12 Months", price: 269700, currency: "INR" }, // ₹2,697
      ],
      // Subscribe to 1 Sanjeevani and get 50% off the other two
      multiSanjeevaniDiscount: 0.50,
    },

    // ── Garbh Sanjeevani ──
    {
      id: "garbh_sanjeevani",
      name: "Garbh Sanjeevani",
      durations: [
        { months: 4, label: "4 Months", price: 119600, currency: "INR" },  // ₹1,196
        { months: 8, label: "8 Months", price: 199600, currency: "INR" },  // ₹1,996
      ],
      installments: {
        count: 2,
        secondInstallmentWindow: {
          minMonth: 2,
          maxMonth: 9,
        },
      },
    },

    // ── Arogya Sanjeevani ──
    {
      id: "arogya_sanjeevani",
      name: "Arogya Sanjeevani",
      durations: [
        { months: 3, label: "3 Months", price: 89700, currency: "INR" },
        { months: 6, label: "6 Months", price: 149700, currency: "INR" },
        { months: 12, label: "12 Months", price: 269700, currency: "INR" },
      ],
      installments: {
        count: 2,
      },
    },
  ],
};

/** Static list of search-purpose filter chips for Surawali mode */
export const surawaliPurposes = [
  "Stress Relief",
  "Focus",
  "Sleep",
  "Anxiety",
  "Energy",
  "Meditation",
  "Healing",
  "Calm Mind",
  "Mood Balance",
];
