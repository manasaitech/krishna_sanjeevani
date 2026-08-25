import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  Bell,
  BellRing,
  Crown,
  Menu,
  Search as SearchIcon,
  Music4,
  RefreshCw,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarBody } from "@/components/AppSidebar";
import { useApp } from "@/lib/app-state";
import { categories } from "@/lib/content";
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
  const userName = user?.profile?.fullName || user?.email?.split("@")[0] || "Guest";
  const [menuOpen, setMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bellRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const active = categories.find((c) => c.id === category);

  const [searchVal, setSearchVal] = useState("");
  const searchParam = useRouterState({
    select: (s: any) =>
      s.location.pathname === "/home" ? (s.location.search as any).search : undefined,
  });

  useEffect(() => {
    setSearchVal((searchParam as unknown as string) || "");
  }, [searchParam]);

  const handleSearchChange = (val: string) => {
    setSearchVal(val);
    navigate({
      to: "/home",
      search: val ? { search: val } : {},
      replace: true,
    });
  };

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

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-5 py-3.5 md:gap-5 md:px-8 lg:py-4">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            aria-label="Open navigation"
            className="press grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border bg-surface lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[300px] bg-background p-2 [&>button]:bg-surface [&>button]:rounded-full [&>button]:shadow-sm [&>button]:border [&>button]:border-border"
          >
            <SidebarBody onNavigate={() => setMenuOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="min-w-0 flex-1">
          {title ? (
            <>
              <h1 className="truncate font-display text-[19px] leading-tight font-semibold md:text-[22px]">
                {title}
              </h1>
              {subtitle && (
                <p className="truncate text-[12px] text-muted-foreground md:text-[13px]">
                  {subtitle}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-[12px] text-muted-foreground">{greeting()},</p>
              <h1 className="truncate font-display text-[19px] leading-tight font-semibold md:text-[22px]">
                {userName}
              </h1>
            </>
          )}
        </div>

        <div className="relative hidden w-full max-w-sm md:block">
          <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search ragas, programs, ailments..."
            className="w-full min-h-11 pl-11 pr-14 rounded-field border border-border bg-surface text-[13px] outline-none focus-visible:border-cat focus-visible:ring-2 focus-visible:ring-cat/20 transition-all text-foreground"
          />
          {searchVal && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-cat hover:brightness-95 p-1"
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="press hidden min-h-11 items-center gap-2 rounded-btn border border-border bg-surface px-3.5 text-[13px] font-medium sm:inline-flex">
              <span className="h-2.5 w-2.5 rounded-full bg-cat" />
              {active?.name ?? "Theme"}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Listening theme</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {categories.map((c) => (
                <DropdownMenuItem
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={cn("gap-2", c.id === category && "font-semibold")}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      background:
                        c.id === "devotional"
                          ? "#7A1E2C"
                          : c.id === "secular"
                            ? "#0F766E"
                            : "#C97B8A",
                    }}
                  />
                  {c.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            to="/subscription"
            className="press hidden min-h-11 items-center gap-1.5 rounded-btn bg-cat-light px-3.5 text-[12px] font-semibold text-cat lg:inline-flex"
          >
            <Crown className="h-3.5 w-3.5" /> Premium
          </Link>

          <div className="relative">
            <button
              ref={bellRef}
              onClick={() => setIsNotificationOpen((prev) => !prev)}
              aria-label="Notifications"
              aria-expanded={isNotificationOpen}
              aria-haspopup="dialog"
              className="press relative grid h-11 w-11 place-items-center rounded-full border border-border bg-surface text-foreground focus-visible:ring-2 focus-visible:ring-cat focus-visible:outline-none cursor-pointer"
            >
              <Bell className="h-[18px] w-[18px]" />
              {hasUnread && (
                <span className="absolute top-2.5 right-3 h-2.5 w-2.5 rounded-full bg-cat border-2 border-surface" />
              )}
            </button>

            {isNotificationOpen && (
              <div
                ref={popoverRef}
                role="dialog"
                aria-label="Notifications panel"
                className="fixed inset-x-4 top-[72px] sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-[calc(100vw-32px)] sm:w-[380px] rounded-card border border-border bg-surface p-4 shadow-lift z-50 animate-rise"
              >
                <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                  <h2 className="font-display text-[15px] font-semibold text-foreground">
                    Notifications
                  </h2>
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
                      <p className="text-[13px] font-semibold text-foreground">
                        You're all caught up!
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        No new notifications.
                      </p>
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
                                      n.unread && "cursor-pointer",
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        "grid h-8 w-8 shrink-0 place-items-center rounded-lg text-cat",
                                        n.unread
                                          ? "bg-cat-light text-cat"
                                          : "bg-secondary text-muted-foreground",
                                      )}
                                    >
                                      <Icon className="h-4 w-4" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-start justify-between gap-2">
                                        <h4
                                          className={cn(
                                            "text-[13px]",
                                            n.unread
                                              ? "font-semibold text-foreground"
                                              : "font-medium text-foreground/80",
                                          )}
                                        >
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

          <Link
            to="/profile"
            aria-label="Profile"
            className="press grid h-11 w-11 place-items-center rounded-full bg-primary text-[13px] font-semibold text-primary-foreground"
          >
            AN
          </Link>
        </div>
      </div>
    </header>
  );
}
