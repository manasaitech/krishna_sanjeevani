import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Section } from "@/components/layout-bits";
import { ProgramCard } from "@/components/cards";
import { programs } from "@/lib/content";

export const Route = createFileRoute("/programs")({
  head: () => ({
    meta: [
      { title: "Therapeutic programs — Krishna Sanjeevani" },
      {
        name: "description",
        content:
          "Multi-week therapeutic programs: stress relief arcs, deep sleep restoration, devotional healing and nine months of pregnancy nurture.",
      },
      { property: "og:title", content: "Therapeutic programs — Krishna Sanjeevani" },
      {
        property: "og:description",
        content: "Guided multi-week raga programs with sessions, benefits and progress.",
      },
    ],
  }),
  component: Programs,
});

function Programs() {
  const featured = programs[0]!;

  return (
    <AppShell title="Programs" subtitle="Guided multi-week therapeutic arcs">
      <section className="animate-rise relative overflow-hidden rounded-card shadow-lift">
        <img
          src={featured.art}
          alt={`Artwork for ${featured.title}`}
          className="h-[240px] w-full object-cover md:h-[300px]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/50 to-transparent" />
        <div className="absolute inset-0 flex max-w-2xl flex-col justify-end p-6 md:p-10">
          <span className="w-fit rounded-full bg-background/95 px-3 py-1 text-[10px] font-semibold tracking-wider text-cat uppercase">
            Featured program
          </span>
          <h2 className="mt-3 font-display text-[26px] leading-tight font-semibold text-background md:text-[36px]">
            {featured.title}
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-background/85 md:text-[15px]">
            {featured.description}
          </p>
        </div>
      </section>

      <Section title="All programs" hint={`${programs.length} programs`}>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {programs.map((p) => (
            <ProgramCard key={p.id} program={p} wide />
          ))}
        </div>
      </Section>

      <Section title="Corporate wellness" hint="For teams and clinics">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {programs
            .filter((p) => p.category === "secular")
            .map((p) => (
              <ProgramCard key={p.id} program={p} wide />
            ))}
        </div>
      </Section>
    </AppShell>
  );
}
