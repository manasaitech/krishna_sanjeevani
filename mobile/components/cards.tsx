import React from "react";
import { View, Text, Pressable, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Heart, Lock, Pause, Play } from "lucide-react-native";
import { useApp } from "@/lib/app-state";
import { categories, formatDuration, type Track, type Program } from "@/lib/content";

/* ── Favorite button ── */
export function FavoriteButton({ id }: { id: string }) {
  const { isFavorite, toggleFavorite, theme } = useApp();
  const active = isFavorite(id);
  return (
    <Pressable
      onPress={() => toggleFavorite(id)}
      style={styles.iconBtn}
    >
      <Heart
        size={18}
        color={active ? theme.cat : "#7C7A85"}
        fill={active ? theme.cat : "none"}
      />
    </Pressable>
  );
}

/* ── Play button ── */
export function PlayButton({ track, small = false }: { track: Track; small?: boolean }) {
  const { current, playing, play, toggle, theme } = useApp();
  const isCurrent = current?.id === track.id;
  const isPlaying = isCurrent && playing;
  const size = small ? 44 : 48;

  return (
    <Pressable
      onPress={() => (isCurrent ? toggle() : play(track))}
      style={[
        styles.playBtn,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.cat,
        },
      ]}
    >
      {isPlaying ? (
        <Pause size={16} color={theme.catForeground} fill={theme.catForeground} />
      ) : (
        <Play size={16} color={theme.catForeground} fill={theme.catForeground} />
      )}
    </Pressable>
  );
}

/* ── Track card (vertical, for rails) ── */
export function TrackCard({ track }: { track: Track }) {
  const { theme } = useApp();

  return (
    <View style={styles.trackCard}>
      <View style={styles.trackCardImageWrap}>
        <Image source={track.art} style={styles.trackCardImage} resizeMode="cover" />
        <View style={styles.trackCardOverlay}>
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{formatDuration(track.duration)}</Text>
          </View>
          <PlayButton track={track} small />
        </View>
        {track.premium && (
          <View style={styles.lockBadge}>
            <Lock size={14} color={theme.cat} />
          </View>
        )}
      </View>
      <View style={styles.trackCardInfo}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={styles.trackTitle}>{track.title}</Text>
          <Text numberOfLines={1} style={styles.trackSubtitle}>{track.raga}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
            <View style={[styles.catBadge, { backgroundColor: theme.catLight }]}>
              <Text style={[styles.catBadgeText, { color: theme.cat }]}>
                {categories.find((c) => c.id === track.category)?.name.split(" ")[0]}
              </Text>
            </View>
            <Text style={{ fontSize: 11, color: "#7C7A85" }}>{track.purpose}</Text>
          </View>
        </View>
        <FavoriteButton id={track.id} />
      </View>
    </View>
  );
}

/* ── Track row (horizontal, for lists) ── */
export function TrackRow({ track, index }: { track: Track; index?: number }) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push("/player")}
      style={styles.trackRow}
    >
      {typeof index === "number" && (
        <Text style={styles.indexText}>{index + 1}</Text>
      )}
      <Image source={track.art} style={styles.rowArt} resizeMode="cover" />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={styles.trackTitle}>{track.title}</Text>
        <Text numberOfLines={1} style={styles.trackSubtitle}>
          {track.raga} · {formatDuration(track.duration)} · {track.purpose}
        </Text>
      </View>
      <FavoriteButton id={track.id} />
      <PlayButton track={track} small />
    </Pressable>
  );
}

/* ── Continue card (horizontal, for rails) ── */
export function ContinueCard({ track, progress }: { track: Track; progress: number }) {
  const { theme } = useApp();

  return (
    <View style={styles.continueCard}>
      <Image source={track.art} style={styles.continueArt} resizeMode="cover" />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={styles.trackTitle}>{track.title}</Text>
        <Text numberOfLines={1} style={styles.trackSubtitle}>{track.purpose}</Text>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%`, backgroundColor: theme.cat },
            ]}
          />
        </View>
      </View>
      <PlayButton track={track} small />
    </View>
  );
}

/* ── Program card (vertical, for rails) ── */
export function ProgramCard({ program }: { program: Program }) {
  const { theme } = useApp();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/program/${program.id}`)}
      style={styles.programCard}
    >
      <View style={{ overflow: "hidden", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
        <Image source={program.art} style={styles.programArt} resizeMode="cover" />
        {program.premium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>Premium</Text>
          </View>
        )}
      </View>
      <View style={{ padding: 16 }}>
        <Text numberOfLines={1} style={styles.trackTitle}>{program.title}</Text>
        <Text numberOfLines={1} style={[styles.trackSubtitle, { marginTop: 4 }]}>
          {program.subtitle}
        </Text>
        <Text style={[styles.catBadgeText, { color: theme.cat, marginTop: 12, fontSize: 11 }]}>
          {program.sessions} sessions · {program.days} days
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  playBtn: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 4,
  },
  trackCard: {
    width: 176,
  },
  trackCardImageWrap: {
    width: 176,
    height: 176,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 4,
  },
  trackCardImage: {
    width: 176,
    height: 176,
  },
  trackCardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    padding: 10,
  },
  durationBadge: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  durationText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  lockBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  trackCardInfo: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 4,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  trackSubtitle: {
    fontSize: 12,
    color: "#7C7A85",
    marginTop: 2,
  },
  catBadge: {
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  catBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  trackRow: {
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
  indexText: {
    width: 16,
    textAlign: "center",
    fontSize: 12,
    color: "#7C7A85",
    fontVariant: ["tabular-nums"],
  },
  rowArt: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  continueCard: {
    width: 288,
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
  continueArt: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "#F0ECE4",
    marginTop: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  programCard: {
    width: 256,
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
  programArt: {
    width: 256,
    height: 160,
  },
  premiumBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#1A1A1A",
  },
});
