import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Crown, Menu, Search as SearchIcon } from "lucide-react";
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

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function TopBar({ title, subtitle }: { title?: string; subtitle?: string }) {
  const { category, setCategory } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const active = categories.find((c) => c.id === category);

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
          <SheetContent side="left" className="w-[300px] bg-surface px-4 py-5">
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
                Ananya
              </h1>
            </>
          )}
        </div>

        <button
          onClick={() => navigate({ to: "/search" })}
          className="press hidden min-h-11 w-full max-w-sm items-center gap-3 rounded-field border border-border bg-surface px-4 text-left text-[13px] text-muted-foreground hover:border-cat/40 md:flex"
        >
          <SearchIcon className="h-4 w-4 shrink-0" />
          Search ragas, purposes, programs
        </button>

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

          <Link
            to="/notifications"
            aria-label="Notifications"
            className="press relative grid h-11 w-11 place-items-center rounded-full border border-border bg-surface"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute top-2.5 right-3 h-2 w-2 rounded-full bg-cat" />
          </Link>

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
