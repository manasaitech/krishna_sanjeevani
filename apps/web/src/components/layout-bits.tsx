import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Section({
  title,
  hint,
  href,
  onClick,
  children,
  className,
}: {
  title: string;
  hint?: string;
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("animate-rise mt-12", className)}>
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className="font-display text-[19px] leading-tight font-semibold md:text-[22px]">
          {title}
        </h2>
        {onClick ? (
          <button
            onClick={onClick}
            className="press inline-flex shrink-0 items-center gap-1.5 text-[12px] font-semibold text-cat hover:gap-2.5 cursor-pointer bg-transparent border-none"
          >
            {hint ?? "See all"} <ArrowRight className="h-3.5 w-3.5" />
          </button>
        ) : href ? (
          <Link
            to={href}
            className="press inline-flex shrink-0 items-center gap-1.5 text-[12px] font-semibold text-cat hover:gap-2.5"
          >
            {hint ?? "See all"} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          hint && (
            <span className="shrink-0 text-xs font-medium text-muted-foreground">
              {hint}
            </span>
          )
        )}
      </div>
      {children}
    </section>
  );
}

/** Horizontally scrolling rail — used on every breakpoint for dense discovery rows. */
export function Rail({ children }: { children: ReactNode }) {
  return (
    <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-2 md:-mx-8 md:px-8">
      {children}
    </div>
  );
}

/** Responsive card grid: 2 → 3 → 4 → 5 → 6 columns. */
export function CardGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {children}
    </div>
  );
}

export function Panel({
  title,
  children,
  className,
  action,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-card border border-border bg-surface p-6 shadow-soft",
        className,
      )}
    >
      {(title || action) && (
        <div className="mb-5 flex items-center justify-between gap-4">
          {title && <h2 className="font-display text-[16px] font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "press min-h-10 shrink-0 rounded-btn border px-4 text-[13px] font-medium whitespace-nowrap focus-visible:ring-2 focus-visible:ring-cat focus-visible:outline-none",
        active
          ? "border-cat bg-cat text-cat-foreground"
          : "border-border bg-surface text-muted-foreground hover:border-cat/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
