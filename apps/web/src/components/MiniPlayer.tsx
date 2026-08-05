import { Link } from "@tanstack/react-router";
import { Pause, Play, SkipForward } from "lucide-react";
import { useApp } from "@/lib/app-state";
import { formatTime } from "@/lib/content";

export function MiniPlayer({ lifted = true }: { lifted?: boolean }) {
  const { current, playing, toggle, position, skip } = useApp();
  if (!current) return null;

  const progress = Math.min(100, (position / current.duration) * 100);

  return (
    <div
      className={`fixed inset-x-0 z-40 px-4 ${lifted ? "bottom-[calc(4.75rem+env(safe-area-inset-bottom))]" : "bottom-4"}`}
    >
      <div className="animate-rise relative mx-auto flex max-w-2xl items-center gap-3 overflow-hidden rounded-card border border-border bg-surface p-2.5 shadow-lift">
        <Link
          to="/player"
          className="press flex min-w-0 flex-1 items-center gap-3 rounded-btn focus-visible:ring-2 focus-visible:ring-cat focus-visible:outline-none"
          aria-label={`Open player for ${current.title}`}
        >
          <img
            src={current.art}
            alt=""
            width={64}
            height={64}
            loading="lazy"
            className="h-12 w-12 shrink-0 rounded-xl object-cover"
          />
          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate text-sm font-semibold">{current.title}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {current.raga} · {formatTime(position)} / {formatTime(current.duration)}
            </span>
          </span>
        </Link>
        <button
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
          className="press grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cat text-cat-foreground focus-visible:ring-2 focus-visible:ring-cat focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {playing ? (
            <Pause className="h-4 w-4" fill="currentColor" />
          ) : (
            <Play className="h-4 w-4" fill="currentColor" />
          )}
        </button>
        <button
          onClick={() => skip(30)}
          aria-label="Skip forward 30 seconds"
          className="press mr-1 hidden h-11 w-11 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-foreground sm:grid"
        >
          <SkipForward className="h-4 w-4" />
        </button>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-border"
        >
          <span
            className="block h-full bg-cat transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </span>
      </div>
    </div>
  );
}
