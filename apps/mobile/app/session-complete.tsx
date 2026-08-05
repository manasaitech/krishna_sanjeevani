import React, { useState } from "react";
import { View, Text, Pressable, TextInput, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Sparkles } from "lucide-react-native";
import { useApp } from "@/lib/app-state";

const moods = [
  { emoji: "🌤️", label: "Calmer" },
  { emoji: "😌", label: "Rested" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "🌧️", label: "Heavy" },
];

export default function SessionComplete() {
  const { theme } = useApp();
  const router = useRouter();
  const [mood, setMood] = useState<string | null>("Calmer");
  const [rating, setRating] = useState(4);

  return (
    <SafeAreaView style={styles.container}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.iconWrap}>
          <View style={[styles.breatheCircle, { backgroundColor: theme.catLight }]} />
          <View style={[styles.iconCircle, { backgroundColor: theme.cat }]}>
            <Sparkles size={32} color={theme.catForeground} strokeWidth={1.6} />
          </View>
        </View>
        <Text style={styles.heading}>Session complete</Text>
        <Text style={styles.description}>
          That's 19 minutes of steady listening. Sit quietly for a moment before you move on.
        </Text>
      </View>

      {/* Rating + Mood */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Rate today's experience</Text>
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable
              key={n}
              onPress={() => setRating(n)}
              style={[
                styles.ratingBtn,
                n <= rating
                  ? { borderColor: theme.cat, backgroundColor: theme.cat }
                  : { borderColor: "#E8E4DC", backgroundColor: "#FFFFFF" },
              ]}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: n <= rating ? theme.catForeground : "#7C7A85",
                }}
              >
                {n}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 28 }]}>How do you feel?</Text>
        <View style={styles.moodRow}>
          {moods.map((m) => (
            <Pressable
              key={m.label}
              onPress={() => setMood(m.label)}
              style={[
                styles.moodBtn,
                mood === m.label
                  ? { borderColor: theme.cat, backgroundColor: theme.catLight }
                  : { borderColor: "#E8E4DC", backgroundColor: "#FFFFFF" },
              ]}
            >
              <Text style={{ fontSize: 20 }}>{m.emoji}</Text>
              <Text style={styles.moodLabel}>{m.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 28 }]}>
          Notes <Text style={{ fontWeight: "400", color: "#7C7A85" }}>(optional)</Text>
        </Text>
        <TextInput
          multiline
          numberOfLines={3}
          placeholder="Anything you noticed during the session"
          placeholderTextColor="#7C7A85"
          style={styles.textarea}
        />
      </View>

      {/* Continue button */}
      <Pressable
        onPress={() => router.replace("/(tabs)/home")}
        style={[styles.primaryBtn, { backgroundColor: "#264653" }]}
      >
        <Text style={styles.primaryBtnText}>Continue</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F1EB",
    paddingHorizontal: 24,
  },
  hero: {
    marginTop: 40,
    alignItems: "center",
  },
  iconWrap: {
    width: 112,
    height: 112,
    alignItems: "center",
    justifyContent: "center",
  },
  breatheCircle: {
    position: "absolute",
    width: 112,
    height: 112,
    borderRadius: 56,
    opacity: 0.6,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 8,
  },
  heading: {
    marginTop: 32,
    fontSize: 26,
    fontWeight: "600",
    color: "#1A1A1A",
    fontFamily: "DMSans",
  },
  description: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    color: "#7C7A85",
    maxWidth: 300,
  },
  card: {
    marginTop: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    backgroundColor: "#FFFFFF",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  ratingRow: {
    marginTop: 16,
    flexDirection: "row",
    gap: 8,
  },
  ratingBtn: {
    flex: 1,
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  moodRow: {
    marginTop: 16,
    flexDirection: "row",
    gap: 8,
  },
  moodBtn: {
    flex: 1,
    minHeight: 80,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  moodLabel: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: "500",
    color: "#1A1A1A",
  },
  textarea: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    backgroundColor: "#F5F1EB",
    borderRadius: 16,
    padding: 12,
    fontSize: 14,
    color: "#1A1A1A",
    textAlignVertical: "top",
    minHeight: 80,
  },
  primaryBtn: {
    marginTop: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    borderRadius: 16,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FAF8F4",
  },
});
