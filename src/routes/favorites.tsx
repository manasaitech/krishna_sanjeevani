import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ContinueCard, ProgramCard, TrackRow } from "@/components/cards";
import { Rail, Section } from "@/components/layout-bits";
import { EmptyState } from "@/components/States";
import { useApp } from "@/lib/app-state";
import { programs, tracks } from "@/lib/content";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Saved — Krishna Sanjeevani" },
      {
        name: "description",
        content:
          "Your saved surāvalis and therapeutic programs, plus sessions you have paused midway.",
      },
      { property: "og:title", content: "Saved — Krishna Sanjeevani" },
      {
        property: "og:description",
        content: "Favourite tracks, saved programs, and continue listening in one calm place.",
      },
    ],
  }),
  component: Favorites,
});

function Favorites() {
  const { favorites, savedPrograms, current } = useApp();
  const [tab, setTab] = useState<"tracks" | "programs">("tracks");

  const savedTracks = tracks.filter((t) => favorites.includes(t.id));
  const savedProgramList = programs.filter((p) => savedPrograms.includes(p.id));

  return (
    <AppShell bare>
      <h1 className="animate-rise mt-2 text-[24px] leading-tight font-semibold">Saved</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {savedTracks.length} tracks · {savedProgramList.length} programs
      </p>

      <div className="mt-6 grid grid-cols-2 gap-1 rounded-btn border border-border bg-surface p-1">
        {(["tracks", "programs"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className={`press min-h-11 rounded-[12px] text-sm font-semibold capitalize ${
              tab === t ? "bg-cat text-cat-foreground" : "text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "tracks" ? (
        <Section title="Saved tracks" className="mt-8">
          {savedTracks.length ? (
            <div className="space-y-3">
              {savedTracks.map((t) => (
                <TrackRow key={t.id} track={t} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Heart className="h-6 w-6" />}
              title="No saved tracks yet"
              body="Tap the heart on any surāvali and it will wait for you here."
              action={
                <Link
                  to="/home"
                  className="press inline-flex min-h-11 items-center rounded-btn bg-primary px-6 text-sm font-semibold text-primary-foreground"
                >
                  Explore sessions
                </Link>
              }
            />
          )}
        </Section>
      ) : (
        <Section title="Saved programs" className="mt-8">
          {savedProgramList.length ? (
            <Rail>
              {savedProgramList.map((p) => (
                <ProgramCard key={p.id} program={p} />
              ))}
            </Rail>
          ) : (
            <EmptyState
              title="No saved programs"
              body="Save a therapeutic program to follow it day by day."
            />
          )}
        </Section>
      )}

      <Section title="Continue listening">
        <Rail>
          {[current ?? tracks[0]!, tracks[4]!].map((t, i) => (
            <ContinueCard key={`${t.id}-${i}`} track={t} progress={[62, 35][i]!} />
          ))}
        </Rail>
      </Section>
    </AppShell>
  );
}
