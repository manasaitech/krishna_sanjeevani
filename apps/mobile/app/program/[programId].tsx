import React, { useState, useEffect, useMemo } from "react";
import { View, Text, Image, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BookmarkCheck, Bookmark, CalendarDays, Check, ListMusic, Play } from "lucide-react-native";
import { AppShell } from "@/components/AppShell";
import { TrackRow } from "@/components/cards";
import { useApp } from "@/lib/app-state";
import { api, BASE_URL } from "@/lib/api";
import { resolveImageSource } from "@/lib/utils";
import { type Track } from "@/lib/content";

export default function ProgramDetail() {
  const { programId } = useLocalSearchParams<{ programId: string }>();
  const { savedPrograms, toggleSavedProgram, play, theme, programs } = useApp();
  const router = useRouter();

  const program = useMemo(
    () => programs.find((p) => p.id === programId),
    [programs, programId]
  );

  const [programTracks, setProgramTracks] = useState<Track[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(true);

  useEffect(() => {
    let active = true;
    if (!programId) return;
    setLoadingTracks(true);
    api.programs.getTracks(programId)
      .then((res) => {
        if (active && res.success && res.data) {
          const mapped = res.data.map((t: any) => ({
            ...t,
            art: t.thumbnailKey ? `${BASE_URL}/storage/file/${t.thumbnailKey}` : undefined,
            raga: t.subtitle || "",
            purpose: t.description || "Healing",
          }));
          setProgramTracks(mapped);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingTracks(false);
      });
    return () => { active = false; };
  }, [programId, BASE_URL]);

  if (!program) {
    return (
      <AppShell title="Not found" back>
        <Text style={{ fontSize: 14, color: "#7C7A85", textAlign: "center", marginTop: 40 }}>
          This program isn't available.
        </Text>
      </AppShell>
    );
  }

  const saved = savedPrograms.includes(program.id);
  const list = programTracks;

  return (
    <AppShell bare>
      {/* Hero image */}
      <View style={styles.heroWrap}>
        <Image source={resolveImageSource(program.art, program.category)} style={styles.heroImage} resizeMode="cover" />
        <View style={styles.heroOverlay} />
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 18, color: "#1A1A1A" }}>‹</Text>
        </Pressable>
        <View style={styles.heroContent}>
          <View style={styles.heroBadge}>
            <Text style={[styles.heroBadgeText, { color: theme.cat }]}>
              {program.premium ? "PREMIUM PROGRAM" : "THERAPEUTIC PROGRAM"}
            </Text>
          </View>
          <Text style={styles.heroTitle}>{program.title}</Text>
          <Text style={styles.heroSubtitle}>{program.subtitle}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: "Sessions", value: program.sessions, icon: ListMusic },
          { label: "Days", value: program.days, icon: CalendarDays },
          { label: "Tracks", value: list.length, icon: Play },
        ].map((s) => (
          <View key={s.label} style={styles.statCard}>
            <s.icon size={16} color={theme.cat} />
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* About */}
      <View style={{ marginTop: 32 }}>
        <Text style={styles.sectionTitle}>About this program</Text>
        <Text style={styles.bodyText}>{program.description}</Text>
      </View>

      {/* Benefits */}
      {program.benefits && program.benefits.length > 0 && (
        <View style={{ marginTop: 32 }}>
          <Text style={styles.sectionTitle}>Benefits</Text>
          <View style={{ gap: 12, marginTop: 16 }}>
            {program.benefits.map((b: string) => (
              <View key={b} style={styles.benefitRow}>
                <View style={[styles.checkCircle, { backgroundColor: theme.catLight }]}>
                  <Check size={14} color={theme.cat} strokeWidth={2.5} />
                </View>
                <Text style={styles.benefitText}>{b}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Usage */}
      <View style={[styles.usageCard, { backgroundColor: theme.catLight }]}>
        <Text style={[styles.usageLabel, { color: theme.cat }]}>RECOMMENDED USAGE</Text>
        <Text style={styles.usageText}>{program.usage || "Listen daily in a quiet room."}</Text>
      </View>

      {/* Track list */}
      <View style={{ marginTop: 32 }}>
        <Text style={styles.sectionTitle}>Track list</Text>
        {loadingTracks ? (
          <ActivityIndicator size="small" color={theme.cat} style={{ marginTop: 24 }} />
        ) : (
          <View style={{ gap: 12, marginTop: 16 }}>
            {list.map((t, i) => (
              <TrackRow key={`${t.id}-${i}`} track={t} index={i} programId={program.id} />
            ))}
            {list.length === 0 && (
              <Text style={{ fontSize: 13, color: "#7C7A85", textAlign: "center", paddingVertical: 16 }}>
                No tracks assigned to this program yet.
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          onPress={() => {
            if (list[0]) play(list[0], program.id);
            router.push("/player");
          }}
          disabled={list.length === 0}
          style={[styles.primaryBtn, { backgroundColor: "#264653", flex: 1 }, list.length === 0 && { opacity: 0.6 }]}
        >
          <Play size={16} color="#FAF8F4" fill="#FAF8F4" />
          <Text style={styles.primaryBtnText}>Play program</Text>
        </Pressable>
        <Pressable
          onPress={() => toggleSavedProgram(program.id)}
          style={[
            styles.saveBtn,
            saved && { borderColor: theme.cat, backgroundColor: theme.catLight },
          ]}
        >
          {saved ? (
            <BookmarkCheck size={16} color={theme.cat} />
          ) : (
            <Bookmark size={16} color="#1A1A1A" />
          )}
          <Text style={[styles.saveBtnText, saved && { color: theme.cat }]}>
            {saved ? "Saved" : "Save"}
          </Text>
        </Pressable>
      </View>

    </AppShell>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    marginHorizontal: -20,
    marginTop: -16,
    overflow: "hidden",
  },
  heroImage: { width: "100%", height: 200 },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(26,26,26,0.45)",
  },
  backBtn: {
    position: "absolute",
    top: 48,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(245,241,235,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  heroBadge: {
    backgroundColor: "rgba(245,241,235,0.95)",
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  heroTitle: {
    marginTop: 12,
    fontSize: 26,
    fontWeight: "600",
    color: "#F5F1EB",
    fontFamily: "DMSans",
  },
  heroSubtitle: { marginTop: 4, fontSize: 13, color: "rgba(245,241,235,0.85)" },
  statsRow: {
    marginTop: 24,
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    backgroundColor: "#FFFFFF",
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 4,
  },
  statValue: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    fontVariant: ["tabular-nums"],
  },
  statLabel: { fontSize: 11, color: "#7C7A85" },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1A1A1A",
    fontFamily: "DMSans",
  },
  bodyText: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 24,
    color: "#7C7A85",
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  benefitText: { flex: 1, fontSize: 14, lineHeight: 22, color: "#1A1A1A" },
  usageCard: {
    marginTop: 32,
    borderRadius: 20,
    padding: 20,
  },
  usageLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
  },
  usageText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: "#1A1A1A",
  },
  actions: {
    marginTop: 36,
    flexDirection: "row",
    gap: 12,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 52,
    borderRadius: 16,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 4,
  },
  primaryBtnText: { fontSize: 15, fontWeight: "600", color: "#FAF8F4" },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
  },
  saveBtnText: { fontSize: 15, fontWeight: "600", color: "#1A1A1A" },
});
