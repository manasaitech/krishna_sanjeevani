// ─────────────────────────────────────────────────────────────
// Emotion Remediation Mode — Subscription Configuration
// Placeholder pricing — will be finalized when business
// rules are provided.
// ─────────────────────────────────────────────────────────────

import type { ModeSubscriptionConfig } from "@/core/mode/types";

export const emotionSubscriptionConfig: ModeSubscriptionConfig = {
  // Free for all users for 20 days, then subscription is required
  freeTrialDays: 20,

  plans: [
    {
      id: "emotion_remediation",
      name: "Emotion Remediation",
      durations: [
        { months: 1, label: "1 Month", price: 19900, currency: "INR" },    // ₹199 (reduced)
        { months: 3, label: "3 Months", price: 49900, currency: "INR" },   // ₹499 (reduced)
        { months: 6, label: "6 Months", price: 89900, currency: "INR" },   // ₹899 (reduced)
        { months: 12, label: "12 Months", price: 149900, currency: "INR" }, // ₹1,499 (reduced)
      ],
    },
  ],
};
