import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Minus, Loader2, Sparkles, AlertCircle, CreditCard, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { Section } from "@/components/layout-bits";
import { useApp } from "@/lib/app-state";
import { api } from "@/lib/api";

export const Route = createFileRoute("/subscription")({
  head: () => ({
    meta: [
      { title: "Plans — Krishna Sanjeevani" },
      {
        name: "description",
        content:
          "Free, Standard and Premium Care plans for therapeutic raga streaming.",
      },
      { property: "og:title", content: "Plans — Krishna Sanjeevani" },
      { property: "og:description", content: "Choose the plan that fits your practice." },
    ],
  }),
  component: SubscriptionRouteComponent,
});

const featuresMap: Record<string, string[]> = {
  free: [
    "Access to standard healing ragas",
    "Dynamic category-switching UI",
    "Daily recommended tracks",
    "Support for Web & Mobile playback",
  ],
  standard: [
    "Unlock standard healing sessions & schedules",
    "AES-128 secure HLS high-fidelity streaming",
    "Custom pregnancy week-by-week journeys",
    "Sync listening progress across devices",
  ],
  premium: [
    "Complete access to the full curative audio library",
    "Unlock all premium sessions & schedules",
    "Priority clinician support & guided meditation sets",
    "AES-128 secure HLS high-fidelity streaming",
    "Custom pregnancy week-by-week journeys",
  ],
};

const comparison = [
  { label: "Therapeutic Ragas", free: true, standard: true, premium: true },
  { label: "HLS Secure Streaming", free: true, standard: true, premium: true },
  { label: "Pregnancy Calendar", free: false, standard: true, premium: true },
  { label: "Sync Progress", free: false, standard: true, premium: true },
  { label: "Advanced Clinician Sets", free: false, standard: false, premium: true },
];

function SubscriptionRouteComponent() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<any[]>([]);
  const [currentSub, setCurrentSub] = useState<any>(null);
  const [paymentsList, setPaymentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState("premium");

  // Checkout modal states
  const [checkoutOrder, setCheckoutOrder] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<"idle" | "success" | "failed">("idle");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const loadSubscriptionData = async () => {
    setLoading(true);
    try {
      const [plansRes, subRes, payRes] = await Promise.all([
        api.plans.list().catch(() => ({ success: false, data: [] })),
        api.subscriptions.getCurrent().catch(() => ({ success: false, data: null })),
        api.payments.list().catch(() => ({ success: false, data: [] })),
      ]);

      if (plansRes.success) {
        setPlans(plansRes.data);
      }
      if (subRes.success) {
        setCurrentSub(subRes.data);
      }
      if (payRes.success) {
        setPaymentsList(payRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const handleStartCheckout = async () => {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    setProcessing(true);
    setCheckoutError(null);
    setCheckoutStatus("idle");
    try {
      const res = await api.subscriptions.createOrder(selectedPlan);
      if (res.success) {
        setCheckoutOrder(res.data);
      } else {
        setCheckoutError(res.message || "Failed to initiate payment");
      }
    } catch (err) {
      setCheckoutError("Failed to connect to checkout services.");
    } finally {
      setProcessing(false);
    }
  };

  const handleSimulatePayment = async (signature: "mock_success" | "fail") => {
    if (!checkoutOrder) return;
    setProcessing(true);
    setCheckoutError(null);
    try {
      const res = await api.subscriptions.verifyPayment(
        checkoutOrder.orderId,
        `pay_${crypto.randomUUID()}`,
        signature
      );
      if (res.success && res.data?.success) {
        setCheckoutStatus("success");
        await loadSubscriptionData();
      } else {
        setCheckoutStatus("failed");
        setCheckoutError("Payment simulation reported failure.");
      }
    } catch (err) {
      setCheckoutStatus("failed");
      setCheckoutError("Verification request failed.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-cat" />
        </div>
      </AppShell>
    );
  }

  const formatPrice = (priceCents: number) => {
    return `₹${Math.round(priceCents / 100)}`;
  };

  const isSubscribed = currentSub && currentSub.status === "active" && currentSub.currentPeriodEnd > Date.now();

  return (
    <AppShell title="Plans" subtitle="Unlock complete therapeutic access">
      
      {/* Current Subscription Status Header */}
      <div className="animate-rise mb-8 rounded-card border border-border bg-surface p-5 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-semibold tracking-wider text-cat uppercase bg-cat-light px-2.5 py-1 rounded-full">
            My Account status
          </span>
          <h2 className="text-lg font-semibold mt-2.5">
            {isSubscribed ? (
              <span className="text-green-600 flex items-center gap-1.5">
                Active {plans.find(p => p.id === currentSub.planId)?.name || currentSub.planId} Tier
              </span>
            ) : (
              <span className="text-muted-foreground">Free Tier Account</span>
            )}
          </h2>
          {isSubscribed && (
            <p className="text-xs text-muted-foreground mt-1">
              Valid until: {new Date(currentSub.currentPeriodEnd).toLocaleDateString()}
            </p>
          )}
        </div>
        {!isSubscribed && (
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
            <AlertCircle className="h-4 w-4" /> Limited access: Ragas are locked to previews.
          </div>
        )}
      </div>

      <div className="mt-2 grid gap-6 sm:grid-cols-3">
        {plans.map((p) => {
          const active = selectedPlan === p.id;
          const isCurrentPlan = (isSubscribed && currentSub.planId === p.id) || (!isSubscribed && p.id === "free");
          const features = featuresMap[p.id] || [];

          return (
            <button
              key={p.id}
              onClick={() => setSelectedPlan(p.id)}
              aria-pressed={active}
              className={`press animate-rise rounded-card border bg-surface p-5 text-left shadow-soft hover:shadow-lift flex flex-col justify-between ${
                active ? "border-cat ring-1 ring-cat" : "border-border"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-[17px] font-semibold">{p.name}</h2>
                    {isCurrentPlan && (
                      <span className="inline-block mt-1 text-[9px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                        Current Plan
                      </span>
                    )}
                  </div>
                  {p.id === "premium" && (
                    <span className="rounded-full bg-cat-light px-2.5 py-1 text-[10px] font-semibold tracking-wider text-cat uppercase shrink-0">
                      Curative
                    </span>
                  )}
                </div>
                <p className="mt-4 text-2xl font-semibold">
                  {formatPrice(p.price)}
                  <span className="ml-1 text-xs font-medium text-muted-foreground">
                    / {p.interval}
                  </span>
                </p>
                <ul className="mt-6 space-y-2.5">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[13px] text-foreground/90">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cat" strokeWidth={2.6} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </button>
          );
        })}
      </div>

      {/* Feature matrix */}
      <section className="animate-rise mt-10 overflow-hidden rounded-card border border-border bg-surface shadow-soft">
        <h2 className="border-b border-border px-5 py-4 text-[15px] font-semibold">
          Compare features
        </h2>
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="text-[11px] tracking-wider text-muted-foreground uppercase">
              <th scope="col" className="px-5 py-3 font-semibold">
                Feature
              </th>
              <th scope="col" className="px-3 py-3 text-center font-semibold">
                Free
              </th>
              <th scope="col" className="px-3 py-3 text-center font-semibold">
                Standard
              </th>
              <th scope="col" className="px-3 py-3 text-center font-semibold">
                Premium
              </th>
            </tr>
          </thead>
          <tbody>
            {comparison.map((row) => (
              <tr key={row.label} className="border-t border-border">
                <th scope="row" className="px-5 py-3.5 font-medium">
                  {row.label}
                </th>
                {[row.free, row.standard, row.premium].map((v, i) => (
                  <td key={i} className="px-3 py-3.5 text-center">
                    {v ? (
                      <Check
                        className="mx-auto h-4 w-4 text-cat"
                        strokeWidth={2.6}
                        aria-label="Included"
                      />
                    ) : (
                      <Minus
                        className="mx-auto h-4 w-4 text-muted-foreground"
                        aria-label="Not included"
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Subscribe Button */}
      {selectedPlan !== "free" && (
        <div className="mt-8">
          <button
            onClick={handleStartCheckout}
            disabled={processing}
            className="press flex min-h-13 w-full items-center justify-center rounded-btn bg-primary px-6 text-[15px] font-semibold text-primary-foreground shadow-soft hover:bg-primary-hover disabled:opacity-75"
          >
            {processing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              `Subscribe to ${plans.find(p => p.id === selectedPlan)?.name}`
            )}
          </button>
          <p className="mt-4 text-center text-[12px] leading-relaxed text-muted-foreground">
            Billed securely. Simulation mode enabled. Razorpay integrations pending activation.
          </p>
        </div>
      )}

      {/* Simulated Checkout Modal */}
      {checkoutOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4">
          <div className="bg-surface rounded-card border border-border max-w-md w-full p-6 shadow-lift animate-rise space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-amber-50 text-amber-600">
                <CreditCard className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold text-base">Development Mode Payment</h3>
                <p className="text-xs text-muted-foreground">Simulating Razorpay order validation</p>
              </div>
            </div>

            <div className="bg-background/80 rounded-xl p-4 border border-border text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-semibold tabular-nums">{checkoutOrder.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tier Plan</span>
                <span className="font-semibold">{checkoutOrder.planName}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 mt-2">
                <span className="font-semibold">Authoritative Amount</span>
                <span className="font-semibold tabular-nums text-cat">{formatPrice(checkoutOrder.amount)}</span>
              </div>
            </div>

            {checkoutStatus === "idle" && (
              <div className="space-y-3">
                <button
                  onClick={() => handleSimulatePayment("mock_success")}
                  disabled={processing}
                  className="w-full min-h-[44px] bg-green-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
                >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Simulate Success (mock_success)
                </button>
                <button
                  onClick={() => handleSimulatePayment("fail")}
                  disabled={processing}
                  className="w-full min-h-[44px] bg-red-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-red-700 transition-colors"
                >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Minus className="h-4 w-4" />}
                  Simulate Failure (fail)
                </button>
                <button
                  onClick={() => setCheckoutOrder(null)}
                  disabled={processing}
                  className="w-full min-h-[44px] bg-surface border border-border text-foreground rounded-xl font-semibold flex items-center justify-center hover:bg-muted transition-colors"
                >
                  Cancel Checkout
                </button>
              </div>
            )}

            {checkoutStatus === "success" && (
              <div className="space-y-4 text-center">
                <div className="mx-auto w-12 h-12 bg-green-50 text-green-600 border border-green-200 rounded-full grid place-items-center">
                  <Check className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-green-700">Subscription Activated!</h4>
                <p className="text-xs text-muted-foreground">Your tier has successfully synced in D1.</p>
                <button
                  onClick={() => { setCheckoutOrder(null); setCheckoutStatus("idle"); }}
                  className="w-full min-h-[44px] bg-primary text-primary-foreground rounded-xl font-semibold"
                >
                  Done
                </button>
              </div>
            )}

            {checkoutStatus === "failed" && (
              <div className="space-y-4 text-center">
                <div className="mx-auto w-12 h-12 bg-red-50 text-red-600 border border-red-200 rounded-full grid place-items-center">
                  <Minus className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-red-700">Payment Simulation Failed</h4>
                {checkoutError && <p className="text-xs text-red-500">{checkoutError}</p>}
                <button
                  onClick={() => { setCheckoutStatus("idle"); setCheckoutError(null); }}
                  className="w-full min-h-[44px] bg-muted text-foreground rounded-xl font-semibold"
                >
                  Retry simulation
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payments billing log */}
      <Section title="Billing & Payment logs">
        {paymentsList.length === 0 ? (
          <div className="rounded-card border border-border bg-surface p-6 text-center text-sm text-muted-foreground shadow-soft">
            No transaction records found for this account.
          </div>
        ) : (
          <div className="overflow-hidden rounded-card border border-border bg-surface shadow-soft">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="text-[11px] tracking-wider text-muted-foreground bg-cat-light/10 uppercase">
                  <th scope="col" className="px-5 py-3 font-semibold">Date</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Transaction ID</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Tier Plan</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Amount</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {paymentsList.map((pay) => (
                  <tr key={pay.id} className="border-t border-border">
                    <td className="px-5 py-3.5 font-medium flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      {new Date(pay.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-3.5 text-muted-foreground font-mono text-[11px]">
                      {pay.id}
                    </td>
                    <td className="px-3 py-3.5 font-semibold capitalize">
                      {pay.planId}
                    </td>
                    <td className="px-3 py-3.5 tabular-nums">
                      {formatPrice(pay.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        pay.status === "completed" 
                          ? "bg-green-50 text-green-700 border border-green-200" 
                          : pay.status === "pending"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                        {pay.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </AppShell>
  );
}
