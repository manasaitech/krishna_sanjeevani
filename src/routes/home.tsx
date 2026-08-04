import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bell, Crown, Search as SearchIcon, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Chip, Rail, Section } from "@/components/layout-bits";
import { ContinueCard, ProgramCard, TrackCard, TrackRow } from "@/components/cards";
import { CardsLoading, EmptyState } from "@/components/States";
import { useApp } from "@/lib/app-state";
import { programs, purposes, tracks } from "@/lib/content";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Home — Krishna Sanjeevani" },
      {
        name: "description",
        content:
          "Your daily therapeutic listening: recommended surāvalis, continue listening, and programs matched to your purpose.",
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

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function Home() {
  const { category, current } = useApp();
  const [purpose, setPurpose] = useState<string | null>(null);

  const catTracks = useMemo(
    () => tracks.filter((t) => t.category === category),
    [category],
  );
  const filtered = useMemo(
    () => (purpose ? tracks.filter((t) => t.purpose === purpose) : catTracks),
    [purpose, catTracks],
  );
  const catPrograms = programs.filter((p) => p.category === category);
  const featured = catTracks[0] ?? tracks[0]!;

  return (
    <AppShell bare>
      <header className="animate-rise mt-2 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[13px] text-muted-foreground">{greeting()},</p>
          <h1 className="truncate text-[24px] leading-tight font-semibold">Ananya</h1>
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-cat-light px-3 py-1 text-[11px] font-semibold text-cat">
            <Crown className="h-3.5 w-3.5" /> Premium member
          </span>
        </div>
        <Link
          to="/notifications"
          aria-label="Notifications"
          className="press relative grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border bg-surface shadow-soft"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute top-2.5 right-3 h-2 w-2 rounded-full bg-cat" />
        </Link>
      </header>

      <Link
        to="/search"
        className="press mt-6 flex min-h-13 items-center gap-3 rounded-field border border-border bg-surface px-4 text-sm text-muted-foreground shadow-soft focus-visible:ring-2 focus-visible:ring-cat focus-visible:outline-none"
      >
        <SearchIcon className="h-[18px] w-[18px]" />
        Search ragas, purposes, programs
      </Link>

      <div className="no-scrollbar -mx-5 mt-5 flex gap-2.5 overflow-x-auto px-5">
        <Chip active={purpose === null} onClick={() => setPurpose(null)}>
          All
        </Chip>
        {purposes.map((p) => (
          <Chip key={p} active={purpose === p} onClick={() => setPurpose(p)}>
            {p}
          </Chip>
        ))}
      </div>

      <section className="animate-rise mt-8">
        <Link
          to="/player"
          className="press group relative block overflow-hidden rounded-card shadow-lift focus-visible:ring-2 focus-visible:ring-cat focus-visible:outline-none"
        >
          <img
            src={featured.art}
            alt={`Artwork for ${featured.title}`}
            width={1024}
            height={1024}
            className="aspect-[16/11] w-full object-cover transition-transform duration-[250ms] group-hover:scale-[1.03] sm:aspect-[16/7]"
          />
          <div className="absolute inset-0 bg-foreground/45" />
          <div className="absolute inset-0 flex flex-col justify-end p-6">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-background/95 px-3 py-1 text-[10px] font-semibold tracking-wider text-cat uppercase">
              <Sparkles className="h-3 w-3" /> Today's session
            </span>
            <h2 className="mt-3 text-[22px] leading-tight font-semibold text-background">
              {featured.title}
            </h2>
            <p className="mt-1 text-[13px] text-background/85">
              {featured.raga} · {featured.purpose}
            </p>
          </div>
        </Link>
      </section>

      <Section title="Continue listening" hint="Picks up where you paused">
        <Rail>
          {[current ?? tracks[0]!, tracks[2]!, tracks[8]!].map((t, i) => (
            <ContinueCard key={`${t.id}-${i}`} track={t} progress={[62, 28, 45][i]!} />
          ))}
        </Rail>
      </Section>

      <Section
        title={purpose ? `Recommended for ${purpose.toLowerCase()}` : "Recommended for you"}
        hint={`${filtered.length} tracks`}
      >
        {filtered.length === 0 ? (
          <EmptyState
            title="Nothing here yet"
            body="We haven't sequenced a surāvali for this purpose in your path. Try another chip."
          />
        ) : (
          <Rail>
            {filtered.map((t) => (
              <TrackCard key={t.id} track={t} />
            ))}
          </Rail>
        )}
      </Section>

      <Section title="Recently played">
        <div className="space-y-3">
          {tracks.slice(0, 3).map((t) => (
            <TrackRow key={t.id} track={t} />
          ))}
        </div>
      </Section>

      <Section title="Popular today" hint="Across all listeners">
        <Rail>
          {tracks.slice(3, 8).map((t) => (
            <TrackCard key={t.id} track={t} />
          ))}
        </Rail>
      </Section>

      <Section title="Therapeutic programs">
        <Rail>
          {(catPrograms.length ? catPrograms : programs).map((p) => (
            <ProgramCard key={p.id} program={p} />
          ))}
        </Rail>
      </Section>

      <Section title="Premium programs" hint="Included with your plan">
        <Rail>
          {programs.filter((p) => p.premium).map((p) => (
            <ProgramCard key={p.id} program={p} />
          ))}
        </Rail>
      </Section>

      <Section title="Arriving soon" hint="Loading new sequences">
        <CardsLoading count={4} />
      </Section>
    </AppShell>
  );
}
