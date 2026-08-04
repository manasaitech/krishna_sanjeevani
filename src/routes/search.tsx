import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Clock, Search as SearchIcon, TrendingUp, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Chip, Rail, Section } from "@/components/layout-bits";
import { ProgramCard, TrackRow } from "@/components/cards";
import { EmptyState, ListLoading } from "@/components/States";
import {
  categories,
  programs,
  purposes,
  recentSearches,
  tracks,
  trendingSearches,
} from "@/lib/content";
import { useApp } from "@/lib/app-state";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search — Krishna Sanjeevani" },
      {
        name: "description",
        content:
          "Search Krishna Sanjeevani ragas, surāvalis, purposes and therapeutic programs.",
      },
      { property: "og:title", content: "Search — Krishna Sanjeevani" },
      {
        property: "og:description",
        content: "Find a raga by name, purpose, or pregnancy month.",
      },
    ],
  }),
  component: SearchScreen,
});

function SearchScreen() {
  const { setCategory } = useApp();
  const [q, setQ] = useState("");
  const [typing, setTyping] = useState(false);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return null;
    return {
      tracks: tracks.filter((t) =>
        [t.title, t.raga, t.purpose, t.subtitle].join(" ").toLowerCase().includes(s),
      ),
      programs: programs.filter((p) =>
        [p.title, p.subtitle].join(" ").toLowerCase().includes(s),
      ),
    };
  }, [q]);

  const onChange = (value: string) => {
    setQ(value);
    setTyping(true);
    window.setTimeout(() => setTyping(false), 320);
  };

  return (
    <AppShell bare>
      <h1 className="animate-rise mt-2 text-[24px] leading-tight font-semibold">Search</h1>

      <div className="animate-rise mt-5 flex items-center gap-3 rounded-field border border-border bg-surface px-4 shadow-soft focus-within:ring-2 focus-within:ring-cat">
        <SearchIcon className="h-[18px] w-[18px] shrink-0 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Raga, purpose, or program"
          aria-label="Search ragas, purposes and programs"
          className="min-h-13 min-w-0 flex-1 bg-transparent text-[15px] placeholder:text-muted-foreground focus:outline-none"
        />
        {q && (
          <button
            onClick={() => setQ("")}
            aria-label="Clear search"
            className="press grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {!results ? (
        <>
          <Section title="Recent searches">
            <ul className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface shadow-soft">
              {recentSearches.map((r) => (
                <li key={r}>
                  <button
                    onClick={() => onChange(r)}
                    className="press flex min-h-13 w-full items-center gap-3 px-4 text-left text-sm"
                  >
                    <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{r}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Trending">
            <div className="flex flex-wrap gap-2.5">
              {trendingSearches.map((t) => (
                <Chip key={t} onClick={() => onChange(t)}>
                  <span className="inline-flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5" />
                    {t}
                  </span>
                </Chip>
              ))}
            </div>
          </Section>

          <Section title="Browse paths">
            <div className="grid gap-3 sm:grid-cols-3">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className="press overflow-hidden rounded-card border border-border bg-surface text-left shadow-soft hover:shadow-lift"
                >
                  <img
                    src={c.art}
                    alt=""
                    width={1024}
                    height={1024}
                    loading="lazy"
                    className="h-24 w-full object-cover"
                  />
                  <span className="block p-4 text-sm font-semibold">{c.name}</span>
                </button>
              ))}
            </div>
          </Section>

          <Section title="Purposes">
            <div className="flex flex-wrap gap-2.5">
              {purposes.map((p) => (
                <Chip key={p} onClick={() => onChange(p)}>
                  {p}
                </Chip>
              ))}
            </div>
          </Section>

          <Section title="Suggested tracks">
            <div className="space-y-3">
              {tracks.slice(0, 3).map((t) => (
                <TrackRow key={t.id} track={t} />
              ))}
            </div>
          </Section>

          <Section title="Suggested programs">
            <Rail>
              {programs.map((p) => (
                <ProgramCard key={p.id} program={p} />
              ))}
            </Rail>
          </Section>
        </>
      ) : typing ? (
        <div className="mt-8">
          <ListLoading count={3} />
        </div>
      ) : results.tracks.length === 0 && results.programs.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={<SearchIcon className="h-6 w-6" />}
            title={`No results for "${q}"`}
            body="Try a raga name like Neelambari, a purpose like Sleep, or a pregnancy month."
          />
        </div>
      ) : (
        <>
          {results.tracks.length > 0 && (
            <Section title="Tracks" hint={`${results.tracks.length} found`}>
              <div className="space-y-3">
                {results.tracks.map((t) => (
                  <TrackRow key={t.id} track={t} />
                ))}
              </div>
            </Section>
          )}
          {results.programs.length > 0 && (
            <Section title="Programs">
              <Rail>
                {results.programs.map((p) => (
                  <ProgramCard key={p.id} program={p} />
                ))}
              </Rail>
            </Section>
          )}
        </>
      )}
    </AppShell>
  );
}
