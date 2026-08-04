import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { StatusBar } from "@/components/StatusBar";
import { BottomNav } from "@/components/BottomNav";
import { MiniPlayer } from "@/components/MiniPlayer";
import { cn } from "@/lib/utils";

type Props = {
  title?: string;
  subtitle?: string;
  back?: string;
  action?: ReactNode;
  children: ReactNode;
  nav?: boolean;
  mini?: boolean;
  wide?: boolean;
  bare?: boolean;
};

export function AppShell({
  title,
  subtitle,
  back,
  action,
  children,
  nav = true,
  mini = true,
  wide = false,
  bare = false,
}: Props) {
  return (
    <div className="min-h-dvh bg-background">
      <StatusBar />
      {!bare && (
        <header className="sticky top-[1.9rem] z-30 bg-background/85 backdrop-blur-xl">
          <div
            className={cn(
              "mx-auto grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 pt-2 pb-4",
              wide ? "max-w-6xl" : "max-w-2xl",
            )}
          >
            {back ? (
              <Link
                to={back}
                aria-label="Go back"
                className="press grid h-11 w-11 place-items-center rounded-full border border-border bg-surface text-foreground shadow-soft focus-visible:ring-2 focus-visible:ring-cat focus-visible:outline-none"
              >
                <ChevronLeft className="h-5 w-5" />
              </Link>
            ) : (
              <span className="h-11 w-0" />
            )}
            <div className="min-w-0">
              {title && (
                <h1 className="truncate text-[22px] leading-tight font-semibold">{title}</h1>
              )}
              {subtitle && (
                <p className="truncate text-[13px] text-muted-foreground">{subtitle}</p>
              )}
            </div>
            <div className="flex items-center gap-2">{action}</div>
          </div>
        </header>
      )}

      <main
        className={cn(
          "mx-auto px-5 pb-40",
          wide ? "max-w-6xl" : "max-w-2xl",
          bare && "pt-4",
        )}
      >
        {children}
      </main>

      {mini && <MiniPlayer lifted={nav} />}
      {nav && <BottomNav />}
    </div>
  );
}
