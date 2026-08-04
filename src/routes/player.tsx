import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Gauge,
  Heart,
  Info,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Timer,
  Waves,
} from "lucide-react";
import { StatusBar } from "@/components/StatusBar";
import { Slider } from "@/components/ui/slider";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useApp } from "@/lib/app-state";
import { formatTime } from "@/lib/content";
import { EmptyState } from "@/components/States";

export const Route = createFileRoute("/player")({
  head: () => ({
    meta: [
      { title: "Now playing — Krishna Sanjeevani" },
      {
        name: "description",
        content:
          "Full-screen therapeutic player with listening instructions, recommended frequency, sleep timer and playback speed.",
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
    <div
      aria-hidden="true"
      className="flex h-12 items-center justify-center gap-[3px]"
    >
      {Array.from({ length: 44 }).map((_, i) => (
        <span
          key={i}
          className={`w-[3px] rounded-full bg-cat/70 ${playing ? "wave-bar" : ""}`}
          style={{
            height: `${18 + Math.abs(Math.sin(i / 2.6)) * 30}px`,
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
    speed,
    setSpeed,
    sleepTimer,
    setSleepTimer,
    isFavorite,
    toggleFavorite,
  } = useApp();
  const navigate = useNavigate();
  const [instructionsOpen, setInstructionsOpen] = useState(false);

  if (!current) {
    return (
      <div className="min-h-dvh bg-background">
        <StatusBar />
        <main className="mx-auto max-w-md px-6 pt-16">
          <EmptyState
            icon={<Waves className="h-6 w-6" />}
            title="Nothing is playing"
            body="Choose a surāvali from home and it will appear here with its listening guidance."
            action={
              <Link
                to="/home"
                className="press inline-flex min-h-11 items-center rounded-btn bg-primary px-6 text-sm font-semibold text-primary-foreground"
              >
                Browse sessions
              </Link>
            }
          />
        </main>
      </div>
    );
  }

  const fav = isFavorite(current.id);

  return (
    <div className="min-h-dvh bg-background">
      <StatusBar />
      <main className="mx-auto max-w-md px-6 pb-14">
        <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 pt-2 pb-4">
          <Link
            to="/home"
            aria-label="Minimise player"
            className="press grid h-11 w-11 place-items-center rounded-full border border-border bg-surface shadow-soft"
          >
            <ChevronDown className="h-5 w-5" />
          </Link>
          <p className="truncate text-center text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Now playing
          </p>
          <Drawer open={instructionsOpen} onOpenChange={setInstructionsOpen}>
            <DrawerTrigger
              aria-label="Listening instructions"
              className="press grid h-11 w-11 place-items-center rounded-full border border-border bg-surface shadow-soft"
            >
              <Info className="h-[18px] w-[18px]" />
            </DrawerTrigger>
            <DrawerContent className="rounded-t-sheet border-border bg-surface">
              <DrawerHeader className="text-left">
                <DrawerTitle>Listening instructions</DrawerTitle>
                <DrawerDescription className="leading-relaxed">
                  {current.instructions}
                </DrawerDescription>
              </DrawerHeader>
              <div className="px-4 pb-8">
                <div className="rounded-card bg-cat-light p-4">
                  <p className="text-[11px] font-semibold tracking-wider text-cat uppercase">
                    Recommended frequency
                  </p>
                  <p className="mt-1.5 text-sm text-foreground">{current.frequency}</p>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </header>

        <div className="animate-rise relative mt-2">
          <span className="animate-breathe absolute -inset-4 rounded-[36px] bg-cat-light" />
          <img
            src={current.art}
            alt={`Artwork for ${current.title}`}
            width={1024}
            height={1024}
            className="relative aspect-square w-full rounded-[28px] object-cover shadow-lift"
          />
        </div>

        <div className="animate-rise mt-8 text-center">
          <h1 className="text-[24px] leading-tight font-semibold">{current.title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {current.raga} · {current.subtitle}
          </p>
          <span className="mt-4 inline-flex rounded-full bg-cat-light px-3.5 py-1.5 text-[11px] font-semibold tracking-wider text-cat uppercase">
            {current.purpose}
          </span>
        </div>

        <div className="mt-6">
          <Waveform playing={playing} />
        </div>

        <div className="mt-2">
          <Slider
            value={[position]}
            max={current.duration}
            step={1}
            onValueChange={(v) => seek(v[0] ?? 0)}
            aria-label="Seek within session"
          />
          <div className="mt-2.5 flex justify-between text-[12px] tabular-nums text-muted-foreground">
            <span>{formatTime(position)}</span>
            <span>-{formatTime(Math.max(0, current.duration - position))}</span>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-5">
          <button
            onClick={() => toggleFavorite(current.id)}
            aria-pressed={fav}
            aria-label={fav ? "Remove from favourites" : "Add to favourites"}
            className={`press grid h-12 w-12 place-items-center rounded-full border border-border bg-surface shadow-soft ${fav ? "text-cat" : "text-muted-foreground"}`}
          >
            <Heart className="h-5 w-5" fill={fav ? "currentColor" : "none"} />
          </button>
          <button
            onClick={() => skip(-15)}
            aria-label="Back 15 seconds"
            className="press grid h-14 w-14 place-items-center rounded-full text-foreground"
          >
            <RotateCcw className="h-6 w-6" strokeWidth={1.8} />
          </button>
          <button
            onClick={toggle}
            aria-label={playing ? "Pause session" : "Play session"}
            className="press grid h-20 w-20 place-items-center rounded-full bg-cat text-cat-foreground shadow-lift focus-visible:ring-2 focus-visible:ring-cat focus-visible:ring-offset-4 focus-visible:outline-none"
          >
            {playing ? (
              <Pause className="h-7 w-7" fill="currentColor" />
            ) : (
              <Play className="h-7 w-7 translate-x-0.5" fill="currentColor" />
            )}
          </button>
          <button
            onClick={() => skip(30)}
            aria-label="Forward 30 seconds"
            className="press grid h-14 w-14 place-items-center rounded-full text-foreground"
          >
            <RotateCw className="h-6 w-6" strokeWidth={1.8} />
          </button>
          <Drawer>
            <DrawerTrigger
              aria-label="Playback speed and sleep timer"
              className="press grid h-12 w-12 place-items-center rounded-full border border-border bg-surface text-muted-foreground shadow-soft"
            >
              <Gauge className="h-5 w-5" />
            </DrawerTrigger>
            <DrawerContent className="rounded-t-sheet border-border bg-surface">
              <DrawerHeader className="text-left">
                <DrawerTitle>Session settings</DrawerTitle>
                <DrawerDescription>
                  Gentle adjustments — the sequence keeps its therapeutic shape.
                </DrawerDescription>
              </DrawerHeader>
              <div className="space-y-7 px-4 pb-10">
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
                        className={`press min-h-11 rounded-btn border px-4 text-sm font-medium ${
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
                      className={`press min-h-11 rounded-btn border px-4 text-sm font-medium ${
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
                        className={`press min-h-11 rounded-btn border px-4 text-sm font-medium ${
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
            </DrawerContent>
          </Drawer>
        </div>

        <div className="mt-9 grid gap-3">
          <button
            onClick={() => setInstructionsOpen(true)}
            className="press rounded-card border border-border bg-surface p-4 text-left shadow-soft"
          >
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Listening instructions
            </p>
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed">
              {current.instructions}
            </p>
          </button>
          <div className="rounded-card border border-border bg-surface p-4 shadow-soft">
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Recommended frequency
            </p>
            <p className="mt-1.5 text-sm leading-relaxed">{current.frequency}</p>
          </div>
        </div>

        <button
          onClick={() => navigate({ to: "/session-complete" })}
          className="press mt-8 flex min-h-13 w-full items-center justify-center gap-2 rounded-btn bg-primary px-6 text-[15px] font-semibold text-primary-foreground shadow-soft hover:bg-primary-hover"
        >
          <CheckCircle2 className="h-4 w-4" /> Session completed
        </button>
        <p className="mt-4 text-center text-[12px] text-muted-foreground">
          Streaming only · sessions are guided, never downloaded
        </p>
      </main>
    </div>
  );
}
