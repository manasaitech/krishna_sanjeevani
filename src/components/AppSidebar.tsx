import { Link, useRouterState } from "@tanstack/react-router";
import {
  Compass,
  Heart,
  History,
  House,
  LayoutGrid,
  Search,
  Settings,
  Sparkles,
  Sprout,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const navItems = [
  { to: "/home", label: "Home", icon: House },
  { to: "/browse", label: "Browse", icon: Compass },
  { to: "/search", label: "Search", icon: Search },
  { to: "/programs", label: "Programs", icon: LayoutGrid },
  { to: "/journey", label: "Pregnancy", icon: Sprout },
] as const;

export const libraryItems = [
  { to: "/favorites", label: "Favorites", icon: Heart },
  { to: "/recent", label: "Recently played", icon: History },
] as const;

export const accountItems = [
  { to: "/subscription", label: "Subscription", icon: Sparkles },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function NavList({
  label,
  items,
  onNavigate,
}: {
  label: string;
  items: readonly { to: string; label: string; icon: React.ElementType }[];
  onNavigate?: (() => void) | undefined;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="mt-7 first:mt-0">
      <p className="px-3 pb-2 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        {label}
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const active = pathname === item.to;
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "press group flex min-h-11 items-center gap-3 rounded-btn px-3 text-[14px] font-medium focus-visible:ring-2 focus-visible:ring-cat focus-visible:outline-none",
                  active
                    ? "bg-cat-light text-cat"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <item.icon
                  className="h-[18px] w-[18px] shrink-0"
                  strokeWidth={active ? 2.3 : 1.9}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function SidebarBody({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  return (
    <div className="flex h-full flex-col">
      <Link
        to="/home"
        onClick={onNavigate}
        className="press flex items-center gap-3 px-3 py-1 focus-visible:ring-2 focus-visible:ring-cat focus-visible:outline-none"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-cat text-[15px] font-semibold text-cat-foreground">
          KS
        </span>
        <span className="min-w-0">
          <span className="block truncate font-display text-[15px] leading-tight font-semibold">
            Krishna Sanjeevani
          </span>
          <span className="block truncate text-[11px] text-muted-foreground">
            The Divine Music Medicine
          </span>
        </span>
      </Link>

      <nav aria-label="Primary" className="mt-8 flex-1 overflow-y-auto pb-6">
        <NavList label="Discover" items={navItems} onNavigate={onNavigate} />
        <NavList label="Library" items={libraryItems} onNavigate={onNavigate} />
        <NavList label="Account" items={accountItems} onNavigate={onNavigate} />
      </nav>

      <div className="rounded-card border border-border bg-background p-4">
        <p className="text-[11px] font-semibold tracking-wider text-cat uppercase">
          Streaming only
        </p>
        <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
          Sessions are guided in-app and never downloaded or shared.
        </p>
      </div>
    </div>
  );
}

export function AppSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] shrink-0 flex-col border-r border-border bg-surface px-4 py-5 lg:flex xl:w-[288px]">
      <SidebarBody />
    </aside>
  );
}
