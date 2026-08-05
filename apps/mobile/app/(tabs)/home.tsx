import React, { useMemo, useState } from "react";
import { View, Text, Pressable, Image, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Bell, Crown, Search as SearchIcon, Sparkles } from "lucide-react-native";
import { AppShell } from "@/components/AppShell";
import { Chip, Rail, Section } from "@/components/layout-bits";
import { ContinueCard, ProgramCard, TrackCard, TrackRow } from "@/components/cards";
import { CardsLoading, EmptyState } from "@/components/States";
import { useApp } from "@/lib/app-state";
import { programs, purposes, tracks } from "@/lib/content";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Home() {
  const { category, current, theme } = useApp();
  const router = useRouter();
  const [purpose, setPurpose] = useState<string | null>(null);

  const catTracks = useMemo(
    () => tracks.filter((t) => t.category === category),
    [category]
  );
  const filtered = useMemo(
    () => (purpose ? tracks.filter((t) => t.purpose === purpose) : catTracks),
    [purpose, catTracks]
  );
  const catPrograms = programs.filter((p) => p.category === category);
  const featured = catTracks[0] ?? tracks[0]!;

  return (
    <AppShell bare>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.greeting}>{greeting()},</Text>
          <Text style={styles.name} numberOfLines={1}>
            Ananya
          </Text>
          <View style={[styles.premiumBadge, { backgroundColor: theme.catLight }]}>
            <Crown size={14} color={theme.cat} />
            <Text style={[styles.premiumText, { color: theme.cat }]}>Premium member</Text>
          </View>
        </View>
        <Pressable
          onPress={() => router.push("/notifications")}
          style={styles.bellBtn}
        >
          <Bell size={18} color="#1A1A1A" />
          <View style={[styles.bellDot, { backgroundColor: theme.cat }]} />
        </Pressable>
      </View>

      {/* Search bar */}
      <Pressable onPress={() => router.push("/(tabs)/search")} style={styles.searchBar}>
        <SearchIcon size={18} color="#7C7A85" />
        <Text style={styles.searchText}>Search ragas, purposes, programs</Text>
      </Pressable>

      {/* Purpose chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        <Chip active={purpose === null} onPress={() => setPurpose(null)}>
          All
        </Chip>
        {purposes.map((p) => (
          <Chip key={p} active={purpose === p} onPress={() => setPurpose(p)}>
            {p}
          </Chip>
        ))}
      </ScrollView>

      {/* Featured */}
      <Pressable
        onPress={() => router.push("/player")}
        style={styles.featuredCard}
      >
        <Image source={featured.art} style={styles.featuredImage} resizeMode="cover" />
        <View style={styles.featuredOverlay} />
        <View style={styles.featuredContent}>
          <View style={styles.todayBadge}>
            <Sparkles size={12} color={theme.cat} />
            <Text style={[styles.todayText, { color: theme.cat }]}>TODAY'S SESSION</Text>
          </View>
          <Text style={styles.featuredTitle}>{featured.title}</Text>
          <Text style={styles.featuredSubtitle}>
            {featured.raga} · {featured.purpose}
          </Text>
        </View>
      </Pressable>

      {/* Continue listening */}
      <Section title="Continue listening" hint="Picks up where you paused">
        <Rail>
          {[current ?? tracks[0]!, tracks[2]!, tracks[8]!].map((t, i) => (
            <ContinueCard key={`${t.id}-${i}`} track={t} progress={[62, 28, 45][i]!} />
          ))}
        </Rail>
      </Section>

      {/* Recommended */}
      <Section
        title={purpose ? `Recommended for ${purpose.toLowerCase()}` : "Recommended for you"}
        hint={`${filtered.length} tracks`}
      >
        {filtered.length === 0 ? (
          <EmptyState
            title="Nothing here yet"
            body="We haven't sequenced a surāvali for this purpose in your path. Try another chip."
          />
        ) : (
          <Rail>
            {filtered.map((t) => (
              <TrackCard key={t.id} track={t} />
            ))}
          </Rail>
        )}
      </Section>

      {/* Recently played */}
      <Section title="Recently played">
        <View style={{ gap: 12 }}>
          {tracks.slice(0, 3).map((t) => (
            <TrackRow key={t.id} track={t} />
          ))}
        </View>
      </Section>

      {/* Popular today */}
      <Section title="Popular today" hint="Across all listeners">
        <Rail>
          {tracks.slice(3, 8).map((t) => (
            <TrackCard key={t.id} track={t} />
          ))}
        </Rail>
      </Section>

      {/* Therapeutic programs */}
      <Section title="Therapeutic programs">
        <Rail>
          {(catPrograms.length ? catPrograms : programs).map((p) => (
            <ProgramCard key={p.id} program={p} />
          ))}
        </Rail>
      </Section>

      {/* Premium programs */}
      <Section title="Premium programs" hint="Included with your plan">
        <Rail>
          {programs
            .filter((p) => p.premium)
            .map((p) => (
              <ProgramCard key={p.id} program={p} />
            ))}
        </Rail>
      </Section>

      {/* Arriving soon */}
      <Section title="Arriving soon" hint="Loading new sequences">
        <CardsLoading count={4} />
      </Section>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  greeting: {
    fontSize: 13,
    color: "#7C7A85",
  },
  name: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1A1A1A",
    fontFamily: "DMSans",
  },
  premiumBadge: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  premiumText: {
    fontSize: 11,
    fontWeight: "600",
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 4,
  },
  bellDot: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  searchBar: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 4,
  },
  searchText: {
    fontSize: 14,
    color: "#7C7A85",
  },
  chips: {
    marginTop: 20,
    gap: 10,
    paddingRight: 4,
  },
  featuredCard: {
    marginTop: 32,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 8,
  },
  featuredImage: {
    width: "100%",
    height: 200,
  },
  featuredOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(26,26,26,0.45)",
  },
  featuredContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  todayBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(245,241,235,0.95)",
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  todayText: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  featuredTitle: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: "600",
    color: "#F5F1EB",
    fontFamily: "DMSans",
  },
  featuredSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "rgba(245,241,235,0.85)",
  },
});
