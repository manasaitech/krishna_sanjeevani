import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({
  title,
  hint,
  children,
  className,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("animate-rise mt-10", className)}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-[17px] font-semibold">{title}</h2>
        {hint && <span className="text-xs font-medium text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

export function Rail({ children }: { children: ReactNode }) {
  return (
    <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-1">
      {children}
    </div>
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
        "press min-h-11 shrink-0 rounded-btn border px-4 text-[13px] font-medium whitespace-nowrap focus-visible:ring-2 focus-visible:ring-cat focus-visible:outline-none",
        active
          ? "border-cat bg-cat text-cat-foreground"
          : "border-border bg-surface text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
