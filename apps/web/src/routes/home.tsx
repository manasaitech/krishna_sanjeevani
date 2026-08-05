import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Play, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CardGrid, Chip, Panel, Rail, Section } from "@/components/layout-bits";
import { ContinueCard, ProgramCard, TrackCard, TrackRow, TrackTile } from "@/components/cards";
import { useApp } from "@/lib/app-state";
import { programs, purposes, tracks } from "@/lib/content";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Home — Krishna Sanjeevani" },
      {
        name: "description",
        content:
          "Your therapeutic listening home: recommended surāvalis, continue listening, stress relief, focus, sleep and pregnancy programs.",
      },
      { property: "og:title", content: "Home — Krishna Sanjeevani" },
      {
        property: "og:description",
        content: "Recommended ragas, therapeutic programs, and your listening history.",
      },
    ],
  }),
  component: Home,
});

function byPurpose(purpose: string) {
  return tracks.filter((t) => t.purpose === purpose);
}

function Home() {
  const { category, current, play } = useApp();
  const [purpose, setPurpose] = useState<string | null>(null);

  const catTracks = useMemo(
    () => tracks.filter((t) => t.category === category),
    [category],
  );
  const filtered = useMemo(
    () => (purpose ? tracks.filter((t) => t.purpose === purpose) : catTracks),
    [purpose, catTracks],
  );
  const featured = catTracks[0] ?? tracks[0]!;
  const catPrograms = programs.filter((p) => p.category === category);

  return (
    <AppShell>
      {/* Hero */}
      <section className="animate-rise grid gap-6 xl:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]">
        <div className="relative overflow-hidden rounded-card shadow-lift">
          <img
            src={featured.art}
            alt={`Artwork for ${featured.title}`}
            width={1600}
            height={800}
            className="h-[260px] w-full object-cover md:h-[320px] xl:h-[380px]"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-foreground/80 via-foreground/45 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end gap-4 p-6 md:p-10">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-background/95 px-3 py-1 text-[10px] font-semibold tracking-wider text-cat uppercase">
              <Sparkles className="h-3 w-3" /> Today's session
            </span>
            <div>
              <h2 className="font-display text-[26px] leading-tight font-semibold text-background md:text-[38px] xl:text-[44px]">
                {featured.title}
              </h2>
              <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-background/85 md:text-[15px]">
                {featured.raga} · {featured.purpose} — {featured.frequency}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => play(featured)}
                className="press inline-flex min-h-12 items-center gap-2 rounded-btn bg-background px-6 text-[14px] font-semibold text-foreground hover:bg-background/90"
              >
                <Play className="h-4 w-4" fill="currentColor" /> Begin session
              </button>
              <Link
                to="/player"
                className="press inline-flex min-h-12 items-center rounded-btn border border-background/40 px-6 text-[14px] font-semibold text-background hover:bg-background/10"
              >
                Listening guidance
              </Link>
            </div>
          </div>
        </div>

        <Panel title="Your practice" className="flex flex-col justify-between">
          <div className="space-y-5">
            {[
              { label: "Sessions this week", value: "5 of 7" },
              { label: "Total listening", value: "6h 12m" },
              { label: "Current theme", value: category },
            ].map((s) => (
              <div key={s.label} className="flex items-baseline justify-between gap-4">
                <span className="text-[13px] text-muted-foreground">{s.label}</span>
                <span className="font-display text-[17px] font-semibold capitalize">
                  {s.value}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-cat-light p-4">
            <p className="text-[11px] font-semibold tracking-wider text-cat uppercase">
              Now in your queue
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed">
              {(current ?? featured).title} — {(current ?? featured).instructions}
            </p>
          </div>
        </Panel>
      </section>

      <div className="no-scrollbar -mx-5 mt-8 flex gap-2.5 overflow-x-auto px-5 md:-mx-8 md:px-8">
        <Chip active={purpose === null} onClick={() => setPurpose(null)}>
          All purposes
        </Chip>
        {purposes.map((p) => (
          <Chip key={p} active={purpose === p} onClick={() => setPurpose(p)}>
            {p}
          </Chip>
        ))}
      </div>

      <Section title="Continue listening" hint="Picks up where you paused">
        <Rail>
          {[current ?? tracks[0]!, tracks[2]!, tracks[8]!, tracks[4]!].map((t, i) => (
            <ContinueCard key={`${t.id}-${i}`} track={t} progress={[62, 28, 45, 12][i]!} />
          ))}
        </Rail>
      </Section>

      <Section
        title={purpose ? `Recommended for ${purpose.toLowerCase()}` : "Recommended for you"}
        hint={`${filtered.length} sessions`}
      >
        <CardGrid>
          {filtered.map((t) => (
            <TrackTile key={t.id} track={t} />
          ))}
        </CardGrid>
      </Section>

      <Section title="Popular today" hint="Across all listeners">
        <Rail>
          {tracks.slice(3, 10).map((t) => (
            <TrackCard key={t.id} track={t} />
          ))}
        </Rail>
      </Section>

      {["Stress Relief", "Focus", "Sleep"].map((p) => (
        <Section key={p} title={p} hint={`${byPurpose(p).length} sessions`} href="/browse">
          <Rail>
            {(byPurpose(p).length ? byPurpose(p) : tracks.slice(0, 4)).map((t) => (
              <TrackCard key={t.id} track={t} />
            ))}
          </Rail>
        </Section>
      ))}

      <Section title="Corporate wellness" hint="Secular sequences for teams" href="/programs">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {programs
            .filter((p) => p.category === "secular")
            .map((p) => (
              <ProgramCard key={p.id} program={p} wide />
            ))}
        </div>
      </Section>

      <Section title="Pregnancy programs" href="/journey" hint="Open dashboard">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {programs
            .filter((p) => p.category === "pregnancy")
            .map((p) => (
              <ProgramCard key={p.id} program={p} wide />
            ))}
        </div>
      </Section>

      <Section title="Recently played" href="/recent">
        <div className="rounded-card border border-border bg-surface/60 p-2 md:p-3">
          {tracks.slice(0, 6).map((t, i) => (
            <TrackRow key={t.id} track={t} index={i} />
          ))}
        </div>
      </Section>

      <Section title="Trending programs" href="/programs">
        <Rail>
          {(catPrograms.length ? catPrograms : programs).map((p) => (
            <ProgramCard key={p.id} program={p} />
          ))}
        </Rail>
      </Section>
    </AppShell>
  );
}
