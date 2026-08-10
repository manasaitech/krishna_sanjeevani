import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Bell, BellRing, Music4, RefreshCw, TrendingUp } from "lucide-react-native";
import { AppShell } from "@/components/AppShell";
import { notifications } from "@/lib/content";
import { useApp } from "@/lib/app-state";

const icons: Record<string, any> = {
  reminder: BellRing,
  progress: TrendingUp,
  new: Music4,
  update: RefreshCw,
};

export default function Notifications() {
  const { theme } = useApp();
  const groups = ["Today", "Earlier"];

  return (
    <AppShell title="Notifications" subtitle="Reminders and updates" back>
      {groups.map((g) => {
        const items = notifications.filter((n) => n.group === g);
        if (!items.length) return null;
        return (
          <View key={g} style={{ marginTop: 24 }}>
            <Text style={styles.groupLabel}>{g.toUpperCase()}</Text>
            <View style={{ gap: 12 }}>
              {items.map((n) => {
                const Icon = icons[n.kind] ?? Bell;
                return (
                  <View key={n.id} style={styles.card}>
                    <View style={[styles.iconWrap, { backgroundColor: theme.catLight }]}>
                      <Icon size={18} color={theme.cat} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle} numberOfLines={1}>
                          {n.title}
                        </Text>
                        <Text style={styles.cardTime}>{n.time}</Text>
                      </View>
                      <Text style={styles.cardBody}>{n.body}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  groupLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 2,
    color: "#7C7A85",
    marginBottom: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    backgroundColor: "#FFFFFF",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 4,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  cardTime: {
    fontSize: 11,
    color: "#7C7A85",
  },
  cardBody: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 20,
    color: "#7C7A85",
  },
});
