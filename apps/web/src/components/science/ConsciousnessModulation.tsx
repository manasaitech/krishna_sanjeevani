import { Music2, Heart, Sparkles, Eye, Compass, ArrowRight, CheckCircle2 } from "lucide-react";

export function ConsciousnessModulation() {
  const steps = [
    {
      num: "01",
      title: "Audible Nāda",
      sub: "Microtonal Frequencies",
      desc: "Microtonal swaras and prahara intervals enter acoustic neural pathways.",
      color: "#732026",
      icon: Music2,
    },
    {
      num: "02",
      title: "Bhāva Stimulation",
      sub: "Emotional Resonance",
      desc: "Evokes foundational archetypal sentiments (love, devotion, peace).",
      color: "#C84B31",
      icon: Heart,
    },
    {
      num: "03",
      title: "Rasa Illumination",
      sub: "Aesthetic Relish",
      desc: "Raw emotion is distilled into an elevated, relishable spiritual state.",
      color: "#D4AF37",
      icon: Sparkles,
    },
    {
      num: "04",
      title: "Witness Awareness",
      sub: "Sāttvic Stillness",
      desc: "The observer rests in serene contemplation, detached from panic.",
      color: "#2E7D32",
      icon: Eye,
    },
    {
      num: "05",
      title: "Sanjeevani Realignment",
      sub: "Cellular Equilibrium",
      desc: "Subdues Rajas & Tamas, restoring systemic bio-energetic vitality.",
      color: "#1E3A8A",
      icon: Compass,
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-surface border-y border-border/80 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-cat-light border border-cat/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cat shadow-sm mb-3">
            <Sparkles className="h-3.5 w-3.5 text-cat" />
            <span>Process Continuum</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif tracking-tight text-foreground">
            Music as Modulation of Consciousness
          </h2>

          <p className="mt-4 text-base sm:text-lg text-muted-foreground font-sans">
            How aesthetic musical experience transforms a passive auditory response into an active,
            psycho-spiritual realignment of the subtle body.
          </p>
        </div>

        {/* Visual Interactive Process Step Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="rounded-3xl bg-background border border-border p-5 shadow-soft hover:shadow-lift hover:border-cat/40 transition-all flex flex-col justify-between relative group"
              >
                {/* Top Number & Icon */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-serif font-bold text-cat">PHASE {item.num}</span>
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: item.color }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <span className="text-[10px] uppercase font-bold tracking-wider text-cat font-sans block">
                    {item.sub}
                  </span>

                  <h3 className="text-base font-bold font-serif text-foreground mt-0.5">
                    {item.title}
                  </h3>

                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed font-sans">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-1 text-[11px] font-semibold text-cat">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Integrated Step</span>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-6 w-6 rounded-full bg-surface border border-border items-center justify-center text-muted-foreground shadow-sm">
                    <ArrowRight className="h-3 w-3" />
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
