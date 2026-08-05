import React from "react";
import { View, Text, TextInput, ScrollView, StyleSheet } from "react-native";
import { Baby, CalendarCheck, HeartPulse, Stethoscope } from "lucide-react-native";
import { AppShell } from "@/components/AppShell";
import { Section } from "@/components/layout-bits";
import { TrackRow } from "@/components/cards";
import { pregnancyTips, tracks } from "@/lib/content";
import { useApp } from "@/lib/app-state";
import Svg, { Circle } from "react-native-svg";

const months = Array.from({ length: 9 }, (_, i) => i + 1);
const currentMonth = 5;
const completed = 18;
const total = 24;

function ProgressRing({ value }: { value: number }) {
  const { theme } = useApp();
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;

  return (
    <View style={styles.ringWrap}>
      <Svg width={128} height={128} viewBox="0 0 120 120" style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle cx="60" cy="60" r={r} fill="none" stroke="#E8E4DC" strokeWidth={8} />
        <Circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={theme.cat}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={`${c}`}
          strokeDashoffset={offset}
        />
      </Svg>
      <View style={styles.ringCenter}>
        <Text style={styles.ringValue}>{value}%</Text>
        <Text style={styles.ringLabel}>complete</Text>
      </View>
    </View>
  );
}

export default function Journey() {
  const { theme } = useApp();
  const pct = Math.round((completed / total) * 100);
  const today = tracks.find((t) => t.id === "t5")!;

  return (
    <AppShell bare>
      {/* Header */}
      <View style={{ marginTop: 8 }}>
        <Text style={[styles.label, { color: theme.cat }]}>PREGNANCY JOURNEY</Text>
        <Text style={styles.heading}>Month {currentMonth} · Second trimester</Text>
        <Text style={styles.description}>
          Gentle sequences chosen for this stage. Nothing strenuous, nothing loud.
        </Text>
      </View>

      {/* Progress card */}
      <View style={styles.progressCard}>
        <ProgressRing value={pct} />
        <View style={{ flex: 1, gap: 12 }}>
          <View>
            <Text style={styles.bigNum}>
              {completed}
              <Text style={styles.totalNum}> / {total}</Text>
            </Text>
            <Text style={styles.smallLabel}>Sessions completed</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <CalendarCheck size={16} color={theme.cat} />
            <Text style={styles.smallLabel}>6 day streak</Text>
          </View>
        </View>
      </View>

      {/* Timeline */}
      <Section title="Your timeline">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12 }}
        >
          {months.map((m) => {
            const done = m < currentMonth;
            const active = m === currentMonth;
            return (
              <View
                key={m}
                style={[
                  styles.timelineItem,
                  {
                    borderColor: active ? theme.cat : "#E8E4DC",
                    backgroundColor: active
                      ? theme.cat
                      : done
                      ? theme.catLight
                      : "#FFFFFF",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.timelineLabel,
                    { color: active ? theme.catForeground : "#7C7A85" },
                  ]}
                >
                  MONTH
                </Text>
                <Text
                  style={[
                    styles.timelineNum,
                    {
                      color: active
                        ? theme.catForeground
                        : done
                        ? theme.cat
                        : "#7C7A85",
                    },
                  ]}
                >
                  {m}
                </Text>
                <Text
                  style={[
                    styles.timelineStatus,
                    { color: active ? theme.catForeground : "#7C7A85" },
                  ]}
                >
                  {done ? "Complete" : active ? "In progress" : "Upcoming"}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </Section>

      {/* Today's recommendation */}
      <Section title="Today's recommendation">
        <View style={styles.recoCard}>
          <View style={[styles.recoHeader, { backgroundColor: theme.catLight }]}>
            <Baby size={14} color={theme.cat} />
            <Text style={[styles.recoLabel, { color: theme.cat }]}>
              MONTH {currentMonth} · EVENING
            </Text>
          </View>
          <View style={{ padding: 12 }}>
            <TrackRow track={today} />
          </View>
        </View>
      </Section>

      {/* Upcoming sessions */}
      <Section title="Upcoming sessions">
        <View style={{ gap: 12 }}>
          {tracks
            .filter((t) => t.category === "pregnancy" || t.purpose === "Sleep")
            .slice(0, 3)
            .map((t) => (
              <TrackRow key={t.id} track={t} />
            ))}
        </View>
      </Section>

      {/* Baby wellness tips */}
      <Section title="Baby wellness tips">
        <View style={{ gap: 12 }}>
          {pregnancyTips.map((tip) => (
            <View key={tip} style={styles.tipCard}>
              <HeartPulse size={16} color={theme.cat} style={{ marginTop: 2 }} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </Section>

      {/* Doctor note */}
      <Section title="Doctor note">
        <View style={styles.doctorCard}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={[styles.doctorAvatar, { backgroundColor: theme.catLight }]}>
              <Stethoscope size={20} color={theme.cat} />
            </View>
            <View>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#1A1A1A" }}>
                Dr. Meera Iyer
              </Text>
              <Text style={{ fontSize: 12, color: "#7C7A85" }}>
                Obstetrics · reviewed 3 days ago
              </Text>
            </View>
          </View>
          <Text style={styles.doctorNote}>
            "Continue the evening sequences at low volume. Add the Month 6 set only after your
            next scan. Stop any session that causes discomfort."
          </Text>
          <Text style={styles.noteLabel}>Add a note for your next visit</Text>
          <TextInput
            multiline
            numberOfLines={3}
            placeholder="How did this week's sessions feel?"
            placeholderTextColor="#7C7A85"
            style={styles.noteInput}
          />
        </View>
      </Section>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 2,
  },
  heading: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: "600",
    color: "#1A1A1A",
    fontFamily: "DMSans",
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: "#7C7A85",
  },
  progressCard: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
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
  ringWrap: {
    width: 128,
    height: 128,
    alignItems: "center",
    justifyContent: "center",
  },
  ringCenter: {
    position: "absolute",
    alignItems: "center",
  },
  ringValue: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1A1A1A",
    fontVariant: ["tabular-nums"],
  },
  ringLabel: {
    fontSize: 11,
    color: "#7C7A85",
  },
  bigNum: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1A1A1A",
    fontVariant: ["tabular-nums"],
  },
  totalNum: {
    fontSize: 14,
    fontWeight: "500",
    color: "#7C7A85",
  },
  smallLabel: {
    fontSize: 12,
    color: "#7C7A85",
  },
  timelineItem: {
    width: 96,
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
  },
  timelineLabel: {
    fontSize: 10,
    letterSpacing: 1,
  },
  timelineNum: {
    fontSize: 20,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  timelineStatus: {
    marginTop: 4,
    fontSize: 10,
  },
  recoCard: {
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
  recoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  recoLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
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
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: "#1A1A1A",
  },
  doctorCard: {
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
  doctorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  doctorNote: {
    marginTop: 16,
    fontSize: 14,
    lineHeight: 22,
    color: "#7C7A85",
  },
  noteLabel: {
    marginTop: 20,
    fontSize: 12,
    fontWeight: "500",
    color: "#7C7A85",
  },
  noteInput: {
    marginTop: 8,
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
});
