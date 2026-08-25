import { ArrowUpRight, ArrowDownRight, Scale, Sparkles } from "lucide-react";

export function BalancePrinciple() {
  return (
    <section className="py-20 sm:py-24 bg-surface border-y border-border/80 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-cat-light border border-cat/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cat shadow-sm mb-3">
            <Scale className="h-3.5 w-3.5 text-cat" />
            <span>Sāmānya-Viśeṣa Siddhānta</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif tracking-tight text-foreground">
            Like Increases Like · Opposites Balance
          </h2>

          <p className="mt-4 text-base sm:text-lg text-muted-foreground font-sans">
            The foundational Ayurvedic thermodynamic axiom guiding therapeutic music selection.
          </p>
        </div>

        {/* Split Visual Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Like Increases Like */}
          <div className="rounded-card bg-background border border-border p-7 sm:p-8 shadow-soft hover:shadow-lift transition-all">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold font-serif text-foreground">
                  Like Increases Like (Sāmānya)
                </h3>
              </div>
              <span className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">
                Amplifies Excess
              </span>
            </div>

            <p className="mt-4 text-sm text-foreground/90 leading-relaxed font-sans">
              Exposing an already aggravated condition to musical forms sharing identical qualities
              intensifies the imbalance.
            </p>

            <div className="mt-4 p-4 rounded-xl bg-surface border border-border/60 text-xs text-muted-foreground space-y-2">
              <p>
                • <strong>Hyperactive Vāta</strong> + Fast, erratic, aggressive rhythms ={" "}
                <em>Heightened anxiety & nervous tension.</em>
              </p>
              <p>
                • <strong>Inflamed Pitta</strong> + Fiery, competitive, intense marches ={" "}
                <em>Elevated metabolic heat & irritability.</em>
              </p>
            </div>
          </div>

          {/* Card 2: Opposites Balance */}
          <div className="rounded-card bg-background border border-border p-7 sm:p-8 shadow-soft hover:shadow-lift transition-all">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <ArrowDownRight className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold font-serif text-foreground">
                  Opposites Balance (Viśeṣa)
                </h3>
              </div>
              <span className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                Restores Neutrality
              </span>
            </div>

            <p className="mt-4 text-sm text-foreground/90 leading-relaxed font-sans">
              Applying musical modes containing opposing qualitative profiles dissolves congestion
              and neutralizes hyper-reactivity.
            </p>

            <div className="mt-4 p-4 rounded-xl bg-surface border border-border/60 text-xs text-muted-foreground space-y-2">
              <p>
                • <strong>Restless Vāta & Hot Pitta</strong> + Grounding, cooling Karuṇa / Śānta ={" "}
                <em>Profound tranquility & peace.</em>
              </p>
              <p>
                • <strong>Sluggish, Heavy Kapha</strong> + Uplifting, dynamic Śṛṅgāra & Vīra ={" "}
                <em>Energized vitality & alertness.</em>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
