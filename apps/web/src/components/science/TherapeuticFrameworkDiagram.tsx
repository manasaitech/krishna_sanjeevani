import { GANDHARVA_MURCHANA_MODEL } from "@/lib/science-data";
import { Layers, ArrowDown, Activity, Sun, Heart, Music2, Sparkles } from "lucide-react";

export function TherapeuticFrameworkDiagram() {
  const stepIcons = [Activity, Sun, Heart, Music2, Sparkles];
  const stepColors = ["#2563EB", "#D97706", "#E11D48", "#732026", "#059669"];

  return (
    <section className="py-20 sm:py-28 bg-surface border-y border-border text-foreground relative overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-cat-light border border-cat/25 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cat shadow-sm mb-3">
            <Layers className="h-3.5 w-3.5 text-cat" />
            <span>The Unified Architecture</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold font-serif tracking-tight text-foreground leading-tight">
            The Complete Vedic Therapeutic Music Framework
          </h2>

          <p className="mt-4 text-sm sm:text-base text-muted-foreground font-sans">
            How somatic assessment, qualitative profiling, aesthetic rasa, and modal scale
            selection unite into a coherent therapeutic intervention.
          </p>
        </div>

        {/* 5-Step Visual Flowchart Pipeline */}
        <div className="space-y-3 max-w-3xl mx-auto">
          {GANDHARVA_MURCHANA_MODEL.steps.map((item, index) => {
            const Icon = stepIcons[index % stepIcons.length];
            const color = stepColors[index % stepColors.length];

            return (
              <div key={index} className="flex flex-col items-center">
                <div className="w-full rounded-3xl bg-background border border-border p-5 sm:p-6 shadow-soft hover:shadow-lift hover:border-cat/40 transition-all flex items-start sm:items-center gap-4">
                  <div
                    className="h-12 w-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: color }}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-cat font-sans">
                        {item.step}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        Step 0{index + 1}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold font-serif text-foreground mt-0.5">
                      {item.label}
                    </h3>

                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed font-sans">
                      {item.detail}
                    </p>
                  </div>
                </div>

                {index < GANDHARVA_MURCHANA_MODEL.steps.length - 1 && (
                  <div className="my-1.5 flex items-center justify-center text-cat">
                    <ArrowDown className="h-4 w-4 animate-bounce" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
