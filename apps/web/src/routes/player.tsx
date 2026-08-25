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

const RAGA_DETAILS: Record<
  string,
  {
    time: string;
    emotion: string;
    rasa: string;
    notes: string;
  }
> = {
  Kalyani: {
    time: "Evening (Circadian: 6 PM - 9 PM)",
    emotion: "Devotion & Tranquility",
    rasa: "Shanti / Bhakti",
    notes: "S R G M P D N (All Shuddha, Tivra Ma)",
  },
  Bhairavi: {
    time: "Early Morning (Circadian: 6 AM - 9 AM)",
    emotion: "Deep Calm & Healing",
    rasa: "Karuna / Shanti",
    notes: "S r g M P d n (Komal Re, Ga, Dha, Ni)",
  },
  Yaman: {
    time: "Evening / Night (Circadian: 7 PM - 10 PM)",
    emotion: "Inner Peace & Relaxation",
    rasa: "Shringara / Karuna",
    notes: "S R G M# P D N (Tivra Ma)",
  },
  Todi: {
    time: "Morning (Circadian: 9 AM - 12 PM)",
    emotion: "Focus & Spiritual Upliftment",
    rasa: "Bhakti / Karuna",
    notes: "S r g M# P d N (Komal Re, Ga, Dha, Tivra Ma)",
  },
  Bhairav: {
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
    <div
      className="flex h-14 items-end justify-center gap-[3.5px] cursor-pointer py-1.5"
      aria-label="Acoustic waveform"
    >
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
  const matchedKey = Object.keys(RAGA_DETAILS).find((key) =>
    ragaNameClean.includes(key.toLowerCase()),
  );
  const ragaProp = (matchedKey ? RAGA_DETAILS[matchedKey] : null) || {
    time: "Circadian Recommended time",
    emotion: "Sattva & Meditative Calm",
    rasa: "Shanti (Peace)",
    notes: "Classical Circadian Swaras",
  };

  return (
    <AppShell
      title="Now playing"
      subtitle={`${current.raga || "Sonic Session"} · ${current.purpose || "Therapy"}`}
    >
      <div className="mx-auto max-w-[1280px] px-2 py-4">
        {/* Sleek Navigation Back Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/home"
            className="press inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" /> Back to home
          </Link>
          <span className="text-xs font-semibold uppercase tracking-widest text-cat/80 bg-cat-light px-3 py-1 rounded-full">
            Therapeutic Session
          </span>
        </div>

        {/* Responsive Grid */}
        <div className="grid gap-8 lg:grid-cols-[1fr_420px] xl:gap-12 items-start">
          
          {/* LEFT COLUMN: Visuals & Scripture Context */}
          <div className="space-y-6">
            
            {/* Ambient Artwork & Metadata */}
            <div className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-soft flex flex-col md:flex-row gap-6 items-center">
              {/* Cover Art with Ambient Shadow */}
              <div className="relative shrink-0 w-52 h-52 md:w-60 md:h-60">
                <div className="absolute -inset-2.5 rounded-[32px] bg-gradient-to-tr from-amber-500/20 via-cat-light to-amber-500/10 blur-md opacity-75" />
                <img
                  src={current.art}
                  alt={`Artwork for ${current.title}`}
                  className="relative aspect-square h-full w-full rounded-[24px] object-cover shadow-lift border border-border/30"
                />
              </div>

              {/* Title & Badges */}
              <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-cat-light px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-cat">
                    <Sparkles className="h-3 w-3" /> {current.purpose}
                  </span>
                  <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-foreground">
                    {current.title}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Raga {current.raga} · {current.subtitle}
                  </p>
                </div>

                {/* Swaras & Raga Details Badges */}
                <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
                  <span className="rounded-lg bg-secondary/80 px-2.5 py-1 text-[11px] font-medium text-foreground">
                    🕒 {ragaProp.time.split(" (")[0] || "Circadian"}
                  </span>
                  <span className="rounded-lg bg-secondary/80 px-2.5 py-1 text-[11px] font-medium text-foreground">
                    🎭 {ragaProp.rasa.split(" / ")[0] || "Mood"}
                  </span>
                </div>
              </div>
            </div>

            {/* Sacred Divine Verse Card (Scripture parchment) */}
            <div className="relative overflow-hidden rounded-3xl border border-amber-900/10 bg-[#FFFDF9] p-6 shadow-sm text-center">
              {/* Elegant parchment background pattern */}
              <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#854d0e_1.5px,transparent_1.5px)] [background-size:16px_16px]" />
              <div className="relative space-y-3">
                <span className="text-[10px] font-bold tracking-[0.25em] text-amber-800/80 uppercase">
                  Divine Verse
                </span>
                <p className="text-xl font-serif font-bold text-stone-900 tracking-wide">
                  पिब मनः श्रीकृष्णदिव्यौषधम्
                </p>
                <p className="text-xs text-stone-500 font-serif italic">
                  piba manaḥ śrī-kṛṣṇa-divyauṣadham
                </p>
                <div className="h-0.5 w-16 bg-amber-800/20 mx-auto my-2" />
                <p className="text-sm text-amber-900 font-serif leading-relaxed italic max-w-md mx-auto">
                  "O mind, drink the divine medicine of Sri Krishna!"
                </p>
              </div>
            </div>

            {/* Combined Therapeutic Guidance */}
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft space-y-4">
              <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                <Info className="h-4 w-4 text-cat" /> Therapeutic Guide
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
                  <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Listening Method
                  </span>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-foreground/80">
                    {current.instructions}
                  </p>
                </div>
                <div className="rounded-2xl bg-cat-light/50 p-4">
                  <span className="block text-[10px] font-bold tracking-wider text-cat uppercase">
                    Recommended Frequency
                  </span>
                  <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-cat">
                    {current.frequency}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Controls, Parameters, Queue */}
          <div className="space-y-6">

            {/* Immersive Playback Console Card */}
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft space-y-6">
              
              {/* Waveform Visualization */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Therapeutic Arc
                  </span>
                  <span className="text-[11px] text-cat font-semibold flex items-center gap-1">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-cat animate-pulse" />
                    Live Session
                  </span>
                </div>
                <Waveform
                  playing={playing}
                  duration={current.duration}
                  position={localProgress !== null ? localProgress : position}
                  seek={seek}
                />
              </div>

              {/* Progress Slider (Spotify Style) */}
              <div>
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
                  className="cursor-pointer"
                />
                <div className="mt-2.5 flex justify-between text-xs tabular-nums text-muted-foreground font-medium">
                  <span>{formatTime(localProgress !== null ? localProgress : position)}</span>
                  <span>
                    -{formatTime(
                      Math.max(
                        0,
                        current.duration - (localProgress !== null ? localProgress : position),
                      ),
                    )}
                  </span>
                </div>
              </div>

              {/* Spotify-style Media Controls Row */}
              <div className="flex items-center justify-between px-2">
                {/* Favorite Heart */}
                <button
                  onClick={() => toggleFavorite(current.id)}
                  aria-pressed={fav}
                  className={`press grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-secondary ${fav ? "text-cat" : "text-muted-foreground"}`}
                >
                  <Heart className="h-5 w-5" fill={fav ? "currentColor" : "none"} />
                </button>

                {/* Skip back */}
                <button
                  onClick={previous}
                  className="press grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:text-foreground"
                >
                  <SkipBack className="h-5 w-5" fill="currentColor" />
                </button>

                {/* Rewind 15s */}
                <button
                  onClick={() => skip(-15)}
                  className="press grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>

                {/* Central Circle Play/Pause Button */}
                <button
                  onClick={toggle}
                  className="press grid h-14 w-14 place-items-center rounded-full bg-cat text-cat-foreground shadow-lift hover:scale-105 transition-transform"
                >
                  {playing ? (
                    <Pause className="h-6 w-6" fill="currentColor" />
                  ) : (
                    <Play className="h-6 w-6 translate-x-0.5" fill="currentColor" />
                  )}
                </button>

                {/* Fast Forward 30s */}
                <button
                  onClick={() => skip(30)}
                  className="press grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:text-foreground"
                >
                  <RotateCw className="h-5 w-5" />
                </button>

                {/* Skip forward */}
                <button
                  onClick={next}
                  className="press grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:text-foreground"
                >
                  <SkipForward className="h-5 w-5" fill="currentColor" />
                </button>

                {/* Complete Button */}
                <button
                  onClick={() => navigate({ to: "/session-complete" })}
                  className="press grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:text-cat hover:bg-secondary"
                  title="Mark Completed"
                >
                  <CheckCircle2 className="h-5 w-5" />
                </button>
              </div>

              {/* Complete CTA Button */}
              <button
                onClick={() => navigate({ to: "/session-complete" })}
                className="w-full press flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#4D0F1B] hover:bg-[#6b1525] text-white text-[14px] font-semibold shadow-soft"
              >
                <CheckCircle2 className="h-4.5 w-4.5 text-amber-400" />
                Session completed
              </button>
            </div>

            {/* Raga Properties Panel */}
            <div className="rounded-3xl border border-border bg-surface p-5 space-y-4">
              <h3 className="font-display text-[13px] font-semibold border-b border-border pb-2 text-cat uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Raga Properties
              </h3>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Raga Name
                  </span>
                  <span className="text-[13px] font-medium text-foreground">
                    {current.raga || "Circadian Raga"}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Circadian Timing
                  </span>
                  <span className="text-[13px] font-medium text-foreground">
                    {ragaProp.time}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Primary Emotion
                  </span>
                  <span className="text-[13px] font-medium text-foreground">
                    {ragaProp.emotion}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Rasa (Mood)
                  </span>
                  <span className="text-[13px] font-medium text-foreground">
                    {ragaProp.rasa}
                  </span>
                </div>
                <div className="col-span-2 space-y-1">
                  <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Scale Swaras
                  </span>
                  <span className="text-[13px] font-mono font-medium text-cat bg-cat-light/50 px-2 py-0.5 rounded">
                    {ragaProp.notes}
                  </span>
                </div>
              </div>
            </div>

            {/* Session settings */}
            <div className="rounded-3xl border border-border bg-surface p-5 space-y-5">
              <div>
                <p className="flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  <Gauge className="h-4 w-4 text-cat" /> Playback speed
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {speeds.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      aria-pressed={speed === s}
                      className={`press min-h-8 rounded-full border px-3 text-xs font-semibold transition-all ${
                        speed === s
                          ? "border-cat bg-cat text-cat-foreground"
                          : "border-border bg-background text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {s}×
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  <Timer className="h-4 w-4 text-cat" /> Sleep timer
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSleepTimer(null)}
                    aria-pressed={sleepTimer === null}
                    className={`press min-h-8 rounded-full border px-3 text-xs font-semibold transition-all ${
                      sleepTimer === null
                        ? "border-cat bg-cat text-cat-foreground"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Off
                  </button>
                  {timers.map((m) => (
                    <button
                      key={m}
                      onClick={() => setSleepTimer(m)}
                      aria-pressed={sleepTimer === m}
                      className={`press min-h-8 rounded-full border px-3 text-xs font-semibold transition-all ${
                        sleepTimer === m
                          ? "border-cat bg-cat text-cat-foreground"
                          : "border-border bg-background text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {m} min
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Up next queue */}
            <div className="rounded-3xl border border-border bg-surface p-5 space-y-4">
              <h3 className="font-display text-[13px] font-semibold border-b border-border pb-2 text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <ListMusic className="h-4 w-4 text-cat" /> Up next
              </h3>
              <div className="divide-y divide-border/60 max-h-60 overflow-y-auto pr-1">
                {queue.map((t, i) => (
                  <TrackRow key={t.id} track={t} index={i} />
                ))}
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                <Info className="h-3.5 w-3.5" /> Sequenced to preserve the therapeutic arc
              </p>
            </div>

          </div>

        </div>
      </div>
    </AppShell>
  );
}
