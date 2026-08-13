import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { CardGrid, Chip, Section } from "@/components/layout-bits";
import { ProgramCard, TrackCard } from "@/components/cards";
import { EmptyState } from "@/components/States";
import { categories, programs, purposes, tracks } from "@/lib/content";
import { useApp } from "@/lib/app-state";
import type { CategoryId } from "@/lib/content";

export const Route = createFileRoute("/browse")({
  head: () => ({
    meta: [
      { title: "Browse the library — Krishna Sanjeevani" },
      {
        name: "description",
        content:
          "Browse every therapeutic surāvali by theme and purpose — stress relief, focus, sleep, anxiety, healing and pregnancy care.",
      },
      { property: "og:title", content: "Browse the library — Krishna Sanjeevani" },
      {
        property: "og:description",
        content: "Every raga sequence, filterable by theme and therapeutic purpose.",
      },
    ],
  }),
  component: Browse,
});

function Browse() {
  const { category, setCategory } = useApp();
  const [purpose, setPurpose] = useState<string | null>(null);

  const list = useMemo(
    () =>
      tracks.filter(
        (t) => t.category === category && (purpose ? t.purpose === purpose : true),
      ),
    [category, purpose],
  );

  return (
    <AppShell title="Browse" subtitle="The full Krishna Sanjeevani library">
      <div className="grid gap-4 sm:grid-cols-3">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id as CategoryId)}
            aria-pressed={category === c.id}
            className={`press group relative overflow-hidden rounded-card text-left shadow-soft transition-all duration-[250ms] hover:-translate-y-1 hover:shadow-lift ${
              category === c.id ? "ring-2 ring-cat" : ""
            }`}
          >
            <img
              src={c.art}
              alt=""
              className="h-36 w-full object-cover transition-transform duration-[250ms] group-hover:scale-[1.04] md:h-44"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
            <span className="absolute inset-x-0 bottom-0 p-5">
              <span className="block font-display text-[17px] font-semibold text-background">
                {c.name}
              </span>
              <span className="mt-1 block text-[12px] text-background/80">
                {c.description}
              </span>
            </span>
          </button>
        ))}
      </div>

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

      <Section title="Sessions" hint={`${list.length} results`}>
        {list.length === 0 ? (
          <EmptyState
            title="Nothing sequenced yet"
            body="We haven't sequenced a surāvali for this purpose in this theme. Try another filter."
          />
        ) : (
          <CardGrid>
            {list.map((t) => (
              <TrackCard key={t.id} track={t} />
            ))}
          </CardGrid>
        )}
      </Section>

      <Section title="Programs in this theme">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {(programs.filter((p) => p.category === category).length
            ? programs.filter((p) => p.category === category)
            : programs
          ).map((p) => (
            <ProgramCard key={p.id} program={p} wide />
          ))}
        </div>
      </Section>
    </AppShell>
  );
}
