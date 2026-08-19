import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  Heart,
  House,
  Library,
  Plus,
  ArrowRight,
  LayoutGrid,
  Search,
  Sprout,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-state";
import { tracks, programs } from "@/lib/content";
import logoWithoutText from "@/assets/logo-without-text.png";

export function SidebarBody({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  const { favorites, savedPrograms, current, playing, play } = useApp();
  const [filter, setFilter] = useState<"All" | "Playlists" | "Programs">("All");
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Map favorites IDs to full tracks
  const favoriteTracksList = favorites
    .map((id) => tracks.find((t) => t.id === id))
    .filter(Boolean);

  // Map saved programs IDs to full programs
  const savedProgramsList = savedPrograms
    .map((id) => programs.find((p) => p.id === id))
    .filter(Boolean);

  // Use a subset of tracks as recently played placeholder
  const recentTracks = tracks.slice(0, 3);

  const getLinkClass = (to: string) => {
    const active = pathname === to;
    return cn(
      "press group flex min-h-11 items-center gap-4 rounded-btn px-3.5 py-2.5 text-[14px] font-medium transition-all focus-visible:ring-2 focus-visible:ring-cat focus-visible:outline-none",
      active
        ? "bg-cat-light text-cat font-semibold"
        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
    );
  };

  return (
    <div className="flex h-full flex-col gap-2">
      {/* Top Box: Navigation */}
      <div className="flex flex-col gap-4 rounded-card border border-border/60 bg-surface p-4 shadow-soft">
        {/* Logo */}
        <Link
          to="/home"
          onClick={onNavigate}
          className="press flex items-center gap-3 px-1.5 py-1 focus-visible:ring-2 focus-visible:ring-cat focus-visible:outline-none"
        >
          <img
            src={logoWithoutText}
            alt="Krishna Sanjeevani Logo"
            className="h-10 w-10 shrink-0 object-contain"
          />
          <div className="min-w-0">
            <span className="block truncate font-display text-[15px] leading-tight font-semibold">
              Krishna Sanjeevani
            </span>
            <span className="block truncate text-[11px] text-muted-foreground">
              The Divine Therapeutic Music
            </span>
          </div>
        </Link>

        {/* Navigation Core List */}
        <nav aria-label="Core Navigation">
          <ul className="space-y-0.5">
            <li>
              <Link to="/home" onClick={onNavigate} className={getLinkClass("/home")}>
                <House className="h-[18px] w-[18px] shrink-0" />
                <span className="truncate">Home</span>
              </Link>
            </li>
            <li>
              <Link to="/search" onClick={onNavigate} className={getLinkClass("/search")}>
                <Search className="h-[18px] w-[18px] shrink-0" />
                <span className="truncate">Search</span>
              </Link>
            </li>
            <li>
              <Link to="/journey" onClick={onNavigate} className={getLinkClass("/journey")}>
                <Sprout className="h-[18px] w-[18px] shrink-0" />
                <span className="truncate">Pregnancy</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Bottom Box: Your Library */}
      <div className="flex flex-col gap-3 rounded-card border border-border/60 bg-surface p-4 shadow-soft flex-1 min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <Library className="h-[18px] w-[18px] shrink-0" />
            <span className="text-[13px] font-bold tracking-tight uppercase">Your Library</span>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              aria-label="Add to library"
              className="press p-1.5 hover:bg-secondary rounded-full text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              aria-label="Expand library"
              className="press p-1.5 hover:bg-secondary rounded-full text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1 shrink-0">
          {(["All", "Playlists", "Programs"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                "press px-3.5 py-1 rounded-full text-xs font-semibold border transition-all select-none cursor-pointer",
                filter === tab
                  ? "bg-cat border-cat text-cat-foreground"
                  : "bg-surface border-border text-muted-foreground hover:border-cat-accent/30 hover:text-foreground",
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Library Scrollable Area */}
        <div className="flex-1 overflow-y-auto pr-1 -mr-2 space-y-1.5 mt-1 no-scrollbar">
          {/* Favorites / Liked Songs */}
          {(filter === "All" || filter === "Playlists") && (
            <Link
              to="/favorites"
              onClick={onNavigate}
              className={cn(
                "press flex items-center gap-3 p-2 rounded-btn hover:bg-secondary/60 transition-all group",
                pathname === "/favorites" && "bg-secondary/40",
              )}
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cat to-cat-accent/70 text-cat-foreground shadow-sm">
                <Heart className="h-4 w-4 fill-current" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold truncate group-hover:text-cat transition-colors">
                  Liked Songs
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Playlist · {favoriteTracksList.length} songs
                </p>
              </div>
            </Link>
          )}

          {/* Saved Programs */}
          {(filter === "All" || filter === "Programs") && (
            savedProgramsList.map((prog) => {
              if (!prog) return null;
              const active = pathname === `/program/${prog.id}`;
              return (
                <Link
                  key={prog.id}
                  to="/program/$programId"
                  params={{ programId: prog.id }}
                  onClick={onNavigate}
                  className={cn(
                    "press flex items-center gap-3 p-2 rounded-btn hover:bg-secondary/60 transition-all group",
                    active && "bg-secondary/40",
                  )}
                >
                  <img
                    src={prog.art}
                    alt={prog.title}
                    className="h-11 w-11 rounded-xl object-cover shadow-sm shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold truncate group-hover:text-cat transition-colors">
                      {prog.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Program · {prog.sessions} sessions
                    </p>
                  </div>
                </Link>
              );
            })
          )}

          {/* Recently Played Tracks */}
          {(filter === "All" || filter === "Playlists") && (
            recentTracks.map((track) => {
              if (!track) return null;
              const isActive = current?.id === track.id;
              return (
                <button
                  key={track.id}
                  onClick={() => {
                    play(track);
                    if (onNavigate) onNavigate();
                  }}
                  className={cn(
                    "press flex items-center gap-3 p-2 w-full text-left rounded-btn hover:bg-secondary/60 transition-all group",
                    isActive && "bg-secondary/30",
                  )}
                >
                  <div className="relative h-11 w-11 shrink-0 rounded-xl overflow-hidden shadow-sm">
                    <img
                      src={track.art}
                      alt={track.title}
                      className="h-full w-full object-cover"
                    />
                    {isActive && playing && (
                      <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                        <span className="text-[9px] text-white font-bold tracking-wider animate-pulse uppercase">
                          Playing
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn(
                      "text-[13px] font-semibold truncate transition-colors",
                      isActive ? "text-cat font-bold" : "group-hover:text-cat",
                    )}>
                      {track.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Track · {track.raga}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Streaming Info Box */}
        <div className="rounded-xl border border-border/80 bg-background/50 p-3 mt-auto shrink-0">
          <p className="text-[10px] font-bold tracking-wider text-cat uppercase">
            Streaming only
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Sessions are guided in-app and never downloaded or shared.
          </p>
        </div>
      </div>
    </div>
  );
}

export function AppSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] shrink-0 flex-col bg-background p-2 lg:flex xl:w-[300px]">
      <SidebarBody />
    </aside>
  );
}
