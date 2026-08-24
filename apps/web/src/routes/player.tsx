import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  Gauge,
  Heart,
  Info,
  ListMusic,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Timer,
  Waves,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Slider } from "@/components/ui/slider";
import { Panel } from "@/components/layout-bits";
import { TrackRow } from "@/components/cards";
import { EmptyState } from "@/components/States";
import { useApp } from "@/lib/app-state";
import { formatTime } from "@/lib/content";

export const Route = createFileRoute("/player")({
  head: () => ({
    meta: [
      { title: "Now playing — Krishna Sanjeevani" },
      {
        name: "description",
        content:
          "Immersive therapeutic player with listening instructions, recommended frequency, sleep timer, playback speed and the upcoming queue.",
      },
      { property: "og:title", content: "Now playing — Krishna Sanjeevani" },
      {
        property: "og:description",
        content: "A calm, streaming-only player built around guided therapeutic listening.",
      },
    ],
  }),
  component: Player,
});

const speeds = [0.75, 0.9, 1, 1.1, 1.25];
const timers = [10, 20, 30, 45, 60];

const RAGA_DETAILS: Record<string, {
  time: string;
  emotion: string;
  rasa: string;
  notes: string;
}> = {
  "Kalyani": {
    time: "Evening (Circadian: 6 PM - 9 PM)",
    emotion: "Devotion & Tranquility",
    rasa: "Shanti / Bhakti",
    notes: "S R G M P D N (All Shuddha, Tivra Ma)",
  },
  "Bhairavi": {
    time: "Early Morning (Circadian: 6 AM - 9 AM)",
    emotion: "Deep Calm & Healing",
    rasa: "Karuna / Shanti",
    notes: "S r g M P d n (Komal Re, Ga, Dha, Ni)",
  },
  "Yaman": {
    time: "Evening / Night (Circadian: 7 PM - 10 PM)",
    emotion: "Inner Peace & Relaxation",
    rasa: "Shringara / Karuna",
    notes: "S R G M# P D N (Tivra Ma)",
  },
  "Todi": {
    time: "Morning (Circadian: 9 AM - 12 PM)",
    emotion: "Focus & Spiritual Upliftment",
    rasa: "Bhakti / Karuna",
    notes: "S r g M# P d N (Komal Re, Ga, Dha, Tivra Ma)",
  },
  "Bhairav": {
    time: "Sunrise (Circadian: 4 AM - 6 AM)",
    emotion: "Peace & Meditation",
    rasa: "Shanti / Bhakti",
    notes: "S r G M P d N (Komal Re, Dha)",
  },
};

function Waveform({
  playing,
  duration,
  position,
  seek,
}: {
  playing: boolean;
  duration: number;
  position: number;
  seek: (s: number) => void;
}) {
  const percent = position / (duration || 1);
  return (
    <div className="flex h-14 items-end justify-center gap-[3.5px] cursor-pointer py-1.5" aria-label="Acoustic waveform">
      {Array.from({ length: 50 }).map((_, i) => {
        const isActive = i / 50 <= percent;
        const targetSec = Math.floor((i / 50) * duration);
        return (
          <span
            key={i}
            onClick={() => seek(targetSec)}
            className={`w-[3.5px] rounded-full transition-all duration-300 hover:scale-y-110 ${
              isActive ? "bg-cat" : "bg-stone-200"
            } ${playing && isActive ? "wave-bar" : ""}`}
            style={{
              height: `${12 + Math.abs(Math.sin(i / 2.2)) * 32}px`,
              animationDelay: `${(i % 9) * 80}ms`,
            }}
          />
        );
      })}
    </div>
  );
}

function Player() {
  const {
    current,
    playing,
    toggle,
    position,
    seek,
    skip,
    next,
    previous,
    queue,
    speed,
    setSpeed,
    sleepTimer,
    setSleepTimer,
    isFavorite,
    toggleFavorite,
  } = useApp();
  const navigate = useNavigate();
  const [localProgress, setLocalProgress] = useState<number | null>(null);

  if (!current) {
    return (
      <AppShell title="Now playing" narrow>
        <EmptyState
          icon={<Waves className="h-6 w-6" />}
          title="Nothing is playing"
          body="Choose a surāvali from the library and it will appear here with its listening guidance."
          action={
            <Link
              to="/home"
              className="press inline-flex min-h-11 items-center rounded-btn bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            >
              Browse sessions
            </Link>
          }
        />
      </AppShell>
    );
  }

  const fav = isFavorite(current.id);

  // Raga details lookup
  const ragaNameClean = (current.raga || "").trim().toLowerCase();
  const matchedKey = Object.keys(RAGA_DETAILS).find(key => ragaNameClean.includes(key.toLowerCase()));
  const ragaProp = matchedKey ? RAGA_DETAILS[matchedKey] : {
    time: "Circadian Recommended time",
    emotion: "Sattva & Meditative Calm",
    rasa: "Shanti (Peace)",
    notes: "Classical Circadian Swaras",
  };

  return (
    <AppShell title="Now playing" subtitle={`${current.raga || "Sonic Session"} · ${current.purpose || "Therapy"}`}>
      <Link
        to="/home"
        className="press mb-6 inline-flex items-center gap-2 text-[13px] font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Back to home
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] xl:gap-12">
        {/* Main Player Area split into Parameters (Left) and Immersive Controls (Right) */}
        <div className="animate-rise overflow-hidden rounded-card border border-border bg-surface p-6 shadow-soft md:p-8">
          <div className="grid gap-8 md:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
            
            {/* Parameters Block & Sanskrit Verse Card (Left) */}
            <div className="flex flex-col gap-6">
              {/* Raga Parameters */}
              <div className="rounded-2xl border border-border bg-background/50 p-5 space-y-4">
                <h3 className="font-display text-[14px] font-semibold border-b border-border pb-2 text-cat uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5" /> Raga Properties
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Raga Name
                    </span>
                    <span className="text-[13px] font-medium text-foreground">
                      {current.raga || "Circadian Raga"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Circadian Timing
                    </span>
                    <span className="text-[13px] font-medium text-foreground">
                      {ragaProp.time}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Primary Emotion
                    </span>
                    <span className="text-[13px] font-medium text-foreground">
                      {ragaProp.emotion}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Rasa (Mood)
                    </span>
                    <span className="text-[13px] font-medium text-foreground">
                      {ragaProp.rasa}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Scale Swaras
                    </span>
                    <span className="text-[13px] font-mono font-medium text-cat">
                      {ragaProp.notes}
                    </span>
                  </div>
                </div>
              </div>

              {/* Antique Sanskrit Verse Card */}
              <div className="rounded-2xl border border-amber-800/10 bg-[#FFFDF9] p-5 shadow-sm relative overflow-hidden text-center">
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#C9A84C_1.5px,transparent_1.5px)] [background-size:12px_12px]" />
                <div className="relative space-y-2">
                  <span className="text-[9px] font-bold tracking-[0.2em] text-amber-800/70 uppercase font-sans">
                    Divine Verse
                  </span>
                  <p className="text-base font-serif font-bold text-stone-900 leading-normal">
                    पिब मनः श्रीकृष्णदिव्यौषधम्
                  </p>
                  <p className="text-[10px] text-stone-600 font-serif italic">
                    piba manaḥ śrī-kṛṣṇa-divyauṣadham
                  </p>
                  <div className="h-px w-10 bg-amber-800/20 mx-auto my-1.5" />
                  <p className="text-[11px] text-amber-900 font-medium leading-relaxed">
                    "O mind, drink the divine medicine of Sri Krishna!"
                  </p>
                </div>
              </div>
            </div>

            {/* Immersive Controls & Art (Right) */}
            <div className="flex flex-col justify-center">
              <div className="grid gap-6 md:grid-cols-[200px_minmax(0,1fr)] md:items-center">
                <div className="relative mx-auto w-48 md:w-full">
                  <span className="animate-breathe absolute -inset-3 rounded-[32px] bg-cat-light" />
                  <img
                    src={current.art}
                    alt={`Artwork for ${current.title}`}
                    width={1024}
                    height={1024}
                    className="relative aspect-square w-full rounded-[24px] object-cover shadow-lift"
                  />
                </div>

                <div className="min-w-0">
                  <span className="inline-flex rounded-full bg-cat-light px-3 py-1 text-[10px] font-semibold tracking-wider text-cat uppercase">
                    {current.purpose}
                  </span>
                  <h1 className="mt-3 font-display text-[22px] leading-tight font-semibold md:text-[28px]">
                    {current.title}
                  </h1>
                  <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                    {current.raga} · {current.subtitle}
                  </p>

                  <div className="mt-4">
                    <Waveform
                      playing={playing}
                      duration={current.duration}
                      position={localProgress !== null ? localProgress : position}
                      seek={seek}
                    />
                  </div>

                  <Slider
                    value={[localProgress !== null ? localProgress : position]}
                    max={current.duration}
                    step={1}
                    onValueChange={(v) => setLocalProgress(v[0] ?? 0)}
                    onValueCommit={(v) => {
                      seek(v[0] ?? 0);
                      setLocalProgress(null);
                    }}
                    aria-label="Seek within session"
                  />
                  <div className="mt-2 flex justify-between text-[11px] tabular-nums text-muted-foreground">
                    <span>{formatTime(localProgress !== null ? localProgress : position)}</span>
                    <span>-{formatTime(Math.max(0, current.duration - (localProgress !== null ? localProgress : position)))}</span>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-3">
                    <button
                      onClick={() => toggleFavorite(current.id)}
                      aria-pressed={fav}
                      aria-label={fav ? "Remove from favourites" : "Add to favourites"}
                      className={`press grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-surface shadow-soft ${fav ? "text-cat" : "text-muted-foreground"}`}
                    >
                      <Heart className="h-4 w-4" fill={fav ? "currentColor" : "none"} />
                    </button>

                    <div className="flex items-center gap-2 md:gap-3">
                      <button
                        onClick={previous}
                        aria-label="Previous session"
                        className="press grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:text-foreground"
                      >
                        <SkipBack className="h-4.5 w-4.5" fill="currentColor" />
                      </button>
                      <button
                        onClick={() => skip(-15)}
                        aria-label="Back 15 seconds"
                        className="press grid h-10 w-10 place-items-center rounded-full text-foreground"
                      >
                        <RotateCcw className="h-4.5 w-4.5" strokeWidth={1.8} />
                      </button>

                      {/* Central progress play button in maroon and gold */}
                      <div className="relative flex items-center justify-center">
                        <svg className="absolute h-18 w-18 transform -rotate-90">
                          <circle
                            cx="36"
                            cy="36"
                            r="32"
                            className="text-stone-200"
                            strokeWidth="2"
                            stroke="currentColor"
                            fill="transparent"
                          />
                          <circle
                            cx="36"
                            cy="36"
                            r="32"
                            className="text-amber-500 transition-all duration-300"
                            strokeWidth="2"
                            strokeDasharray={2 * Math.PI * 32}
                            strokeDashoffset={(1 - (position / (current.duration || 1))) * (2 * Math.PI * 32)}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                          />
                        </svg>
                        <button
                          onClick={toggle}
                          aria-label={playing ? "Pause session" : "Play session"}
                          className="press z-10 grid h-13 w-13 place-items-center rounded-full bg-[#4D0F1B] text-white shadow-lift focus-visible:ring-2 focus-visible:ring-cat focus-visible:ring-offset-4 focus-visible:outline-none"
                        >
                          {playing ? (
                            <Pause className="h-5 w-5" fill="currentColor" />
                          ) : (
                            <Play className="h-5 w-5 translate-x-0.5" fill="currentColor" />
                          )}
                        </button>
                      </div>

                      <button
                        onClick={() => skip(30)}
                        aria-label="Forward 30 seconds"
                        className="press grid h-10 w-10 place-items-center rounded-full text-foreground"
                      >
                        <RotateCw className="h-4.5 w-4.5" strokeWidth={1.8} />
                      </button>
                      <button
                        onClick={next}
                        aria-label="Next session"
                        className="press grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:text-foreground"
                      >
                        <SkipForward className="h-4.5 w-4.5" fill="currentColor" />
                      </button>
                    </div>

                    <button
                      onClick={() => navigate({ to: "/session-complete" })}
                      aria-label="Mark session completed"
                      className="press grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-surface text-muted-foreground shadow-soft hover:text-cat"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-background/60 p-4">
              <p className="flex items-center gap-2 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                <Info className="h-3.5 w-3.5" /> Listening instructions
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-foreground/80">{current.instructions}</p>
            </div>
            <div className="rounded-xl bg-cat-light p-4">
              <p className="text-[10px] font-semibold tracking-wider text-cat uppercase">
                Recommended frequency
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-cat font-medium">{current.frequency}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <button
              onClick={() => navigate({ to: "/session-complete" })}
              className="press flex min-h-11 items-center justify-center gap-2 rounded-btn bg-primary px-6 text-[14px] font-semibold text-primary-foreground shadow-soft hover:bg-primary-hover"
            >
              <CheckCircle2 className="h-4 w-4" /> Session completed
            </button>
            <p className="text-[11px] text-muted-foreground">
              Streaming only · sessions are guided, never downloaded
            </p>
          </div>
        </div>

        {/* Aside controls */}
        <aside className="space-y-6">
          <Panel title="Session settings">
            <div className="space-y-7">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Gauge className="h-4 w-4 text-cat" /> Playback speed
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {speeds.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      aria-pressed={speed === s}
                      className={`press min-h-9 rounded-btn border px-3 text-xs font-medium ${
                        speed === s
                          ? "border-cat bg-cat text-cat-foreground"
                          : "border-border bg-surface text-muted-foreground"
                      }`}
                    >
                      {s}×
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Timer className="h-4 w-4 text-cat" /> Sleep timer
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => setSleepTimer(null)}
                    aria-pressed={sleepTimer === null}
                    className={`press min-h-9 rounded-btn border px-3 text-xs font-medium ${
                      sleepTimer === null
                        ? "border-cat bg-cat text-cat-foreground"
                        : "border-border bg-surface text-muted-foreground"
                    }`}
                  >
                    Off
                  </button>
                  {timers.map((m) => (
                    <button
                      key={m}
                      onClick={() => setSleepTimer(m)}
                      aria-pressed={sleepTimer === m}
                      className={`press min-h-9 rounded-btn border px-3 text-xs font-medium ${
                        sleepTimer === m
                          ? "border-cat bg-cat text-cat-foreground"
                          : "border-border bg-surface text-muted-foreground"
                      }`}
                    >
                      {m} min
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Up next">
            <div className="-mx-2">
              {queue.map((t, i) => (
                <TrackRow key={t.id} track={t} index={i} />
              ))}
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <ListMusic className="h-3.5 w-3.5" /> Sequenced to preserve the therapeutic arc
            </p>
          </Panel>
        </aside>
      </div>
    </AppShell>
  );
}
