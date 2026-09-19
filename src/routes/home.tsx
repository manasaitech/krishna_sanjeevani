import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import {
  Play,
  Sparkles,
  Loader2,
  Heart,
  Waves,
  Info,
  Clock,
  BookOpen,
  CheckCircle,
  TrendingUp,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Lock,
  Crown,
  AlertTriangle,
  ArrowRight,
  Flame,
  Wind,
  Mountain
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useApp } from "@/lib/app-state";
import { useMode, getActiveMode } from "@/core/mode";
import { sanjeevaniConfigs, type CategoryId, type Track } from "@/lib/content";
import { AUTHORITATIVE_TRAJECTORIES, AUTHORITATIVE_EMOTION_SONGS, type EmotionTrajectory } from "@/modes/emotion-remediation/content-provider";
import { emotionThemeConfig } from "@/modes/emotion-remediation/theme";
import { api, BASE_URL } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Home — Krishna Sanjeevani" },
      {
        name: "description",
        content: "Vedic Sound Therapy & Emotion Remediation Dashboard.",
      },
    ],
  }),
  component: HomeDashboard,
});

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
  surawaliName: string;
  status: string;
  endDate: number;
}

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return "5:00 min";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs} min`;
}

function getDoshaIcon(dosha?: string) {
  switch (dosha?.toLowerCase()) {
    case "pitta":
      return <Flame className="h-3.5 w-3.5 text-amber-600" />;
    case "vata":
      return <Wind className="h-3.5 w-3.5 text-purple-600" />;
    case "kapha":
    default:
      return <Mountain className="h-3.5 w-3.5 text-emerald-600" />;
  }
}

function getDoshaBadgeClass(dosha?: string): string {
  switch (dosha?.toLowerCase()) {
    case "pitta":
      return "bg-amber-100 text-amber-800 border-amber-300/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
    case "vata":
      return "bg-purple-100 text-purple-800 border-purple-300/60 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800";
    case "kapha":
    default:
      return "bg-emerald-100 text-emerald-800 border-emerald-300/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
  }
}

function HomeDashboard() {
  const {
    category,
    current,
    playing,
    play,
    user,
    tracks,
  } = useApp();

  const { isEmotionMode: ctxIsEmotion, config: modeConfig } = useMode();
  const isEmotionMode = ctxIsEmotion ?? (getActiveMode() === "emotion_remediation");
  const navigate = useNavigate();

  // Redirect guest or unset users to register/login or onboarding
  const activeCategory = (!category || category === "unset") ? "devotional" : category;
  const config = isEmotionMode ? emotionThemeConfig : sanjeevaniConfigs[activeCategory as Exclude<CategoryId, "unset">];

  // Master Data & Subscriptions
  const [catalog, setCatalog] = useState<{
    ailments: Ailment[];
    surawalis: Surawali[];
    timings: Timing[];
    ailmentSurawalis: AilmentSurawali[];
    pregnancyMappings: PregnancyMapping[];
    corporateRagas: CorporateRaga[];
  } | null>(null);

  const [subscriptions, setSubscriptions] = useState<ActiveSub[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [activeChip, setActiveChip] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParam, setSelectedParam] = useState(""); // Ailment ID / Dosha / Pregnancy Month / Corporate Weekday
  const [selectedTrajectory, setSelectedTrajectory] = useState("");
  const [selectedTimingId, setSelectedTimingId] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Mock Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [subscribingSurawali, setSubscribingSurawali] = useState<{ id: string; name: string } | null>(null);

  const greetingName = user?.profile?.fullName || user?.email?.split("@")[0] || "Guest";

  useEffect(() => {
    async function loadData() {
      try {
        if (!isEmotionMode) {
          const [catRes, subRes] = await Promise.all([
            api.discover.getCatalog(),
            api.discover.listSubscriptions(),
          ]);
          if (catRes.success) setCatalog(catRes.data);
          if (subRes.success) {
            const active = subRes.data.filter((s: any) => s.status === "active" && s.endDate > Date.now());
            setSubscriptions(active);
          }
        }
      } catch (err) {
        console.error("Failed to load catalog or subscriptions", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, isEmotionMode]);

  // Helper resolvers for Surawali mode
  const getSurawaliName = (id: string) => catalog?.surawalis.find(s => s.id === id)?.name || "Unknown Surawali";
  const getTimingName = (id: string) => catalog?.timings.find(t => t.id === id)?.name || "Any Time";

  // Filtered Subscriptions list for Surawali mode
  const filteredSubscriptions = useMemo(() => {
    if (!catalog) return [];
    return subscriptions.filter(sub => {
      if (activeCategory === "pregnancy" && (sub.surawaliName === "Greeshma" || sub.surawaliId === "sur_b719ad07-c4a5-51db-aaa5-48027611b68d")) {
        return false;
      }
      if (activeCategory === "devotional") {
        return catalog.ailmentSurawalis.some(m => m.surawaliId === sub.surawaliId);
      } else if (activeCategory === "pregnancy") {
        return catalog.pregnancyMappings.some(m => m.surawaliId === sub.surawaliId);
      } else {
        return false;
      }
    });
  }, [subscriptions, catalog, activeCategory]);

  // Dynamic filter lists for dropdowns (Surawali mode)
  const paramDropdownList = useMemo(() => {
    if (isEmotionMode) return [];
    if (!catalog) return [];
    if (activeCategory === "devotional") {
      return catalog.ailments.map(a => ({ label: a.name, value: a.id }));
    } else if (activeCategory === "pregnancy") {
      return Array.from({ length: 9 }).map((_, i) => ({ label: `Month ${i + 1}`, value: String(i + 1) }));
    } else {
      return [
        { label: "Monday", value: "Monday" },
        { label: "Tuesday", value: "Tuesday" },
        { label: "Wednesday", value: "Wednesday" },
        { label: "Thursday", value: "Thursday" },
        { label: "Friday", value: "Friday" },
        { label: "Saturday", value: "Saturday" },
        { label: "Sunday", value: "Sunday" },
      ];
    }
  }, [catalog, activeCategory, isEmotionMode]);

  // Filtered Explore Results (Supports both Emotion Mode and Surawali Mode)
  const exploreResults = useMemo(() => {
    if (isEmotionMode) {
      // ── EMOTION REMEDIATION MODE: 21 Google Sheet Songs ──
      return AUTHORITATIVE_EMOTION_SONGS.filter((song) => {
        const needle = searchQuery.trim().toLowerCase();
        
        // Chip tag filter
        let matchesChip = true;
        if (activeChip === "Kapha") matchesChip = song.dosha?.toLowerCase() === "kapha";
        else if (activeChip === "Pitta") matchesChip = song.dosha?.toLowerCase() === "pitta";
        else if (activeChip === "Vata") matchesChip = song.dosha?.toLowerCase() === "vata";
        else if (activeChip === "2-Step Transitions") matchesChip = !song.trajectory?.includes("--> Utsaha -->");
        else if (activeChip === "3-Step Journeys") matchesChip = !!song.trajectory?.includes("--> Utsaha -->");
        else if (activeChip === "Kshobha → Prashanti") matchesChip = song.trajectory === "Kshobha --> Prashanti";
        else if (activeChip === "Visada → Prashanti") matchesChip = song.trajectory === "Visada --> Prashanti";
        else if (activeChip === "Kshobha → Utsaha") matchesChip = song.trajectory === "Kshobha --> Utsaha";
        else if (activeChip === "Visada → Utsaha") matchesChip = song.trajectory === "Visada --> Utsaha";
        else if (activeChip === "Utsaha → Prashanti") matchesChip = song.trajectory === "Utsaha --> Prashanti";

        // Search bar match
        const matchesSearch = needle
          ? [
              song.title,
              song.dosha,
              song.trajectory,
              song.initialState,
              song.intermediateState,
              song.targetState,
              song.description,
              ...(song.tags || []),
            ]
              .filter(Boolean)
              .some((val) => String(val).toLowerCase().includes(needle))
          : true;

        // Dropdown parameter matches
        const matchesDosha = selectedParam ? song.dosha?.toLowerCase() === selectedParam.toLowerCase() : true;
        const matchesTrajectory = selectedTrajectory ? song.trajectory === selectedTrajectory : true;

        return matchesChip && matchesSearch && matchesDosha && matchesTrajectory;
      }).map((song) => ({
        id: song.id,
        surawaliId: song.id,
        title: song.title,
        dosha: song.dosha,
        trajectory: song.trajectory,
        initialState: song.initialState,
        intermediateState: song.intermediateState,
        targetState: song.targetState,
        purpose: `${song.dosha?.toUpperCase()} • ${song.trajectory}`,
        timing: song.dosha === "kapha" ? "Early Morning" : song.dosha === "pitta" ? "Mid-Day / Evening" : "Dusk / Night",
        duration: formatDuration(song.duration),
        durationSeconds: song.duration || 300,
        description: song.description || "Calibrated Vedic sound therapy for emotional balance and mental tranquility.",
        type: "emotion",
      }));
    }

    // ── SURAWALI MODE ──
    if (!catalog) return [];
    
    if (activeCategory === "devotional") {
      return catalog.ailmentSurawalis.filter(m => {
        const sName = getSurawaliName(m.surawaliId);
        const aName = catalog.ailments.find(a => a.id === m.ailmentId)?.name || "";
        
        const matchesChip = activeChip === "All" || 
          (activeChip === "Disorder Relief" && ["Anxiety", "Migraine", "Hypertension", "Insomnia"].some(d => aName.includes(d))) ||
          (activeChip === "Stress Relief" && ["Stress", "Anxiety"].some(d => aName.includes(d))) ||
          (activeChip === "Focus" && ["Focus", "Concentration"].some(d => aName.includes(d))) ||
          (activeChip === "Sleep" && ["Sleep", "Insomnia"].some(d => aName.includes(d)));

        const matchesSearch = searchQuery.trim() 
          ? sName.toLowerCase().includes(searchQuery.toLowerCase()) || aName.toLowerCase().includes(searchQuery.toLowerCase())
          : true;

        const matchesParam = selectedParam ? m.ailmentId === selectedParam : true;
        const matchesTiming = selectedTimingId ? m.timingId === selectedTimingId : true;

        return matchesChip && matchesSearch && matchesParam && matchesTiming;
      }).map(m => ({
        id: m.id,
        surawaliId: m.surawaliId,
        title: getSurawaliName(m.surawaliId),
        purpose: catalog.ailments.find(a => a.id === m.ailmentId)?.name || "Therapeutic",
        timing: getTimingName(m.timingId),
        duration: "30 min",
        durationSeconds: 1800,
        description: "Curated harmonic resonance session optimized for restorative bio-acoustic alignment.",
        type: "ailment"
      }));

    } else if (activeCategory === "pregnancy") {
      return catalog.pregnancyMappings.filter(m => {
        const sName = getSurawaliName(m.surawaliId);
        if (sName === "Greeshma" || m.surawaliId === "sur_b719ad07-c4a5-51db-aaa5-48027611b68d") {
          return false;
        }

        const matchesChip = activeChip === "All" ||
          (activeChip === "Month 1-3" && [1, 2, 3].includes(m.pregnancyMonth)) ||
          (activeChip === "Month 4-6" && [4, 5, 6].includes(m.pregnancyMonth)) ||
          (activeChip === "Month 7-9" && [7, 8, 9].includes(m.pregnancyMonth));

        const matchesSearch = searchQuery.trim() 
          ? sName.toLowerCase().includes(searchQuery.toLowerCase()) 
          : true;

        const matchesParam = selectedParam ? String(m.pregnancyMonth) === selectedParam : true;
        const matchesTiming = selectedTimingId ? m.timingId === selectedTimingId : true;

        return matchesChip && matchesSearch && matchesParam && matchesTiming;
      }).map(m => ({
        id: m.id,
        surawaliId: m.surawaliId,
        title: getSurawaliName(m.surawaliId),
        purpose: `Pregnancy Care (Month ${m.pregnancyMonth})`,
        timing: getTimingName(m.timingId),
        duration: "28 min",
        durationSeconds: 1680,
        description: "Delicate and calming sound therapy to support maternal comfort and healthy fetal cognitive development.",
        type: "pregnancy"
      }));

    } else {
      return catalog.corporateRagas.filter(m => {
        const matchesChip = activeChip === "All" ||
          (activeChip === "Workplace Stress" && ["Monday", "Wednesday", "Friday"].includes(m.weekDay)) ||
          (activeChip === "Focus Boost" && ["Tuesday", "Thursday"].includes(m.weekDay));

        const matchesSearch = searchQuery.trim() 
          ? m.ragaName.toLowerCase().includes(searchQuery.toLowerCase()) 
          : true;

        const matchesParam = selectedParam ? m.weekDay === selectedParam : true;
        const matchesTiming = selectedTimingId ? m.timingId === selectedTimingId : true;

        return matchesChip && matchesSearch && matchesParam && matchesTiming;
      }).map(m => ({
        id: m.id,
        surawaliId: m.id,
        title: m.ragaName,
        purpose: `Workspace Wellness (${m.weekDay})`,
        timing: getTimingName(m.timingId),
        duration: "32 min",
        durationSeconds: 1920,
        description: "Professional auditory composition calibrated to suppress cognitive fatigue and elevate office focus.",
        type: "corporate"
      }));
    }
  }, [catalog, activeCategory, activeChip, searchQuery, selectedParam, selectedTrajectory, selectedTimingId, isEmotionMode]);

  // Paginated Explore list
  const totalPages = Math.ceil(exploreResults.length / itemsPerPage);
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return exploreResults.slice(start, start + itemsPerPage);
  }, [exploreResults, currentPage]);

  const handlePlaySong = (song: { id: string; title: string; subtitle?: string; duration?: number; dosha?: string }) => {
    toast.success(`Playing: ${song.title}`);
    play({
      id: song.id,
      title: song.title,
      artist: isEmotionMode ? `Krishna Sanjeevani • ${song.dosha?.toUpperCase() || "Dosha"} Balancing` : config.name,
      subtitle: song.subtitle || (isEmotionMode ? "Vedic Emotion Remediation" : "Raga Chikitsa"),
      duration: song.duration || 300,
      category: isEmotionMode ? ("devotional" as any) : activeCategory,
      playlistKey: "",
      art: "/govinda-bhakta-pr-seminars-mukund.mp3"
    } as any);
  };

  const handlePlayPreview = (surawaliName: string, subtext: string, forceSubscribed = false) => {
    toast.info(`Playing ${forceSubscribed ? "session" : "preview"} for ${surawaliName}`);
    play({
      id: forceSubscribed ? `session_${surawaliName}` : `preview_${surawaliName}`,
      title: surawaliName + (forceSubscribed ? "" : " (Preview)"),
      artist: config.name,
      subtitle: subtext,
      duration: forceSubscribed ? 1800 : 90,
      category: activeCategory,
      playlistKey: "",
      art: "/govinda-bhakta-pr-seminars-mukund.mp3"
    } as any);
  };

  const handleSubscribeClick = (surawali: { id: string; name: string }) => {
    setSubscribingSurawali(surawali);
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async () => {
    if (!subscribingSurawali) return;
    try {
      const txnId = `mock_txn_${Math.random().toString(36).substring(7)}`;
      const res = await api.discover.subscribe(subscribingSurawali.id, "monthly", txnId);
      if (res.success) {
        toast.success(`Successfully subscribed to ${subscribingSurawali.name}!`);
        const subRes = await api.discover.listSubscriptions();
        if (subRes.success) {
          const active = subRes.data.filter((s: any) => s.status === "active" && s.endDate > Date.now());
          setSubscriptions(active);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to subscribe");
    } finally {
      setPaymentModalOpen(false);
      setSubscribingSurawali(null);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedParam("");
    setSelectedTrajectory("");
    setSelectedTimingId("");
    setSelectedDuration("");
    setActiveChip("All");
    setCurrentPage(1);
  };

  const primaryColor = isEmotionMode ? "#7C1C24" : config.theme.primary;

  return (
    <AppShell>
      <div 
        className="space-y-8 max-w-[1600px] mx-auto pb-24"
        style={{ "--theme-color": primaryColor } as React.CSSProperties}
      >
        {/* Dynamic Sloka & Pathway Block */}
        <div 
          className="rounded-card border p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 shadow-soft"
          style={{ 
            borderColor: primaryColor + "20",
            background: `linear-gradient(135deg, ${primaryColor}08, ${primaryColor}12)` 
          }}
        >
          <div className="space-y-1">
            <p className="text-[12px] text-muted-foreground font-semibold uppercase tracking-wider">
              {isEmotionMode ? "Active Emotion Remediation Pathway" : "Active Sanjeevani Pathway"}
            </p>
            <h2 className="font-display font-bold text-2xl text-foreground" style={{ color: primaryColor }}>
              {config.name}
            </h2>
            <p className="text-sm text-muted-foreground/90 max-w-xl">{config.description}</p>
          </div>
          <div 
            className="shrink-0 rounded-btn px-4 py-3 border font-display text-xs leading-normal font-semibold text-center italic text-muted-foreground/90 bg-background max-w-md shadow-sm" 
            style={{ borderColor: primaryColor + "30" }}
          >
            {config.greetingText}
          </div>
        </div>

        {/* ── EMOTION MODE: 7 Authoritative Transitional Trajectories ── */}
        {isEmotionMode && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="font-semibold text-foreground text-lg">7 Transitional Trajectories</h3>
                <p className="text-xs text-muted-foreground">Select an emotional pathway to filter calibrated compositions</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cat/10 text-cat">
                7 Authoritative Pathways
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {AUTHORITATIVE_TRAJECTORIES.map((traj) => {
                const isSelected = selectedTrajectory === traj.name;
                return (
                  <div
                    key={traj.id}
                    onClick={() => {
                      if (selectedTrajectory === traj.name) {
                        setSelectedTrajectory("");
                      } else {
                        setSelectedTrajectory(traj.name);
                        setCurrentPage(1);
                      }
                    }}
                    className="press rounded-card border bg-surface p-4 flex flex-col justify-between space-y-3 cursor-pointer transition-all duration-200 hover:shadow-soft"
                    style={{
                      borderColor: isSelected ? primaryColor : "rgba(226, 232, 240, 0.8)",
                      background: isSelected ? `${primaryColor}08` : "var(--surface)",
                    }}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-foreground">
                          {traj.type === "three-step" ? "3-Step Journey" : "2-Step Transition"}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-cat flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> Active
                          </span>
                        )}
                      </div>
                      <h4 className="font-display font-bold text-sm text-foreground leading-snug pt-1">
                        {traj.name}
                      </h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                        {traj.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[10px] font-medium text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="font-bold text-foreground">{traj.initialState}</span>
                        <ArrowRight className="h-3 w-3 text-cat" />
                        <span className="font-bold text-cat">{traj.targetState}</span>
                      </span>
                      <span>3 Doshas</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SURAWALI MODE: Subscribed Surawalis ── */}
        {!isEmotionMode && (
          <div id="subscribed-surawalis" className="space-y-4 scroll-mt-20">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-semibold text-foreground text-lg">Your Subscribed Surawalis</h3>
              <span className="text-xs text-muted-foreground font-medium">{filteredSubscriptions.length} subscriptions active</span>
            </div>

            {loading ? (
              <div className="flex min-h-[120px] items-center justify-center border border-dashed border-border rounded-card">
                <Loader2 className="h-6 w-6 animate-spin text-cat" />
              </div>
            ) : filteredSubscriptions.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto no-scrollbar py-1">
                {filteredSubscriptions.map(sub => (
                  <div 
                    key={sub.id} 
                    onClick={() => navigate({ to: "/discover", search: { search: sub.surawaliName } })}
                    className="press min-w-[280px] max-w-[280px] bg-surface rounded-card border border-border/60 hover:border-cat/60 hover:shadow-soft transition-all duration-300 p-4 flex flex-col justify-between space-y-4 cursor-pointer"
                  >
                    <div className="space-y-2">
                      <div className="relative h-28 w-full rounded-xl overflow-hidden bg-muted">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
                        <div className="absolute top-2.5 left-2.5 z-20 rounded bg-white/20 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold text-white tracking-wider uppercase">
                          Subscribed
                        </div>
                        <div 
                          className="absolute inset-0 flex items-center justify-center text-white/90 text-2xl font-bold font-display uppercase tracking-widest z-0 bg-gradient-to-br"
                          style={{ from: primaryColor, to: "#2d3748" } as any}
                        >
                          {sub.surawaliName.substring(0, 2)}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-display font-bold text-[15px] truncate text-foreground">
                          {sub.surawaliName}
                        </h4>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wide mt-0.5">
                          {activeCategory === "devotional" ? "Raga Chikitsa" : "Garbha Sanskar"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/40">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>30 min</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayPreview(sub.surawaliName, "Subscribed active session", true);
                        }}
                        className="press h-8 w-8 rounded-full flex items-center justify-center text-white hover:scale-105 transition-transform"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-card border border-dashed border-border p-8 text-center bg-surface/50">
                <p className="text-sm text-muted-foreground">
                  Your Surawali journey starts here. Explore and subscribe to curated Surawalis for your pathway.
                </p>
                <button
                  onClick={() => {
                    const exploreElement = document.getElementById("explore-surawalis");
                    if (exploreElement) exploreElement.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="press mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-btn text-xs font-bold text-white transition-all shadow-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span>Explore Surawalis</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Dynamic Journey Progress Banner */}
        <div 
          className="rounded-card border p-4 flex items-center gap-4 transition-all duration-300 shadow-soft"
          style={{ 
            borderColor: primaryColor + "1f", 
            background: `${primaryColor}06` 
          }}
        >
          <div className="p-2 rounded-full bg-white shrink-0 shadow-sm border border-border/40">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ stroke: primaryColor }} strokeWidth="2">
              <path d="M12 2L2 22h20L12 2zm0 4l6 12H6l6-12z" />
            </svg>
          </div>
          <p className="text-xs font-medium text-foreground leading-relaxed">
            {config.bannerText}
          </p>
        </div>

        {/* ── Explore Songs Section ── */}
        <div id="explore-surawalis" className="space-y-6 scroll-mt-20">
          <div className="px-1 space-y-1">
            <h3 className="font-semibold text-foreground text-lg">
              {isEmotionMode ? "Explore Emotion Remediation Songs" : "Explore Surawalis"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isEmotionMode 
                ? "21 authoritative Vedic compositions calibrated for emotional transition and Dosha balancing"
                : "Discover other auditory medicine sequences sequenced for your condition"}
            </p>
          </div>

          {/* Chips categories filter */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {config.filters.map(filterName => (
              <button
                key={filterName}
                onClick={() => {
                  setActiveChip(filterName);
                  setCurrentPage(1);
                }}
                className="press px-4 py-2 rounded-full text-xs font-semibold border transition-all select-none cursor-pointer"
                style={{
                  backgroundColor: activeChip === filterName ? primaryColor : "transparent",
                  color: activeChip === filterName ? "#fff" : "inherit",
                  borderColor: activeChip === filterName ? primaryColor : "rgba(226, 232, 240, 0.8)"
                }}
              >
                {filterName}
              </button>
            ))}
          </div>

          {/* Detailed filters toolbar panel */}
          <div className="rounded-card border border-border/60 bg-surface p-5 shadow-soft space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              
              {/* Search bar */}
              <div className="lg:col-span-2 relative w-full">
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder={isEmotionMode ? "Search songs, doshas, emotions..." : "Search by name, tags..."}
                    className="w-full min-h-10 pl-9 pr-4 rounded-btn border border-border bg-background text-sm outline-none focus-visible:ring-1 focus-visible:ring-cat focus-visible:border-cat transition-all text-foreground"
                  />
                </div>
              </div>

              {/* Dynamic selector 1: Dosha (Emotion Mode) or Ailment/Month (Surawali Mode) */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {isEmotionMode ? "Ayurvedic Dosha" : activeCategory === "devotional" ? "Disorder / Ailment" : activeCategory === "pregnancy" ? "Pregnancy Month" : "Corporate Day"}
                </label>
                <select
                  value={selectedParam}
                  onChange={(e) => {
                    setSelectedParam(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full min-h-10 px-3 rounded-btn border border-border bg-background text-sm outline-none focus-visible:ring-1 focus-visible:ring-cat"
                >
                  <option value="">{isEmotionMode ? "-- All Doshas --" : "-- All Options --"}</option>
                  {isEmotionMode ? (
                    <>
                      <option value="kapha">Kapha (Earth & Water)</option>
                      <option value="pitta">Pitta (Fire & Water)</option>
                      <option value="vata">Vata (Air & Ether)</option>
                    </>
                  ) : (
                    paramDropdownList.map(item => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))
                  )}
                </select>
              </div>

              {/* Dynamic selector 2: Trajectory (Emotion Mode) or Listening Time (Surawali Mode) */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {isEmotionMode ? "Trajectory Pathway" : "Best Listening Time"}
                </label>
                {isEmotionMode ? (
                  <select
                    value={selectedTrajectory}
                    onChange={(e) => {
                      setSelectedTrajectory(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full min-h-10 px-3 rounded-btn border border-border bg-background text-sm outline-none focus-visible:ring-1 focus-visible:ring-cat"
                  >
                    <option value="">-- All Trajectories --</option>
                    {AUTHORITATIVE_TRAJECTORIES.map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={selectedTimingId}
                    onChange={(e) => {
                      setSelectedTimingId(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full min-h-10 px-3 rounded-btn border border-border bg-background text-sm outline-none focus-visible:ring-1 focus-visible:ring-cat"
                  >
                    <option value="">-- Any Time --</option>
                    {catalog?.timings.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Reset filters button */}
              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="press w-full min-h-10 px-4 rounded-btn border border-border bg-background text-xs font-bold text-muted-foreground hover:bg-secondary flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Reset Filters</span>
                </button>
              </div>

            </div>
          </div>

          {/* Results rows list */}
          <div className="space-y-4">
            {exploreResults.length > 0 ? (
              paginatedResults.map(item => {
                const isSubscribed = isEmotionMode 
                  ? true // Free 20-day trial for all emotion songs
                  : activeCategory === "devotional" 
                    ? subscriptions.some(s => s.surawaliId === item.surawaliId)
                    : activeCategory === "pregnancy"
                      ? subscriptions.some(s => s.surawaliId === item.surawaliId)
                      : true;

                const isCurrentPlaying = current?.id === item.id && playing;

                return (
                  <div 
                    key={item.id} 
                    className="rounded-card border border-border/70 bg-surface p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:shadow-soft hover:border-cat/40 transition-all duration-200"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      {/* Album / Avatar Icon */}
                      <div 
                        className="h-14 w-14 rounded-2xl shrink-0 flex flex-col items-center justify-center font-display text-white font-bold text-sm select-none uppercase tracking-wider shadow-sm mt-0.5"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {item.dosha ? (
                          <span className="text-xs font-black">{item.dosha.substring(0, 3)}</span>
                        ) : (
                          item.title.substring(0, 2)
                        )}
                      </div>

                      {/* Song Details & Description */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-display font-bold text-[16px] text-foreground">
                            {item.title}
                          </h4>
                          
                          {/* Dosha Badge */}
                          {item.dosha && (
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getDoshaBadgeClass(item.dosha)}`}>
                              {getDoshaIcon(item.dosha)}
                              <span>{item.dosha}</span>
                            </span>
                          )}

                          {/* Trajectory Badge */}
                          {item.trajectory && (
                            <span className="rounded-full bg-secondary border border-border/50 px-2.5 py-0.5 text-[10px] font-bold text-foreground">
                              {item.trajectory}
                            </span>
                          )}

                          {!item.dosha && (
                            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                              {item.purpose}
                            </span>
                          )}
                        </div>

                        {/* Authoritative Description */}
                        <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
                          {item.description}
                        </p>

                        {/* Meta details */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-medium text-muted-foreground pt-0.5">
                          {item.initialState && item.targetState && (
                            <span className="flex items-center gap-1.5 text-foreground font-semibold">
                              <span>{item.initialState}</span>
                              <ArrowRight className="h-3 w-3 text-cat" />
                              <span className="text-cat">{item.targetState}</span>
                            </span>
                          )}
                          {item.initialState && <span>&bull;</span>}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Duration: {item.duration}</span>
                          </span>
                          <span>&bull;</span>
                          <span>Timing: {item.timing}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 justify-end">
                      <button
                        onClick={() => {
                          if (isEmotionMode) {
                            handlePlaySong(item as any);
                          } else {
                            handlePlayPreview(item.title, `Preview of ${item.title}`);
                          }
                        }}
                        className="press flex-1 md:flex-none min-h-10 px-5 rounded-btn text-xs font-bold text-white hover:brightness-110 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>{isCurrentPlaying ? "Playing..." : "Stream Session"}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-card border border-border bg-surface/60 p-8 text-center shadow-soft">
                <Waves className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2 animate-pulse" />
                <p className="text-[13px] font-semibold text-foreground">
                  {isEmotionMode ? "No Emotion Remediation songs matched your criteria" : "No Surāwalis matched your criteria"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Try resetting the filters or tweaking your keywords.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="press h-9 w-9 rounded-btn border border-border flex items-center justify-center text-muted-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                const isSelected = currentPage === pageNum;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className="press h-9 w-9 rounded-btn text-xs font-bold border transition-all cursor-pointer"
                    style={{
                      backgroundColor: isSelected ? primaryColor : "transparent",
                      color: isSelected ? "#fff" : "inherit",
                      borderColor: isSelected ? primaryColor : "#e2e8f0"
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="press h-9 w-9 rounded-btn border border-border flex items-center justify-center text-muted-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

        </div>

        {/* Bottom medical disclaimer and info */}
        <div className="rounded-card border border-amber-500/25 bg-amber-500/5 p-4 flex gap-3.5 items-start mt-8">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-xs text-amber-800">Professional Auditory Wellness Statement</h4>
            <p className="text-[11px] leading-relaxed text-amber-700/90">
              All therapeutic frequencies are sequenced based on Vedic sound therapy, Dosha balancing principles, and acoustic harmonization standards. Auditory therapy is a safe, natural support mechanism and is not a replacement for professional clinical advice, diagnoses, or prescriptions.
            </p>
          </div>
        </div>

      </div>

      {/* Mock Subscription Payment Modal (Surawali Mode) */}
      {paymentModalOpen && subscribingSurawali && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-card border border-border bg-surface p-6 shadow-lift space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3">
              <div 
                className="h-10 w-10 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-display font-semibold text-base text-foreground">Confirm Subscription</h4>
                <p className="text-xs text-muted-foreground">Premium Raga Chikitsa Sequence</p>
              </div>
            </div>

            <div className="p-4 rounded-btn border border-border/80 bg-background space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sequence:</span>
                <span className="font-bold text-foreground">{subscribingSurawali.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pathway:</span>
                <span className="font-bold text-foreground capitalize">{activeCategory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price Tier:</span>
                <span className="font-bold text-emerald-600">₹299 / month</span>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => {
                  setPaymentModalOpen(false);
                  setSubscribingSurawali(null);
                }}
                className="press flex-1 min-h-10 px-4 rounded-btn border border-border bg-background text-xs font-bold text-muted-foreground hover:bg-secondary cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentSubmit}
                className="press flex-1 min-h-10 px-4 rounded-btn text-xs font-bold text-white shadow-lift cursor-pointer"
                style={{ backgroundColor: primaryColor }}
              >
                Mock Success Payment
              </button>
            </div>
          </div>
        </div>
      )}

    </AppShell>
  );
}
