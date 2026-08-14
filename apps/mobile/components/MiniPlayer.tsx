import React from "react";
import { View, Text, Image, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Pause, Play, SkipForward } from "lucide-react-native";
import { useApp } from "@/lib/app-state";
import { formatTime } from "@/lib/content";
import { resolveImageSource } from "@/lib/utils";

export function MiniPlayer({ lifted = true }: { lifted?: boolean }) {
  const { current, playing, toggle, position, next, theme, buffering } = useApp();
  const router = useRouter();
  if (!current) return null;

  const progress = Math.min(100, (position / current.duration) * 100);

  return (
    <View
      style={[
        styles.container,
        { bottom: lifted ? 12 : 16 },
      ]}
    >
      <View style={styles.card}>
        <Pressable
          onPress={() => router.push("/player")}
          style={styles.info}
        >
          <Image
            source={resolveImageSource(current.art, current.category)}
            style={styles.art}
            resizeMode="cover"
          />
          <View style={styles.textContainer}>
            <Text numberOfLines={1} style={styles.title}>
              {current.title}
            </Text>
            <Text numberOfLines={1} style={styles.subtitle}>
              {current.raga} · {formatTime(position)} / {formatTime(current.duration)}
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={toggle}
          disabled={buffering}
          style={[styles.playBtn, { backgroundColor: theme.cat }, buffering && { opacity: 0.85 }]}
        >
          {buffering ? (
            <ActivityIndicator size="small" color={theme.catForeground} />
          ) : playing ? (
            <Pause size={16} color={theme.catForeground} fill={theme.catForeground} />
          ) : (
            <Play size={16} color={theme.catForeground} fill={theme.catForeground} />
          )}
        </Pressable>

        <Pressable
          onPress={next}
          style={styles.skipBtn}
        >
          <SkipForward size={16} color="#7C7A85" />
        </Pressable>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%`, backgroundColor: theme.cat },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 40,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 8,
    overflow: "hidden",
  },
  info: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },
  art: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
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
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  skipBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  progressTrack: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#E8E4DC",
  },
  progressFill: {
    height: "100%",
  },
});
