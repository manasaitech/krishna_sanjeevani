// ─────────────────────────────────────────────────────────────
// Core Payments Module
// Provides payment provider factory, order initialization, and
// verification shared across modes using mode-specific credentials.
// ─────────────────────────────────────────────────────────────

export {
  PaymentProviderFactory,
  RazorpayProvider,
  MockPaymentProvider,
  type PaymentProvider,
  type PaymentOrder,
  type PaymentVerificationResult,
} from "../../modules/subscriptions/payment.provider";
