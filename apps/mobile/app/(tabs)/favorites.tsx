import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Heart } from "lucide-react-native";
import { useRouter } from "expo-router";
import { AppShell } from "@/components/AppShell";
import { ContinueCard, ProgramCard, TrackRow } from "@/components/cards";
import { Rail, Section } from "@/components/layout-bits";
import { EmptyState } from "@/components/States";
import { useApp } from "@/lib/app-state";

export default function Favorites() {
  const { favorites, savedPrograms, current, theme, tracks, programs, continueListeningList } = useApp();
  const router = useRouter();
  const [tab, setTab] = useState<"tracks" | "programs">("tracks");

  const savedTracks = tracks.filter((t) => favorites.includes(t.id));
  const savedProgramList = programs.filter((p) => savedPrograms.includes(p.id));

  return (
    <AppShell bare>
      <Text style={styles.heading}>Saved</Text>
      <Text style={styles.meta}>
        {savedTracks.length} tracks · {savedProgramList.length} programs
      </Text>

      {/* Tab toggle */}
      <View style={styles.tabBar}>
        {(["tracks", "programs"] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[
              styles.tabBtn,
              tab === t && { backgroundColor: theme.cat },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                tab === t && { color: theme.catForeground },
              ]}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === "tracks" ? (
        <Section title="Saved tracks" style={{ marginTop: 32 }}>
          {savedTracks.length ? (
            <View style={{ gap: 12 }}>
              {savedTracks.map((t) => (
                <TrackRow key={t.id} track={t} />
              ))}
            </View>
          ) : (
            <EmptyState
              icon={<Heart size={24} color={theme.cat} />}
              title="No saved tracks yet"
              body="Tap the heart on any surāvali and it will wait for you here."
              action={
                <Pressable
                  onPress={() => router.push("/(tabs)/home")}
                  style={styles.actionBtn}
                >
                  <Text style={styles.actionBtnText}>Explore sessions</Text>
                </Pressable>
              }
            />
          )}
        </Section>
      ) : (
        <Section title="Saved programs" style={{ marginTop: 32 }}>
          {savedProgramList.length ? (
            <Rail>
              {savedProgramList.map((p) => (
                <ProgramCard key={p.id} program={p} />
              ))}
            </Rail>
          ) : (
            <EmptyState
              title="No saved programs"
              body="Save a therapeutic program to follow it day by day."
            />
          )}
        </Section>
      )}

      <Section title="Continue listening">
        {continueListeningList.length ? (
          <Rail>
            {continueListeningList.map((item, i) => (
              <ContinueCard
                key={`${item.track.id}-${i}`}
                track={item.track}
                progress={item.progressPercentage}
                programId={item.programId || undefined}
              />
            ))}
          </Rail>
        ) : (
          <Text style={{ fontSize: 13, color: "#7C7A85", paddingHorizontal: 24, paddingVertical: 12 }}>
            No sessions in progress. Explore home to start listening!
          </Text>
        )}
      </Section>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  heading: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: "600",
    color: "#1A1A1A",
    fontFamily: "DMSans",
  },
  meta: {
    marginTop: 8,
    fontSize: 14,
    color: "#7C7A85",
  },
  tabBar: {
    marginTop: 24,
    flexDirection: "row",
    gap: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    backgroundColor: "#FFFFFF",
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7C7A85",
    textTransform: "capitalize",
  },
  actionBtn: {
    minHeight: 44,
    borderRadius: 16,
    backgroundColor: "#264653",
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FAF8F4",
  },
});
