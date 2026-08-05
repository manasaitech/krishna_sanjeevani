import type { ReactNode } from "react";
import { CircleAlert, Inbox, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-muted", className)} />;
}

export function CardsLoading({ count = 3 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-44 shrink-0 space-y-3">
          <Skeleton className="aspect-square w-full rounded-card" />
          <Skeleton className="h-3.5 w-4/5" />
          <Skeleton className="h-3 w-2/5" />
        </div>
      ))}
    </div>
  );
}

export function ListLoading({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-card border border-border bg-surface p-3"
        >
          <Skeleton className="h-14 w-14 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-card border border-border bg-surface px-6 py-12 text-center shadow-soft">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-cat-light text-cat">
        {icon ?? <Inbox className="h-6 w-6" />}
      </div>
      <h3 className="mt-5 text-base font-semibold">{title}</h3>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "We couldn't load this",
  body = "Your session is safe. Check your connection and try again.",
  onRetry,
}: {
  title?: string;
  body?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center rounded-card border border-border bg-surface px-6 py-12 text-center shadow-soft"
    >
      <div className="grid h-14 w-14 place-items-center rounded-full bg-destructive/10 text-destructive">
        <CircleAlert className="h-6 w-6" />
      </div>
      <h3 className="mt-5 text-base font-semibold">{title}</h3>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{body}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="press mt-6 inline-flex min-h-11 items-center gap-2 rounded-btn bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
      )}
    </div>
  );
}
