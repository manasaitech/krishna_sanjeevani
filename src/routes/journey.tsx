import { createFileRoute } from "@tanstack/react-router";
import { Baby, CalendarCheck, HeartPulse, Stethoscope } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Section } from "@/components/layout-bits";
import { TrackRow } from "@/components/cards";
import { pregnancyTips, tracks } from "@/lib/content";

export const Route = createFileRoute("/journey")({
  head: () => ({
    meta: [
      { title: "Pregnancy journey — Krishna Sanjeevani" },
      {
        name: "description",
        content:
          "A month-wise pregnancy wellness dashboard: today's recommendation, completed sessions, baby wellness tips and doctor notes.",
      },
      { property: "og:title", content: "Pregnancy journey — Krishna Sanjeevani" },
      {
        property: "og:description",
        content: "Track your month-wise prenatal listening journey with gentle guidance.",
      },
    ],
  }),
  component: Journey,
});

const months = Array.from({ length: 9 }, (_, i) => i + 1);
const currentMonth = 5;
const completed = 18;
const total = 24;

function ProgressRing({ value }: { value: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid h-32 w-32 place-items-center">
      <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="var(--cat)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (value / 100) * c}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-semibold tabular-nums">{value}%</p>
        <p className="text-[11px] text-muted-foreground">complete</p>
      </div>
    </div>
  );
}

function Journey() {
  const pct = Math.round((completed / total) * 100);
  const today = tracks.find((t) => t.id === "t5")!;

  return (
    <AppShell bare>
      <header className="animate-rise mt-2">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-cat uppercase">
          Pregnancy journey
        </p>
        <h1 className="mt-2 text-[24px] leading-tight font-semibold">
          Month {currentMonth} · Second trimester
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Gentle sequences chosen for this stage. Nothing strenuous, nothing loud.
        </p>
      </header>

      <div className="animate-rise mt-6 flex items-center gap-6 rounded-card border border-border bg-surface p-5 shadow-soft">
        <ProgressRing value={pct} />
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="text-2xl font-semibold tabular-nums">
              {completed}
              <span className="text-sm font-medium text-muted-foreground"> / {total}</span>
            </p>
            <p className="text-xs text-muted-foreground">Sessions completed</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarCheck className="h-4 w-4 text-cat" /> 6 day streak
          </div>
        </div>
      </div>

      <Section title="Your timeline">
        <ol className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5">
          {months.map((m) => {
            const done = m < currentMonth;
            const active = m === currentMonth;
            return (
              <li key={m} className="shrink-0">
                <div
                  className={`w-24 rounded-card border p-3 text-center ${
                    active
                      ? "border-cat bg-cat text-cat-foreground shadow-soft"
                      : done
                        ? "border-border bg-cat-light text-cat"
                        : "border-border bg-surface text-muted-foreground"
                  }`}
                >
                  <p className="text-[10px] tracking-wider uppercase">Month</p>
                  <p className="text-xl font-semibold tabular-nums">{m}</p>
                  <p className="mt-1 text-[10px]">
                    {done ? "Complete" : active ? "In progress" : "Upcoming"}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </Section>

      <Section title="Today's recommendation">
        <div className="overflow-hidden rounded-card border border-border bg-surface shadow-soft">
          <div className="flex items-center gap-2 bg-cat-light px-4 py-2.5 text-[11px] font-semibold tracking-wider text-cat uppercase">
            <Baby className="h-3.5 w-3.5" /> Month {currentMonth} · evening
          </div>
          <div className="p-3">
            <TrackRow track={today} />
          </div>
        </div>
      </Section>

      <Section title="Upcoming sessions">
        <div className="space-y-3">
          {tracks
            .filter((t) => t.category === "pregnancy" || t.purpose === "Sleep")
            .slice(0, 3)
            .map((t) => (
              <TrackRow key={t.id} track={t} />
            ))}
        </div>
      </Section>

      <Section title="Baby wellness tips">
        <ul className="space-y-3">
          {pregnancyTips.map((tip) => (
            <li
              key={tip}
              className="flex items-start gap-3 rounded-card border border-border bg-surface p-4 text-sm leading-relaxed shadow-soft"
            >
              <HeartPulse className="mt-0.5 h-4 w-4 shrink-0 text-cat" />
              {tip}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Doctor note">
        <div className="rounded-card border border-border bg-surface p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cat-light text-cat">
              <Stethoscope className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold">Dr. Meera Iyer</p>
              <p className="text-xs text-muted-foreground">Obstetrics · reviewed 3 days ago</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            "Continue the evening sequences at low volume. Add the Month 6 set only after
            your next scan. Stop any session that causes discomfort."
          </p>
          <label className="mt-5 block text-xs font-medium text-muted-foreground">
            Add a note for your next visit
            <textarea
              rows={3}
              placeholder="How did this week's sessions feel?"
              className="mt-2 w-full resize-none rounded-field border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-cat focus:outline-none"
            />
          </label>
        </div>
      </Section>
    </AppShell>
  );
}
