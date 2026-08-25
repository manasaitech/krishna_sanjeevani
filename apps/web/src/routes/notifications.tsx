import { createFileRoute } from "@tanstack/react-router";
import { Bell, BellRing, Music4, RefreshCw, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { notifications } from "@/lib/content";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Krishna Sanjeevani" },
      {
        name: "description",
        content:
          "Session reminders, weekly progress, new tracks and program updates in one quiet feed.",
      },
      { property: "og:title", content: "Notifications — Krishna Sanjeevani" },
      { property: "og:description", content: "Gentle reminders and progress updates." },
    ],
  }),
  component: Notifications,
});

const icons = {
  reminder: BellRing,
  progress: TrendingUp,
  new: Music4,
  update: RefreshCw,
};

function Notifications() {
  const groups = ["Today", "Earlier"];

  return (
    <AppShell title="Notifications" subtitle="Reminders and updates">
      {groups.map((g) => {
        const items = notifications.filter((n) => n.group === g);
        if (!items.length) return null;
        return (
          <section key={g} className="animate-rise mt-6">
            <h2 className="mb-3 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              {g}
            </h2>
            <ul className="space-y-3">
              {items.map((n) => {
                const Icon = icons[n.kind] ?? Bell;
                return (
                  <li
                    key={n.id}
                    className="flex items-start gap-3 rounded-card border border-border bg-surface p-4 shadow-soft"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cat-light text-cat">
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm font-semibold">{n.title}</h3>
                        <span className="shrink-0 text-[11px] text-muted-foreground">{n.time}</span>
                      </div>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                        {n.body}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </AppShell>
  );
}
