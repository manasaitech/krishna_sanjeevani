import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Baby, Briefcase, Flower } from "lucide-react";
import { StatusBar } from "@/components/StatusBar";
import { categories, type CategoryId } from "@/lib/content";
import { useApp } from "@/lib/app-state";

export const Route = createFileRoute("/category")({
  head: () => ({
    meta: [
      { title: "Choose your path — Krishna Sanjeevani" },
      {
        name: "description",
        content:
          "Devotional, secular and corporate, or pregnancy wellness — choose the path that shapes your recommendations.",
      },
      { property: "og:title", content: "Choose your path — Krishna Sanjeevani" },
      {
        property: "og:description",
        content: "One app, three gentle paths: devotional, secular, and pregnancy wellness.",
      },
    ],
  }),
  component: CategoryScreen,
});

const icons: Record<CategoryId, typeof Flower> = {
  devotional: Flower,
  secular: Briefcase,
  pregnancy: Baby,
};

function CategoryScreen() {
  const { category, setCategory } = useApp();
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-background">
      <StatusBar />
      <main className="mx-auto w-full max-w-2xl px-6 pb-16">
        <header className="animate-rise mt-8">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-cat uppercase">
            Step 1 of 1
          </p>
          <h1 className="mt-3 text-[28px] leading-tight font-semibold">
            Which path fits you today?
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            Your choice quietly adapts the colours, recommendations, and programs. You can change it
            any time from your profile.
          </p>
        </header>

        <ul className="mt-8 space-y-4">
          {categories.map((c, i) => {
            const Icon = icons[c.id];
            const active = category === c.id;
            return (
              <li key={c.id}>
                <button
                  data-category={c.id}
                  onClick={() => setCategory(c.id)}
                  aria-pressed={active}
                  className={`press animate-rise group w-full overflow-hidden rounded-card border bg-surface p-5 text-left shadow-soft hover:shadow-lift focus-visible:ring-2 focus-visible:ring-cat focus-visible:outline-none ${
                    active ? "border-cat ring-1 ring-cat" : "border-border"
                  }`}
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-cat-light text-cat transition-transform duration-[250ms] group-hover:scale-105">
                      <Icon
                        className="h-6 w-6"
                        strokeWidth={1.7}
                        color={c.id === "devotional" ? "var(--cat-accent)" : undefined}
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-[17px] font-semibold">{c.name}</h2>
                      <p className="mt-1 text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
                        {c.tagline}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {c.description}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        <button
          onClick={() => navigate({ to: category === "pregnancy" ? "/journey" : "/home" })}
          className="press mt-10 flex min-h-13 w-full items-center justify-center gap-2 rounded-btn bg-primary px-6 text-[15px] font-semibold text-primary-foreground shadow-soft hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Continue with {categories.find((c) => c.id === category)?.name}
          <ArrowRight className="h-4 w-4" />
        </button>
      </main>
    </div>
  );
}
