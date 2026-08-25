import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, House, Search, Sparkles, User } from "lucide-react";
import { useApp } from "@/lib/app-state";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const { category } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const items = [
    { to: "/home", label: "Home", icon: House },
    { to: "/search", label: "Search", icon: Search },
    ...(category === "pregnancy" ? [{ to: "/journey", label: "Journey", icon: Sparkles }] : []),
    { to: "/favorites", label: "Saved", icon: Heart },
    { to: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/90 backdrop-blur-xl"
    >
      <ul className="mx-auto flex max-w-2xl items-stretch justify-around px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map((item) => {
          const active = pathname === item.to;
          return (
            <li key={item.to} className="flex-1">
              <Link
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "press flex min-h-11 flex-col items-center justify-center gap-1 rounded-btn px-2 py-1.5 text-[11px] font-medium focus-visible:ring-2 focus-visible:ring-cat focus-visible:outline-none",
                  active ? "text-cat" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon
                  className={cn("h-[22px] w-[22px]", active && "scale-105")}
                  strokeWidth={active ? 2.4 : 1.9}
                />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
