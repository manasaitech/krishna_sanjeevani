import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CardGrid, Section } from "@/components/layout-bits";
import { ProgramCard, TrackTile } from "@/components/cards";
import { EmptyState } from "@/components/States";
import { useApp } from "@/lib/app-state";
import { programs, tracks } from "@/lib/content";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Favorites — Krishna Sanjeevani" },
      {
        name: "description",
        content:
          "Your saved surāvalis and bookmarked therapeutic programs, ready to stream whenever you need them.",
      },
      { property: "og:title", content: "Favorites — Krishna Sanjeevani" },
      {
        property: "og:description",
        content: "Saved sessions and bookmarked programs in one calm library.",
      },
    ],
  }),
  component: Favorites,
});

function Favorites() {
  const { favorites, savedPrograms } = useApp();
  const favTracks = tracks.filter((t) => favorites.includes(t.id));
  const favPrograms = programs.filter((p) => savedPrograms.includes(p.id));

  return (
    <AppShell
      title="Favorites"
      subtitle={`${favTracks.length} sessions · ${favPrograms.length} programs`}
    >
      <Section title="Saved sessions" hint={`${favTracks.length} sessions`} className="mt-0">
        {favTracks.length === 0 ? (
          <EmptyState
            icon={<Heart className="h-6 w-6" />}
            title="No favourites yet"
            body="Tap the heart on any session and it will be waiting here for you."
            action={
              <Link
                to="/home"
                className="press inline-flex min-h-11 items-center rounded-btn bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
              >
                Browse the library
              </Link>
            }
          />
        ) : (
          <CardGrid>
            {favTracks.map((t) => (
              <TrackTile key={t.id} track={t} />
            ))}
          </CardGrid>
        )}
      </Section>

      <Section title="Bookmarked programs" hint={`${favPrograms.length} programs`}>
        {favPrograms.length === 0 ? (
          <EmptyState
            title="No bookmarked programs"
            body="Bookmark a therapeutic program to keep its schedule close at hand."
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {favPrograms.map((p) => (
              <ProgramCard key={p.id} program={p} wide />
            ))}
          </div>
        )}
      </Section>
    </AppShell>
  );
}
