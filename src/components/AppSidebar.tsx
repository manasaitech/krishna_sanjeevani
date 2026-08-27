import { Link, useRouterState } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Heart,
  House,
  Library,
  Plus,
  ArrowRight,
  LayoutGrid,
  Search,
  Sprout,
  Compass,
  Waves,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-state";
import { tracks, programs, sanjeevaniConfigs, type CategoryId } from "@/lib/content";
import logoWithoutText from "@/assets/logo-without-text.webp";
import { api } from "@/lib/api";

export function SidebarBody({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  const { favorites, play, category } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Map favorites IDs to full tracks
  const favoriteTracksList = favorites
    .map((id) => tracks.find((t) => t.id === id))
    .filter(Boolean);

  const activeCategory = (!category || category === "unset") ? "devotional" : category;
  const activeConfig = sanjeevaniConfigs[activeCategory as Exclude<CategoryId, "unset">];

  const getLinkClass = (to: string, hash?: string) => {
    const active = pathname === to && (!hash || window.location.hash === `#${hash}`);
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
            alt={`${activeConfig.name} Logo`}
            className="h-10 w-10 shrink-0 object-contain"
          />
          <div className="min-w-0">
            <span className="block truncate font-display text-[15px] leading-tight font-semibold">
              {activeConfig.name}
            </span>
            <span className="block truncate text-[11px] text-muted-foreground">
              {activeConfig.subtitle}
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
          </ul>
        </nav>
      </div>

      {/* Bottom Box: Your Library */}
      <div className="flex flex-col gap-3 rounded-card border border-border/60 bg-surface p-4 shadow-soft flex-1 min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <Library className="h-[18px] w-[18px] shrink-0" />
            <span className="text-[13px] font-bold tracking-tight uppercase">Your Library</span>
          </div>
        </div>

        {/* Library Scrollable Area */}
        <div className="flex-1 overflow-y-auto pr-1 -mr-2 space-y-1.5 mt-1 no-scrollbar">
          {/* Favorites / Liked Songs */}
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

          {/* My Playlists (Placeholder) */}
          <div className="press flex items-center gap-3 p-2 rounded-btn hover:bg-secondary/60 transition-all group cursor-not-allowed opacity-60">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary text-muted-foreground shadow-sm">
              <Library className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold truncate">
                My Playlists
              </p>
              <p className="text-[11px] text-muted-foreground">
                0 playlists
              </p>
            </div>
          </div>
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
