import { Link } from "@tanstack/react-router";
import { EXPLORE_CARDS } from "@/lib/home-data";
import { ArrowRight, Sparkles, Compass } from "lucide-react";

export function ExploreCardsGrid() {
  return (
    <section id="explore" className="py-20 sm:py-28 bg-surface border-y border-border relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-cat-light border border-cat/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cat shadow-sm mb-3">
            <Compass className="h-3.5 w-3.5 text-cat" />
            <span>Public Pathways</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif tracking-tight text-foreground">
            Explore Krishna Sanjeevani
          </h2>

          <p className="mt-4 text-base sm:text-lg text-muted-foreground font-sans">
            Delve deeper into our foundational lineages, therapeutic science, historical launch,
            and the vision guiding our sound ecosystem.
          </p>
        </div>

        {/* 3 Large, Visually Stunning Pathway Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {EXPLORE_CARDS.map((card, idx) => (
            <div
              key={idx}
              className="group relative rounded-3xl overflow-hidden border border-border bg-background shadow-soft hover:shadow-lift hover:border-cat/40 transition-all duration-500 flex flex-col justify-between"
            >
              {/* High-Resolution Header Image with Zoom and Gradient Overlay */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                <img
                  src={card.image}
                  alt={card.title}
                  className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700 filter brightness-[0.98] contrast-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />

                <div className="absolute top-3.5 left-3.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-surface/95 backdrop-blur-md border border-cat/25 px-3 py-1 text-[11px] font-bold text-cat shadow-sm">
                    <Sparkles className="h-3 w-3 text-cat" />
                    {card.tag}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] uppercase font-bold tracking-wider text-cat font-sans block">
                    {card.subtitle}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold font-serif text-foreground mt-1">
                    {card.title}
                  </h3>
                  <p className="mt-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
                    {card.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
                  <Link
                    to={card.link as any}
                    className="press inline-flex items-center gap-2 rounded-btn bg-cat text-cat-foreground px-5 py-2.5 text-xs font-semibold shadow-sm hover:brightness-105 transition-all"
                  >
                    <span>{card.ctaText || "Explore Pathway"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
