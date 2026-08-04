import { Link } from "@tanstack/react-router";
import { Heart, Lock, Pause, Play } from "lucide-react";
import { useApp } from "@/lib/app-state";
import { categories, formatDuration, type Track } from "@/lib/content";
import { cn } from "@/lib/utils";

function CategoryBadge({ id }: { id: Track["category"] }) {
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
        "press grid h-11 w-11 place-items-center rounded-full text-muted-foreground hover:text-cat focus-visible:ring-2 focus-visible:ring-cat focus-visible:outline-none",
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
        "press grid place-items-center rounded-full bg-cat text-cat-foreground shadow-soft focus-visible:ring-2 focus-visible:ring-cat focus-visible:ring-offset-2 focus-visible:outline-none",
        small ? "h-11 w-11" : "h-12 w-12",
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

export function TrackCard({ track }: { track: Track }) {
  return (
    <article className="group w-44 shrink-0 sm:w-48">
      <div className="relative overflow-hidden rounded-card shadow-soft transition-shadow duration-[250ms] group-hover:shadow-lift">
        <img
          src={track.art}
          alt={`Artwork for ${track.title}`}
          width={1024}
          height={1024}
          loading="lazy"
          className="aspect-square w-full object-cover transition-transform duration-[250ms] group-hover:scale-[1.03]"
        />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-2.5">
          <span className="rounded-full bg-surface/90 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm">
            {formatDuration(track.duration)}
          </span>
          <PlayButton track={track} small />
        </div>
        {track.premium && (
          <span className="absolute top-2.5 left-2.5 grid h-7 w-7 place-items-center rounded-full bg-surface/90 text-cat backdrop-blur-sm">
            <Lock className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-1">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{track.title}</h3>
          <p className="truncate text-xs text-muted-foreground">{track.raga}</p>
          <div className="mt-2 flex items-center gap-2">
            <CategoryBadge id={track.category} />
            <span className="truncate text-[11px] text-muted-foreground">{track.purpose}</span>
          </div>
        </div>
        <FavoriteButton id={track.id} className="-mt-1.5 -mr-2.5" />
      </div>
    </article>
  );
}

export function TrackRow({ track, index }: { track: Track; index?: number }) {
  return (
    <article className="flex items-center gap-3 rounded-card border border-border bg-surface p-3 shadow-soft transition-shadow duration-[250ms] hover:shadow-lift">
      {typeof index === "number" && (
        <span className="w-4 shrink-0 text-center text-xs tabular-nums text-muted-foreground">
          {index + 1}
        </span>
      )}
      <img
        src={track.art}
        alt=""
        width={1024}
        height={1024}
        loading="lazy"
        className="h-14 w-14 shrink-0 rounded-xl object-cover"
      />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold">{track.title}</h3>
        <p className="truncate text-xs text-muted-foreground">
          {track.raga} · {formatDuration(track.duration)} · {track.purpose}
        </p>
      </div>
      <FavoriteButton id={track.id} />
      <PlayButton track={track} small />
    </article>
  );
}

export function ContinueCard({ track, progress }: { track: Track; progress: number }) {
  return (
    <article className="flex w-72 shrink-0 items-center gap-3 rounded-card border border-border bg-surface p-3 shadow-soft">
      <img
        src={track.art}
        alt=""
        width={1024}
        height={1024}
        loading="lazy"
        className="h-16 w-16 shrink-0 rounded-xl object-cover"
      />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold">{track.title}</h3>
        <p className="truncate text-xs text-muted-foreground">{track.purpose}</p>
        <div className="mt-2.5 h-1 rounded-full bg-muted">
          <div className="h-full rounded-full bg-cat" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <PlayButton track={track} small />
    </article>
  );
}

export function ProgramCard({
  program,
}: {
  program: {
    id: string;
    title: string;
    subtitle: string;
    art: string;
    sessions: number;
    days: number;
    premium?: boolean;
  };
}) {
  return (
    <Link
      to="/program/$programId"
      params={{ programId: program.id }}
      className="press group block w-64 shrink-0 overflow-hidden rounded-card border border-border bg-surface shadow-soft transition-shadow duration-[250ms] hover:shadow-lift focus-visible:ring-2 focus-visible:ring-cat focus-visible:outline-none"
    >
      <div className="relative overflow-hidden">
        <img
          src={program.art}
          alt={`Artwork for ${program.title}`}
          width={1024}
          height={1024}
          loading="lazy"
          className="aspect-[16/10] w-full object-cover transition-transform duration-[250ms] group-hover:scale-[1.03]"
        />
        {program.premium && (
          <span className="absolute top-3 right-3 rounded-full bg-surface/90 px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase backdrop-blur-sm">
            Premium
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="truncate text-sm font-semibold">{program.title}</h3>
        <p className="mt-1 truncate text-xs text-muted-foreground">{program.subtitle}</p>
        <p className="mt-3 text-[11px] font-medium text-cat">
          {program.sessions} sessions · {program.days} days
        </p>
      </div>
    </Link>
  );
}
