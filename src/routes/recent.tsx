import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Section } from "@/components/layout-bits";
import { TrackRow } from "@/components/cards";
import { tracks } from "@/lib/content";

export const Route = createFileRoute("/recent")({
  head: () => ({
    meta: [
      { title: "Recently played — Krishna Sanjeevani" },
      {
        name: "description",
        content:
          "Your listening history across therapeutic sessions, with purpose, duration and quick replay.",
      },
      { property: "og:title", content: "Recently played — Krishna Sanjeevani" },
      {
        property: "og:description",
        content: "A calm record of every session you have streamed recently.",
      },
    ],
  }),
  component: Recent,
});

const days = ["Today", "Yesterday", "Earlier this week"];

function Recent() {
  return (
    <AppShell title="Recently played" subtitle="Your listening history">
      {days.map((day, i) => (
        <Section
          key={day}
          title={day}
          hint={`${tracks.slice(i * 4, i * 4 + 4).length} sessions`}
          className={i === 0 ? "mt-0" : ""}
        >
          <div className="rounded-card border border-border bg-surface/60 p-2 md:p-3">
            {tracks.slice(i * 4, i * 4 + 4).map((t, idx) => (
              <TrackRow key={t.id} track={t} index={idx} />
            ))}
          </div>
        </Section>
      ))}
    </AppShell>
  );
}
