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

function Waveform({ playing }: { playing: boolean }) {
  return (
    <div aria-hidden="true" className="flex h-14 items-end justify-center gap-[3px]">
      {Array.from({ length: 64 }).map((_, i) => (
        <span
          key={i}
          className={`w-[3px] rounded-full bg-cat/70 ${playing ? "wave-bar" : ""}`}
          style={{
            height: `${16 + Math.abs(Math.sin(i / 2.6)) * 34}px`,
            animationDelay: `${(i % 11) * 90}ms`,
          }}
        />
      ))}
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
              to="/browse"
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

  return (
    <AppShell title="Now playing" subtitle={`${current.raga} · ${current.purpose}`}>
      <Link
        to="/home"
        className="press mb-6 inline-flex items-center gap-2 text-[13px] font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Back to home
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] xl:gap-12">
        <div className="animate-rise overflow-hidden rounded-card border border-border bg-surface p-6 shadow-soft md:p-10">
          <div className="grid gap-8 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:items-center xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
            <div className="relative">
              <span className="animate-breathe absolute -inset-4 rounded-[36px] bg-cat-light" />
              <img
                src={current.art}
                alt={`Artwork for ${current.title}`}
                width={1024}
                height={1024}
                className="relative aspect-square w-full rounded-[28px] object-cover shadow-lift"
              />
            </div>

            <div className="min-w-0">
              <span className="inline-flex rounded-full bg-cat-light px-3.5 py-1.5 text-[11px] font-semibold tracking-wider text-cat uppercase">
                {current.purpose}
              </span>
              <h1 className="mt-4 font-display text-[26px] leading-tight font-semibold md:text-[34px]">
                {current.title}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground md:text-[15px]">
                {current.raga} · {current.subtitle}
              </p>

              <div className="mt-6">
                <Waveform playing={playing} />
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
              <div className="mt-2.5 flex justify-between text-[12px] tabular-nums text-muted-foreground">
                <span>{formatTime(localProgress !== null ? localProgress : position)}</span>
                <span>-{formatTime(Math.max(0, current.duration - (localProgress !== null ? localProgress : position)))}</span>
              </div>

              <div className="mt-7 flex items-center justify-between gap-3">
                <button
                  onClick={() => toggleFavorite(current.id)}
                  aria-pressed={fav}
                  aria-label={fav ? "Remove from favourites" : "Add to favourites"}
                  className={`press grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border bg-surface shadow-soft ${fav ? "text-cat" : "text-muted-foreground"}`}
                >
                  <Heart className="h-5 w-5" fill={fav ? "currentColor" : "none"} />
                </button>

                <div className="flex items-center gap-2 md:gap-3">
                  <button
                    onClick={previous}
                    aria-label="Previous session"
                    className="press grid h-11 w-11 place-items-center rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <SkipBack className="h-5 w-5" fill="currentColor" />
                  </button>
                  <button
                    onClick={() => skip(-15)}
                    aria-label="Back 15 seconds"
                    className="press grid h-11 w-11 place-items-center rounded-full text-foreground"
                  >
                    <RotateCcw className="h-5 w-5" strokeWidth={1.8} />
                  </button>
                  <button
                    onClick={toggle}
                    aria-label={playing ? "Pause session" : "Play session"}
                    className="press grid h-16 w-16 place-items-center rounded-full bg-cat text-cat-foreground shadow-lift focus-visible:ring-2 focus-visible:ring-cat focus-visible:ring-offset-4 focus-visible:outline-none"
                  >
                    {playing ? (
                      <Pause className="h-6 w-6" fill="currentColor" />
                    ) : (
                      <Play className="h-6 w-6 translate-x-0.5" fill="currentColor" />
                    )}
                  </button>
                  <button
                    onClick={() => skip(30)}
                    aria-label="Forward 30 seconds"
                    className="press grid h-11 w-11 place-items-center rounded-full text-foreground"
                  >
                    <RotateCw className="h-5 w-5" strokeWidth={1.8} />
                  </button>
                  <button
                    onClick={next}
                    aria-label="Next session"
                    className="press grid h-11 w-11 place-items-center rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <SkipForward className="h-5 w-5" fill="currentColor" />
                  </button>
                </div>

                <button
                  onClick={() => navigate({ to: "/session-complete" })}
                  aria-label="Mark session completed"
                  className="press grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border bg-surface text-muted-foreground shadow-soft hover:text-cat"
                >
                  <CheckCircle2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="rounded-card border border-border bg-background/60 p-5">
              <p className="flex items-center gap-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                <Info className="h-3.5 w-3.5" /> Listening instructions
              </p>
              <p className="mt-2 text-sm leading-relaxed">{current.instructions}</p>
            </div>
            <div className="rounded-card bg-cat-light p-5">
              <p className="text-[11px] font-semibold tracking-wider text-cat uppercase">
                Recommended frequency
              </p>
              <p className="mt-2 text-sm leading-relaxed">{current.frequency}</p>
            </div>
          </div>

          <button
            onClick={() => navigate({ to: "/session-complete" })}
            className="press mt-8 flex min-h-13 w-full items-center justify-center gap-2 rounded-btn bg-primary px-6 text-[15px] font-semibold text-primary-foreground shadow-soft hover:bg-primary-hover md:w-auto md:px-10"
          >
            <CheckCircle2 className="h-4 w-4" /> Session completed
          </button>
          <p className="mt-4 text-[12px] text-muted-foreground">
            Streaming only · sessions are guided, never downloaded
          </p>
        </div>

        <aside className="space-y-6">
          <Panel title="Session settings">
            <div className="space-y-7">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Gauge className="h-4 w-4 text-cat" /> Playback speed
                </p>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {speeds.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      aria-pressed={speed === s}
                      className={`press min-h-10 rounded-btn border px-4 text-sm font-medium ${
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
                <div className="mt-3 flex flex-wrap gap-2.5">
                  <button
                    onClick={() => setSleepTimer(null)}
                    aria-pressed={sleepTimer === null}
                    className={`press min-h-10 rounded-btn border px-4 text-sm font-medium ${
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
                      className={`press min-h-10 rounded-btn border px-4 text-sm font-medium ${
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
            <p className="mt-3 flex items-center gap-2 text-[12px] text-muted-foreground">
              <ListMusic className="h-3.5 w-3.5" /> Sequenced to preserve the therapeutic arc
            </p>
          </Panel>
        </aside>
      </div>
    </AppShell>
  );
}
