import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Image, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { AppShell } from "@/components/AppShell";
import { Section } from "@/components/layout-bits";
import { EmptyState, CardsLoading } from "@/components/States";
import { useApp } from "@/lib/app-state";
import { api, BASE_URL } from "@/lib/api";
import { resolveImageSource } from "@/lib/utils";
import { Compass, Sparkles, BookOpen } from "lucide-react-native";

export default function ProgramsList() {
  const { theme, programs, loading } = useApp();
  const router = useRouter();
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [loadingProgress, setLoadingProgress] = useState(false);

  useEffect(() => {
    if (!programs.length) return;
    
    let active = true;
    setLoadingProgress(true);

    const fetchAllProgress = async () => {
      try {
        const promises = programs.map(async (p) => {
          try {
            const res = await api.progress.get(p.id);
            if (res.success && res.data) {
              return { id: p.id, percentage: res.data.progressPercentage || 0 };
            }
          } catch {
            // Ignore single failures
          }
          return { id: p.id, percentage: 0 };
        });

        const results = await Promise.all(promises);
        if (active) {
          const mapping: Record<string, number> = {};
          results.forEach((r) => {
            mapping[r.id] = r.percentage;
          });
          setProgressMap(mapping);
        }
      } catch (err) {
        console.warn("Failed to fetch all programs progress", err);
      } finally {
        if (active) setLoadingProgress(false);
      }
    };

    fetchAllProgress();
    return () => {
      active = false;
    };
  }, [programs]);

  return (
    <AppShell title="Programs" subtitle="Guided multi-week therapeutic arcs" back>
      {loading ? (
        <View style={{ marginTop: 24 }}>
          <CardsLoading count={4} />
        </View>
      ) : programs.length === 0 ? (
        <EmptyState
          icon={<Compass size={24} color={theme.cat} />}
          title="No programs available"
          body="Wellness and therapeutic programs will appear here once published."
        />
      ) : (
        <ScrollView style={{ flex: 1, marginTop: 16 }} showsVerticalScrollIndicator={false}>
          <View style={{ gap: 16, paddingBottom: 32 }}>
            {programs.map((p) => {
              const progress = progressMap[p.id] || 0;
              const hasStarted = progress > 0;

              return (
                <Pressable
                  key={p.id}
                  onPress={() => router.push(`/program/${p.id}`)}
                  style={styles.card}
                >
                  <Image
                    source={resolveImageSource(p.thumbnailKey ? `${BASE_URL}/storage/file/${p.thumbnailKey}` : undefined, p.category)}
                    style={styles.art}
                    resizeMode="cover"
                  />
                  <View style={styles.content}>
                    <View style={styles.topRow}>
                      <View style={[styles.badge, { backgroundColor: theme.catLight }]}>
                        <Text style={[styles.badgeText, { color: theme.cat }]}>
                          {p.category.toUpperCase()}
                        </Text>
                      </View>
                      {p.premium && (
                        <View style={styles.premiumBadge}>
                          <Sparkles size={10} color="#D8A53B" fill="#D8A53B" />
                          <Text style={styles.premiumText}>Premium</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.title} numberOfLines={1}>
                      {p.title}
                    </Text>
                    <Text style={styles.description} numberOfLines={2}>
                      {p.description}
                    </Text>

                    <View style={styles.footer}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <BookOpen size={12} color="#7C7A85" />
                        <Text style={styles.infoText}>{p.trackCount || 0} sessions</Text>
                      </View>

                      {hasStarted ? (
                        <Text style={[styles.progressText, { color: theme.cat }]}>
                          {progress}% complete
                        </Text>
                      ) : (
                        <Text style={styles.progressText}>Not started</Text>
                      )}
                    </View>

                    {/* Progress Bar */}
                    {hasStarted && (
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${progress}%`, backgroundColor: theme.cat },
                          ]}
                        />
                      </View>
                    )}
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
  art: {
    width: "100%",
    height: 160,
  },
  content: {
    padding: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  badge: {
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "700",
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "#FAF5EC",
    borderWidth: 1,
    borderColor: "#D8A53B",
  },
  premiumText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#D8A53B",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginTop: 10,
    fontFamily: "DMSans",
  },
  description: {
    fontSize: 13,
    color: "#7C7A85",
    marginTop: 4,
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    borderTopWidth: 1,
    borderColor: "#F5F1EB",
    paddingTop: 12,
  },
  infoText: {
    fontSize: 12,
    color: "#7C7A85",
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7C7A85",
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E8E4DC",
    marginTop: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
});
