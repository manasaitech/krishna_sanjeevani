import React, { useMemo, useState, useEffect } from "react";
import { View, Text, Pressable, Image, ScrollView, StyleSheet, Modal, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Bell, Crown, Search as SearchIcon, Sparkles, CheckCheck, RefreshCw, X } from "lucide-react-native";
import { AppShell } from "@/components/AppShell";
import { Chip, Rail, Section } from "@/components/layout-bits";
import { ContinueCard, ProgramCard, TrackCard, TrackRow } from "@/components/cards";
import { CardsLoading, EmptyState } from "@/components/States";
import { useApp } from "@/lib/app-state";
import { purposes } from "@/lib/content";
import { resolveImageSource } from "@/lib/utils";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Home() {
  const {
    category,
    current,
    theme,
    user,
    trackProgress,
    tracks,
    programs,
    loading,
    fetchTracksAndPrograms,
    historyList,
    continueListeningList,
    fetchHistoryAndContinueListening,
    notifications,
    unreadCount,
    notificationsLoading,
    notificationsError,
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useApp();
  const userName = user?.profile?.fullName || user?.email?.split("@")[0] || "Guest";
  const router = useRouter();
  const [purpose, setPurpose] = useState<string | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const catTracks = useMemo(
    () => tracks.filter((t) => t.category === category),
    [category, tracks]
  );
  const filtered = useMemo(
    () => (purpose ? tracks.filter((t) => t.purpose === purpose) : catTracks),
    [purpose, catTracks, tracks]
  );
  const catPrograms = useMemo(
    () => programs.filter((p) => p.category === category),
    [category, programs]
  );

  useEffect(() => {
    fetchHistoryAndContinueListening();
  }, [fetchHistoryAndContinueListening]);
  const featured = catTracks[0] ?? tracks[0];

  // Loading State
  if (loading && tracks.length === 0) {
    return (
      <AppShell bare>
        <View style={styles.header}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.name} numberOfLines={1}>
              {userName}
            </Text>
          </View>
        </View>
        <Section title="Loading your sessions...">
          <CardsLoading count={4} />
        </Section>
      </AppShell>
    );
  }

  // Empty / Error State
  if (tracks.length === 0) {
    return (
      <AppShell bare>
        <View style={styles.header}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.name} numberOfLines={1}>
              {userName}
            </Text>
          </View>
        </View>
        <View style={{ marginTop: 40, paddingHorizontal: 20 }}>
          <EmptyState
            title="Unable to load catalog"
            body="We couldn't retrieve the therapeutic sessions from the backend. Please check your network."
            action={
              <Pressable
                onPress={() => fetchTracksAndPrograms(category)}
                style={{
                  minHeight: 44,
                  borderRadius: 16,
                  backgroundColor: "#264653",
                  paddingHorizontal: 24,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 16,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#FAF8F4" }}>Retry</Text>
              </Pressable>
            }
          />
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell bare>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.greeting}>{greeting()},</Text>
          <Text style={styles.name} numberOfLines={1}>
            {userName}
          </Text>
          <View style={[styles.premiumBadge, { backgroundColor: theme.catLight }]}>
            <Crown size={14} color={theme.cat} />
            <Text style={[styles.premiumText, { color: theme.cat }]}>Premium member</Text>
          </View>
        </View>
        <Pressable
          onPress={() => setNotificationsOpen(!notificationsOpen)}
          style={styles.bellBtn}
        >
          <Bell size={18} color="#1A1A1A" />
          {unreadCount > 0 && (
            <View style={[styles.badgeContainer, { backgroundColor: theme.cat }]}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
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
      {featured && (
        <Pressable
          onPress={() => router.push("/player")}
          style={styles.featuredCard}
        >
          <Image source={resolveImageSource(featured.art, featured.category)} style={styles.featuredImage} resizeMode="cover" />
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
      )}

      {/* Continue listening */}
      <Section title="Continue listening" hint="Picks up where you paused">
        <Rail>
          {[current ?? tracks[0], tracks[2], tracks[8]]
            .filter((t) => t !== undefined)
            .map((t, i) => (
              <ContinueCard key={`${t.id}-${i}`} track={t} progress={trackProgress[t.id] ?? 0} />
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
      <Section title="Recently played" hint="See all" onPressHint={() => router.push("/history")}>
        {historyList.length ? (
          <View style={{ gap: 12 }}>
            {historyList.slice(0, 3).map((item) => (
              <TrackRow key={item.track.id} track={item.track} programId={item.programId || undefined} />
            ))}
          </View>
        ) : (
          <Text style={{ fontSize: 13, color: "#7C7A85", paddingHorizontal: 24, paddingVertical: 4 }}>
            Your listening history will appear here
          </Text>
        )}
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
      <Section title="Therapeutic programs" hint="See all" onPressHint={() => router.push("/programs")}>
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

      {/* Notifications Popover Modal */}
      <Modal
        visible={notificationsOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setNotificationsOpen(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setNotificationsOpen(false)}
        >
          <Pressable 
            style={[styles.popoverCard, { borderColor: theme.cat }]}
            onPress={(e) => {
              e.stopPropagation();
            }}
          >
            <View style={styles.popoverHeader}>
              <Text style={styles.popoverTitle}>Notifications</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Pressable onPress={fetchNotifications} disabled={notificationsLoading} style={styles.headerActionBtn}>
                  <RefreshCw size={14} color="#7C7A85" />
                </Pressable>
                {unreadCount > 0 && (
                  <Pressable onPress={markAllNotificationsRead} style={styles.headerActionBtn}>
                    <CheckCheck size={14} color={theme.cat} />
                  </Pressable>
                )}
                <Pressable onPress={() => setNotificationsOpen(false)} style={styles.headerActionBtn}>
                  <X size={14} color="#7C7A85" />
                </Pressable>
              </View>
            </View>

            {notificationsError ? (
              <View style={styles.statusBox}>
                <Text style={styles.errorMsg}>{notificationsError}</Text>
                <Pressable onPress={fetchNotifications} style={[styles.retryBtn, { backgroundColor: theme.cat }]}>
                  <Text style={styles.retryBtnText}>Retry</Text>
                </Pressable>
              </View>
            ) : notificationsLoading && notifications.length === 0 ? (
              <View style={styles.statusBox}>
                <ActivityIndicator size="small" color={theme.cat} />
                <Text style={styles.loadingMsg}>Loading...</Text>
              </View>
            ) : notifications.length === 0 ? (
              <View style={styles.statusBox}>
                <Text style={styles.emptyMsg}>No notifications yet</Text>
              </View>
            ) : (
              <ScrollView 
                style={styles.notificationsList} 
                showsVerticalScrollIndicator={false}
              >
                {notifications.map((item) => {
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => {
                        if (!item.read) {
                          markNotificationRead(item.id);
                        }
                      }}
                      style={[
                        styles.notificationItem,
                        !item.read && { backgroundColor: theme.catLight }
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <View style={styles.notificationTitleRow}>
                          <Text style={[styles.notificationTitle, !item.read && { fontWeight: "600" }]}>
                            {item.title}
                          </Text>
                          {!item.read && <View style={[styles.unreadDot, { backgroundColor: theme.cat }]} />}
                        </View>
                        <Text style={styles.notificationMessage}>{item.message}</Text>
                        <Text style={styles.notificationTime}>
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
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
  badgeContainer: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.15)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 80,
    paddingRight: 20,
  },
  popoverCard: {
    width: 320,
    maxHeight: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  popoverHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#F5F1EB",
    paddingBottom: 10,
    marginBottom: 10,
  },
  popoverTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    fontFamily: "DMSans",
  },
  headerActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 4,
  },
  headerActionText: {
    fontSize: 11,
    fontWeight: "500",
  },
  statusBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },
  errorMsg: {
    fontSize: 13,
    color: "#C07B8A",
    textAlign: "center",
  },
  retryBtn: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  loadingMsg: {
    fontSize: 13,
    color: "#7C7A85",
  },
  emptyMsg: {
    fontSize: 13,
    color: "#7C7A85",
  },
  notificationsList: {
    maxHeight: 300,
  },
  notificationItem: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  notificationTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  notificationTitle: {
    fontSize: 14,
    color: "#1A1A1A",
    flex: 1,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  notificationMessage: {
    fontSize: 13,
    color: "#7C7A85",
    marginTop: 4,
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: 11,
    color: "#7C7A85",
    marginTop: 6,
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
