import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CardGrid, Chip, Panel, Section } from "@/components/layout-bits";
import { ProgramCard, TrackTile } from "@/components/cards";
import { EmptyState } from "@/components/States";
import {
  categories,
  programs,
  purposes,
  recentSearches,
  tracks,
  trendingSearches,
} from "@/lib/content";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search — Krishna Sanjeevani" },
      {
        name: "description",
        content:
          "Search the therapeutic library by raga, purpose or program — trending searches, purpose filters and instant results.",
      },
      { property: "og:title", content: "Search — Krishna Sanjeevani" },
      {
        property: "og:description",
        content: "Find ragas, purposes and programs across the therapeutic library.",
      },
    ],
  }),
  component: Search,
});

function Search() {
  const [q, setQ] = useState("");
  const [purpose, setPurpose] = useState<string | null>(null);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return tracks.filter((t) => {
      const matchesPurpose = purpose ? t.purpose === purpose : true;
      if (!needle) return matchesPurpose && (purpose !== null || false);
      return (
        matchesPurpose &&
        [t.title, t.raga, t.purpose, t.subtitle].some((f) =>
          f.toLowerCase().includes(needle),
        )
      );
    });
  }, [q, purpose]);

  const programResults = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return programs.filter((p) =>
      [p.title, p.subtitle, p.description].some((f) => f.toLowerCase().includes(needle)),
    );
  }, [q]);

  const searching = q.trim().length > 0 || purpose !== null;

  return (
    <AppShell title="Search" subtitle="Ragas, purposes and programs">
      <div className="animate-rise relative mx-auto max-w-3xl">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-5 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search ragas, purposes, programs"
          aria-label="Search the library"
          className="min-h-14 w-full rounded-field border border-border bg-surface pr-14 pl-14 text-[15px] shadow-soft outline-none placeholder:text-muted-foreground focus-visible:border-cat focus-visible:ring-2 focus-visible:ring-cat/30 md:min-h-16 md:text-[17px]"
        />
        {q && (
          <button
            onClick={() => setQ("")}
            aria-label="Clear search"
            className="press absolute top-1/2 right-4 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="no-scrollbar -mx-5 mt-6 flex gap-2.5 overflow-x-auto px-5 md:-mx-8 md:justify-center md:px-8">
        <Chip active={purpose === null} onClick={() => setPurpose(null)}>
          All purposes
        </Chip>
        {purposes.map((p) => (
          <Chip key={p} active={purpose === p} onClick={() => setPurpose(p)}>
            {p}
          </Chip>
        ))}
      </div>

      {!searching ? (
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <Panel title="Trending searches">
            <ul className="space-y-1">
              {trendingSearches.map((s, i) => (
                <li key={s}>
                  <button
                    onClick={() => setQ(s)}
                    className="press flex w-full items-center gap-3 rounded-btn px-2 py-2.5 text-left text-[14px] hover:bg-secondary"
                  >
                    <span className="w-4 text-[13px] font-semibold text-cat">{i + 1}</span>
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Recent searches">
            <div className="flex flex-wrap gap-2.5">
              {recentSearches.map((s) => (
                <Chip key={s} onClick={() => setQ(s)}>
                  {s}
                </Chip>
              ))}
            </div>
          </Panel>

          <Panel title="Browse categories">
            <div className="space-y-3">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 rounded-2xl border border-border p-3"
                >
                  <img src={c.art} alt="" className="h-12 w-12 rounded-xl object-cover" />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold">{c.name}</p>
                    <p className="truncate text-[12px] text-muted-foreground">
                      {c.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      ) : (
        <>
          <Section title="Sessions" hint={`${results.length} results`}>
            {results.length === 0 ? (
              <EmptyState
                title="No sessions match"
                body="Try a raga name like Neelambari, or pick a purpose chip above."
              />
            ) : (
              <CardGrid>
                {results.map((t) => (
                  <TrackTile key={t.id} track={t} />
                ))}
              </CardGrid>
            )}
          </Section>

          {programResults.length > 0 && (
            <Section title="Programs" hint={`${programResults.length} results`}>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {programResults.map((p) => (
                  <ProgramCard key={p.id} program={p} wide />
                ))}
              </div>
            </Section>
          )}
        </>
      )}
    </AppShell>
  );
}
