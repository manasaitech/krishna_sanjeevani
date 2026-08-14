import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { Bell, BellRing, Music4, RefreshCw, TrendingUp } from "lucide-react-native";
import { AppShell } from "@/components/AppShell";
import { useApp } from "@/lib/app-state";

const icons: Record<string, any> = {
  system: Bell,
  pregnancy: BellRing,
  track_alert: Music4,
  update: RefreshCw,
};

export default function Notifications() {
  const { theme, notifications, notificationsLoading, notificationsError, fetchNotifications, markNotificationRead } = useApp();

  return (
    <AppShell title="Notifications" subtitle="Reminders and updates" back>
      {notificationsLoading && notifications.length === 0 ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="small" color={theme.cat} />
          <Text style={styles.infoText}>Loading notifications...</Text>
        </View>
      ) : notificationsError ? (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>{notificationsError}</Text>
          <Pressable onPress={fetchNotifications} style={[styles.retryBtn, { backgroundColor: theme.cat }]}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centerBox}>
          <Text style={styles.infoText}>No notifications yet</Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1, marginTop: 12 }} showsVerticalScrollIndicator={false}>
          <View style={{ gap: 12, paddingBottom: 24 }}>
            {notifications.map((n) => {
              const Icon = icons[n.type] ?? Bell;
              return (
                <Pressable
                  key={n.id}
                  onPress={() => {
                    if (!n.read) {
                      markNotificationRead(n.id);
                    }
                  }}
                  style={[styles.card, !n.read && { backgroundColor: theme.catLight }]}
                >
                  <View style={[styles.iconWrap, { backgroundColor: theme.catLight }]}>
                    <Icon size={18} color={theme.cat} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={styles.cardHeader}>
                      <Text style={[styles.cardTitle, !n.read && { fontWeight: "700" }]} numberOfLines={1}>
                        {n.title}
                      </Text>
                      <Text style={styles.cardTime}>
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    <Text style={styles.cardBody}>{n.message}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
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
    fontWeight: "500",
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
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 16,
  },
  infoText: {
    fontSize: 14,
    color: "#7C7A85",
  },
  errorText: {
    fontSize: 14,
    color: "#C07B8A",
    textAlign: "center",
  },
  retryBtn: {
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
