import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator, Modal } from "react-native";
import { Check, Minus, CreditCard, Clock, AlertCircle } from "lucide-react-native";
import { AppShell } from "@/components/AppShell";
import { useApp } from "@/lib/app-state";
import { api } from "@/lib/api";

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

export default function Subscription() {
  const { theme, user } = useApp();
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
      <AppShell title="Plans" back>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", minHeight: 300 }}>
          <ActivityIndicator color={theme.cat} size="large" />
        </View>
      </AppShell>
    );
  }

  const formatPrice = (priceCents: number) => {
    return `₹${Math.round(priceCents / 100)}`;
  };

  const isSubscribed = currentSub && currentSub.status === "active" && currentSub.currentPeriodEnd > Date.now();

  return (
    <AppShell title="Plans" subtitle="Cancel any time" back mini={false}>
      
      {/* Current Subscription Status Header */}
      <View style={styles.statusHeader}>
        <View style={[styles.statusBadge, { backgroundColor: theme.catLight }]}>
          <Text style={[styles.statusBadgeText, { color: theme.cat }]}>MY ACCOUNT STATUS</Text>
        </View>
        <Text style={styles.statusTitle}>
          {isSubscribed ? (
            <Text style={{ color: "#2E7D32" }}>
              Active {plans.find(p => p.id === currentSub.planId)?.name || currentSub.planId} Tier
            </Text>
          ) : (
            <Text style={{ color: "#7C7A85" }}>Free Tier Account</Text>
          )}
        </Text>
        {isSubscribed && (
          <Text style={styles.statusValidity}>
            Valid until: {new Date(currentSub.currentPeriodEnd).toLocaleDateString()}
          </Text>
        )}
      </View>

      {/* Plans List */}
      <View style={{ gap: 16, marginTop: 16 }}>
        {plans.map((p) => {
          const active = selectedPlan === p.id;
          const isCurrentPlan = (isSubscribed && currentSub.planId === p.id) || (!isSubscribed && p.id === "free");
          const features = featuresMap[p.id] || [];

          return (
            <Pressable
              key={p.id}
              onPress={() => setSelectedPlan(p.id)}
              style={[
                styles.card,
                active && { borderColor: theme.cat, borderWidth: 2 },
              ]}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.planName}>{p.name}</Text>
                  {isCurrentPlan && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>Current Plan</Text>
                    </View>
                  )}
                </View>
                {p.id === "premium" && (
                  <View style={[styles.popularBadge, { backgroundColor: theme.catLight }]}>
                    <Text style={[styles.popularText, { color: theme.cat }]}>CURATIVE</Text>
                  </View>
                )}
              </View>
              <Text style={styles.price}>
                {formatPrice(p.price)}
                <Text style={styles.period}> / {p.interval}</Text>
              </Text>
              <View style={{ gap: 8, marginTop: 16 }}>
                {features.map((f) => (
                  <View key={f} style={styles.featureRow}>
                    <Check size={14} color={theme.cat} strokeWidth={2.6} />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Comparison table */}
      <View style={styles.tableCard}>
        <Text style={styles.tableTitle}>Compare features</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCol, { flex: 2 }]}>FEATURE</Text>
          <Text style={styles.tableCol}>FREE</Text>
          <Text style={styles.tableCol}>STANDARD</Text>
          <Text style={styles.tableCol}>PREMIUM</Text>
        </View>
        {comparison.map((row) => (
          <View key={row.label} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>{row.label}</Text>
            {[row.free, row.standard, row.premium].map((v, i) => (
              <View key={i} style={[styles.tableCell, { alignItems: "center" }]}>
                {v ? (
                  <Check size={16} color={theme.cat} strokeWidth={2.6} />
                ) : (
                  <Minus size={16} color="#7C7A85" />
                )}
              </View>
            ))}
          </View>
        ))}
      </View>

      {/* Subscribe Trigger Button */}
      {selectedPlan !== "free" && (
        <View style={{ marginTop: 32 }}>
          <Pressable
            onPress={handleStartCheckout}
            disabled={processing}
            style={[styles.continueBtn, { backgroundColor: theme.cat }]}
          >
            {processing ? (
              <ActivityIndicator color={theme.catForeground} size="small" />
            ) : (
              <Text style={[styles.continueBtnText, { color: theme.catForeground }]}>
                Subscribe to {plans.find(p => p.id === selectedPlan)?.name}
              </Text>
            )}
          </Pressable>
          <Text style={styles.disclaimer}>
            Billed securely. Simulation mode enabled. Razorpay integrations pending activation.
          </Text>
        </View>
      )}

      {/* Billing transaction logs */}
      <View style={[styles.tableCard, { marginTop: 32, marginBottom: 40 }]}>
        <Text style={styles.tableTitle}>Billing & Payment logs</Text>
        {paymentsList.length === 0 ? (
          <Text style={styles.emptyBilling}>No transaction logs found for this account.</Text>
        ) : (
          paymentsList.map((pay) => (
            <View key={pay.id} style={styles.billingRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.billingPlan}>{pay.planId.toUpperCase()} Tier</Text>
                <Text style={styles.billingDate}>
                  {new Date(pay.createdAt).toLocaleDateString()} · {pay.id}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.billingPrice}>{formatPrice(pay.amount)}</Text>
                <View style={[
                  styles.statusTag,
                  pay.status === "completed" 
                    ? { backgroundColor: "#E8F5E9", borderColor: "#A5D6A7" } 
                    : { backgroundColor: "#FFF8E1", borderColor: "#FFE082" }
                ]}>
                  <Text style={[
                    styles.statusTagText,
                    pay.status === "completed" ? { color: "#2E7D32" } : { color: "#F57F17" }
                  ]}>
                    {pay.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Simulated Checkout Modal dialog */}
      <Modal
        visible={!!checkoutOrder}
        transparent
        animationType="fade"
        onRequestClose={() => setCheckoutOrder(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <CreditCard size={20} color={theme.cat} />
              <View>
                <Text style={styles.modalTitle}>Development Checkout</Text>
                <Text style={styles.modalSubtitle}>Simulating Razorpay payment order</Text>
              </View>
            </View>

            {checkoutOrder && (
              <View style={styles.modalOrderInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Order ID</Text>
                  <Text style={styles.infoVal}>{checkoutOrder.orderId}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Tier Plan</Text>
                  <Text style={styles.infoVal}>{checkoutOrder.planName}</Text>
                </View>
                <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: "#E8E4DC", paddingTop: 8, marginTop: 8 }]}>
                  <Text style={[styles.infoLabel, { fontWeight: "700" }]}>Amount</Text>
                  <Text style={[styles.infoVal, { fontWeight: "700", color: theme.cat }]}>
                    {formatPrice(checkoutOrder.amount)}
                  </Text>
                </View>
              </View>
            )}

            {checkoutStatus === "idle" && (
              <View style={{ gap: 12 }}>
                <Pressable
                  onPress={() => handleSimulatePayment("mock_success")}
                  disabled={processing}
                  style={[styles.simBtn, { backgroundColor: "#2E7D32" }]}
                >
                  {processing ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.simBtnText}>Simulate Success</Text>
                  )}
                </Pressable>
                <Pressable
                  onPress={() => handleSimulatePayment("fail")}
                  disabled={processing}
                  style={[styles.simBtn, { backgroundColor: "#C62828" }]}
                >
                  {processing ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.simBtnText}>Simulate Failure</Text>
                  )}
                </Pressable>
                <Pressable
                  onPress={() => setCheckoutOrder(null)}
                  disabled={processing}
                  style={[styles.simBtn, { backgroundColor: "#FAF8F4", borderWidth: 1, borderColor: "#E8E4DC" }]}
                >
                  <Text style={[styles.simBtnText, { color: "#1A1A1A" }]}>Cancel</Text>
                </Pressable>
              </View>
            )}

            {checkoutStatus === "success" && (
              <View style={{ alignItems: "center", gap: 12 }}>
                <Check size={32} color="#2E7D32" strokeWidth={3} />
                <Text style={{ fontSize: 16, fontWeight: "600", color: "#2E7D32" }}>Subscription Activated!</Text>
                <Text style={{ fontSize: 12, color: "#7C7A85", textAlign: "center" }}>
                  Your subscription status has successfully updated to active in the database.
                </Text>
                <Pressable
                  onPress={() => { setCheckoutOrder(null); setCheckoutStatus("idle"); }}
                  style={[styles.simBtn, { backgroundColor: theme.cat, width: "100%", marginTop: 12 }]}
                >
                  <Text style={[styles.simBtnText, { color: theme.catForeground }]}>Done</Text>
                </Pressable>
              </View>
            )}

            {checkoutStatus === "failed" && (
              <View style={{ alignItems: "center", gap: 12 }}>
                <Minus size={32} color="#C62828" strokeWidth={3} />
                <Text style={{ fontSize: 16, fontWeight: "600", color: "#C62828" }}>Simulation Failed</Text>
                {checkoutError && <Text style={{ fontSize: 12, color: "#C62828" }}>{checkoutError}</Text>}
                <Pressable
                  onPress={() => { setCheckoutStatus("idle"); setCheckoutError(null); }}
                  style={[styles.simBtn, { backgroundColor: "#7C7A85", width: "100%", marginTop: 12 }]}
                >
                  <Text style={styles.simBtnText}>Retry Simulation</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  statusHeader: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    backgroundColor: "#FFFFFF",
    padding: 16,
    gap: 8,
  },
  statusBadge: {
    alignSelf: "flex-start",
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: "700",
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  statusValidity: {
    fontSize: 11,
    color: "#7C7A85",
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  planName: { fontSize: 17, fontWeight: "600", color: "#1A1A1A" },
  currentBadge: {
    alignSelf: "flex-start",
    marginTop: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#A5D6A7",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  currentBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#2E7D32",
  },
  popularBadge: {
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  popularText: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1,
  },
  price: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  period: { fontSize: 12, fontWeight: "500", color: "#7C7A85" },
  featureRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  featureText: { fontSize: 13, color: "#1A1A1A", flex: 1 },
  tableCard: {
    marginTop: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  tableTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E4DC",
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(240,236,228,0.6)",
  },
  tableCol: {
    flex: 1,
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1,
    color: "#7C7A85",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#E8E4DC",
  },
  tableCell: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    color: "#1A1A1A",
  },
  continueBtn: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  continueBtnText: { fontSize: 15, fontWeight: "600" },
  disclaimer: {
    marginTop: 16,
    fontSize: 12,
    lineHeight: 20,
    color: "#7C7A85",
    textAlign: "center",
  },
  emptyBilling: {
    padding: 24,
    fontSize: 13,
    color: "#7C7A85",
    textAlign: "center",
  },
  billingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E8E4DC",
  },
  billingPlan: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  billingDate: {
    fontSize: 11,
    color: "#7C7A85",
    marginTop: 4,
  },
  billingPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  statusTag: {
    marginTop: 4,
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusTagText: {
    fontSize: 9,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 360,
    gap: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#7C7A85",
    marginTop: 2,
  },
  modalOrderInfo: {
    backgroundColor: "#F5F1EB",
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoLabel: {
    fontSize: 12,
    color: "#7C7A85",
  },
  infoVal: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  simBtn: {
    minHeight: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  simBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
