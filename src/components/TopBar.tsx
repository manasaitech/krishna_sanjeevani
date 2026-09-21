import { Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect, useMemo } from "react";
import { Bell, BellRing, Crown, Menu, Search as SearchIcon, Music4, RefreshCw, TrendingUp, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarBody } from "@/components/AppSidebar";
import { useApp } from "@/lib/app-state";
import { useMode, getActiveMode } from "@/core/mode";
import { categories, sanjeevaniConfigs, type CategoryId } from "@/lib/content";
import { cn } from "@/lib/utils";

const notificationIcons: Record<string, any> = {
  reminder: BellRing,
  progress: TrendingUp,
  new: Music4,
  update: RefreshCw,
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function TopBar({
  title,
  subtitle,
}: {
  title?: string | undefined;
  subtitle?: string | undefined;
}) {
  const { category, setCategory, user, notifications, markAsRead, markAllAsRead } = useApp();
  const { isEmotionMode: ctxEmotion, config: modeConfig } = useMode();
  const isEmotionMode = ctxEmotion ?? (getActiveMode() === "emotion_remediation");
  const userName = user?.profile?.fullName || user?.email?.split("@")[0] || "Guest";
  const [menuOpen, setMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bellRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const active = categories.find((c) => c.id === category);

  const hasUnread = notifications.some((n) => n.unread);

  useEffect(() => {
    if (!isNotificationOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isNotificationOpen]);

  useEffect(() => {
    if (!isNotificationOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsNotificationOpen(false);
        bellRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isNotificationOpen]);

  // Compute user initials
  const initials = useMemo(() => {
    try {
      const name = user?.profile?.fullName || (user as any)?.fullName || (user as any)?.name;
      if (name && typeof name === "string") {
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length >= 2 && parts[0] && parts[1]) {
          return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        if (parts.length === 1 && parts[0]) {
          return parts[0].substring(0, 2).toUpperCase();
        }
      }
      if (user?.email && typeof user.email === "string" && user.email.length > 0) {
        return user.email.substring(0, 2).toUpperCase();
      }
    } catch {}
    return "AN";
  }, [user]);

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-[#FAF8F5]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-3 md:gap-5 md:px-7">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            aria-label="Open navigation"
            className="press grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-surface lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] bg-[#FAF8F5] p-2 [&>button]:bg-surface [&>button]:rounded-full [&>button]:shadow-sm [&>button]:border [&>button]:border-border">
            <SidebarBody onNavigate={() => setMenuOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Greeting / Header Title */}
        <div className="min-w-0">
          {title ? (
            <>
              <h1 className="truncate font-display text-[18px] leading-tight font-bold md:text-[21px] text-foreground">
                {title}
              </h1>
              {subtitle && (
                <p className="truncate text-[12px] text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </>
          ) : (
            <div>
              <p className="text-[11.5px] font-medium text-muted-foreground">{greeting()},</p>
              <h1 className="truncate font-display text-[18px] leading-tight font-extrabold md:text-[21px] text-foreground tracking-tight">
                {userName}
              </h1>
              <p className="truncate text-[11px] text-muted-foreground/85 font-serif italic mt-0.5 max-w-full">
                Let the healing frequencies guide your day 🪶
              </p>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <button
          onClick={() => navigate({ to: "/search" })}
          className="press hidden min-h-10 w-full max-w-md items-center gap-3 rounded-full border border-border/80 bg-surface/90 px-4 text-left text-[12.5px] text-muted-foreground hover:bg-surface shadow-2xs md:flex transition-all"
        >
          <SearchIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate">
            {isEmotionMode
              ? "Search emotion compositions, doshas, or trajectories..."
              : "Search surawalis, ragas, ailments, or benefits..."}
          </span>
        </button>

        {/* Right Actions */}
        <div className="flex shrink-0 items-center gap-2.5">
          <Link
            to="/subscription"
            className="press hidden min-h-9 items-center gap-1.5 rounded-full border border-amber-900/15 bg-[#FDF6E9] px-3.5 text-[12px] font-bold text-[#9A6E1E] hover:bg-[#FAF0D8] transition-all sm:inline-flex shadow-2xs"
          >
            <Crown className="h-3.5 w-3.5 text-[#B88A2A]" /> Premium
          </Link>

          {/* Notifications Button */}
          <div className="relative">
            <button
              ref={bellRef}
              onClick={() => setIsNotificationOpen((prev) => !prev)}
              aria-label="Notifications"
              aria-expanded={isNotificationOpen}
              aria-haspopup="dialog"
              className="press relative grid h-10 w-10 place-items-center rounded-full border border-border bg-surface text-foreground hover:bg-secondary/60 focus-visible:ring-2 focus-visible:ring-cat focus-visible:outline-none cursor-pointer transition-all shadow-2xs"
            >
              <Bell className="h-4 w-4" />
              {hasUnread && (
                <span 
                  className="absolute top-2 right-2.5 h-2 w-2 rounded-full border-2 border-surface" 
                  style={{ backgroundColor: active?.id === "secular" ? "#0F766E" : active?.id === "pregnancy" ? "#D01C5C" : "#7C1C24" }}
                />
              )}
            </button>

            {isNotificationOpen && (
              <div
                ref={popoverRef}
                role="dialog"
                aria-label="Notifications panel"
                className="fixed inset-x-4 top-[72px] sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-[calc(100vw-32px)] sm:w-[380px] rounded-2xl border border-border bg-surface p-4 shadow-lift z-50 animate-rise"
              >
                <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                  <h2 className="font-display text-[15px] font-semibold text-foreground">Notifications</h2>
                  {hasUnread && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] font-semibold text-cat hover:text-cat-hover transition-colors cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="mt-3">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Loader2 className="h-5 w-5 text-cat animate-spin mb-2" />
                      <p className="text-[12px] text-muted-foreground">Loading notifications...</p>
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <p className="text-[12px] text-muted-foreground mb-3">{error}</p>
                      <button
                        onClick={() => {
                          setLoading(true);
                          setError(null);
                          setTimeout(() => {
                            setLoading(false);
                          }, 300);
                        }}
                        className="press rounded-btn bg-cat px-3 py-1.5 text-xs font-semibold text-cat-foreground"
                      >
                        Retry
                      </button>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Bell className="h-8 w-8 text-muted-foreground/60 mb-2" />
                      <p className="text-[13px] font-semibold text-foreground">You're all caught up!</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">No new notifications.</p>
                    </div>
                  ) : (
                    <div className="max-h-[360px] overflow-y-auto pr-0.5 -mr-1.5 no-scrollbar space-y-4 py-1">
                      {["Today", "Earlier"].map((g) => {
                        const items = notifications.filter((n) => n.group === g);
                        if (!items.length) return null;
                        return (
                          <div key={g} className="space-y-2">
                            <h3 className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                              {g}
                            </h3>
                            <ul className="space-y-2">
                              {items.map((n) => {
                                const Icon = notificationIcons[n.kind] ?? Bell;
                                return (
                                  <li
                                    key={n.id}
                                    onClick={() => {
                                      if (n.unread) markAsRead(n.id);
                                    }}
                                    className={cn(
                                      "flex items-start gap-3 rounded-xl border border-border p-3 transition-colors text-left",
                                      n.unread
                                        ? "bg-cat-light/40 hover:bg-cat-light/65 border-cat-accent/20"
                                        : "bg-surface hover:bg-secondary/40",
                                      n.unread && "cursor-pointer"
                                    )}
                                  >
                                    <span className={cn(
                                      "grid h-8 w-8 shrink-0 place-items-center rounded-lg text-cat",
                                      n.unread ? "bg-cat-light text-cat" : "bg-secondary text-muted-foreground"
                                    )}>
                                      <Icon className="h-4 w-4" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-start justify-between gap-2">
                                        <h4 className={cn("text-[13px]", n.unread ? "font-semibold text-foreground" : "font-medium text-foreground/80")}>
                                          {n.title}
                                        </h4>
                                        <span className="shrink-0 text-[10px] text-muted-foreground">
                                          {n.time}
                                        </span>
                                      </div>
                                      <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                                        {n.body}
                                      </p>
                                    </div>
                                    {n.unread && (
                                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cat mt-1.5" />
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Avatar */}
          <Link
            to="/profile"
            aria-label="Profile"
            className="press grid h-10 w-10 place-items-center rounded-full bg-[#243342] text-[12.5px] font-bold text-white shadow-2xs hover:scale-105 transition-transform"
          >
            {initials}
          </Link>
        </div>
      </div>
    </header>
  );
}
