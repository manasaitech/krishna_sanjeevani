import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { Check, Minus } from "lucide-react-native";
import { AppShell } from "@/components/AppShell";
import { comparison, plans } from "@/lib/content";
import { useApp } from "@/lib/app-state";

export default function Subscription() {
  const { theme } = useApp();
  const [selected, setSelected] = useState("premium");

  return (
    <AppShell title="Plans" subtitle="Cancel any time" back mini={false}>
      <View style={{ gap: 16, marginTop: 8 }}>
        {plans.map((p) => {
          const active = selected === p.id;
          return (
            <Pressable
              key={p.id}
              onPress={() => setSelected(p.id)}
              style={[
                styles.card,
                active && { borderColor: theme.cat, borderWidth: 2 },
              ]}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.planName}>{p.name}</Text>
                  <Text style={styles.planBlurb}>{p.blurb}</Text>
                </View>
                {(p as any).highlight && (
                  <View style={[styles.popularBadge, { backgroundColor: theme.catLight }]}>
                    <Text style={[styles.popularText, { color: theme.cat }]}>POPULAR</Text>
                  </View>
                )}
              </View>
              <Text style={styles.price}>
                {p.price}
                <Text style={styles.period}> {p.period}</Text>
              </Text>
              <View style={{ gap: 8, marginTop: 16 }}>
                {p.features.map((f) => (
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
          <Text style={styles.tableCol}>PREMIUM</Text>
          <Text style={styles.tableCol}>FAMILY</Text>
        </View>
        {comparison.map((row) => (
          <View key={row.label} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>{row.label}</Text>
            {[row.free, row.premium, row.family].map((v, i) => (
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

      <Pressable style={[styles.continueBtn, { backgroundColor: "#264653" }]}>
        <Text style={styles.continueBtnText}>
          Continue with {plans.find((p) => p.id === selected)?.name}
        </Text>
      </Pressable>
      <Text style={styles.disclaimer}>
        Billed securely. Streaming only — sessions are never downloaded or shared.
      </Text>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    backgroundColor: "#FFFFFF",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  planName: { fontSize: 17, fontWeight: "600", color: "#1A1A1A" },
  planBlurb: { marginTop: 4, fontSize: 12, color: "#7C7A85" },
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 4,
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
    marginTop: 32,
    minHeight: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 4,
  },
  continueBtnText: { fontSize: 15, fontWeight: "600", color: "#FAF8F4" },
  disclaimer: {
    marginTop: 16,
    fontSize: 12,
    lineHeight: 20,
    color: "#7C7A85",
    textAlign: "center",
  },
});
