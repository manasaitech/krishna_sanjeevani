import { FEATURE_PILLARS } from "@/lib/home-data";
import { Music2, Sparkles, HeartPulse, BookOpen, Compass, CheckCircle2 } from "lucide-react";

export function FeaturePillars() {
  const iconMap: Record<string, any> = {
    Music2,
    Sparkles,
    HeartPulse,
    BookOpen,
    Compass,
  };

  return (
    <section
      id="pillars"
      className="py-20 sm:py-28 bg-background border-b border-border/70 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-cat-light border border-cat/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cat shadow-sm mb-3">
            <HeartPulse className="h-3.5 w-3.5 text-cat" />
            <span>Conceptual Foundations</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif tracking-tight text-foreground">
            Why Krishna Sanjeevani?
          </h2>

          <p className="mt-4 text-base sm:text-lg text-muted-foreground font-sans">
            A synthesis of classical musicology, Vedic philosophy, and Ayurvedic wellness, crafted
            to restore mental equilibrium and elevate consciousness.
          </p>
        </div>

        {/* Visual Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURE_PILLARS.map((pillar, index) => {
            const IconComponent = iconMap[pillar.icon] || Sparkles;
            return (
              <div
                key={pillar.id}
                className="group rounded-3xl bg-surface border border-border/80 p-6 sm:p-7 shadow-soft hover:shadow-lift hover:border-cat/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-cat-light border border-cat/25 flex items-center justify-center text-cat group-hover:scale-105 transition-transform shadow-sm">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-serif font-bold text-cat/70">0{index + 1}</span>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-cat font-sans block">
                    {pillar.subtitle}
                  </span>

                  <h3 className="text-lg sm:text-xl font-bold font-serif text-foreground mt-1">
                    {pillar.title}
                  </h3>

                  <p className="mt-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/40 flex items-center gap-2 text-xs font-semibold text-cat">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Foundational Principle</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
