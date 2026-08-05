import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, Image, ScrollView, StyleSheet, Modal, Animated } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CheckCircle2,
  ChevronDown,
  Gauge,
  Heart,
  Info,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Timer,
  Waves,
  X,
} from "lucide-react-native";
// Using a simple View-based progress bar instead of @react-native-community/slider
import { useApp } from "@/lib/app-state";
import { formatTime } from "@/lib/content";
import { EmptyState } from "@/components/States";

const speeds = [0.75, 0.9, 1, 1.1, 1.25];
const timers = [10, 20, 30, 45, 60];

function EqualizerBar({
  playing,
  baseHeight,
  maxHeight,
  color,
  width = 3,
  gap = 3,
}: {
  playing: boolean;
  baseHeight: number;
  maxHeight: number;
  color: string;
  width?: number;
  gap?: number;
}) {
  const anim = useRef(new Animated.Value(baseHeight)).current;

  useEffect(() => {
    let active = true;
    const run = () => {
      if (!playing || !active) {
        Animated.timing(anim, {
          toValue: baseHeight,
          duration: 350,
          useNativeDriver: false,
        }).start();
        return;
      }
      const target = baseHeight + Math.random() * (maxHeight - baseHeight);
      Animated.timing(anim, {
        toValue: target,
        duration: 150 + Math.random() * 150,
        useNativeDriver: false,
      }).start(() => {
        if (active) run();
      });
    };

    run();

    return () => {
      active = false;
    };
  }, [playing]);

  return (
    <Animated.View
      style={{
        width,
        height: anim,
        borderRadius: width / 2,
        backgroundColor: color,
        marginHorizontal: gap / 2,
      }}
    />
  );
}

function Waveform({ playing, color }: { playing: boolean; color: string }) {
  return (
    <View style={styles.waveformContainer}>
      {Array.from({ length: 44 }).map((_, i) => {
        const base = 12 + Math.abs(Math.sin(i / 2.6)) * 12;
        const max = base + 16 + Math.abs(Math.sin(i / 1.8)) * 18;
        return (
          <EqualizerBar
            key={i}
            playing={playing}
            baseHeight={base}
            maxHeight={max}
            color={`${color}B0`}
            width={3}
            gap={2}
          />
        );
      })}
    </View>
  );
}

export default function Player() {
  const {
    current,
    playing,
    toggle,
    position,
    seek,
    skip,
    speed,
    setSpeed,
    sleepTimer,
    setSleepTimer,
    isFavorite,
    toggleFavorite,
    theme,
  } = useApp();
  const router = useRouter();
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (!current) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ paddingHorizontal: 24, paddingTop: 64 }}>
          <EmptyState
            icon={<Waves size={24} color={theme.cat} />}
            title="Nothing is playing"
            body="Choose a surāvali from home and it will appear here with its listening guidance."
            action={
              <Pressable
                onPress={() => router.back()}
                style={[styles.primaryBtn, { backgroundColor: "#264653" }]}
              >
                <Text style={styles.primaryBtnText}>Browse sessions</Text>
              </Pressable>
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  const fav = isFavorite(current.id);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconCircle}>
            <ChevronDown size={20} color="#1A1A1A" />
          </Pressable>
          <Text style={styles.nowPlaying}>NOW PLAYING</Text>
          <Pressable onPress={() => setInstructionsOpen(true)} style={styles.iconCircle}>
            <Info size={18} color="#1A1A1A" />
          </Pressable>
        </View>

        {/* Artwork */}
        <View style={styles.artWrap}>
          <View style={[styles.artGlow, { backgroundColor: theme.catLight }]} />
          <Image source={current.art} style={styles.art} resizeMode="cover" />
        </View>

        {/* Title */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.subtitle}>
            {current.raga} · {current.subtitle}
          </Text>
          <View style={[styles.purposeBadge, { backgroundColor: theme.catLight }]}>
            <Text style={[styles.purposeText, { color: theme.cat }]}>{current.purpose}</Text>
          </View>
        </View>

        {/* Waveform */}
        <Waveform playing={playing} color={theme.cat} />

        {/* Seek slider */}
        <View style={styles.sliderWrap}>
          <Pressable
            onPress={(e) => {
              const ratio = Math.max(0, Math.min(1, (e.nativeEvent as any).locationX / 300));
              seek(Math.floor(ratio * current.duration));
            }}
            style={{ height: 40, justifyContent: "center" }}
          >
            <View style={{ height: 4, borderRadius: 2, backgroundColor: "#E8E4DC", overflow: "hidden" }}>
              <View
                style={{
                  height: "100%",
                  width: `${(position / current.duration) * 100}%`,
                  backgroundColor: theme.cat,
                  borderRadius: 2,
                }}
              />
            </View>
          </Pressable>
          <View style={styles.timeRow}>
            <Text style={styles.time}>{formatTime(position)}</Text>
            <Text style={styles.time}>-{formatTime(Math.max(0, current.duration - position))}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable
            onPress={() => toggleFavorite(current.id)}
            style={[styles.iconCircle, fav && { borderColor: theme.cat }]}
          >
            <Heart size={20} color={fav ? theme.cat : "#7C7A85"} fill={fav ? theme.cat : "none"} />
          </Pressable>
          <Pressable onPress={() => skip(-15)} style={styles.skipBtn}>
            <RotateCcw size={24} color="#1A1A1A" strokeWidth={1.8} />
          </Pressable>
          <Pressable
            onPress={toggle}
            style={[styles.playBtn, { backgroundColor: theme.cat }]}
          >
            {playing ? (
              <Pause size={28} color={theme.catForeground} fill={theme.catForeground} />
            ) : (
              <Play size={28} color={theme.catForeground} fill={theme.catForeground} />
            )}
          </Pressable>
          <Pressable onPress={() => skip(30)} style={styles.skipBtn}>
            <RotateCw size={24} color="#1A1A1A" strokeWidth={1.8} />
          </Pressable>
          <Pressable onPress={() => setSettingsOpen(true)} style={styles.iconCircle}>
            <Gauge size={20} color="#7C7A85" />
          </Pressable>
        </View>

        {/* Info cards */}
        <View style={{ gap: 12, marginTop: 36 }}>
          <Pressable
            onPress={() => setInstructionsOpen(true)}
            style={styles.infoCard}
          >
            <Text style={styles.infoLabel}>LISTENING INSTRUCTIONS</Text>
            <Text numberOfLines={2} style={styles.infoBody}>
              {current.instructions}
            </Text>
          </Pressable>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>RECOMMENDED FREQUENCY</Text>
            <Text style={styles.infoBody}>{current.frequency}</Text>
          </View>
        </View>

        {/* Complete button */}
        <Pressable
          onPress={() => router.push("/session-complete")}
          style={[styles.primaryBtn, { backgroundColor: "#264653", marginTop: 32 }]}
        >
          <CheckCircle2 size={16} color="#FAF8F4" />
          <Text style={styles.primaryBtnText}>Session completed</Text>
        </Pressable>
        <Text style={styles.disclaimer}>
          Streaming only · sessions are guided, never downloaded
        </Text>
      </ScrollView>

      {/* Instructions Modal */}
      <Modal visible={instructionsOpen} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setInstructionsOpen(false)}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Listening instructions</Text>
            <Text style={styles.modalBody}>{current.instructions}</Text>
            <View style={[styles.freqCard, { backgroundColor: theme.catLight }]}>
              <Text style={[styles.freqLabel, { color: theme.cat }]}>RECOMMENDED FREQUENCY</Text>
              <Text style={styles.freqValue}>{current.frequency}</Text>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Settings Modal */}
      <Modal visible={settingsOpen} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setSettingsOpen(false)}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Session settings</Text>
            <Text style={[styles.modalBody, { marginBottom: 24 }]}>
              Gentle adjustments — the sequence keeps its therapeutic shape.
            </Text>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Gauge size={16} color={theme.cat} />
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#1A1A1A" }}>Playback speed</Text>
            </View>
            <View style={styles.chipsRow}>
              {speeds.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setSpeed(s)}
                  style={[
                    styles.chip,
                    speed === s
                      ? { borderColor: theme.cat, backgroundColor: theme.cat }
                      : { borderColor: "#E8E4DC", backgroundColor: "#FFFFFF" },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color: speed === s ? theme.catForeground : "#7C7A85",
                    }}
                  >
                    {s}×
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 28, marginBottom: 12 }}>
              <Timer size={16} color={theme.cat} />
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#1A1A1A" }}>Sleep timer</Text>
            </View>
            <View style={styles.chipsRow}>
              <Pressable
                onPress={() => setSleepTimer(null)}
                style={[
                  styles.chip,
                  sleepTimer === null
                    ? { borderColor: theme.cat, backgroundColor: theme.cat }
                    : { borderColor: "#E8E4DC", backgroundColor: "#FFFFFF" },
                ]}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: sleepTimer === null ? theme.catForeground : "#7C7A85",
                  }}
                >
                  Off
                </Text>
              </Pressable>
              {timers.map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setSleepTimer(m)}
                  style={[
                    styles.chip,
                    sleepTimer === m
                      ? { borderColor: theme.cat, backgroundColor: theme.cat }
                      : { borderColor: "#E8E4DC", backgroundColor: "#FFFFFF" },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color: sleepTimer === m ? theme.catForeground : "#7C7A85",
                    }}
                  >
                    {m} min
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F1EB" },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 56 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 8,
    paddingBottom: 16,
  },
  iconCircle: {
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
  nowPlaying: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 2,
    color: "#7C7A85",
    textAlign: "center",
  },
  artWrap: {
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  artGlow: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 36,
    opacity: 0.6,
  },
  art: {
    width: 280,
    height: 280,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
  },
  titleBlock: { marginTop: 32, alignItems: "center" },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1A1A1A",
    textAlign: "center",
    fontFamily: "DMSans",
  },
  subtitle: { marginTop: 6, fontSize: 14, color: "#7C7A85", textAlign: "center" },
  purposeBadge: {
    marginTop: 16,
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  purposeText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  waveformContainer: {
    marginTop: 24,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  waveBar: { width: 3, borderRadius: 1.5 },
  sliderWrap: { marginTop: 8 },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -4,
  },
  time: { fontSize: 12, color: "#7C7A85", fontVariant: ["tabular-nums"] },
  controls: {
    marginTop: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  skipBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  playBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 8,
  },
  infoCard: {
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
  infoLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    color: "#7C7A85",
  },
  infoBody: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 22,
    color: "#1A1A1A",
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
  disclaimer: {
    marginTop: 16,
    fontSize: 12,
    color: "#7C7A85",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E8E4DC",
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1A1A1A",
    fontFamily: "DMSans",
  },
  modalBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: "#7C7A85",
  },
  freqCard: {
    marginTop: 24,
    borderRadius: 20,
    padding: 16,
  },
  freqLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
  },
  freqValue: {
    marginTop: 6,
    fontSize: 14,
    color: "#1A1A1A",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    minHeight: 44,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
