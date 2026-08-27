import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bell, BellRing, Music4, RefreshCw, TrendingUp, Heart, Clock, Compass } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useApp } from "@/lib/app-state";

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
  welcome: Heart,
  first_surawali_cta: Compass,
  surawali_subscription: BellRing,
  surawali_reminder: Clock,
  system: Bell,
  reminder: BellRing,
  progress: TrendingUp,
  new: Music4,
  update: RefreshCw,
};

function Notifications() {
  const { notifications, markAsRead } = useApp();
  const navigate = useNavigate();
  const groups = ["Today", "Earlier"];
  const hasNotifications = notifications && notifications.length > 0;

  return (
    <AppShell title="Notifications" subtitle="Reminders and updates">
      {!hasNotifications ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-rise">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-cat-light text-cat">
            <Bell className="h-8 w-8" />
          </div>
          <h3 className="text-base font-semibold">No notifications yet</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-[280px] leading-relaxed">
            We will notify you here when you have session reminders, subscription updates, or new recommendations.
          </p>
        </div>
      ) : (
        groups.map((g) => {
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
                      onClick={() => {
                        if (n.unread) markAsRead(n.id);
                        if (n.link) {
                          navigate({ to: n.link });
                        }
                      }}
                      className={`flex items-start gap-3 rounded-card border border-border bg-surface p-4 shadow-soft transition-all duration-200 ${
                        n.link ? "cursor-pointer hover:border-cat/40 hover:shadow-lift" : ""
                      }`}
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
        })
      )}
    </AppShell>
  );
}
