import { useState, useMemo, useEffect } from "react";
import {
  Play,
  Heart,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ShieldCheck,
  ArrowRight,
  Flame,
  Wind,
  Mountain,
  CheckCircle,
  Quote,
  Clock,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useApp } from "@/lib/app-state";
import { AUTHORITATIVE_TRAJECTORIES, AUTHORITATIVE_EMOTION_SONGS, type EmotionTrajectory } from "@/modes/emotion-remediation/content-provider";
import { emotionThemeConfig } from "@/modes/emotion-remediation/theme";
import { BASE_URL } from "@/lib/api";
import { toast } from "sonner";

// Artwork imports
import artNature1 from "@/assets/18fc75d6-df05-469c-9855-d79c4931636d.webp";
import artNature2 from "@/assets/2978e827-6b28-45f0-bbce-575e6023a705.webp";
import artNature3 from "@/assets/3f99cd1e-9061-4ee5-a720-ba4041cfae9d.webp";
import artNature4 from "@/assets/57d4ebea-a77c-4f30-88ad-87e99aac7c1f.webp";
import artNature5 from "@/assets/70fad00b-8e20-42f8-a986-11f0bd7335f5.webp";
import artNature6 from "@/assets/8269a526-98ab-49a2-bcce-928814d51baa.webp";
import artNature7 from "@/assets/89e81ba6-b688-4575-9b1f-964ace72a456.webp";
import artNature8 from "@/assets/af091c30-50ed-4947-85f7-7be2e6a958f4.webp";
import artNature9 from "@/assets/caf22ea5-bc7e-46d8-a845-876858c2a009.webp";
import artNature10 from "@/assets/cbabb2a5-2787-4997-986f-daf7b88017ff.webp";

interface EmotionSongItem {
  id: string;
  title: string;
  dosha: string;
  trajectory: string;
  initialState?: string;
  intermediateState?: string;
  targetState?: string;
  description: string;
  duration: number;
  reviewStatus?: string;
  tags?: string[];
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
      return <Flame className="h-3 w-3 text-amber-600" />;
    case "vata":
      return <Wind className="h-3 w-3 text-purple-600" />;
    case "kapha":
    default:
      return <Mountain className="h-3 w-3 text-emerald-600" />;
  }
}

function getArtworkForSong(index: number): string {
  const pool = [artNature1, artNature2, artNature3, artNature4, artNature5, artNature6, artNature7, artNature8, artNature9, artNature10];
  return pool[index % pool.length] ?? artNature1;
}

export function EmotionHome() {
  const { play, current, playing, favorites, toggleFavorite } = useApp();

  // Songs & Trajectories State
  const [songs, setSongs] = useState<EmotionSongItem[]>(AUTHORITATIVE_EMOTION_SONGS as unknown as EmotionSongItem[]);
  const [trajectories, setTrajectories] = useState<EmotionTrajectory[]>(AUTHORITATIVE_TRAJECTORIES);
  const [loading, setLoading] = useState(false);

  // Filters State
  const [activeChip, setActiveChip] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDosha, setSelectedDosha] = useState("");
  const [selectedTrajectory, setSelectedTrajectory] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Fetch Emotion Songs from API
  async function loadEmotionData() {
    setLoading(true);
    try {
      const origin = BASE_URL.endsWith("/api/v1") ? BASE_URL : `${BASE_URL}/api/v1`;
      const [songsRes, trajRes] = await Promise.all([
        fetch(`${origin}/emotion/content/songs`).then(r => r.json()).catch(() => null),
        fetch(`${origin}/emotion/content/trajectories`).then(r => r.json()).catch(() => null),
      ]);

      const rawSongs = songsRes?.data?.songs || (Array.isArray(songsRes?.data) ? songsRes.data : null);

      if (songsRes?.success && Array.isArray(rawSongs) && rawSongs.length > 0) {
        setSongs(rawSongs.map((s: any) => ({
          id: s.id,
          title: s.title,
          dosha: s.dosha,
          trajectory: s.trajectory,
          initialState: s.initialState || s.initial_state,
          intermediateState: s.intermediateState || s.intermediate_state,
          targetState: s.targetState || s.target_state,
          description: s.description || s.reviewNotes || "Calibrated Vedic sound therapy for emotional balance and mental tranquility.",
          duration: s.duration || s.duration_seconds || 300,
          reviewStatus: s.reviewStatus || s.review_status,
          tags: s.tags || [s.dosha, s.initialState, s.targetState].filter(Boolean),
        })));
      } else {
        setSongs(AUTHORITATIVE_EMOTION_SONGS as unknown as EmotionSongItem[]);
      }

      if (trajRes?.success && Array.isArray(trajRes.data) && trajRes.data.length > 0) {
        setTrajectories(trajRes.data);
      }
    } catch (err: any) {
      console.warn("Failed to load emotion songs from backend API, using authoritative fallback.", err);
      setSongs(AUTHORITATIVE_EMOTION_SONGS as unknown as EmotionSongItem[]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmotionData();
  }, []);

  // Filtered Songs
  const filteredSongs = useMemo(() => {
    return songs.filter((song) => {
      const needle = searchQuery.trim().toLowerCase();

      // Chip matching
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

      // Search matching
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

      // Dropdown filters
      const matchesDosha = selectedDosha ? song.dosha?.toLowerCase() === selectedDosha.toLowerCase() : true;
      const matchesTrajectory = selectedTrajectory ? song.trajectory === selectedTrajectory : true;

      return matchesChip && matchesSearch && matchesDosha && matchesTrajectory;
    });
  }, [songs, activeChip, searchQuery, selectedDosha, selectedTrajectory]);

  // Paginated list
  const totalPages = Math.max(1, Math.ceil(filteredSongs.length / itemsPerPage));
  const paginatedSongs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSongs.slice(start, start + itemsPerPage);
  }, [filteredSongs, currentPage]);

  const handlePlay = (song: EmotionSongItem) => {
    toast.success(`Playing: ${song.title}`);
    play({
      id: song.id,
      title: song.title,
      artist: `Krishna Sanjeevani • ${song.dosha?.toUpperCase()} Balancing`,
      subtitle: song.trajectory,
      duration: song.duration,
      category: "devotional" as any,
      playlistKey: "",
      art: "/govinda-bhakta-pr-seminars-mukund.mp3",
    } as any);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedDosha("");
    setSelectedTrajectory("");
    setActiveChip("All");
    setCurrentPage(1);
  };

  const filterPills = [
    "All",
    "Kapha",
    "Pitta",
    "Vata",
    "2-Step Transitions",
    "3-Step Journeys",
    "Kshobha → Prashanti",
    "Visada → Prashanti",
    "Kshobha → Utsaha",
  ];

  return (
    <AppShell>
      <div 
        className="space-y-8 max-w-[1360px] mx-auto pb-24"
        style={{ "--theme-color": "#7C1C24" } as React.CSSProperties}
      >
        {/* ── 1. ACTIVE SANJEEVANI PATHWAY HERO BANNER ── */}
        <section 
          aria-label="Active Emotion Remediation Pathway"
          className="relative overflow-hidden rounded-[24px] border border-[#B88A2A]/20 bg-gradient-to-r from-[#F7EFE3] via-[#F3E2CB] to-[#E9CEAB] p-6 sm:p-8 md:p-10 shadow-xs"
        >
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-600 via-amber-700 to-transparent blur-2xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left Content */}
            <div className="space-y-3 max-w-xl">
              <span className="inline-block text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#7C1C24]">
                ACTIVE SANJEEVANI PATHWAY
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#65151C] leading-[1.15] tracking-tight">
                Emotion Remediation
              </h2>
              <p className="text-xs sm:text-sm text-[#3A2A1A]/90 leading-relaxed font-medium">
                Therapeutic sound frequencies calibrated to support emotional transformation and neurological equilibrium through Raga Chikitsa.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    const el = document.getElementById("explore-emotion-songs");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="press inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#7C1C24] hover:bg-[#65151C] text-white text-xs sm:text-[13px] font-bold shadow-md shadow-[#7C1C24]/25 transition-all cursor-pointer"
                >
                  <span>Continue Your Journey</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Right Sloka & Quote Card */}
            <div className="shrink-0 lg:max-w-xs xl:max-w-sm rounded-2xl bg-white/40 backdrop-blur-md border border-white/60 p-5 shadow-2xs space-y-2 text-right">
              <p className="font-serif italic text-xs sm:text-[13px] text-[#65151C]/90 leading-snug">
                "Let the divine frequencies restore your natural harmony."
              </p>
              <p className="font-serif text-sm font-bold text-[#7C1C24] leading-relaxed">
                ॐ सर्वे भवन्तु सुखिनः<br />
                सर्वे सन्तु निरामयाः।
              </p>
            </div>
          </div>
        </section>

        {/* ── 2. 7 TRANSITIONAL TRAJECTORIES & JOURNEY CARD ── */}
        <section aria-label="Transitional Trajectories" className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground">
              7 Transitional Trajectories
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#7C1C24]/10 text-[#7C1C24]">
              7 Authoritative Pathways
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {trajectories.map((traj) => {
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
                  className={`press rounded-2xl border p-4 flex flex-col justify-between space-y-3 cursor-pointer transition-all duration-200 shadow-2xs hover:shadow-xs ${
                    isSelected
                      ? "border-[#7C1C24] bg-[#F7E6E7]/35 shadow-xs"
                      : "border-border/80 bg-surface hover:border-[#7C1C24]/40"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-foreground">
                        {traj.type === "three-step" ? "3-Step Journey" : "2-Step Transition"}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-[#7C1C24] flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Active
                        </span>
                      )}
                    </div>
                    <h4 className="font-serif font-bold text-sm text-foreground leading-snug pt-1">
                      {traj.name}
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                      {traj.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[10px] font-medium text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="font-bold text-foreground">{traj.initialState}</span>
                      <ArrowRight className="h-3 w-3 text-[#7C1C24]" />
                      <span className="font-bold text-[#7C1C24]">{traj.targetState}</span>
                    </span>
                    <span className="font-semibold text-amber-800">3 Doshas</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Plato Quote Card */}
          <div className="rounded-2xl border border-amber-900/10 bg-[#FDF9F3] p-4.5 flex items-center gap-3.5 shadow-2xs mt-2">
            <Quote className="h-5 w-5 text-[#B88A2A] shrink-0 rotate-180" />
            <p className="font-serif italic text-xs sm:text-[13px] text-foreground/85 leading-relaxed flex-1">
              "Music gives a soul to the universe, wings to the mind, flight to the imagination, and life to everything."
              <span className="ml-2 not-italic font-sans text-[11px] font-bold text-[#7C1C24]">— Plato</span>
            </p>
          </div>
        </section>

        {/* ── 3. EXPLORE EMOTION SONGS SECTION ── */}
        <section id="explore-emotion-songs" aria-label="Explore Emotion Songs" className="space-y-5 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 px-1">
            <div className="space-y-1">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                Explore Emotion Remediation Songs
              </h3>
              <p className="text-xs text-muted-foreground">
                21 authoritative Vedic compositions calibrated for emotional transition and Dosha balancing
              </p>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {filterPills.map((pill) => {
              const isSelected = activeChip === pill;
              return (
                <button
                  key={pill}
                  onClick={() => {
                    setActiveChip(pill);
                    setCurrentPage(1);
                  }}
                  className={`press shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all select-none cursor-pointer border ${
                    isSelected
                      ? "bg-[#7C1C24] border-[#7C1C24] text-white shadow-xs"
                      : "bg-surface border-border text-foreground hover:border-[#7C1C24]/50 hover:bg-[#FDF9F5]"
                  }`}
                >
                  {pill}
                </button>
              );
            })}
          </div>

          {/* Filter Toolbar Card */}
          <div className="rounded-2xl border border-border/80 bg-surface p-4 sm:p-5 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              {/* Search Field */}
              <div className="lg:col-span-2 space-y-1.5">
                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search emotions, feelings (Kshobha, Visada, Utsaha)..."
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-background text-xs sm:text-sm outline-none focus:border-[#7C1C24] focus:ring-1 focus:ring-[#7C1C24] transition-all"
                  />
                </div>
              </div>

              {/* Ayurvedic Dosha Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Ayurvedic Dosha
                </label>
                <select
                  value={selectedDosha}
                  onChange={(e) => {
                    setSelectedDosha(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs sm:text-sm outline-none focus:border-[#7C1C24] focus:ring-1 focus:ring-[#7C1C24] cursor-pointer"
                >
                  <option value="">All Doshas</option>
                  <option value="Kapha">Kapha (Earth & Water)</option>
                  <option value="Pitta">Pitta (Fire & Water)</option>
                  <option value="Vata">Vata (Air & Ether)</option>
                </select>
              </div>

              {/* Trajectory Dropdown & Reset */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Target Trajectory
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedTrajectory}
                    onChange={(e) => {
                      setSelectedTrajectory(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs sm:text-sm outline-none focus:border-[#7C1C24] focus:ring-1 focus:ring-[#7C1C24] cursor-pointer"
                  >
                    <option value="">All Trajectories</option>
                    {trajectories.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={resetFilters}
                    title="Reset Filters"
                    className="press shrink-0 h-10 px-3 rounded-xl border border-border bg-background hover:bg-secondary text-xs font-bold text-muted-foreground flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    <span className="hidden xl:inline">Reset</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── 4. SONG RESULT ROWS LIST ── */}
          <div className="space-y-3.5">
            {loading ? (
              <div className="h-48 rounded-2xl border border-border bg-surface flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#7C1C24]" />
              </div>
            ) : filteredSongs.length > 0 ? (
              paginatedSongs.map((song, idx) => {
                const isCurrentPlaying = current?.id === song.id && playing;
                const isFav = favorites?.includes(song.id);
                const artworkUrl = getArtworkForSong(idx);

                return (
                  <div
                    key={song.id}
                    className="press group rounded-2xl border border-border/80 bg-surface p-4 sm:p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#7C1C24]/40 hover:shadow-md transition-all duration-300 shadow-2xs"
                  >
                    {/* Left: Thumbnail & Details */}
                    <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden shrink-0 bg-muted shadow-2xs relative">
                        <img
                          src={artworkUrl}
                          alt={song.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-serif text-base sm:text-lg font-bold text-foreground leading-snug">
                            {song.title}
                          </h4>
                          <span className="rounded-full bg-[#FDF2E2] text-[#945617] border border-[#B88A2A]/20 px-2.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                            {getDoshaIcon(song.dosha)}
                            <span>{song.dosha} Balancing</span>
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
                          {song.description}
                        </p>

                        {/* Meta Chips */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground font-medium pt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-[#B88A2A]" />
                            <span>{formatDuration(song.duration)}</span>
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-[#7C1C24]">
                            Trajectory: {song.trajectory}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center w-full md:w-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite?.(song.id);
                        }}
                        className="press h-9.5 w-9.5 rounded-xl border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground cursor-pointer transition-all"
                        aria-label="Toggle favorite"
                      >
                        <Heart className={`h-4 w-4 ${isFav ? "fill-[#7C1C24] text-[#7C1C24]" : ""}`} />
                      </button>

                      <button
                        onClick={() => handlePlay(song)}
                        className="press flex-1 md:flex-none h-9.5 px-5 rounded-xl bg-[#7C1C24] hover:bg-[#65151C] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-[#7C1C24]/20 transition-all cursor-pointer"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>{isCurrentPlaying ? "Playing" : "Stream Session"}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-border bg-surface p-10 text-center space-y-2 shadow-2xs">
                <p className="text-sm font-bold text-foreground">No Emotion Remediation songs match your criteria</p>
                <p className="text-xs text-muted-foreground">Try resetting the filters to explore all calibrated compositions.</p>
              </div>
            )}
          </div>

          {/* ── 5. CIRCULAR PAGINATION CONTROLS ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="press h-9 w-9 rounded-full border border-border bg-surface flex items-center justify-center text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-secondary cursor-pointer shadow-2xs"
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
                    className={`press h-9 w-9 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#7C1C24] text-white shadow-xs"
                        : "bg-surface border border-border/80 text-foreground hover:bg-secondary"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="press h-9 w-9 rounded-full border border-border bg-surface flex items-center justify-center text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-secondary cursor-pointer shadow-2xs"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </section>

        {/* ── 6. PROFESSIONAL AUDITORY WELLNESS STATEMENT ── */}
        <section aria-label="Medical Disclaimer" className="pt-2">
          <div className="rounded-2xl border border-amber-900/15 bg-gradient-to-r from-[#FAF5EC] to-[#F5ECE0] p-5 flex gap-4 items-start shadow-xs">
            <ShieldCheck className="h-5 w-5 text-[#B88A2A] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-xs sm:text-[13px] text-[#65151C]">
                Professional Auditory Wellness Statement
              </h4>
              <p className="text-[11.5px] leading-relaxed text-[#3A2A1A]/85">
                All therapeutic frequencies are sequenced based on Vedic Raga Chikitsa standards and physical acoustic measures. Auditory therapy is a supportive wellness mechanism and is not a replacement for professional clinical advice, diagnoses, or prescriptions.
              </p>
            </div>
          </div>
        </section>

      </div>
    </AppShell>
  );
}
