import { Env } from "../../shared/config/env";

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  status: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  orderId: string;
  paymentId: string;
  status: "completed" | "failed";
}

export interface PaymentProvider {
  createOrder(planId: string, amount: number, currency: string): Promise<PaymentOrder>;
  verifyPayment(orderId: string, paymentId: string, signature: string): Promise<PaymentVerificationResult>;
}

export class MockPaymentProvider implements PaymentProvider {
  async createOrder(planId: string, amount: number, currency: string): Promise<PaymentOrder> {
    return {
      orderId: `mock_order_${crypto.randomUUID()}`,
      amount,
      currency,
      status: "created",
    };
  }

  async verifyPayment(orderId: string, paymentId: string, signature: string): Promise<PaymentVerificationResult> {
    // In mock mode, if signature is "fail", simulate payment failure.
    // Otherwise, simulate payment success!
    const success = signature !== "fail";
    return {
      success,
      orderId,
      paymentId: paymentId || `mock_payment_${crypto.randomUUID()}`,
      status: success ? "completed" : "failed",
    };
  }
}

export class RazorpayProvider implements PaymentProvider {
  async createOrder(planId: string, amount: number, currency: string): Promise<PaymentOrder> {
    throw new Error("Razorpay production integration is pending credentials activation.");
  }

  async verifyPayment(orderId: string, paymentId: string, signature: string): Promise<PaymentVerificationResult> {
    throw new Error("Razorpay production integration is pending credentials activation.");
  }
}

export class PaymentProviderFactory {
  static getProvider(env: Env): PaymentProvider {
    const mode = env.PAYMENT_MODE || "mock";
    if (mode === "mock") {
      return new MockPaymentProvider();
    }
    if (mode === "razorpay") {
      return new RazorpayProvider();
    }
    throw new Error(`Payment mode '${mode}' is not supported yet.`);
  }
}
