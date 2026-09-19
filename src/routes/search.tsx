import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search as SearchIcon, X, Play, Clock, Flame, Wind, Mountain, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CardGrid, Chip, Panel, Section } from "@/components/layout-bits";
import { ProgramCard, TrackTile } from "@/components/cards";
import { EmptyState } from "@/components/States";
import { useMode, getActiveMode } from "@/core/mode";
import { useApp } from "@/lib/app-state";
import { AUTHORITATIVE_EMOTION_SONGS, AUTHORITATIVE_TRAJECTORIES } from "@/modes/emotion-remediation/content-provider";
import {
  categories,
  programs,
  purposes,
  recentSearches,
  tracks,
  trendingSearches,
} from "@/lib/content";
import { toast } from "sonner";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search — Krishna Sanjeevani" },
      {
        name: "description",
        content:
          "Search the therapeutic library by emotional state, dosha, raga, or trajectory — instant results and calibrated compositions.",
      },
    ],
  }),
  component: Search,
});

const EMOTION_TRENDING = [
  "Kshobha to Prashanti",
  "Pitta cooling & serenity",
  "Visada grief & sorrow relief",
  "Kapha morning vitality",
  "3-Stage Deep Peace journey",
  "Hare Krishna Shiva Ranjani",
];

const EMOTION_CHIPS = [
  "Kapha",
  "Pitta",
  "Vata",
  "Kshobha → Prashanti",
  "Visada → Prashanti",
  "Kshobha → Utsaha",
  "Visada → Utsaha",
  "Utsaha → Prashanti",
  "3-Step Journeys",
];

function getDoshaBadgeClass(dosha?: string): string {
  switch (dosha?.toLowerCase()) {
    case "pitta":
      return "bg-amber-100 text-amber-800 border-amber-300/60 dark:bg-amber-950/40 dark:text-amber-300";
    case "vata":
      return "bg-purple-100 text-purple-800 border-purple-300/60 dark:bg-purple-950/40 dark:text-purple-300";
    case "kapha":
    default:
      return "bg-emerald-100 text-emerald-800 border-emerald-300/60 dark:bg-emerald-950/40 dark:text-emerald-300";
  }
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

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return "5:00 min";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs} min`;
}

function Search() {
  const { isEmotionMode: ctxIsEmotion } = useMode();
  const isEmotionMode = ctxIsEmotion ?? (getActiveMode() === "emotion_remediation");
  const { play, current, playing } = useApp();
  const [q, setQ] = useState("");
  const [purpose, setPurpose] = useState<string | null>(null);
  const [emotionChip, setEmotionChip] = useState<string | null>(null);

  // ── Surawali Mode Results ──
  const results = useMemo(() => {
    if (isEmotionMode) return [];
    const needle = q.trim().toLowerCase();
    return tracks.filter((t) => {
      const matchesPurpose = purpose
        ? t.purposeTags?.some(
            (tag: any) => tag.name && tag.name.toLowerCase().trim() === purpose.toLowerCase().trim()
          ) || (t.purpose && t.purpose.toLowerCase().trim() === purpose.toLowerCase().trim())
        : true;

      if (!needle) return matchesPurpose && (purpose !== null || false);

      const searchFields = [
        t.title,
        t.raga,
        t.purpose,
        t.subtitle,
        ...(t.purposeTags?.map((tag: any) => tag.name) || []),
      ];

      return (
        matchesPurpose &&
        searchFields.filter(Boolean).some((f) =>
          f!.toLowerCase().includes(needle),
        )
      );
    });
  }, [q, purpose, isEmotionMode]);

  const programResults = useMemo(() => {
    if (isEmotionMode) return [];
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return programs.filter((p) =>
      [p.title, p.subtitle, p.description].filter(Boolean).some((f) => f!.toLowerCase().includes(needle)),
    );
  }, [q, isEmotionMode]);

  // ── Emotion Mode Results ──
  const emotionResults = useMemo(() => {
    if (!isEmotionMode) return [];
    const needle = q.trim().toLowerCase();

    return AUTHORITATIVE_EMOTION_SONGS.filter((song) => {
      // Chip matching
      let matchesChip = true;
      if (emotionChip === "Kapha") matchesChip = song.dosha?.toLowerCase() === "kapha";
      else if (emotionChip === "Pitta") matchesChip = song.dosha?.toLowerCase() === "pitta";
      else if (emotionChip === "Vata") matchesChip = song.dosha?.toLowerCase() === "vata";
      else if (emotionChip === "3-Step Journeys") matchesChip = !!song.trajectory?.includes("--> Utsaha -->");
      else if (emotionChip === "Kshobha → Prashanti") matchesChip = song.trajectory === "Kshobha --> Prashanti";
      else if (emotionChip === "Visada → Prashanti") matchesChip = song.trajectory === "Visada --> Prashanti";
      else if (emotionChip === "Kshobha → Utsaha") matchesChip = song.trajectory === "Kshobha --> Utsaha";
      else if (emotionChip === "Visada → Utsaha") matchesChip = song.trajectory === "Visada --> Utsaha";
      else if (emotionChip === "Utsaha → Prashanti") matchesChip = song.trajectory === "Utsaha --> Prashanti";

      if (!needle) return matchesChip && (emotionChip !== null || false);

      const searchFields = [
        song.title,
        song.dosha,
        song.trajectory,
        song.initialState,
        song.intermediateState,
        song.targetState,
        song.description,
        ...(song.tags || []),
      ];

      return (
        matchesChip &&
        searchFields.filter(Boolean).some((f) =>
          String(f).toLowerCase().includes(needle)
        )
      );
    });
  }, [q, emotionChip, isEmotionMode]);

  const searching = isEmotionMode
    ? q.trim().length > 0 || emotionChip !== null
    : q.trim().length > 0 || purpose !== null;

  const handlePlayEmotionSong = (song: typeof AUTHORITATIVE_EMOTION_SONGS[0]) => {
    toast.success(`Playing: ${song.title}`);
    play({
      id: song.id,
      title: song.title,
      artist: `Krishna Sanjeevani • ${song.dosha?.toUpperCase()} Balancing`,
      subtitle: song.trajectory,
      duration: song.duration || 300,
      category: "devotional" as any,
      playlistKey: "",
      art: "/govinda-bhakta-pr-seminars-mukund.mp3"
    } as any);
  };

  return (
    <AppShell 
      title="Search" 
      subtitle={isEmotionMode ? "Vedic Emotion Remediation & Dosha Balancing" : "Ragas, purposes and programs"}
    >
      {/* Search Input Bar */}
      <div className="animate-rise relative mx-auto max-w-3xl">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-5 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={
            isEmotionMode
              ? "Search emotional states, trajectories, doshas (Kapha/Pitta/Vata), songs..."
              : "Search ragas, purposes, programs"
          }
          aria-label="Search the library"
          className="min-h-14 w-full rounded-field border border-border bg-surface pr-14 pl-14 text-[15px] shadow-soft outline-none placeholder:text-muted-foreground focus-visible:border-cat focus-visible:ring-2 focus-visible:ring-cat/30 md:min-h-16 md:text-[17px] text-foreground"
        />
        {q && (
          <button
            onClick={() => setQ("")}
            aria-label="Clear search"
            className="press absolute top-1/2 right-4 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-secondary cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Chips Filter Bar */}
      <div className="no-scrollbar -mx-5 mt-6 flex gap-2.5 overflow-x-auto px-5 md:-mx-8 md:justify-center md:px-8">
        {isEmotionMode ? (
          <>
            <Chip active={emotionChip === null} onClick={() => setEmotionChip(null)}>
              All Pathways & Doshas
            </Chip>
            {EMOTION_CHIPS.map((chip) => (
              <Chip key={chip} active={emotionChip === chip} onClick={() => setEmotionChip(chip)}>
                {chip}
              </Chip>
            ))}
          </>
        ) : (
          <>
            <Chip active={purpose === null} onClick={() => setPurpose(null)}>
              All purposes
            </Chip>
            {purposes.map((p) => (
              <Chip key={p} active={purpose === p} onClick={() => setPurpose(p)}>
                {p}
              </Chip>
            ))}
          </>
        )}
      </div>

      {/* Discovery / Empty State View */}
      {!searching ? (
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <Panel title="Trending searches">
            <ul className="space-y-1">
              {(isEmotionMode ? EMOTION_TRENDING : trendingSearches).map((s, i) => (
                <li key={s}>
                  <button
                    onClick={() => setQ(s)}
                    className="press flex w-full items-center gap-3 rounded-btn px-2 py-2.5 text-left text-[14px] hover:bg-secondary cursor-pointer text-foreground"
                  >
                    <span className="w-4 text-[13px] font-semibold text-cat">{i + 1}</span>
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title={isEmotionMode ? "Ayurvedic Doshas" : "Recent searches"}>
            {isEmotionMode ? (
              <div className="space-y-3">
                <div 
                  onClick={() => setEmotionChip("Kapha")}
                  className="press p-3 rounded-xl border border-emerald-300/60 bg-emerald-50/50 dark:bg-emerald-950/20 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <Mountain className="h-4 w-4 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-foreground">Kapha Dosha (Earth & Water)</p>
                      <p className="text-[10px] text-muted-foreground">Heavy, steady, grounded</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700">7 Songs</span>
                </div>

                <div 
                  onClick={() => setEmotionChip("Pitta")}
                  className="press p-3 rounded-xl border border-amber-300/60 bg-amber-50/50 dark:bg-amber-950/20 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <Flame className="h-4 w-4 text-amber-600" />
                    <div>
                      <p className="text-xs font-bold text-foreground">Pitta Dosha (Fire & Water)</p>
                      <p className="text-[10px] text-muted-foreground">Dynamic, intense, focused</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-700">7 Songs</span>
                </div>

                <div 
                  onClick={() => setEmotionChip("Vata")}
                  className="press p-3 rounded-xl border border-purple-300/60 bg-purple-50/50 dark:bg-purple-950/20 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <Wind className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-xs font-bold text-foreground">Vata Dosha (Air & Ether)</p>
                      <p className="text-[10px] text-muted-foreground">Light, swift, creative</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-purple-700">7 Songs</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {recentSearches.map((s) => (
                  <Chip key={s} onClick={() => setQ(s)}>
                    {s}
                  </Chip>
                ))}
              </div>
            )}
          </Panel>

          <Panel title={isEmotionMode ? "Transitional Trajectories" : "Browse categories"}>
            {isEmotionMode ? (
              <div className="space-y-2">
                {AUTHORITATIVE_TRAJECTORIES.slice(0, 4).map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setQ(t.name);
                    }}
                    className="press p-2.5 rounded-xl border border-border/80 bg-surface hover:bg-secondary cursor-pointer"
                  >
                    <p className="text-xs font-bold text-foreground">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{t.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 rounded-2xl border border-border p-3"
                  >
                    <img src={c.art} alt="" className="h-12 w-12 rounded-xl object-cover" />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold">{c.name}</p>
                      <p className="truncate text-[12px] text-muted-foreground">
                        {c.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      ) : isEmotionMode ? (
        /* ── Emotion Remediation Search Results ── */
        <Section title="Emotion Remediation Compositions" hint={`${emotionResults.length} results`}>
          {emotionResults.length === 0 ? (
            <EmptyState
              title="No emotion compositions match"
              body="Try searching for a dosha (Kapha, Pitta, Vata) or emotion state (Kshobha, Visada, Utsaha, Prashanti)."
            />
          ) : (
            <div className="space-y-3.5">
              {emotionResults.map((song) => {
                const isCurrentPlaying = current?.id === song.id && playing;
                return (
                  <div
                    key={song.id}
                    className="rounded-card border border-border/70 bg-surface p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:shadow-soft transition-all"
                  >
                    <div className="flex items-start gap-3.5 flex-1">
                      <div className="h-12 w-12 rounded-xl shrink-0 flex items-center justify-center font-display text-white font-bold text-xs bg-cat uppercase tracking-wider shadow-sm mt-0.5">
                        {song.dosha?.substring(0, 3)}
                      </div>

                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-display font-bold text-base text-foreground">
                            {song.title}
                          </h4>
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getDoshaBadgeClass(song.dosha)}`}>
                            {getDoshaIcon(song.dosha)}
                            <span>{song.dosha}</span>
                          </span>
                          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold text-foreground">
                            {song.trajectory}
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {song.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-muted-foreground pt-0.5">
                          <span className="flex items-center gap-1 font-semibold text-foreground">
                            <span>{song.initialState}</span>
                            <ArrowRight className="h-3 w-3 text-cat" />
                            <span className="text-cat">{song.targetState}</span>
                          </span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDuration(song.duration)}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePlayEmotionSong(song)}
                      className="press flex-1 md:flex-none min-h-10 px-5 rounded-btn bg-cat text-white text-xs font-bold hover:brightness-110 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>{isCurrentPlaying ? "Playing..." : "Stream Session"}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </Section>
      ) : (
        /* ── Surawali Search Results ── */
        <>
          <Section title="Sessions" hint={`${results.length} results`}>
            {results.length === 0 ? (
              <EmptyState
                title="No sessions match"
                body="Try a raga name like Neelambari, or pick a purpose chip above."
              />
            ) : (
              <CardGrid>
                {results.map((t) => (
                  <TrackTile key={t.id} track={t} />
                ))}
              </CardGrid>
            )}
          </Section>

          {programResults.length > 0 && (
            <Section title="Programs" hint={`${programResults.length} results`}>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {programResults.map((p) => (
                  <ProgramCard key={p.id} program={p} wide />
                ))}
              </div>
            </Section>
          )}
        </>
      )}
    </AppShell>
  );
}
