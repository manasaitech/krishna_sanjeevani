import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Image, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { AppShell } from "@/components/AppShell";
import { Section } from "@/components/layout-bits";
import { EmptyState, CardsLoading } from "@/components/States";
import { useApp } from "@/lib/app-state";
import { api, BASE_URL } from "@/lib/api";
import { resolveImageSource } from "@/lib/utils";
import { Clock, Play, CheckCircle2 } from "lucide-react-native";

interface HistoryItem {
  track: any;
  position: number;
  completed: boolean;
  lastPlayedAt: number;
  programId: string | null;
}

export default function ListeningHistory() {
  const { theme, play } = useApp();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await api.progress.history();
      if (res.success && Array.isArray(res.data)) {
        setHistory(res.data);
      }
    } catch (err) {
      console.warn("Failed to fetch listening history", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Grouping helper
  const grouped = (() => {
    const todayItems: HistoryItem[] = [];
    const yesterdayItems: HistoryItem[] = [];
    const earlierItems: HistoryItem[] = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;

    history.forEach((item) => {
      const time = item.lastPlayedAt;
      if (time >= startOfToday) {
        todayItems.push(item);
      } else if (time >= startOfYesterday) {
        yesterdayItems.push(item);
      } else {
        earlierItems.push(item);
      }
    });

    return { today: todayItems, yesterday: yesterdayItems, earlier: earlierItems };
  })();

  const handlePlayItem = (item: HistoryItem) => {
    play(item.track, item.programId || undefined);
    router.push("/player");
  };

  return (
    <AppShell title="Listening History" subtitle="Your wellness and meditation path" back>
      {loading ? (
        <View style={{ marginTop: 24 }}>
          <CardsLoading count={4} />
        </View>
      ) : history.length === 0 ? (
        <EmptyState
          icon={<Clock size={24} color={theme.cat} />}
          title="No listening history"
          body="Your played tracks and wellness sessions will appear here."
        />
      ) : (
        <ScrollView style={{ flex: 1, marginTop: 16 }} showsVerticalScrollIndicator={false}>
          <View style={{ paddingBottom: 32 }}>
            {/* Today */}
            {grouped.today.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <Text style={styles.groupLabel}>TODAY</Text>
                <View style={{ gap: 12 }}>
                  {grouped.today.map((item, idx) => (
                    <Pressable
                      key={item.track.id + "-today-" + idx}
                      onPress={() => handlePlayItem(item)}
                      style={styles.card}
                    >
                      <Image source={resolveImageSource(item.track.art, item.track.category)} style={styles.art} />
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.title} numberOfLines={1}>
                          {item.track.title}
                        </Text>
                        <Text style={styles.subtitle} numberOfLines={1}>
                          {item.track.raga} · {item.track.purpose}
                        </Text>
                        <View style={styles.statusRow}>
                          {item.completed ? (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                              <CheckCircle2 size={12} color="#4CAF50" />
                              <Text style={[styles.statusText, { color: "#4CAF50" }]}>Completed</Text>
                            </View>
                          ) : (
                            <Text style={styles.statusText}>
                              Listened to {formatTime(item.position)} / {formatTime(item.track.duration)}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={[styles.playBtn, { backgroundColor: theme.catLight }]}>
                        <Play size={14} color={theme.cat} fill={theme.cat} />
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Yesterday */}
            {grouped.yesterday.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <Text style={styles.groupLabel}>YESTERDAY</Text>
                <View style={{ gap: 12 }}>
                  {grouped.yesterday.map((item, idx) => (
                    <Pressable
                      key={item.track.id + "-yesterday-" + idx}
                      onPress={() => handlePlayItem(item)}
                      style={styles.card}
                    >
                      <Image source={resolveImageSource(item.track.art, item.track.category)} style={styles.art} />
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.title} numberOfLines={1}>
                          {item.track.title}
                        </Text>
                        <Text style={styles.subtitle} numberOfLines={1}>
                          {item.track.raga} · {item.track.purpose}
                        </Text>
                        <View style={styles.statusRow}>
                          {item.completed ? (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                              <CheckCircle2 size={12} color="#4CAF50" />
                              <Text style={[styles.statusText, { color: "#4CAF50" }]}>Completed</Text>
                            </View>
                          ) : (
                            <Text style={styles.statusText}>
                              Listened to {formatTime(item.position)} / {formatTime(item.track.duration)}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={[styles.playBtn, { backgroundColor: theme.catLight }]}>
                        <Play size={14} color={theme.cat} fill={theme.cat} />
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Earlier */}
            {grouped.earlier.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <Text style={styles.groupLabel}>EARLIER</Text>
                <View style={{ gap: 12 }}>
                  {grouped.earlier.map((item, idx) => (
                    <Pressable
                      key={item.track.id + "-earlier-" + idx}
                      onPress={() => handlePlayItem(item)}
                      style={styles.card}
                    >
                      <Image source={resolveImageSource(item.track.art, item.track.category)} style={styles.art} />
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.title} numberOfLines={1}>
                          {item.track.title}
                        </Text>
                        <Text style={styles.subtitle} numberOfLines={1}>
                          {item.track.raga} · {item.track.purpose}
                        </Text>
                        <View style={styles.statusRow}>
                          {item.completed ? (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                              <CheckCircle2 size={12} color="#4CAF50" />
                              <Text style={[styles.statusText, { color: "#4CAF50" }]}>Completed</Text>
                            </View>
                          ) : (
                            <Text style={styles.statusText}>
                              Listened to {formatTime(item.position)} / {formatTime(item.track.duration)}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={[styles.playBtn, { backgroundColor: theme.catLight }]}>
                        <Play size={14} color={theme.cat} fill={theme.cat} />
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      )}
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
    paddingHorizontal: 4,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    backgroundColor: "#FFFFFF",
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 4,
  },
  art: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  subtitle: {
    fontSize: 12,
    color: "#7C7A85",
    marginTop: 2,
  },
  statusRow: {
    marginTop: 6,
  },
  statusText: {
    fontSize: 11,
    color: "#7C7A85",
  },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
