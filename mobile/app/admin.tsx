import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import {
  BarChart3,
  LayoutDashboard,
  Search,
  Upload,
  Users,
} from "lucide-react-native";
import { AppShell } from "@/components/AppShell";
import { useApp } from "@/lib/app-state";
import { programs, tracks } from "@/lib/content";

const kpis = [
  { label: "Registrations", value: "12,480", delta: "+6.2% this week" },
  { label: "Active users", value: "5,214", delta: "+3.1% this week" },
  { label: "Track plays", value: "184,902", delta: "+11.4% this week" },
  { label: "Tracks live", value: "312", delta: "8 pending review" },
];

const activity = [
  { who: "Meera I.", what: "published Nivarana Healing", when: "12 min ago" },
  { who: "Ops", what: "approved 4 pregnancy month-7 sequences", when: "1 hr ago" },
  { who: "Ravi K.", what: "updated Deep Sleep Restoration program", when: "3 hrs ago" },
  { who: "Billing", what: "42 new Premium subscriptions", when: "Today" },
];

export default function Admin() {
  const { theme } = useApp();

  return (
    <AppShell title="Admin" subtitle="Therapeutic catalogue operations" back mini={false}>
      {/* KPIs */}
      <View style={styles.kpiGrid}>
        {kpis.map((k) => (
          <View key={k.label} style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>{k.label}</Text>
            <Text style={styles.kpiValue}>{k.value}</Text>
            <Text style={[styles.kpiDelta, { color: theme.cat }]}>{k.delta}</Text>
          </View>
        ))}
      </View>

      {/* Recent activity */}
      <View style={[styles.card, { marginTop: 24 }]}>
        <Text style={styles.sectionTitle}>Recent activity</Text>
        <View style={{ gap: 16, marginTop: 20 }}>
          {activity.map((a) => (
            <View key={a.what} style={styles.activityRow}>
              <View style={[styles.activityAvatar, { backgroundColor: theme.catLight }]}>
                <Text style={[styles.activityInitials, { color: theme.cat }]}>
                  {a.who.slice(0, 2)}
                </Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.activityText}>
                  <Text style={{ fontWeight: "600" }}>{a.who}</Text> {a.what}
                </Text>
                <Text style={styles.activityTime}>{a.when}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.divider} />
        <Text style={{ fontSize: 14, fontWeight: "600", color: "#1A1A1A" }}>Programs live</Text>
        <Text style={styles.programsCount}>{programs.length}</Text>
      </View>

      {/* Content summary */}
      <View style={[styles.card, { marginTop: 24 }]}>
        <Text style={styles.sectionTitle}>Content library</Text>
        <View style={{ gap: 12, marginTop: 16 }}>
          {tracks.slice(0, 5).map((t) => (
            <View key={t.id} style={styles.trackRow}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text numberOfLines={1} style={styles.trackTitle}>{t.title}</Text>
                <Text numberOfLines={1} style={styles.trackMeta}>
                  {t.raga} · {t.purpose} · {Math.round(t.duration / 60)} min
                </Text>
              </View>
              <View style={styles.liveBadge}>
                <Text style={styles.liveText}>Live</Text>
              </View>
            </View>
          ))}
        </View>
        <Text style={styles.totalTracks}>{tracks.length} total tracks</Text>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  kpiCard: {
    width: "47%",
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
  kpiLabel: { fontSize: 12, fontWeight: "500", color: "#7C7A85" },
  kpiValue: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: "600",
    color: "#1A1A1A",
    fontVariant: ["tabular-nums"],
  },
  kpiDelta: { marginTop: 4, fontSize: 11, fontWeight: "500" },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    backgroundColor: "#FFFFFF",
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1A1A1A",
    fontFamily: "DMSans",
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  activityAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  activityInitials: {
    fontSize: 11,
    fontWeight: "600",
  },
  activityText: { fontSize: 14, color: "#1A1A1A" },
  activityTime: { fontSize: 11, color: "#7C7A85", marginTop: 2 },
  divider: {
    height: 1,
    backgroundColor: "#E8E4DC",
    marginVertical: 20,
  },
  programsCount: {
    marginTop: 4,
    fontSize: 24,
    fontWeight: "600",
    color: "#1A1A1A",
    fontVariant: ["tabular-nums"],
  },
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E4DC",
  },
  trackTitle: { fontSize: 14, fontWeight: "500", color: "#1A1A1A" },
  trackMeta: { fontSize: 12, color: "#7C7A85", marginTop: 2 },
  liveBadge: {
    backgroundColor: "rgba(39,174,96,0.12)",
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  liveText: { fontSize: 11, fontWeight: "600", color: "#27AE60" },
  totalTracks: {
    marginTop: 16,
    fontSize: 12,
    color: "#7C7A85",
  },
});
