import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  Search as SearchIcon,
  Sparkles,
  Activity,
  Calendar,
  Clock,
  Lock,
  Play,
  X,
  CreditCard,
  Send,
  Landmark,
  Compass,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";
import { AppShell } from "@/components/AppShell";
import { Section } from "@/components/layout-bits";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/lib/api";
import { useApp } from "@/lib/app-state";

const { height, width } = Dimensions.get("window");

// Ailment Search Aliases for fuzzy typing matches
const searchAliases: Record<string, string> = {
  "migrane": "Migraine",
  "migrain": "Migraine",
  "headache": "Migraine",
  "alziemer": "Alziemer",
  "alzheimer": "Alziemer",
  "alzheimers": "Alziemer",
  "memory": "Alziemer",
  "back apin": "Lower back apin",
  "back pain": "Lower back apin",
  "lower back": "Lower back apin",
  "sciatica": "Sciatica ", // trailing space
  "bp": "Hyper tension",
  "blood pressure": "Hyper tension",
  "hypertension": "Hyper tension",
  "sleeplessness": "Insomnia",
  "sleep": "Insomnia",
  "depression": "Depression",
  "depressed": "Depression",
  "anxiety": "Anxiety ",
  "stress": "Anxiety ",
  "anger": "Anger",
  "cancer": "Cancer",
  "parkinson": "Parkinson",
  "parkinsons": "Parkinson",
};

interface Ailment {
  id: string;
  name: string;
}

interface Surawali {
  id: string;
  name: string;
}

interface Timing {
  id: string;
  name: string;
}

interface AilmentSurawali {
  id: string;
  ailmentId: string;
  surawaliId: string;
  timingId: string;
}

interface PregnancyMapping {
  id: string;
  pregnancyMonth: number;
  surawaliId: string;
  timingId: string;
  musicTrack: string;
}

interface CorporateRaga {
  id: string;
  ragaName: string;
  weekDay: string;
  timingId: string;
}

interface ActiveSub {
  id: string;
  surawaliId: string;
  status: string;
  endDate: number;
}

export default function TherapyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();
  const { user, play, tracks, theme } = useApp();

  const [activeTab, setActiveTab] = useState<"ailments" | "pregnancy" | "corporate">("ailments");
  const [loading, setLoading] = useState(true);

  // Data Catalog State
  const [catalog, setCatalog] = useState<{
    ailments: Ailment[];
    surawalis: Surawali[];
    timings: Timing[];
    ailmentSurawalis: AilmentSurawali[];
    pregnancyMappings: PregnancyMapping[];
    corporateRagas: CorporateRaga[];
  } | null>(null);

  // Subscriptions State
  const [subscriptions, setSubscriptions] = useState<ActiveSub[]>([]);

  // Therapeutic Ailments Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAilmentId, setSelectedAilmentId] = useState("");
  const [selectedSurawaliId, setSelectedSurawaliId] = useState("");
  const [selectedTimingId, setSelectedTimingId] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<"ailment" | "surawali" | "timing" | null>(null);

  const toggleDropdown = (type: "ailment" | "surawali" | "timing") => {
    setActiveDropdown((prev) => (prev === type ? null : type));
  };

  useEffect(() => {
    if (params.q) {
      setSearchQuery(params.q);
      setActiveTab("ailments");
    }
  }, [params.q]);

  // Pregnancy Care Filters State
  const [selectedMonth, setSelectedMonth] = useState<number>(1);

  // Corporate Wellness Filters State
  const [selectedDay, setSelectedDay] = useState<string>("Monday");

  // Mock Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [subscribingSurawali, setSubscribingSurawali] = useState<Surawali | null>(null);

  // Fetch Catalog & Subscriptions
  const fetchData = async () => {
    try {
      setLoading(true);
      const catRes = await api.discover.getCatalog();
      if (catRes.success) {
        setCatalog(catRes.data);
      }

      if (user) {
        const subRes = await api.discover.listSubscriptions();
        if (subRes.success && Array.isArray(subRes.data)) {
          setSubscriptions(
            subRes.data.filter((s: any) => s.status === "active" && s.endDate > Date.now())
          );
        }
      }
    } catch (err) {
      console.warn("Failed to load discover catalog on mobile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Check if user is subscribed to a Surawali
  const isSubscribed = (surawaliId: string) => {
    return subscriptions.some((sub) => sub.surawaliId === surawaliId);
  };

  // Helpers mapping IDs to names
  const getAilmentName = (id: string) => catalog?.ailments.find((a) => a.id === id)?.name || "";
  const getSurawaliName = (id: string) => catalog?.surawalis.find((s) => s.id === id)?.name || "";
  const getTimingName = (id: string) => catalog?.timings.find((t) => t.id === id)?.name || "";

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedAilmentId("");
    setSelectedSurawaliId("");
    setSelectedTimingId("");
  };

  // Dynamic filter chips options logic
  const filteredAilments = useMemo(() => {
    if (!catalog) return [];
    let list = catalog.ailments;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const alias = searchAliases[q] || Object.keys(searchAliases).find(k => q.includes(k) || k.includes(q))
        ? searchAliases[Object.keys(searchAliases).find(k => q.includes(k) || k.includes(q))!]
        : null;

      list = list.filter((a) => {
        const matchesName = a.name.toLowerCase().includes(q);
        const matchesAlias = alias ? a.name.toLowerCase().includes(alias.toLowerCase()) : false;

        const hasMatchingSurawali = catalog.ailmentSurawalis.some((m) => {
          if (m.ailmentId !== a.id) return false;
          const sName = getSurawaliName(m.surawaliId);
          return sName.toLowerCase().includes(q);
        });

        return matchesName || matchesAlias || hasMatchingSurawali;
      });
    }

    if (selectedSurawaliId) {
      const mappedAilmentIds = catalog.ailmentSurawalis
        .filter((m) => m.surawaliId === selectedSurawaliId)
        .map((m) => m.ailmentId);
      list = list.filter((a) => mappedAilmentIds.includes(a.id));
    }

    if (selectedTimingId) {
      const mappedAilmentIds = catalog.ailmentSurawalis
        .filter((m) => m.timingId === selectedTimingId)
        .map((m) => m.ailmentId);
      list = list.filter((a) => mappedAilmentIds.includes(a.id));
    }

    return list;
  }, [catalog, searchQuery, selectedSurawaliId, selectedTimingId]);

  const filteredSurawalis = useMemo(() => {
    if (!catalog) return [];
    let list = catalog.surawalis;

    if (selectedAilmentId) {
      const mappedSurawaliIds = catalog.ailmentSurawalis
        .filter((m) => m.ailmentId === selectedAilmentId)
        .map((m) => m.surawaliId);
      list = list.filter((s) => mappedSurawaliIds.includes(s.id));
    }

    if (selectedTimingId) {
      const mappedSurawaliIds = catalog.ailmentSurawalis
        .filter((m) => m.timingId === selectedTimingId)
        .map((m) => m.surawaliId);
      list = list.filter((s) => mappedSurawaliIds.includes(s.id));
    }

    return list;
  }, [catalog, selectedAilmentId, selectedTimingId]);

  const filteredTimings = useMemo(() => {
    if (!catalog) return [];
    let list = catalog.timings;

    if (selectedAilmentId) {
      const mappedTimingIds = catalog.ailmentSurawalis
        .filter((m) => m.ailmentId === selectedAilmentId)
        .map((m) => m.timingId);
      list = list.filter((t) => mappedTimingIds.includes(t.id));
    }

    if (selectedSurawaliId) {
      const mappedTimingIds = catalog.ailmentSurawalis
        .filter((m) => m.surawaliId === selectedSurawaliId)
        .map((m) => m.timingId);
      list = list.filter((t) => mappedTimingIds.includes(t.id));
    }

    return list;
  }, [catalog, selectedAilmentId, selectedSurawaliId]);

  // Recommendations filters
  const matchedRecommendations = useMemo(() => {
    if (!catalog) return [];
    return catalog.ailmentSurawalis.filter((m) => {
      const matchesSearch = searchQuery.trim()
        ? filteredAilments.some((a) => a.id === m.ailmentId)
        : true;
      const matchesAilment = selectedAilmentId ? m.ailmentId === selectedAilmentId : true;
      const matchesSurawali = selectedSurawaliId ? m.surawaliId === selectedSurawaliId : true;
      const matchesTiming = selectedTimingId ? m.timingId === selectedTimingId : true;

      return matchesSearch && matchesAilment && matchesSurawali && matchesTiming;
    });
  }, [catalog, filteredAilments, searchQuery, selectedAilmentId, selectedSurawaliId, selectedTimingId]);

  const pregnancyRecommendations = useMemo(() => {
    if (!catalog) return [];
    return catalog.pregnancyMappings.filter((m) => m.pregnancyMonth === selectedMonth);
  }, [catalog, selectedMonth]);

  const corporateRecommendations = useMemo(() => {
    if (!catalog) return [];
    return catalog.corporateRagas.filter(
      (m) =>
        m.weekDay.toLowerCase() === selectedDay.toLowerCase() ||
        m.weekDay.toLowerCase() === "daily"
    );
  }, [catalog, selectedDay]);

  // Audio stream ticket playback helper
  const handlePlayPreview = (surawaliName: string, subtext: string, forceSubscribed = false) => {
    // 1. Search if track exists in user's tracks
    const existingTrack = tracks.find(
      (t) =>
        t.title.toLowerCase().includes(surawaliName.toLowerCase()) ||
        t.raga?.toLowerCase().includes(surawaliName.toLowerCase())
    );

    if (existingTrack) {
      play(existingTrack);
    } else {
      // 2. Play fallback track pointing to database to avoid stream ticket failures
      let fallback = null;
      if (activeTab === "pregnancy") {
        fallback = tracks.find((t) => t.category === "pregnancy");
      } else if (activeTab === "corporate") {
        fallback = tracks.find((t) => t.category === "secular" || t.category === "corporate");
      }
      if (!fallback) {
        fallback = tracks.find((t) => t.category === "secular") || tracks[0];
      }

      if (fallback) {
        play({
          ...fallback,
          title: `${surawaliName} (${fallback.title})`,
        });
      } else {
        Alert.alert("Playback Unavailable", "No tracks available for fallback streaming.");
      }
    }
  };

  const handleSubscribeClick = (surawali: Surawali) => {
    if (!user) {
      Alert.alert("Sign In Required", "Please sign in to subscribe to this therapeutic Surāwali.", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign In", onPress: () => router.push("/login") },
      ]);
      return;
    }
    setSubscribingSurawali(surawali);
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async (txnId: string) => {
    if (!subscribingSurawali) return;
    try {
      const res = await api.discover.subscribe(subscribingSurawali.id, "monthly", txnId);
      if (res.success) {
        Alert.alert("Success", `Successfully subscribed to ${subscribingSurawali.name}!`);
        fetchData();
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to create subscription in database");
    } finally {
      setPaymentModalOpen(false);
      setSubscribingSurawali(null);
    }
  };

  return (
    <AppShell bare>
      <Text style={styles.heading}>Surāwali Therapy</Text>
      <Text style={styles.subheading}>Vedic sound recommendation & medical streaming</Text>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tabButton, activeTab === "ailments" && styles.activeTabButton]}
          onPress={() => setActiveTab("ailments")}
        >
          <Activity size={16} color={activeTab === "ailments" ? theme.cat : "#7C7A85"} />
          <Text style={[styles.tabText, activeTab === "ailments" && { color: theme.cat, fontWeight: "700" }]}>
            Ailments
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tabButton, activeTab === "pregnancy" && styles.activeTabButton]}
          onPress={() => setActiveTab("pregnancy")}
        >
          <Calendar size={16} color={activeTab === "pregnancy" ? theme.cat : "#7C7A85"} />
          <Text style={[styles.tabText, activeTab === "pregnancy" && { color: theme.cat, fontWeight: "700" }]}>
            Pregnancy
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tabButton, activeTab === "corporate" && styles.activeTabButton]}
          onPress={() => setActiveTab("corporate")}
        >
          <Sparkles size={16} color={activeTab === "corporate" ? theme.cat : "#7C7A85"} />
          <Text style={[styles.tabText, activeTab === "corporate" && { color: theme.cat, fontWeight: "700" }]}>
            Corporate
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.cat} />
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          
          {/* TAB 1: THERAPEUTIC AILMENTS */}
          {activeTab === "ailments" && (
            <View style={{ gap: 20, paddingBottom: 80 }}>
              
              {/* Filters Block */}
              <View style={styles.filtersCard}>
                
                {/* Search Text Input */}
                <View style={styles.searchInputWrap}>
                  <SearchIcon size={16} color="#7C7A85" style={styles.searchIcon} />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Type ailment (e.g. Migraine, Insomnia...)"
                    placeholderTextColor="#7C7A8580"
                    style={styles.textInput}
                  />
                  {searchQuery.length > 0 && (
                    <Pressable onPress={() => setSearchQuery("")} style={styles.clearSearch}>
                      <X size={14} color="#7C7A85" />
                    </Pressable>
                  )}
                </View>

                {/* 1. Disorder / Ailment Dropdown */}
                <View style={styles.dropdownContainer}>
                  <Text style={styles.dropdownLabel}>DISORDER / AILMENT</Text>
                  <Pressable
                    style={styles.dropdownButton}
                    onPress={() => toggleDropdown("ailment")}
                  >
                    <Text style={[styles.dropdownButtonText, !selectedAilmentId && styles.dropdownPlaceholder]}>
                      {selectedAilmentId ? getAilmentName(selectedAilmentId) : "Select Ailment (e.g., Asthma)"}
                    </Text>
                    <ChevronDown size={16} color="#7C7A85" />
                  </Pressable>

                  <Modal
                    visible={activeDropdown === "ailment"}
                    animationType="slide"
                    onRequestClose={() => setActiveDropdown(null)}
                  >
                    <SafeAreaView style={styles.modalFullContainer}>
                      <View style={styles.modalFullHeader}>
                        <Text style={styles.modalFullTitle}>Select Ailment / Disorder</Text>
                        <Pressable onPress={() => setActiveDropdown(null)} style={styles.modalFullCloseBtn}>
                          <X size={20} color="#4D0F1B" />
                        </Pressable>
                      </View>
                      <ScrollView style={styles.modalFullList} showsVerticalScrollIndicator={false}>
                        <Pressable
                          style={[styles.modalFullItem, !selectedAilmentId && styles.modalFullItemActive]}
                          onPress={() => {
                            setSelectedAilmentId("");
                            setActiveDropdown(null);
                          }}
                        >
                          <Text style={[styles.modalFullItemText, !selectedAilmentId && styles.modalFullItemTextActive]}>
                            All Ailments
                          </Text>
                        </Pressable>
                        {filteredAilments.map((a) => (
                          <Pressable
                            key={a.id}
                            style={[styles.modalFullItem, selectedAilmentId === a.id && styles.modalFullItemActive]}
                            onPress={() => {
                              setSelectedAilmentId(a.id);
                              setActiveDropdown(null);
                            }}
                          >
                            <Text style={[styles.modalFullItemText, selectedAilmentId === a.id && styles.modalFullItemTextActive]}>
                              {a.name}
                            </Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </SafeAreaView>
                  </Modal>
                </View>

                {/* 2. Surāwali Dropdown */}
                <View style={styles.dropdownContainer}>
                  <Text style={styles.dropdownLabel}>SURĀWALI RAGA</Text>
                  <Pressable
                    style={styles.dropdownButton}
                    onPress={() => toggleDropdown("surawali")}
                  >
                    <Text style={[styles.dropdownButtonText, !selectedSurawaliId && styles.dropdownPlaceholder]}>
                      {selectedSurawaliId ? getSurawaliName(selectedSurawaliId) : "Select Surāwali"}
                    </Text>
                    <ChevronDown size={16} color="#7C7A85" />
                  </Pressable>

                  <Modal
                    visible={activeDropdown === "surawali"}
                    animationType="slide"
                    onRequestClose={() => setActiveDropdown(null)}
                  >
                    <SafeAreaView style={styles.modalFullContainer}>
                      <View style={styles.modalFullHeader}>
                        <Text style={styles.modalFullTitle}>Select Surāwali Raga</Text>
                        <Pressable onPress={() => setActiveDropdown(null)} style={styles.modalFullCloseBtn}>
                          <X size={20} color="#4D0F1B" />
                        </Pressable>
                      </View>
                      <ScrollView style={styles.modalFullList} showsVerticalScrollIndicator={false}>
                        <Pressable
                          style={[styles.modalFullItem, !selectedSurawaliId && styles.modalFullItemActive]}
                          onPress={() => {
                            setSelectedSurawaliId("");
                            setActiveDropdown(null);
                          }}
                        >
                          <Text style={[styles.modalFullItemText, !selectedSurawaliId && styles.modalFullItemTextActive]}>
                            All Surāwalis
                          </Text>
                        </Pressable>
                        {filteredSurawalis.map((s) => (
                          <Pressable
                            key={s.id}
                            style={[styles.modalFullItem, selectedSurawaliId === s.id && styles.modalFullItemActive]}
                            onPress={() => {
                              setSelectedSurawaliId(s.id);
                              setActiveDropdown(null);
                            }}
                          >
                            <Text style={[styles.modalFullItemText, selectedSurawaliId === s.id && styles.modalFullItemTextActive]}>
                              {s.name}
                            </Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </SafeAreaView>
                  </Modal>
                </View>

                {/* 3. Optimal Timing Dropdown */}
                <View style={styles.dropdownContainer}>
                  <Text style={styles.dropdownLabel}>OPTIMAL TIMING</Text>
                  <Pressable
                    style={styles.dropdownButton}
                    onPress={() => toggleDropdown("timing")}
                  >
                    <Text style={[styles.dropdownButtonText, !selectedTimingId && styles.dropdownPlaceholder]}>
                      {selectedTimingId ? getTimingName(selectedTimingId) : "Select Timing"}
                    </Text>
                    <ChevronDown size={16} color="#7C7A85" />
                  </Pressable>

                  <Modal
                    visible={activeDropdown === "timing"}
                    animationType="slide"
                    onRequestClose={() => setActiveDropdown(null)}
                  >
                    <SafeAreaView style={styles.modalFullContainer}>
                      <View style={styles.modalFullHeader}>
                        <Text style={styles.modalFullTitle}>Select Optimal Timing</Text>
                        <Pressable onPress={() => setActiveDropdown(null)} style={styles.modalFullCloseBtn}>
                          <X size={20} color="#4D0F1B" />
                        </Pressable>
                      </View>
                      <ScrollView style={styles.modalFullList} showsVerticalScrollIndicator={false}>
                        <Pressable
                          style={[styles.modalFullItem, !selectedTimingId && styles.modalFullItemActive]}
                          onPress={() => {
                            setSelectedTimingId("");
                            setActiveDropdown(null);
                          }}
                        >
                          <Text style={[styles.modalFullItemText, !selectedTimingId && styles.modalFullItemTextActive]}>
                            All Timings
                          </Text>
                        </Pressable>
                        {filteredTimings.map((t) => (
                          <Pressable
                            key={t.id}
                            style={[styles.modalFullItem, selectedTimingId === t.id && styles.modalFullItemActive]}
                            onPress={() => {
                              setSelectedTimingId(t.id);
                              setActiveDropdown(null);
                            }}
                          >
                            <Text style={[styles.modalFullItemText, selectedTimingId === t.id && styles.modalFullItemTextActive]}>
                              {t.name}
                            </Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </SafeAreaView>
                  </Modal>
                </View>

                {(searchQuery || selectedAilmentId || selectedSurawaliId || selectedTimingId) ? (
                  <Pressable style={styles.resetBtn} onPress={handleResetFilters}>
                    <Text style={styles.resetBtnText}>Reset All Filters</Text>
                  </Pressable>
                ) : null}

              </View>

              {/* Matched Recommendations Results List */}
              <Section title="Matched Prescriptions">
                {matchedRecommendations.length === 0 ? (
                  <View style={styles.noResults}>
                    <AlertTriangle size={24} color="#C9A84C" />
                    <Text style={styles.noResultsTitle}>No recommendations found</Text>
                    <Text style={styles.noResultsBody}>Try adjusting filters or searching a different disorder.</Text>
                  </View>
                ) : (
                  <View style={{ gap: 12 }}>
                    {matchedRecommendations.map((m) => {
                      const surawaliName = getSurawaliName(m.surawaliId);
                      const ailmentName = getAilmentName(m.ailmentId);
                      const timingName = getTimingName(m.timingId);
                      const subscribed = isSubscribed(m.surawaliId);

                      return (
                        <View key={m.id} style={styles.recommendationCard}>
                          <View style={styles.cardHeader}>
                            <View style={styles.badge}>
                              <Text style={styles.badgeText}>{ailmentName.toUpperCase()}</Text>
                            </View>
                            <View style={styles.timing}>
                              <Clock size={12} color="#7C7A85" />
                              <Text style={styles.timingText}>{timingName}</Text>
                            </View>
                          </View>

                          <Text style={styles.cardTitle}>{surawaliName}</Text>
                          <Text style={styles.cardDesc}>Vedic music frequency session customized for {ailmentName.toLowerCase()}.</Text>

                          <View style={styles.cardActions}>
                            <Pressable
                              style={styles.previewBtn}
                              onPress={() => handlePlayPreview(surawaliName, `Disorder: ${ailmentName}`)}
                            >
                              <Play size={12} color="#4D0F1B" />
                              <Text style={styles.previewText}>Play Preview</Text>
                            </Pressable>

                            {subscribed ? (
                              <Pressable
                                style={styles.activeSubBtn}
                                onPress={() => handlePlayPreview(surawaliName, `Full Therapy Session`, true)}
                              >
                                <Play size={12} color="#FAF8F4" />
                                <Text style={styles.activeSubText}>Play Session</Text>
                              </Pressable>
                            ) : (
                              <Pressable
                                style={styles.subscribeBtn}
                                onPress={() => handleSubscribeClick({ id: m.surawaliId, name: surawaliName })}
                              >
                                <Lock size={12} color="#FAF8F4" />
                                <Text style={styles.subscribeText}>Subscribe</Text>
                              </Pressable>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </Section>
            </View>
          )}

          {/* TAB 2: PREGNANCY CARE */}
          {activeTab === "pregnancy" && (
            <View style={{ gap: 20, paddingBottom: 80 }}>
              
              {/* Months Filters */}
              <View style={styles.filtersCard}>
                <Text style={styles.filtersCardTitle}>Choose Pregnancy Month</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollChips}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((m) => (
                    <Pressable
                      key={m}
                      style={[styles.filterChip, selectedMonth === m && styles.activeFilterChip]}
                      onPress={() => setSelectedMonth(m)}
                    >
                      <Text style={[styles.chipText, selectedMonth === m && styles.activeChipText]}>Month {m}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              <Section title={`Month ${selectedMonth} Care Raga`}>
                {pregnancyRecommendations.length === 0 ? (
                  <View style={styles.noResults}>
                    <Text style={styles.noResultsTitle}>No pregnancy data configured</Text>
                  </View>
                ) : (
                  <View style={{ gap: 12 }}>
                    {pregnancyRecommendations.map((m) => {
                      const surawaliName = getSurawaliName(m.surawaliId);
                      const timingName = getTimingName(m.timingId);
                      const subscribed = isSubscribed(m.surawaliId);

                      return (
                        <View key={m.id} style={styles.recommendationCard}>
                          <View style={styles.cardHeader}>
                            <View style={styles.badge}>
                              <Text style={styles.badgeText}>PREGNANCY MONTH {selectedMonth}</Text>
                            </View>
                            <View style={styles.timing}>
                              <Clock size={12} color="#7C7A85" />
                              <Text style={styles.timingText}>{timingName}</Text>
                            </View>
                          </View>

                          <Text style={styles.cardTitle}>{surawaliName}</Text>
                          <Text style={styles.cardDesc}>Healthy womb stimulation and hormonal balance acoustic frequency.</Text>

                          <View style={styles.cardActions}>
                            <Pressable
                              style={styles.previewBtn}
                              onPress={() => handlePlayPreview(surawaliName, `Pregnancy Month ${selectedMonth}`)}
                            >
                              <Play size={12} color="#4D0F1B" />
                              <Text style={styles.previewText}>Play Preview</Text>
                            </Pressable>

                            {subscribed ? (
                              <Pressable
                                style={styles.activeSubBtn}
                                onPress={() => handlePlayPreview(surawaliName, `Full Pregnancy Session`, true)}
                              >
                                <Play size={12} color="#FAF8F4" />
                                <Text style={styles.activeSubText}>Play Session</Text>
                              </Pressable>
                            ) : (
                              <Pressable
                                style={styles.subscribeBtn}
                                onPress={() => handleSubscribeClick({ id: m.surawaliId, name: surawaliName })}
                              >
                                <Lock size={12} color="#FAF8F4" />
                                <Text style={styles.subscribeText}>Subscribe</Text>
                              </Pressable>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </Section>
            </View>
          )}

          {/* TAB 3: CORPORATE WELLNESS */}
          {activeTab === "corporate" && (
            <View style={{ gap: 20, paddingBottom: 80 }}>
              
              {/* Day Filters */}
              <View style={styles.filtersCard}>
                <Text style={styles.filtersCardTitle}>Choose Office Weekday</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollChips}>
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Daily"].map((d) => (
                    <Pressable
                      key={d}
                      style={[styles.filterChip, selectedDay === d && styles.activeFilterChip]}
                      onPress={() => setSelectedDay(d)}
                    >
                      <Text style={[styles.chipText, selectedDay === d && styles.activeChipText]}>{d}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              <Section title={`${selectedDay} Stress Buster`}>
                {corporateRecommendations.length === 0 ? (
                  <View style={styles.noResults}>
                    <Text style={styles.noResultsTitle}>No corporate wellness config found</Text>
                  </View>
                ) : (
                  <View style={{ gap: 12 }}>
                    {corporateRecommendations.map((m) => {
                      const timingName = getTimingName(m.timingId);

                      return (
                        <View key={m.id} style={styles.recommendationCard}>
                          <View style={styles.cardHeader}>
                            <View style={styles.badge}>
                              <Text style={styles.badgeText}>CORPORATE WELLNESS</Text>
                            </View>
                            <View style={styles.timing}>
                              <Clock size={12} color="#7C7A85" />
                              <Text style={styles.timingText}>{timingName}</Text>
                            </View>
                          </View>

                          <Text style={styles.cardTitle}>{m.ragaName}</Text>
                          <Text style={styles.cardDesc}>Relieve office workload stress, digital fatigue, and improve focus.</Text>

                          <View style={styles.cardActions}>
                            <Pressable
                              style={styles.activeSubBtn}
                              onPress={() => handlePlayPreview(m.ragaName, `Corporate ${selectedDay}`)}
                            >
                              <Play size={12} color="#FAF8F4" />
                              <Text style={styles.activeSubText}>Play Session</Text>
                            </Pressable>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </Section>
            </View>
          )}

        </ScrollView>
      )}

      {/* 4. Mock Payment Modal */}
      {subscribingSurawali && (
        <MockPaymentModal
          visible={paymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
            setSubscribingSurawali(null);
          }}
          surawaliName={subscribingSurawali.name}
          price={299}
          onSuccess={handlePaymentSuccess}
        />
      )}

    </AppShell>
  );
}

interface MockPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  surawaliName: string;
  price: number;
  onSuccess: (txnId: string) => void;
}

function MockPaymentModal({
  visible,
  onClose,
  surawaliName,
  price,
  onSuccess,
}: MockPaymentModalProps) {
  const [method, setMethod] = useState<"card" | "upi" | "netbanking">("card");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [txnId, setTxnId] = useState("");

  // Form states
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [selectedBank, setSelectedBank] = useState("SBI");

  const handlePaymentSubmit = () => {
    if (method === "card") {
      if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
        Alert.alert("Validation Error", "Please fill in all card details.");
        return;
      }
    } else if (method === "upi") {
      if (!upiId || !upiId.includes("@")) {
        Alert.alert("Validation Error", "Please enter a valid UPI ID (e.g. user@bank).");
        return;
      }
    }

    setLoading(true);
    setLoadingStep(1);

    setTimeout(() => {
      setLoadingStep(2);
      setTimeout(() => {
        setLoadingStep(3);
        setTimeout(() => {
          const generatedTxnId = `TXN_KS_${Math.floor(100000000 + Math.random() * 900000000)}`;
          setTxnId(generatedTxnId);
          setLoading(false);
          setCompleted(true);
        }, 1200);
      }, 1000);
    }, 800);
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Subscribe to Surāwali</Text>
              <Text style={styles.modalSubtitle}>{surawaliName}</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#7C7A85" />
            </Pressable>
          </View>

          {/* Body */}
          <ScrollView contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.loadingState}>
                <ActivityIndicator size="large" color="#4D0F1B" />
                <Text style={styles.loadingText}>
                  {loadingStep === 1 && "Initiating secure transaction..."}
                  {loadingStep === 2 && "Verifying mock payment gateway..."}
                  {loadingStep === 3 && "Finalizing subscription records..."}
                </Text>
                <Text style={styles.loadingSubtext}>Please do not close this window.</Text>
              </View>
            ) : completed ? (
              <View style={styles.completedState}>
                <CheckCircle2 size={56} color="#2A9D8F" />
                <Text style={styles.completedTitle}>Payment Successful</Text>
                <Text style={styles.completedBody}>Mock transaction completed successfully.</Text>
                <View style={styles.txnBadge}>
                  <Text style={styles.txnText}>ID: {txnId}</Text>
                </View>
                <Pressable style={styles.finishBtn} onPress={() => onSuccess(txnId)}>
                  <Text style={styles.finishBtnText}>Go to Library</Text>
                </Pressable>
              </View>
            ) : (
              <View style={{ gap: 20 }}>
                
                {/* Summary */}
                <View style={styles.summaryCard}>
                  <View>
                    <Text style={styles.summaryLabel}>Therapeutic Plan</Text>
                    <Text style={styles.summaryValue}>Monthly Subscription</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.summaryLabel}>Total Price</Text>
                    <Text style={styles.summaryPrice}>₹{price}</Text>
                  </View>
                </View>

                {/* Payment Methods */}
                <View style={styles.methodsRow}>
                  <Pressable
                    style={[styles.methodBtn, method === "card" && styles.activeMethodBtn]}
                    onPress={() => setMethod("card")}
                  >
                    <CreditCard size={18} color={method === "card" ? "#4D0F1B" : "#7C7A85"} />
                    <Text style={[styles.methodText, method === "card" && { color: "#4D0F1B", fontWeight: "700" }]}>Card</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.methodBtn, method === "upi" && styles.activeMethodBtn]}
                    onPress={() => setMethod("upi")}
                  >
                    <Send size={18} color={method === "upi" ? "#4D0F1B" : "#7C7A85"} />
                    <Text style={[styles.methodText, method === "upi" && { color: "#4D0F1B", fontWeight: "700" }]}>UPI</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.methodBtn, method === "netbanking" && styles.activeMethodBtn]}
                    onPress={() => setMethod("netbanking")}
                  >
                    <Landmark size={18} color={method === "netbanking" ? "#4D0F1B" : "#7C7A85"} />
                    <Text style={[styles.methodText, method === "netbanking" && { color: "#4D0F1B", fontWeight: "700" }]}>Bank</Text>
                  </Pressable>
                </View>

                {/* Form Fields */}
                <View style={{ minHeight: 180 }}>
                  {method === "card" && (
                    <View style={{ gap: 12 }}>
                      <View>
                        <Text style={styles.formLabel}>CARD NUMBER</Text>
                        <TextInput
                          value={cardNumber}
                          onChangeText={(t) => setCardNumber(t.replace(/\D/g, "").slice(0, 16))}
                          placeholder="1111 2222 3333 4444"
                          placeholderTextColor="#7C7A8550"
                          keyboardType="numeric"
                          style={styles.modalInput}
                        />
                      </View>
                      <View style={{ flexDirection: "row", gap: 12 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.formLabel}>EXPIRY DATE</Text>
                          <TextInput
                            value={cardExpiry}
                            onChangeText={(t) => setCardExpiry(t.slice(0, 5))}
                            placeholder="MM/YY"
                            placeholderTextColor="#7C7A8550"
                            style={styles.modalInput}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.formLabel}>CVV</Text>
                          <TextInput
                            value={cardCvv}
                            onChangeText={(t) => setCardCvv(t.replace(/\D/g, "").slice(0, 3))}
                            placeholder="***"
                            placeholderTextColor="#7C7A8550"
                            secureTextEntry
                            keyboardType="numeric"
                            style={styles.modalInput}
                          />
                        </View>
                      </View>
                      <View>
                        <Text style={styles.formLabel}>CARDHOLDER NAME</Text>
                        <TextInput
                          value={cardName}
                          onChangeText={setCardName}
                          placeholder="John Doe"
                          placeholderTextColor="#7C7A8550"
                          style={styles.modalInput}
                        />
                      </View>
                    </View>
                  )}

                  {method === "upi" && (
                    <View style={{ gap: 12 }}>
                      <View>
                        <Text style={styles.formLabel}>UPI ID</Text>
                        <TextInput
                          value={upiId}
                          onChangeText={setUpiId}
                          placeholder="username@okaxis"
                          placeholderTextColor="#7C7A8550"
                          autoCapitalize="none"
                          style={styles.modalInput}
                        />
                      </View>
                      <Text style={styles.upiHelper}>
                        A mock payment request will be simulated for validation.
                      </Text>
                    </View>
                  )}

                  {method === "netbanking" && (
                    <View style={{ gap: 12 }}>
                      <Text style={styles.formLabel}>SELECT BANK</Text>
                      {["SBI", "HDFC", "ICICI", "Axis"].map((bank) => (
                        <Pressable
                          key={bank}
                          style={[styles.bankRow, selectedBank === bank && styles.activeBankRow]}
                          onPress={() => setSelectedBank(bank)}
                        >
                          <Text style={[styles.bankText, selectedBank === bank && { fontWeight: "700", color: "#4D0F1B" }]}>
                            {bank === "SBI" && "State Bank of India (SBI)"}
                            {bank === "HDFC" && "HDFC Bank"}
                            {bank === "ICICI" && "ICICI Bank"}
                            {bank === "Axis" && "Axis Bank"}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>

                {/* Submit */}
                <Pressable style={styles.payBtn} onPress={handlePaymentSubmit}>
                  <Text style={styles.payBtnText}>Process Payment</Text>
                </Pressable>

              </View>
            )}
          </ScrollView>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  heading: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: "600",
    color: "#4D0F1B",
    fontFamily: "DMSans",
  },
  subheading: {
    fontSize: 12,
    color: "#8A7963",
    fontFamily: "DMSans",
    marginTop: 4,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E4DC",
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTabButton: {
    borderBottomColor: "#C9A84C",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#7C7A85",
    fontFamily: "DMSans",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 250,
  },
  scrollView: {
    flex: 1,
  },
  filtersCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    backgroundColor: "#FFFFFF",
    padding: 16,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 4,
  },
  filtersCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4D0F1B",
    fontFamily: "DMSans",
    marginBottom: 4,
  },
  searchInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    backgroundColor: "#FAF8F4",
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    fontSize: 14,
    color: "#1A1A1A",
  },
  clearSearch: {
    padding: 8,
  },
  chipRow: {
    gap: 8,
  },
  chipRowTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#8A7963",
    fontFamily: "DMSans",
  },
  scrollChips: {
    gap: 8,
    paddingRight: 16,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    backgroundColor: "#FFFFFF",
  },
  activeFilterChip: {
    borderColor: "#C9A84C",
    backgroundColor: "rgba(201, 168, 76, 0.12)",
  },
  chipText: {
    fontSize: 12,
    color: "#7C7A85",
    fontFamily: "DMSans",
  },
  activeChipText: {
    color: "#4D0F1B",
    fontWeight: "700",
  },
  resetBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    borderRadius: 12,
    backgroundColor: "#FAF8F4",
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4D0F1B",
  },
  noResults: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  noResultsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4D0F1B",
    marginTop: 8,
  },
  noResultsBody: {
    fontSize: 12,
    color: "#7C7A85",
    textAlign: "center",
  },
  recommendationCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    backgroundColor: "#FFFFFF",
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    backgroundColor: "rgba(77, 15, 27, 0.08)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#4D0F1B",
    letterSpacing: 1.1,
  },
  timing: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: "auto",
  },
  timingText: {
    fontSize: 11,
    color: "#7C7A85",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    fontFamily: "DMSans",
  },
  cardDesc: {
    fontSize: 13,
    color: "#5C5040",
    lineHeight: 18,
  },
  cardActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  previewBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#4D0F1B",
    borderRadius: 12,
    paddingVertical: 10,
  },
  previewText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4D0F1B",
  },
  subscribeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#4D0F1B",
    borderWidth: 1,
    borderColor: "#4D0F1B",
    borderRadius: 12,
    paddingVertical: 10,
  },
  subscribeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FAF8F4",
  },
  activeSubBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#C9A84C",
    borderWidth: 1,
    borderColor: "#C9A84C",
    borderRadius: 12,
    paddingVertical: 10,
  },
  activeSubText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FAF8F4",
  },

  // Mock Payment Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: height * 0.85,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E4DC",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#7C7A85",
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
  },
  loadingState: {
    paddingVertical: 40,
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4D0F1B",
    textAlign: "center",
  },
  loadingSubtext: {
    fontSize: 11,
    color: "#7C7A85",
  },
  completedState: {
    paddingVertical: 30,
    alignItems: "center",
    gap: 12,
  },
  completedTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  completedBody: {
    fontSize: 13,
    color: "#7C7A85",
    textAlign: "center",
  },
  txnBadge: {
    backgroundColor: "#FAF8F4",
    borderWidth: 1,
    borderColor: "#E8E4DC",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  txnText: {
    fontSize: 11,
    fontFamily: "monospace",
    color: "#7C7A85",
  },
  finishBtn: {
    backgroundColor: "#4D0F1B",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 16,
    marginTop: 20,
  },
  finishBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FAF8F4",
  },
  summaryCard: {
    backgroundColor: "#FAF8F4",
    borderWidth: 1,
    borderColor: "#E8E4DC",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#7C7A85",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: 2,
  },
  summaryPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: "#C9A84C",
    marginTop: 2,
  },
  methodsRow: {
    flexDirection: "row",
    gap: 8,
  },
  methodBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  activeMethodBtn: {
    borderColor: "#C9A84C",
    backgroundColor: "rgba(201, 168, 76, 0.12)",
  },
  methodText: {
    fontSize: 12,
    color: "#7C7A85",
  },
  formLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#8A7963",
    marginBottom: 6,
    letterSpacing: 1.2,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#E8E4DC",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: "#1A1A1A",
    backgroundColor: "#FAF8F4",
  },
  upiHelper: {
    fontSize: 11,
    color: "#7C7A85",
    lineHeight: 16,
  },
  bankRow: {
    borderWidth: 1,
    borderColor: "#E8E4DC",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  activeBankRow: {
    borderColor: "#C9A84C",
    backgroundColor: "rgba(201, 168, 76, 0.12)",
  },
  bankText: {
    fontSize: 13,
    color: "#7C7A85",
  },
  payBtn: {
    backgroundColor: "#4D0F1B",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 8,
  },
  payBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FAF8F4",
  },
  dropdownContainer: {
    width: "100%",
    position: "relative",
  },
  dropdownLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#8A7963",
    marginBottom: 6,
    letterSpacing: 1.2,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 44,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#FAF8F4",
  },
  dropdownButtonText: {
    fontSize: 13,
    color: "#1A1A1A",
    fontFamily: "DMSans",
  },
  dropdownPlaceholder: {
    color: "#7C7A8580",
  },
  modalFullContainer: {
    flex: 1,
    backgroundColor: "#FAF8F4",
  },
  modalFullHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E4DC",
    backgroundColor: "#FFFFFF",
  },
  modalFullTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4D0F1B",
    fontFamily: "DMSans",
  },
  modalFullCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAF8F4",
  },
  modalFullList: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  modalFullItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E4DC",
  },
  modalFullItemActive: {
    backgroundColor: "rgba(201, 168, 76, 0.08)",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  modalFullItemText: {
    fontSize: 14,
    color: "#1A1A1A",
    fontFamily: "DMSans",
  },
  modalFullItemTextActive: {
    color: "#4D0F1B",
    fontWeight: "700",
  },
});
