import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Baby, CalendarCheck, HeartPulse, Stethoscope, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Section } from "@/components/layout-bits";
import { TrackRow } from "@/components/cards";
import { useApp } from "@/lib/app-state";
import { api } from "@/lib/api";
import { pregnancyTips, type Track } from "@/lib/content";

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
  const { current, play } = useApp();
  const [pregnancyData, setPregnancyData] = useState<any>(null);
  const [fetchingData, setFetchingData] = useState(true);
  const [option, setOption] = useState<"lmp" | "edd" | "week">("lmp");
  const [edd, setEdd] = useState("");
  const [week, setWeek] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchPregnancyDetails = () => {
    setFetchingData(true);
    api.pregnancy
      .getToday()
      .then((res) => {
        if (res.success && res.data) {
          setPregnancyData(res.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        setFetchingData(false);
      });
  };

  useEffect(() => {
    fetchPregnancyDetails();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (option === "edd" || option === "lmp") {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(edd)) {
        setErrorMsg("Please enter date in YYYY-MM-DD format");
        return;
      }
      const parsedDate = new Date(edd);
      if (isNaN(parsedDate.getTime())) {
        setErrorMsg("Please enter a valid calendar date");
        return;
      }
    } else {
      const wkNum = parseInt(week, 10);
      if (isNaN(wkNum) || wkNum < 1 || wkNum > 40) {
        setErrorMsg("Please enter a week number between 1 and 40");
        return;
      }
    }

    setSaving(true);
    try {
      let submitEdd = undefined;
      if (option === "edd") {
        submitEdd = edd;
      } else if (option === "lmp") {
        const lmpDate = new Date(edd);
        const calculatedEddDate = new Date(lmpDate.getTime() + 280 * 24 * 60 * 60 * 1000);
        submitEdd = calculatedEddDate.toISOString().split("T")[0];
      }

      const res = await api.pregnancy.saveUserInfo({
        edd: submitEdd,
        currentWeek: option === "week" ? parseInt(week, 10) : undefined,
      });
      if (res.success) {
        fetchPregnancyDetails();
      } else {
        setErrorMsg(res.message || "Failed to save settings");
      }
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (fetchingData) {
    return (
      <AppShell>
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-cat" />
        </div>
      </AppShell>
    );
  }

  const isSet = pregnancyData && !pregnancyData.setNeeded;

  if (!isSet) {
    return (
      <AppShell>
        <div className="mx-auto max-w-md rounded-card border border-border bg-surface p-6 shadow-soft mt-8">
          <h2 className="text-xl font-semibold text-center">Pregnancy Onboarding</h2>
          <p className="text-xs text-muted-foreground text-center mt-2 leading-relaxed">
            Configure your gestational details so we can customize your daily prenatal listening
            path.
          </p>

          <form onSubmit={handleSave} className="mt-6 space-y-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setOption("lmp");
                  setErrorMsg(null);
                }}
                className={`flex-1 min-h-[40px] rounded-xl border text-[11px] font-semibold transition-colors ${
                  option === "lmp"
                    ? "border-cat bg-cat text-cat-foreground"
                    : "border-border bg-surface text-foreground"
                }`}
              >
                Last Period (LMP)
              </button>
              <button
                type="button"
                onClick={() => {
                  setOption("edd");
                  setErrorMsg(null);
                }}
                className={`flex-1 min-h-[40px] rounded-xl border text-[11px] font-semibold transition-colors ${
                  option === "edd"
                    ? "border-cat bg-cat text-cat-foreground"
                    : "border-border bg-surface text-foreground"
                }`}
              >
                Due Date (EDD)
              </button>
              <button
                type="button"
                onClick={() => {
                  setOption("week");
                  setErrorMsg(null);
                }}
                className={`flex-1 min-h-[40px] rounded-xl border text-[11px] font-semibold transition-colors ${
                  option === "week"
                    ? "border-cat bg-cat text-cat-foreground"
                    : "border-border bg-surface text-foreground"
                }`}
              >
                Current Week
              </button>
            </div>

            {option === "lmp" ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold block">
                  Last Period Date / Pregnancy Start Date
                </label>
                <input
                  type="date"
                  value={edd}
                  onChange={(e) => setEdd(e.target.value)}
                  className="w-full rounded-field border border-border bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-cat focus:outline-none"
                />
                <p className="text-[10px] text-muted-foreground">
                  Enter the date you became pregnant. We will calculate the EDD (LMP + 280 days)
                  dynamically.
                </p>
              </div>
            ) : option === "edd" ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold block">Estimated Due Date (EDD)</label>
                <input
                  type="date"
                  value={edd}
                  onChange={(e) => setEdd(e.target.value)}
                  className="w-full rounded-field border border-border bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-cat focus:outline-none"
                />
                <p className="text-[10px] text-muted-foreground">
                  Enter your target due date to calculate gestational age.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold block">Current Gestational Week</label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  placeholder="e.g. 12"
                  value={week}
                  onChange={(e) => setWeek(e.target.value)}
                  className="w-full rounded-field border border-border bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-cat focus:outline-none"
                />
                <p className="text-[10px] text-muted-foreground">
                  Enter your current pregnancy week (1 to 40).
                </p>
              </div>
            )}

            {errorMsg && <p className="text-xs text-red-500 text-center">{errorMsg}</p>}

            <button
              type="submit"
              disabled={saving}
              className="w-full min-h-[48px] rounded-xl bg-cat text-cat-foreground font-semibold flex items-center justify-center disabled:opacity-75 transition-opacity"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save and Start Journey"}
            </button>
          </form>
        </div>
      </AppShell>
    );
  }

  const currentMonth = pregnancyData.gestationalDetails?.month ?? 5;
  const completed = pregnancyData.program?.progress?.completedTracks?.length ?? 0;
  const total = pregnancyData.program?.tracks?.length ?? 0;
  const pct = pregnancyData.program?.progress?.progressPercentage ?? 0;

  const today = pregnancyData.program?.tracks?.[0]
    ? ({
        ...pregnancyData.program.tracks[0],
        art: pregnancyData.program.tracks[0].thumbnailKey
          ? `/api/v1/storage/file/${pregnancyData.program.tracks[0].thumbnailKey}`
          : undefined,
        raga: pregnancyData.program.tracks[0].subtitle || "",
        purpose: pregnancyData.program.tracks[0].description || "Healing",
      } as Track)
    : null;

  const upcomingTracks = Array.isArray(pregnancyData.program?.tracks)
    ? (pregnancyData.program.tracks.slice(1).map((t: any) => ({
        ...t,
        art: t.thumbnailKey ? `/api/v1/storage/file/${t.thumbnailKey}` : undefined,
        raga: t.subtitle || "",
        purpose: t.description || "Healing",
      })) as Track[])
    : [];

  const isTodayCompleted =
    today &&
    Array.isArray(pregnancyData.program?.progress?.completedTracks) &&
    pregnancyData.program.progress.completedTracks.includes(today.id);

  return (
    <AppShell>
      <header className="animate-rise mt-2">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-cat uppercase">
          Pregnancy journey
        </p>
        <h1 className="mt-2 text-[24px] leading-tight font-semibold">
          Month {currentMonth} ·{" "}
          {currentMonth <= 3
            ? "First trimester"
            : currentMonth <= 6
              ? "Second trimester"
              : "Third trimester"}
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
            <CalendarCheck className="h-4 w-4 text-cat" /> Active path
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

      {today ? (
        <Section title="Today's recommendation">
          <div className="overflow-hidden rounded-card border border-border bg-surface shadow-soft">
            <div
              className={`flex items-center gap-2 px-4 py-2.5 text-[11px] font-semibold tracking-wider uppercase ${isTodayCompleted ? "bg-green-50 text-green-700" : "bg-cat-light text-cat"}`}
            >
              <Baby className="h-3.5 w-3.5" /> Month {currentMonth} ·{" "}
              {isTodayCompleted ? "COMPLETED" : "TODAY'S SESSION"}
            </div>
            <div className="p-3">
              <TrackRow track={today} programId={pregnancyData?.program?.id} />
            </div>
          </div>
        </Section>
      ) : (
        <Section title="Today's recommendation">
          <div className="rounded-card border border-border bg-surface p-6 text-center text-sm text-muted-foreground shadow-soft">
            No prenatal tracking sessions available for this stage.
          </div>
        </Section>
      )}

      <Section title="Upcoming sessions">
        <div className="space-y-3">
          {upcomingTracks.map((t: Track) => (
            <TrackRow key={t.id} track={t} programId={pregnancyData?.program?.id} />
          ))}
          {upcomingTracks.length === 0 && (
            <div className="rounded-card border border-border bg-surface p-6 text-center text-sm text-muted-foreground shadow-soft">
              No upcoming prenatal tracks scheduled.
            </div>
          )}
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
            "Continue the evening sequences at low volume. Add the Month 6 set only after your next
            scan. Stop any session that causes discomfort."
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
