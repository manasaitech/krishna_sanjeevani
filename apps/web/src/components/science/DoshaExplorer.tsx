import { useState } from "react";
import { DOSHAS_DATA, TRIDOSHA_BALANCING } from "@/lib/science-data";
import { Wind, Flame, Mountain, Sparkles, Check, AlertCircle, ArrowRight } from "lucide-react";

export function DoshaExplorer() {
  const [activeDoshaId, setActiveDoshaId] = useState("vata");

  const activeDosha = DOSHAS_DATA.find((d) => d.id === activeDoshaId) || DOSHAS_DATA[0];

  const icons = {
    vata: Wind,
    pitta: Flame,
    kapha: Mountain,
  };

  return (
    <section id="doshas" className="py-20 sm:py-28 bg-background relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-cat-light border border-cat/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cat shadow-sm mb-3">
            <Sparkles className="h-3.5 w-3.5 text-cat" />
            <span>Ayurvedic Somatic Humors</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif tracking-tight text-foreground">
            From Rasa to Doṣa
          </h2>

          <p className="mt-4 text-base sm:text-lg text-muted-foreground font-sans">
            Disease manifests from disturbances across mental and bodily domains. By mapping
            the Guṇa profiles of musical Rasas against somatic humors (Vāta, Pitta, Kapha),
            classical Ayurveda constructed a rigorous logic of musical selection.
          </p>
        </div>

        {/* 3 Doṣa Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {DOSHAS_DATA.map((dosha) => {
            const isSelected = dosha.id === activeDoshaId;
            const IconComponent = icons[dosha.id as keyof typeof icons] || Wind;

            return (
              <button
                key={dosha.id}
                onClick={() => setActiveDoshaId(dosha.id)}
                className={`p-6 rounded-2xl border text-left transition-all duration-300 flex items-center justify-between group ${
                  isSelected
                    ? "bg-surface border-cat shadow-lift scale-[1.02]"
                    : "bg-surface/50 border-border hover:border-border hover:bg-surface shadow-soft"
                }`}
                role="tab"
                aria-selected={isSelected}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 transition-colors ${
                      isSelected ? "bg-cat text-cat-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <IconComponent className="h-6 w-6" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold font-serif text-foreground">
                      {dosha.name} <span className="text-base text-cat">({dosha.sanskrit})</span>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 font-sans">
                      {dosha.elements}
                    </p>
                  </div>
                </div>

                <ArrowRight
                  className={`h-4 w-4 transition-transform ${
                    isSelected ? "text-cat translate-x-1" : "text-muted-foreground/30 group-hover:translate-x-0.5"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Selected Doṣa Detailed Analysis */}
        <div className="rounded-card bg-surface border border-border p-7 sm:p-10 shadow-lift mb-10 transition-all duration-500 animate-soft-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-border/70 gap-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-cat font-sans">
                Somatic Profile
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold font-serif text-foreground mt-1">
                {activeDosha.name} Doṣa Dynamics
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-sans">
                Inherent Qualities: <strong>{activeDosha.inherentGunas}</strong>
              </p>
            </div>

            <div className="text-xs bg-muted/80 px-3.5 py-1.5 rounded-full text-foreground/80 font-medium">
              {activeDosha.balancingPrinciple}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-sans mb-1">
                  Signs of Aggravation:
                </h4>
                <p className="text-sm text-foreground/90 leading-relaxed font-sans">
                  {activeDosha.aggravationSigns}
                </p>
              </div>

              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cat font-sans mb-1.5">
                  Classical Therapeutic Logic:
                </h4>
                <p className="text-sm text-foreground/90 leading-relaxed font-sans">
                  {activeDosha.therapeuticLogic}
                </p>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl bg-background border border-border/80 p-6 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-cat font-sans mb-3">
                  Therapeutic Rasa Prescription:
                </h4>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-foreground font-sans">
                        Recommended:
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {activeDosha.recommendedRasas.join(", ")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-foreground font-sans">
                        Contraindicated / Less Suitable:
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {activeDosha.contraindicatedRasas.join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50 text-[11px] text-muted-foreground font-serif italic">
                * According to classical Ayurvedic Sāmānya-Viśeṣa principles.
              </div>
            </div>
          </div>
        </div>

        {/* Tridoṣa Imbalance Card */}
        <div className="rounded-2xl bg-surface border-2 border-cat/30 p-6 sm:p-8 text-foreground shadow-lift">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-cat-light px-3 py-0.5 text-xs font-semibold text-cat">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Multi-Systemic Sannipāta</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold font-serif text-foreground">
                {TRIDOSHA_BALANCING.title}
              </h3>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
                {TRIDOSHA_BALANCING.rationale}
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-2">
              {TRIDOSHA_BALANCING.recommended.map((item, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 rounded-xl bg-cat-light border border-cat/30 text-xs sm:text-sm font-bold text-cat text-center"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
