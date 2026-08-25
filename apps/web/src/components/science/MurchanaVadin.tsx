import { Music2, Waves, Sparkles, BookOpen, Layers } from "lucide-react";

export function MurchanaVadin() {
  const swaras = [
    { note: "Ṣaḍja (Sa)", meaning: "The fundamental base note", guna: "Sāttvic Foundation" },
    { note: "Ṛṣabha (Re)", meaning: "Second modal degree", guna: "Kinetic / Expressive" },
    { note: "Gāndhāra (Ga)", meaning: "Third modal degree", guna: "Emotional / Pathos" },
    { note: "Madhyama (Ma)", meaning: "Fourth central pivot", guna: "Equilibrium & Stillness" },
    { note: "Pañcama (Pa)", meaning: "Fifth vital harmonic", guna: "Dynamic Vitality" },
    { note: "Dhaivata (Dha)", meaning: "Sixth subtle degree", guna: "Receptive & Contemplative" },
    { note: "Niṣāda (Ni)", meaning: "Seventh leading tone", guna: "Transcendental Release" },
  ];

  return (
    <section id="gandharva" className="py-20 sm:py-28 bg-background relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-cat-light border border-cat/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cat shadow-sm mb-3">
            <Music2 className="h-3.5 w-3.5 text-cat" />
            <span>Classical Modal Architecture</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif tracking-tight text-foreground">
            The Musical Architecture of the Gāndharva Tradition
          </h2>

          <p className="mt-4 text-base sm:text-lg text-muted-foreground font-sans">
            Ancient Indian music therapy was based on structured modal systems (
            <strong className="text-foreground">mūrcchanā</strong>) rather than isolated single-note
            renditions. Each complete scale was defined by the predominance of a particular note (
            <strong className="text-foreground">vādin</strong>).
          </p>
        </div>

        {/* Conceptual Blueprint Box */}
        <div className="rounded-card bg-surface border border-border p-8 sm:p-10 shadow-lift mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-cat font-sans">
                The Modal Principle
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">
                Mūrcchanā & Vādin Predominance
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-sans">
                Because each predominant note (Vādin) and its microtonal intervals embody a
                characteristic composition of Sattva, Rajas, and Tamas, the choice of Mūrcchanā can
                be guided by the Ayurvedic principle of opposites to counteract an aggravated bodily
                humor.
              </p>

              <div className="p-4 rounded-xl bg-background border border-border/80 text-xs font-serif italic text-cat">
                “Mūrcchanā → Predominant Note (Vādin) → Rasa Induction → Guṇa Realignment”
              </div>
            </div>

            {/* Visual Swara Scale Representation */}
            <div className="lg:col-span-6 space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2 font-sans">
                The Seven Fundamental Swaras (Saptak):
              </span>
              {swaras.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 px-4 rounded-xl bg-background border border-border/60 text-xs font-sans hover:border-cat/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold font-serif text-cat">{idx + 1}.</span>
                    <span className="font-semibold text-foreground">{s.note}</span>
                  </div>
                  <span className="text-muted-foreground text-[11px]">{s.guna}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
