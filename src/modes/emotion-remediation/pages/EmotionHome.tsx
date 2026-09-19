import { useState, useMemo, useEffect } from "react";
import {
  Play,
  Heart,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Flame,
  Wind,
  Mountain,
  CheckCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useApp } from "@/lib/app-state";
import { AUTHORITATIVE_TRAJECTORIES, AUTHORITATIVE_EMOTION_SONGS, type EmotionTrajectory } from "@/modes/emotion-remediation/content-provider";
import { emotionThemeConfig } from "@/modes/emotion-remediation/theme";
import { api, BASE_URL } from "@/lib/api";
import { toast } from "sonner";

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

export function EmotionHome() {
  const { play, current, playing, favorites, toggleFavorite } = useApp();

  // Songs & Trajectories State
  const [songs, setSongs] = useState<EmotionSongItem[]>(AUTHORITATIVE_EMOTION_SONGS as EmotionSongItem[]);
  const [trajectories, setTrajectories] = useState<EmotionTrajectory[]>(AUTHORITATIVE_TRAJECTORIES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [activeChip, setActiveChip] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDosha, setSelectedDosha] = useState("");
  const [selectedTrajectory, setSelectedTrajectory] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // ── Fetch Emotion Songs from API ──
  async function loadEmotionData() {
    setLoading(true);
    setError(null);
    try {
      const origin = BASE_URL.endsWith("/api/v1") ? BASE_URL : `${BASE_URL}/api/v1`;
      const [songsRes, trajRes] = await Promise.all([
        fetch(`${origin}/emotion/content/songs`).then(r => r.json()).catch(() => null),
        fetch(`${origin}/emotion/content/trajectories`).then(r => r.json()).catch(() => null),
      ]);

      // Handle both response shapes: { data: { total, songs: [...] } } and { data: [...] }
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
        // Use authoritative mapping fallback
        setSongs(AUTHORITATIVE_EMOTION_SONGS as EmotionSongItem[]);
      }

      if (trajRes?.success && Array.isArray(trajRes.data) && trajRes.data.length > 0) {
        setTrajectories(trajRes.data);
      }
    } catch (err: any) {
      console.warn("Failed to load emotion songs from backend API, using authoritative mapping.", err);
      setSongs(AUTHORITATIVE_EMOTION_SONGS as EmotionSongItem[]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmotionData();
  }, []);

  // ── Filtered Songs ──
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
  const totalPages = Math.ceil(filteredSongs.length / itemsPerPage);
  const paginatedSongs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSongs.slice(start, start + itemsPerPage);
  }, [filteredSongs, currentPage]);

  // Recommended tracks (top 3 curated)
  const recommendedSongs = useMemo(() => {
    return songs.slice(0, 3);
  }, [songs]);

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

  const primaryColor = emotionThemeConfig.theme.primary; // #7C1C24

  return (
    <AppShell>
      <div 
        className="space-y-8 max-w-[1600px] mx-auto pb-24"
        style={{ "--theme-color": primaryColor } as React.CSSProperties}
      >
        {/* ── 1. Emotion Remediation Hero Block ── */}
        <div 
          className="rounded-card border p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 shadow-soft"
          style={{ 
            borderColor: primaryColor + "20",
            background: `linear-gradient(135deg, ${primaryColor}08, ${primaryColor}14)` 
          }}
        >
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-cat-light px-3 py-1 text-[11px] font-bold text-cat uppercase tracking-wider">
              <Sparkles className="h-3 w-3" />
              <span>Active Emotion Remediation Pathway</span>
            </div>
            <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground" style={{ color: primaryColor }}>
              Krishna Sanjeevani
            </h2>
            <p className="text-sm text-muted-foreground/90 max-w-2xl leading-relaxed">
              Targeted auditory therapy to transition emotional states (transforming <em>Kshobha</em>/Agitation & <em>Visada</em>/Grief to <em>Prashanti</em>/Serenity & <em>Utsaha</em>/Vitality) calibrated to your Ayurvedic Dosha.
            </p>
          </div>
          <div 
            className="shrink-0 rounded-btn px-4 py-3 border font-display text-xs leading-normal font-semibold text-center italic text-muted-foreground/90 bg-background max-w-md shadow-sm" 
            style={{ borderColor: primaryColor + "30" }}
          >
            {emotionThemeConfig.greetingText}
          </div>
        </div>

        {/* ── 2. 7 Transitional Trajectories ── */}
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

        {/* ── 3. Recommended for You ── */}
        {!searchQuery && !selectedDosha && !selectedTrajectory && activeChip === "All" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="font-semibold text-foreground text-lg">Recommended for Your Emotional Balance</h3>
                <p className="text-xs text-muted-foreground">Curated transitional frequencies to restore equilibrium</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedSongs.map((song) => {
                const isCurrentPlaying = current?.id === song.id && playing;
                const isFav = favorites?.includes(song.id);

                return (
                  <div
                    key={song.id}
                    className="rounded-card border border-border/70 bg-surface p-5 flex flex-col justify-between space-y-4 hover:shadow-soft hover:border-cat/40 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getDoshaBadgeClass(song.dosha)}`}>
                          {getDoshaIcon(song.dosha)}
                          <span>{song.dosha}</span>
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite?.(song.id);
                          }}
                          className="press p-1 rounded-full hover:bg-secondary text-muted-foreground cursor-pointer"
                        >
                          <Heart className={`h-4 w-4 ${isFav ? "fill-cat text-cat" : ""}`} />
                        </button>
                      </div>

                      <div>
                        <h4 className="font-display font-bold text-base text-foreground leading-snug">
                          {song.title}
                        </h4>
                        <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
                          {song.trajectory}
                        </p>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {song.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border/40">
                      <span className="text-xs font-medium text-muted-foreground">
                        {formatDuration(song.duration)}
                      </span>
                      <button
                        onClick={() => handlePlay(song)}
                        className="press h-9 px-4 rounded-btn text-xs font-bold text-white flex items-center gap-1.5 shadow-sm hover:brightness-110 cursor-pointer"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>{isCurrentPlaying ? "Playing" : "Stream"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 4. Main Explore Emotion Remediation Songs Catalog ── */}
        <div id="explore-emotion-songs" className="space-y-6 scroll-mt-20">
          <div className="px-1 space-y-1">
            <h3 className="font-semibold text-foreground text-lg">
              Explore Emotion Remediation Songs
            </h3>
            <p className="text-xs text-muted-foreground">
              21 authoritative Vedic compositions calibrated for emotional transition and Dosha balancing
            </p>
          </div>

          {/* Chips categories filter */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {emotionThemeConfig.filters.map(filterName => (
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
                    placeholder="Search emotions, songs, feelings (Kshobha, Visada, Utsaha, Prashanti)..."
                    className="w-full min-h-10 pl-9 pr-4 rounded-btn border border-border bg-background text-sm outline-none focus-visible:ring-1 focus-visible:ring-cat focus-visible:border-cat transition-all text-foreground"
                  />
                </div>
              </div>

              {/* Ayurvedic Dosha filter */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Ayurvedic Dosha
                </label>
                <select
                  value={selectedDosha}
                  onChange={(e) => {
                    setSelectedDosha(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full min-h-10 px-3 rounded-btn border border-border bg-background text-sm outline-none focus-visible:ring-1 focus-visible:ring-cat"
                >
                  <option value="">-- All Doshas --</option>
                  <option value="kapha">Kapha (Earth & Water)</option>
                  <option value="pitta">Pitta (Fire & Water)</option>
                  <option value="vata">Vata (Air & Ether)</option>
                </select>
              </div>

              {/* Trajectory Pathway filter */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Trajectory Pathway
                </label>
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
            {loading ? (
              <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 border border-dashed border-border rounded-card bg-surface/40">
                <Loader2 className="h-8 w-8 animate-spin text-cat" />
                <p className="text-xs text-muted-foreground font-medium">Loading Emotion Remediation songs...</p>
              </div>
            ) : error ? (
              <div className="rounded-card border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
                <AlertTriangle className="mx-auto h-8 w-8 text-destructive" />
                <p className="text-sm font-semibold text-foreground">We couldn't load your Emotion Remediation content.</p>
                <button
                  onClick={loadEmotionData}
                  className="press px-4 py-2 rounded-btn bg-cat text-white text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Retry</span>
                </button>
              </div>
            ) : filteredSongs.length > 0 ? (
              paginatedSongs.map(song => {
                const isCurrentPlaying = current?.id === song.id && playing;
                const isFav = favorites?.includes(song.id);

                return (
                  <div 
                    key={song.id} 
                    className="rounded-card border border-border/70 bg-surface p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:shadow-soft hover:border-cat/40 transition-all duration-200"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      {/* Album / Avatar Icon */}
                      <div 
                        className="h-14 w-14 rounded-2xl shrink-0 flex flex-col items-center justify-center font-display text-white font-bold text-sm select-none uppercase tracking-wider shadow-sm mt-0.5"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <span className="text-xs font-black">{song.dosha.substring(0, 3)}</span>
                      </div>

                      {/* Song Details & Description */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-display font-bold text-[16px] text-foreground">
                            {song.title}
                          </h4>
                          
                          {/* Dosha Badge */}
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getDoshaBadgeClass(song.dosha)}`}>
                            {getDoshaIcon(song.dosha)}
                            <span>{song.dosha}</span>
                          </span>

                          {/* Trajectory Badge */}
                          <span className="rounded-full bg-secondary border border-border/50 px-2.5 py-0.5 text-[10px] font-bold text-foreground">
                            {song.trajectory}
                          </span>
                        </div>

                        {/* Authoritative Description */}
                        <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
                          {song.description}
                        </p>

                        {/* State Flow & Duration */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-medium text-muted-foreground pt-0.5">
                          {song.initialState && song.targetState && (
                            <span className="flex items-center gap-1.5 text-foreground font-semibold">
                              <span>{song.initialState}</span>
                              <ArrowRight className="h-3 w-3 text-cat" />
                              <span className="text-cat">{song.targetState}</span>
                            </span>
                          )}
                          <span>&bull;</span>
                          <span>Duration: {formatDuration(song.duration)}</span>
                          <span>&bull;</span>
                          <span>Stream: Dedicated R2 Bucket</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite?.(song.id);
                        }}
                        className="press p-2 rounded-btn border border-border hover:bg-secondary text-muted-foreground cursor-pointer"
                        title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                      >
                        <Heart className={`h-4 w-4 ${isFav ? "fill-cat text-cat" : ""}`} />
                      </button>

                      <button
                        onClick={() => handlePlay(song)}
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
              <div className="rounded-card border border-border bg-surface/60 p-8 text-center shadow-soft space-y-2">
                <Sparkles className="mx-auto h-8 w-8 text-muted-foreground/60 animate-pulse" />
                <p className="text-[13px] font-semibold text-foreground">No Emotion Remediation songs matched your criteria</p>
                <p className="text-[11px] text-muted-foreground">Try resetting the filters or tweaking your keywords.</p>
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

        {/* ── 5. Professional Auditory Wellness Statement ── */}
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
    </AppShell>
  );
}
