import { Link } from "@tanstack/react-router";
import { Clock, Heart, Lock, Pause, Play, Sparkles } from "lucide-react";
import { useApp } from "@/lib/app-state";
import {
  categories,
  formatDuration,
  formatTime,
  type Program,
  type Track,
} from "@/lib/content";
import { cn } from "@/lib/utils";

export function CategoryBadge({ id }: { id: Track["category"] }) {
  const name = categories.find((c) => c.id === id)?.name ?? id;
  return (
    <span className="rounded-full bg-cat-light px-2.5 py-1 text-[10px] font-semibold tracking-wide text-cat uppercase">
      {name.split(" ")[0]}
    </span>
  );
}

export function FavoriteButton({ id, className }: { id: string; className?: string }) {
  const { isFavorite, toggleFavorite } = useApp();
  const active = isFavorite(id);
  return (
    <button
      onClick={() => toggleFavorite(id)}
      aria-pressed={active}
      aria-label={active ? "Remove from favourites" : "Add to favourites"}
      className={cn(
        "press grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-cat focus-visible:ring-2 focus-visible:ring-cat focus-visible:outline-none",
        active && "text-cat",
        className,
      )}
    >
      <Heart className="h-[18px] w-[18px]" fill={active ? "currentColor" : "none"} />
    </button>
  );
}

export function PlayButton({ track, small = false }: { track: Track; small?: boolean }) {
  const { current, playing, play, toggle } = useApp();
  const isCurrent = current?.id === track.id;
  const isPlaying = isCurrent && playing;
  return (
    <button
      onClick={() => (isCurrent ? toggle() : play(track))}
      aria-label={isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
      className={cn(
        "press grid place-items-center rounded-full bg-cat text-cat-foreground shadow-lift hover:scale-105 focus-visible:ring-2 focus-visible:ring-cat focus-visible:ring-offset-2 focus-visible:outline-none",
        small ? "h-10 w-10" : "h-12 w-12",
      )}
    >
      {isPlaying ? (
        <Pause className="h-4 w-4" fill="currentColor" />
      ) : (
        <Play className="h-4 w-4 translate-x-px" fill="currentColor" />
      )}
    </button>
  );
}

/** Grid tile — fills its grid cell. Used on desktop grids. */
export function TrackTile({ track }: { track: Track }) {
  return (
    <article className="group animate-soft-in rounded-card border border-border/70 bg-surface p-3 shadow-soft transition-all duration-[250ms] hover:-translate-y-1 hover:shadow-lift">
      <div className="relative overflow-hidden rounded-2xl">
        <img
          src={track.art}
          alt={`Artwork for ${track.title}`}
          width={1024}
          height={1024}
          loading="lazy"
          className="aspect-square w-full object-cover transition-transform duration-[250ms] group-hover:scale-[1.04]"
        />
        {track.premium && (
          <span className="absolute top-2.5 left-2.5 grid h-7 w-7 place-items-center rounded-full bg-surface/90 text-cat backdrop-blur">
            <Lock className="h-3.5 w-3.5" />
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-2.5">
          <span className="rounded-full bg-surface/90 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">
            {formatDuration(track.duration)}
          </span>
          <span className="translate-y-2 opacity-0 transition-all duration-[250ms] group-hover:translate-y-0 group-hover:opacity-100 md:opacity-0">
            <PlayButton track={track} small />
          </span>
        </div>
      </div>
      <div className="px-1 pt-3.5 pb-1">
        <h3 className="truncate text-[14px] font-semibold">{track.title}</h3>
        <p className="mt-1 truncate text-[12px] text-muted-foreground">
          {track.raga} · {track.purpose}
        </p>
      </div>
    </article>
  );
}

/** Rail card — fixed width for horizontal scroll rows. */
export function TrackCard({ track }: { track: Track }) {
  return (
    <div className="w-[168px] shrink-0 snap-start sm:w-[196px] xl:w-[212px]">
      <TrackTile track={track} />
    </div>
  );
}

export function ContinueCard({
  track,
  progress,
}: {
  track: Track;
  progress: number;
}) {
  return (
    <article className="group flex w-[280px] shrink-0 snap-start items-center gap-3.5 rounded-card border border-border/70 bg-surface p-3 shadow-soft transition-all duration-[250ms] hover:-translate-y-1 hover:shadow-lift sm:w-[320px]">
      <img
        src={track.art}
        alt=""
        width={128}
        height={128}
        loading="lazy"
        className="h-16 w-16 shrink-0 rounded-2xl object-cover"
      />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[14px] font-semibold">{track.title}</h3>
        <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
          {formatTime((track.duration * progress) / 100)} / {formatTime(track.duration)}
        </p>
        <span className="mt-2.5 block h-1 w-full overflow-hidden rounded-full bg-border">
          <span className="block h-full bg-cat" style={{ width: `${progress}%` }} />
        </span>
      </div>
      <PlayButton track={track} small />
    </article>
  );
}

export function TrackRow({ track, index }: { track: Track; index?: number }) {
  const { current } = useApp();
  const active = current?.id === track.id;
  return (
    <article
      className={cn(
        "group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-card border border-transparent px-3 py-2.5 transition-colors duration-[250ms] hover:border-border hover:bg-surface md:grid-cols-[auto_minmax(0,2fr)_minmax(0,1fr)_auto_auto]",
        active && "border-border bg-surface",
      )}
    >
      <div className="flex items-center gap-3">
        {index !== undefined && (
          <span className="hidden w-5 text-right text-[12px] tabular-nums text-muted-foreground md:block">
            {index + 1}
          </span>
        )}
        <img
          src={track.art}
          alt=""
          width={112}
          height={112}
          loading="lazy"
          className="h-12 w-12 shrink-0 rounded-xl object-cover"
        />
      </div>
      <div className="min-w-0">
        <h3 className={cn("truncate text-[14px] font-semibold", active && "text-cat")}>
          {track.title}
        </h3>
        <p className="truncate text-[12px] text-muted-foreground">{track.raga}</p>
      </div>
      <p className="hidden truncate text-[12px] text-muted-foreground md:block">
        {track.purpose}
      </p>
      <span className="hidden items-center gap-1.5 text-[12px] tabular-nums text-muted-foreground md:flex">
        <Clock className="h-3.5 w-3.5" /> {formatDuration(track.duration)}
      </span>
      <div className="flex items-center gap-1">
        <FavoriteButton id={track.id} className="hidden sm:grid" />
        <PlayButton track={track} small />
      </div>
    </article>
  );
}

export function ProgramCard({
  program,
  wide = false,
}: {
  program: Program;
  wide?: boolean;
}) {
  return (
    <Link
      to="/program/$programId"
      params={{ programId: program.id }}
      className={cn(
        "press group block overflow-hidden rounded-card border border-border/70 bg-surface shadow-soft transition-all duration-[250ms] hover:-translate-y-1 hover:shadow-lift focus-visible:ring-2 focus-visible:ring-cat focus-visible:outline-none",
        wide ? "w-full" : "w-[256px] shrink-0 snap-start sm:w-[288px]",
      )}
    >
      <div className="relative overflow-hidden">
        <img
          src={program.art}
          alt={`Artwork for ${program.title}`}
          width={1024}
          height={768}
          loading="lazy"
          className="aspect-[16/9] w-full object-cover transition-transform duration-[250ms] group-hover:scale-[1.04]"
        />
        {program.premium && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-surface/90 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-cat uppercase backdrop-blur">
            <Sparkles className="h-3 w-3" /> Premium
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="truncate text-[15px] font-semibold">{program.title}</h3>
        <p className="mt-1 truncate text-[12px] text-muted-foreground">
          {program.subtitle}
        </p>
        <p className="mt-3 text-[12px] font-medium text-muted-foreground">
          {program.sessions} sessions · {program.days} days
        </p>
      </div>
    </Link>
  );
}
