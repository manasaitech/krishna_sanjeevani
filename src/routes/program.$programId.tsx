import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BookmarkCheck, Bookmark, CalendarDays, Check, ListMusic, Play } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TrackRow } from "@/components/cards";
import { useApp } from "@/lib/app-state";
import { programById, trackById, type Program } from "@/lib/content";

export const Route = createFileRoute("/program/$programId")({
  loader: ({ params }) => {
    const program = programById(params.programId);
    if (!program) throw notFound();
    return { program };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Program unavailable — Krishna Sanjeevani" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { program } = loaderData;
    return {
      meta: [
        { title: `${program.title} — Krishna Sanjeevani` },
        { name: "description", content: program.description.slice(0, 155) },
        { property: "og:title", content: `${program.title} — Krishna Sanjeevani` },
        { property: "og:description", content: program.description.slice(0, 155) },
      ],
    };
  },
  component: ProgramDetails,
});

function ProgramDetails() {
  const { program } = Route.useLoaderData() as { program: Program };
  const { savedPrograms, toggleSavedProgram, play } = useApp();
  const saved = savedPrograms.includes(program.id);
  const list = program.trackIds.map((id) => trackById(id)!).filter(Boolean);

  return (
    <AppShell>
      <div className="animate-rise relative -mx-5 -mt-4 overflow-hidden sm:mx-0 sm:rounded-card">
        <img
          src={program.art}
          alt={`Artwork for ${program.title}`}
          width={1024}
          height={1024}
          className="aspect-[16/11] w-full object-cover sm:aspect-[16/8]"
        />
        <div className="absolute inset-0 bg-foreground/45" />
        <Link
          to="/home"
          aria-label="Go back"
          className="press absolute top-4 left-5 grid h-11 w-11 place-items-center rounded-full bg-background/90 backdrop-blur-sm"
        >
          <span aria-hidden="true" className="text-lg leading-none">
            ‹
          </span>
        </Link>
        <div className="absolute inset-x-0 bottom-0 p-6">
          <span className="inline-flex rounded-full bg-background/95 px-3 py-1 text-[10px] font-semibold tracking-wider text-cat uppercase">
            {program.premium ? "Premium program" : "Therapeutic program"}
          </span>
          <h1 className="mt-3 text-[26px] leading-tight font-semibold text-background">
            {program.title}
          </h1>
          <p className="mt-1 text-[13px] text-background/85">{program.subtitle}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { label: "Sessions", value: program.sessions, icon: ListMusic },
          { label: "Days", value: program.days, icon: CalendarDays },
          { label: "Tracks", value: list.length, icon: Play },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-card border border-border bg-surface p-4 text-center shadow-soft"
          >
            <s.icon className="mx-auto h-4 w-4 text-cat" />
            <p className="mt-2 text-lg font-semibold tabular-nums">{s.value}</p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="text-[17px] font-semibold">About this program</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          {program.description}
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-[17px] font-semibold">Benefits</h2>
        <ul className="mt-4 space-y-3">
          {program.benefits.map((b) => (
            <li key={b} className="flex items-start gap-3 text-sm leading-relaxed">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cat-light text-cat">
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
              {b}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-card bg-cat-light p-5">
        <p className="text-[11px] font-semibold tracking-wider text-cat uppercase">
          Recommended usage
        </p>
        <p className="mt-2 text-sm leading-relaxed">{program.usage}</p>
      </section>

      <section className="mt-8">
        <h2 className="text-[17px] font-semibold">Track list</h2>
        <div className="mt-4 space-y-3">
          {list.map((t, i) => (
            <TrackRow key={`${t.id}-${i}`} track={t} index={i} />
          ))}
        </div>
      </section>

      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/player"
          onClick={() => list[0] && play(list[0])}
          className="press flex min-h-13 flex-1 items-center justify-center gap-2 rounded-btn bg-primary px-6 text-[15px] font-semibold text-primary-foreground shadow-soft hover:bg-primary-hover"
        >
          <Play className="h-4 w-4" fill="currentColor" /> Play program
        </Link>
        <button
          onClick={() => toggleSavedProgram(program.id)}
          aria-pressed={saved}
          className={`press flex min-h-13 items-center justify-center gap-2 rounded-btn border px-6 text-[15px] font-semibold ${
            saved ? "border-cat bg-cat-light text-cat" : "border-border bg-surface"
          }`}
        >
          {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          {saved ? "Saved" : "Save program"}
        </button>
      </div>
    </AppShell>
  );
}
