import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, Image, StyleSheet } from "react-native";
import { Clock, Search as SearchIcon, TrendingUp, X } from "lucide-react-native";
import { AppShell } from "@/components/AppShell";
import { Chip, Rail, Section } from "@/components/layout-bits";
import { ProgramCard, TrackRow } from "@/components/cards";
import { EmptyState, ListLoading } from "@/components/States";
import {
  categories,
  programs,
  purposes,
  recentSearches,
  tracks,
  trendingSearches,
} from "@/lib/content";
import { useApp } from "@/lib/app-state";

export default function SearchScreen() {
  const { setCategory, theme } = useApp();
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return null;
    return {
      tracks: tracks.filter((t) =>
        [t.title, t.raga, t.purpose, t.subtitle].join(" ").toLowerCase().includes(s)
      ),
      programs: programs.filter((p) =>
        [p.title, p.subtitle].join(" ").toLowerCase().includes(s)
      ),
    };
  }, [q]);

  return (
    <AppShell bare>
      <Text style={styles.heading}>Search</Text>

      {/* Search input */}
      <View style={styles.searchBar}>
        <SearchIcon size={18} color="#7C7A85" />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Raga, purpose, or program"
          placeholderTextColor="#7C7A85"
          style={styles.input}
        />
        {q.length > 0 && (
          <Pressable onPress={() => setQ("")} style={styles.clearBtn}>
            <X size={16} color="#7C7A85" />
          </Pressable>
        )}
      </View>

      {!results ? (
        <>
          <Section title="Recent searches">
            <View style={styles.listCard}>
              {recentSearches.map((r, i) => (
                <Pressable
                  key={r}
                  onPress={() => setQ(r)}
                  style={[
                    styles.listRow,
                    i < recentSearches.length - 1 && styles.listRowBorder,
                  ]}
                >
                  <Clock size={16} color="#7C7A85" />
                  <Text style={styles.listText}>{r}</Text>
                </Pressable>
              ))}
            </View>
          </Section>

          <Section title="Trending">
            <View style={styles.chipsWrap}>
              {trendingSearches.map((t) => (
                <Chip key={t} onPress={() => setQ(t)}>
                  {t}
                </Chip>
              ))}
            </View>
          </Section>

          <Section title="Browse paths">
            <View style={{ gap: 12 }}>
              {categories.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => setCategory(c.id)}
                  style={styles.pathCard}
                >
                  <Image source={c.art} style={styles.pathImage} />
                  <Text style={styles.pathName}>{c.name}</Text>
                </Pressable>
              ))}
            </View>
          </Section>

          <Section title="Purposes">
            <View style={styles.chipsWrap}>
              {purposes.map((p) => (
                <Chip key={p} onPress={() => setQ(p)}>
                  {p}
                </Chip>
              ))}
            </View>
          </Section>

          <Section title="Suggested tracks">
            <View style={{ gap: 12 }}>
              {tracks.slice(0, 3).map((t) => (
                <TrackRow key={t.id} track={t} />
              ))}
            </View>
          </Section>

          <Section title="Suggested programs">
            <Rail>
              {programs.map((p) => (
                <ProgramCard key={p.id} program={p} />
              ))}
            </Rail>
          </Section>
        </>
      ) : results.tracks.length === 0 && results.programs.length === 0 ? (
        <View style={{ marginTop: 40 }}>
          <EmptyState
            icon={<SearchIcon size={24} color={theme.cat} />}
            title={`No results for "${q}"`}
            body="Try a raga name like Neelambari, a purpose like Sleep, or a pregnancy month."
          />
        </View>
      ) : (
        <>
          {results.tracks.length > 0 && (
            <Section title="Tracks" hint={`${results.tracks.length} found`}>
              <View style={{ gap: 12 }}>
                {results.tracks.map((t) => (
                  <TrackRow key={t.id} track={t} />
                ))}
              </View>
            </Section>
          )}
          {results.programs.length > 0 && (
            <Section title="Programs">
              <Rail>
                {results.programs.map((p) => (
                  <ProgramCard key={p.id} program={p} />
                ))}
              </Rail>
            </Section>
          )}
        </>
      )}
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
  searchBar: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
  input: {
    flex: 1,
    minHeight: 52,
    fontSize: 15,
    color: "#1A1A1A",
  },
  clearBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  listCard: {
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
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  listRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#E8E4DC",
  },
  listText: {
    fontSize: 14,
    color: "#1A1A1A",
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pathCard: {
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
  pathImage: {
    width: "100%",
    height: 96,
  },
  pathName: {
    padding: 16,
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
});
