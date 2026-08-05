import { Link } from "@tanstack/react-router";
import {
  Gauge,
  Heart,
  ListMusic,
  Maximize2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Timer,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useApp } from "@/lib/app-state";
import { formatTime } from "@/lib/content";
import { cn } from "@/lib/utils";

const speeds = [0.75, 0.9, 1, 1.1, 1.25];
const timers = [10, 20, 30, 45, 60];

function IconBtn({
  label,
  onClick,
  active,
  children,
  className,
}: {
  label: string;
  onClick?: () => void;
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        "press grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-cat focus-visible:outline-none",
        active && "text-cat",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function PlayerBar() {
  const {
    current,
    playing,
    toggle,
    position,
    seek,
    next,
    previous,
    speed,
    setSpeed,
    sleepTimer,
    setSleepTimer,
    volume,
    setVolume,
    muted,
    toggleMuted,
    queue,
    isFavorite,
    toggleFavorite,
    close,
  } = useApp();

  if (!current) return null;
  const fav = isFavorite(current.id);
  const progress = Math.min(100, (position / current.duration) * 100);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur-xl">
      <span
        aria-hidden="true"
        className="block h-0.5 w-full bg-border md:hidden"
      >
        <span
          className="block h-full bg-cat transition-[width] duration-500"
          style={{ width: `${progress}%` }}
        />
      </span>
      <div className="mx-auto grid max-w-[1600px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-2.5 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] md:px-8 md:py-3">
        {/* Left: artwork + meta */}
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/player"
            aria-label={`Open full player for ${current.title}`}
            className="press group relative shrink-0 overflow-hidden rounded-xl"
          >
            <img
              src={current.art}
              alt=""
              width={112}
              height={112}
              className="h-12 w-12 object-cover md:h-14 md:w-14"
            />
            <span className="absolute inset-0 hidden place-items-center bg-foreground/40 text-background opacity-0 transition-opacity duration-[250ms] group-hover:opacity-100 md:grid">
              <Maximize2 className="h-4 w-4" />
            </span>
          </Link>
          <div className="min-w-0">
            <Link
              to="/player"
              className="block truncate text-[13px] font-semibold hover:underline md:text-sm"
            >
              {current.title}
            </Link>
            <p className="truncate text-[11px] text-muted-foreground md:text-xs">
              {current.raga} · {current.purpose}
            </p>
          </div>
          <IconBtn
            label={fav ? "Remove from favourites" : "Add to favourites"}
            onClick={() => toggleFavorite(current.id)}
            active={fav}
            className="hidden md:grid"
          >
            <Heart className="h-[18px] w-[18px]" fill={fav ? "currentColor" : "none"} />
          </IconBtn>
        </div>

        {/* Center: transport */}
        <div className="flex items-center gap-1 md:flex-col md:gap-1.5">
          <div className="flex items-center gap-1 md:gap-2">
            <IconBtn label="Previous session" onClick={previous} className="hidden md:grid">
              <SkipBack className="h-[18px] w-[18px]" fill="currentColor" />
            </IconBtn>
            <button
              onClick={toggle}
              aria-label={playing ? "Pause" : "Play"}
              className="press grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cat text-cat-foreground shadow-soft hover:scale-105 focus-visible:ring-2 focus-visible:ring-cat focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {playing ? (
                <Pause className="h-4 w-4" fill="currentColor" />
              ) : (
                <Play className="h-4 w-4 translate-x-px" fill="currentColor" />
              )}
            </button>
            <IconBtn label="Next session" onClick={next}>
              <SkipForward className="h-[18px] w-[18px]" fill="currentColor" />
            </IconBtn>
            <button
              type="button"
              onClick={(e) => {
                console.log("Mobile Close player button clicked!");
                e.stopPropagation();
                e.preventDefault();
                close();
              }}
              aria-label="Close player"
              className="press grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-destructive md:hidden"
            >
              <X className="h-[18px] w-[18px]" />
            </button>
            <Popover>
              <PopoverTrigger
                aria-label="Playback speed"
                className="press hidden min-h-10 items-center gap-1.5 rounded-btn px-2.5 text-[12px] font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground md:inline-flex"
              >
                <Gauge className="h-4 w-4" /> {speed}×
              </PopoverTrigger>
              <PopoverContent align="center" className="w-56">
                <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                  Playback speed
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {speeds.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      aria-pressed={speed === s}
                      className={cn(
                        "press min-h-9 rounded-btn border px-3 text-[13px] font-medium",
                        speed === s
                          ? "border-cat bg-cat text-cat-foreground"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      {s}×
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="hidden w-full max-w-2xl items-center gap-3 md:flex">
            <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
              {formatTime(position)}
            </span>
            <Slider
              value={[position]}
              max={current.duration}
              step={1}
              onValueChange={(v) => seek(v[0] ?? 0)}
              aria-label="Seek within session"
              className="flex-1"
            />
            <span className="w-10 shrink-0 text-[11px] tabular-nums text-muted-foreground">
              -{formatTime(Math.max(0, current.duration - position))}
            </span>
          </div>
        </div>

        {/* Right: volume, queue, timer */}
        <div className="hidden items-center justify-end gap-1 md:flex">
          <Popover>
            <PopoverTrigger
              aria-label="Sleep timer"
              className={cn(
                "press grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground",
                sleepTimer !== null && "text-cat",
              )}
            >
              <Timer className="h-[18px] w-[18px]" />
            </PopoverTrigger>
            <PopoverContent align="end" className="w-60">
              <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Sleep timer
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => setSleepTimer(null)}
                  aria-pressed={sleepTimer === null}
                  className={cn(
                    "press min-h-9 rounded-btn border px-3 text-[13px] font-medium",
                    sleepTimer === null
                      ? "border-cat bg-cat text-cat-foreground"
                      : "border-border text-muted-foreground",
                  )}
                >
                  Off
                </button>
                {timers.map((m) => (
                  <button
                    key={m}
                    onClick={() => setSleepTimer(m)}
                    aria-pressed={sleepTimer === m}
                    className={cn(
                      "press min-h-9 rounded-btn border px-3 text-[13px] font-medium",
                      sleepTimer === m
                        ? "border-cat bg-cat text-cat-foreground"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger
              aria-label="Queue"
              className="press grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <ListMusic className="h-[18px] w-[18px]" />
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-2">
              <p className="px-2 py-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Up next
              </p>
              <ul className="max-h-72 overflow-y-auto">
                {queue.map((t) => (
                  <li key={t.id}>
                    <Link
                      to="/player"
                      className="press flex items-center gap-3 rounded-btn p-2 hover:bg-secondary"
                    >
                      <img
                        src={t.art}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-lg object-cover"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium">
                          {t.title}
                        </span>
                        <span className="block truncate text-[11px] text-muted-foreground">
                          {t.raga}
                        </span>
                      </span>
                      <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                        {formatTime(t.duration)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>

          <div className="flex items-center gap-2 pl-1">
            <IconBtn label={muted ? "Unmute" : "Mute"} onClick={toggleMuted}>
              {muted || volume === 0 ? (
                <VolumeX className="h-[18px] w-[18px]" />
              ) : (
                <Volume2 className="h-[18px] w-[18px]" />
              )}
            </IconBtn>
            <Slider
              value={[muted ? 0 : volume]}
              max={100}
              step={1}
              onValueChange={(v) => setVolume(v[0] ?? 0)}
              aria-label="Volume"
              className="w-24 lg:w-28"
            />
          </div>

          <Link
            to="/player"
            aria-label="Expand player"
            className="press grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Maximize2 className="h-[18px] w-[18px]" />
          </Link>
          <button
            type="button"
            onClick={(e) => {
              console.log("Desktop Close player button clicked!");
              e.stopPropagation();
              e.preventDefault();
              close();
            }}
            aria-label="Close player"
            className="press grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
