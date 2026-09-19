// ─────────────────────────────────────────────────────────────
// Emotion Remediation Mode — Subscriptions Endpoint
// Handles Emotion Remediation subscription plans and checkout.
// Zero dependencies on Surawali modules.
// ─────────────────────────────────────────────────────────────

import { Hono } from "hono";
import { Env } from "../../../shared/config/env";
import { ApiResponse } from "../../../shared/responses";
import { requireAuth } from "../../../modules/auth/auth.middleware";
import { PaymentProviderFactory } from "../../../core/payments";

export const emotionSubscriptionRoute = new Hono<{ Bindings: Env }>();

const EMOTION_TRIAL_CONFIG = {
  freeTrialDays: 20,
  description: "Free access for all users for first 20 days.",
};

const EMOTION_PLANS = [
  {
    id: "emotion_monthly",
    name: "Monthly Wellness",
    price: 199,
    currency: "INR",
    durationMonths: 1,
    description: "Full access to all emotion remediation pathways and guided sessions.",
    features: [
      "Access to all 7 emotion categories",
      "Unlimited daily remediation listening",
      "Personalized emotion tracking",
      "Offline listening support",
    ],
  },
  {
    id: "emotion_quarterly",
    name: "3-Month Balance",
    price: 499,
    currency: "INR",
    durationMonths: 3,
    description: "Sustained emotional healing over a 90-day cycle.",
    features: [
      "All Monthly plan features",
      "Custom audio resonance frequencies",
      "Progressive emotional balance analytics",
    ],
  },
  {
    id: "emotion_annual",
    name: "Annual Healing Journey",
    price: 1499,
    currency: "INR",
    durationMonths: 12,
    description: "Year-long transformative emotional balance with maximum savings.",
    features: [
      "All Quarterly plan features",
      "Priority new pathway releases",
      "Guided emotional journaling",
    ],
  },
];

// Get available subscription plans and trial policy
emotionSubscriptionRoute.get("/plans", (c) => {
  return ApiResponse.success(c, {
    trial: EMOTION_TRIAL_CONFIG,
    plans: EMOTION_PLANS,
  });
});

// Create subscription order for Emotion mode
emotionSubscriptionRoute.post("/create-order", requireAuth(), async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { planId } = body;

  const plan = EMOTION_PLANS.find((p) => p.id === planId);
  if (!plan) {
    return ApiResponse.error(c, "Invalid plan ID", 400);
  }

  const paymentProvider = PaymentProviderFactory.create(c.env);
  const order = await paymentProvider.createOrder(plan.price, plan.currency);

  return ApiResponse.success(c, {
    orderId: order.orderId,
    amount: plan.price,
    currency: plan.currency,
    planId: plan.id,
    planName: plan.name,
  });
});
