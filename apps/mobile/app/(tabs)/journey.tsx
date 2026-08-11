import React, { useState, useEffect, useMemo } from "react";
import { View, Text, TextInput, ScrollView, StyleSheet, Pressable, ActivityIndicator, Alert } from "react-native";
import { Baby, CalendarCheck, HeartPulse, Stethoscope } from "lucide-react-native";
import { AppShell } from "@/components/AppShell";
import { Section } from "@/components/layout-bits";
import { TrackRow } from "@/components/cards";
import { EmptyState, CardsLoading } from "@/components/States";
import { pregnancyTips, type Track } from "@/lib/content";
import { useApp } from "@/lib/app-state";
import { api, BASE_URL } from "@/lib/api";
import Svg, { Circle } from "react-native-svg";

const months = Array.from({ length: 9 }, (_, i) => i + 1);

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

function PregnancyOnboarding({ onComplete }: { onComplete: () => void }) {
  const { theme } = useApp();
  const [option, setOption] = useState<"lmp" | "edd" | "week">("lmp");
  const [edd, setEdd] = useState("");
  const [week, setWeek] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = async () => {
    setErrorMsg(null);
    if (option === "edd" || option === "lmp") {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(edd)) {
        setErrorMsg("Please enter date in YYYY-MM-DD format");
        return;
      }
      const parsedDate = new Date(edd);
      if (isNaN(parsedDate.getTime())) {
        setErrorMsg("Please enter a valid calendar date");
        return;
      }
    } else {
      const wkNum = parseInt(week, 10);
      if (isNaN(wkNum) || wkNum < 1 || wkNum > 40) {
        setErrorMsg("Please enter a week number between 1 and 40");
        return;
      }
    }

    setSaving(true);
    try {
      let submitEdd = undefined;
      if (option === "edd") {
        submitEdd = edd;
      } else if (option === "lmp") {
        const lmpDate = new Date(edd);
        const calculatedEddDate = new Date(lmpDate.getTime() + 280 * 24 * 60 * 60 * 1000);
        submitEdd = calculatedEddDate.toISOString().split("T")[0];
      }

      const res = await api.pregnancy.saveUserInfo({
        edd: submitEdd,
        currentWeek: option === "week" ? parseInt(week, 10) : undefined,
      });
      if (res.success) {
        onComplete();
      } else {
        setErrorMsg(res.message || "Failed to save settings");
      }
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Pregnancy Onboarding</Text>
      <Text style={styles.formSubtitle}>
        Configure your gestational details so we can customize your daily prenatal listening path.
      </Text>

      <View style={styles.toggleRow}>
        <Pressable
          onPress={() => { setOption("lmp"); setErrorMsg(null); }}
          style={[styles.toggleBtn, option === "lmp" && { backgroundColor: theme.cat }]}
        >
          <Text style={[styles.toggleText, option === "lmp" && { color: theme.catForeground }]}>
            LMP Date
          </Text>
        </Pressable>
        <Pressable
          onPress={() => { setOption("edd"); setErrorMsg(null); }}
          style={[styles.toggleBtn, option === "edd" && { backgroundColor: theme.cat }]}
        >
          <Text style={[styles.toggleText, option === "edd" && { color: theme.catForeground }]}>
            Due Date
          </Text>
        </Pressable>
        <Pressable
          onPress={() => { setOption("week"); setErrorMsg(null); }}
          style={[styles.toggleBtn, option === "week" && { backgroundColor: theme.cat }]}
        >
          <Text style={[styles.toggleText, option === "week" && { color: theme.catForeground }]}>
            Week
          </Text>
        </Pressable>
      </View>

      {option === "lmp" ? (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Last Period Date / Pregnancy Start Date</Text>
          <TextInput
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#7C7A85"
            value={edd}
            onChangeText={setEdd}
            style={styles.textInput}
          />
          <Text style={styles.inputHelper}>Enter the date you became pregnant. We will calculate the EDD (LMP + 280 days) dynamically.</Text>
        </View>
      ) : option === "edd" ? (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Estimated Due Date (EDD)</Text>
          <TextInput
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#7C7A85"
            value={edd}
            onChangeText={setEdd}
            style={styles.textInput}
          />
          <Text style={styles.inputHelper}>Enter your target due date to calculate gestational age.</Text>
        </View>
      ) : (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Current Gestational Week</Text>
          <TextInput
            placeholder="e.g. 12"
            placeholderTextColor="#7C7A85"
            keyboardType="number-pad"
            value={week}
            onChangeText={setWeek}
            style={styles.textInput}
          />
          <Text style={styles.inputHelper}>Enter your current pregnancy week (1 to 40).</Text>
        </View>
      )}

      {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

      <Pressable
        onPress={handleSave}
        disabled={saving}
        style={[styles.saveBtn, { backgroundColor: theme.cat }]}
      >
        {saving ? (
          <ActivityIndicator color={theme.catForeground} size="small" />
        ) : (
          <Text style={[styles.saveBtnText, { color: theme.catForeground }]}>
            Save and Start Journey
          </Text>
        )}
      </Pressable>
    </View>
  );
}

export default function Journey() {
  const { theme, tracks, loading } = useApp();
  const [pregnancyData, setPregnancyData] = useState<any>(null);
  const [fetchingData, setFetchingData] = useState(true);

  const fetchPregnancyDetails = () => {
    setFetchingData(true);
    api.pregnancy.getToday()
      .then((res) => {
        if (res.success && res.data) {
          setPregnancyData(res.data);
        }
      })
      .catch(() => {
        // Fail silently
      })
      .finally(() => {
        setFetchingData(false);
      });
  };

  useEffect(() => {
    fetchPregnancyDetails();
  }, []);

  // Compute gestational details based on API or default fallback
  const isSet = pregnancyData && !pregnancyData.setNeeded;
  const currentMonth = isSet ? (pregnancyData.gestationalDetails?.month ?? 5) : 5;
  const completed = isSet ? (pregnancyData.program?.progress?.completedTracks?.length ?? 0) : 0;
  const total = isSet ? (pregnancyData.program?.tracks?.length ?? 0) : 0;
  const pct = isSet ? (pregnancyData.program?.progress?.progressPercentage ?? 0) : 0;

  // Safely resolve today's track
  const today = useMemo(() => {
    if (isSet && pregnancyData.program?.tracks?.[0]) {
      const t = pregnancyData.program.tracks[0];
      return {
        ...t,
        art: t.thumbnailKey ? `${BASE_URL}/storage/file/${t.thumbnailKey}` : undefined,
        raga: t.subtitle || "",
        purpose: t.description || "Healing",
      };
    }
    return null;
  }, [pregnancyData, isSet]);

  const upcomingTracks = useMemo(() => {
    if (isSet && Array.isArray(pregnancyData.program?.tracks)) {
      return pregnancyData.program.tracks.slice(1).map((t: any) => ({
        ...t,
        art: t.thumbnailKey ? `${BASE_URL}/storage/file/${t.thumbnailKey}` : undefined,
        raga: t.subtitle || "",
        purpose: t.description || "Healing",
      }));
    }
    return [];
  }, [pregnancyData, isSet]);

  const isTodayCompleted = useMemo(() => {
    if (!isSet || !today || !pregnancyData.program?.progress?.completedTracks) return false;
    const completedList = pregnancyData.program.progress.completedTracks;
    return Array.isArray(completedList) && completedList.includes(today.id);
  }, [isSet, today, pregnancyData]);

  // Loading State
  if ((loading || fetchingData) && tracks.length === 0) {
    return (
      <AppShell bare>
        <Section title="Loading your pregnancy path...">
          <CardsLoading count={4} />
        </Section>
      </AppShell>
    );
  }

  // Onboarding / Config flow
  if (!isSet) {
    return (
      <AppShell bare>
        <PregnancyOnboarding onComplete={fetchPregnancyDetails} />
      </AppShell>
    );
  }

  return (
    <AppShell bare>
      {/* Header */}
      <View style={{ marginTop: 8 }}>
        <Text style={[styles.label, { color: theme.cat }]}>PREGNANCY JOURNEY</Text>
        <Text style={styles.heading}>Month {currentMonth} · {currentMonth <= 3 ? "First trimester" : currentMonth <= 6 ? "Second trimester" : "Third trimester"}</Text>
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
            <Text style={styles.smallLabel}>Active path</Text>
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
          <View style={[styles.recoHeader, { backgroundColor: isTodayCompleted ? "#E8F5E9" : theme.catLight }]}>
            <Baby size={14} color={isTodayCompleted ? "#2E7D32" : theme.cat} />
            <Text style={[styles.recoLabel, { color: isTodayCompleted ? "#2E7D32" : theme.cat }]}>
              MONTH {currentMonth} · {isTodayCompleted ? "COMPLETED" : "TODAY'S SESSION"}
            </Text>
          </View>
          <View style={{ padding: 12 }}>
            {today ? (
              <TrackRow track={today} programId={pregnancyData?.program?.id} />
            ) : (
              <Text style={{ fontSize: 13, color: "#7C7A85", textAlign: "center", padding: 12 }}>
                No pregnancy tracks available right now.
              </Text>
            )}
          </View>
        </View>
      </Section>

      {/* Upcoming sessions */}
      <Section title="Upcoming sessions">
        <View style={{ gap: 12 }}>
          {upcomingTracks.map((t: Track, i: number) => (
            <TrackRow key={t.id} track={t} index={i + 1} programId={pregnancyData?.program?.id} />
          ))}
          {upcomingTracks.length === 0 && (
            <Text style={{ fontSize: 13, color: "#7C7A85", padding: 12, textAlign: "center" }}>
              No upcoming pregnancy tracks scheduled.
            </Text>
          )}
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
  formContainer: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    backgroundColor: "#FFFFFF",
    marginTop: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 4,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1A1A1A",
    textAlign: "center",
  },
  formSubtitle: {
    fontSize: 13,
    color: "#7C7A85",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 18,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  toggleBtn: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  toggleText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1A1A1A",
  },
  inputGroup: {
    marginTop: 24,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  textInput: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    backgroundColor: "#F5F1EB",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1A1A1A",
  },
  inputHelper: {
    fontSize: 11,
    color: "#7C7A85",
    marginTop: 6,
  },
  saveBtn: {
    marginTop: 24,
    minHeight: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 12,
    color: "#D93838",
    textAlign: "center",
    marginTop: 16,
  },
});
