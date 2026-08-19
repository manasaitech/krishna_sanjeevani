import { Sun, Sparkles, Check, HeartPulse, Waves } from "lucide-react";
import meditationImg from "@/assets/70fad00b-8e20-42f8-a986-11f0bd7335f5.jpeg";

export function CultivatingSattva() {
  const sattvaPillars = [
    {
      title: "Subdues Kinetic Agitation (Rajas)",
      desc: "Calibrated microtones eliminate chaotic nervous restlessness.",
    },
    {
      title: "Eradicates Inertial Dullness (Tamas)",
      desc: "Rhythmic swara progressions awaken clear mental alertness without stress.",
    },
    {
      title: "Illuminates Pristine Awareness (Sattva)",
      desc: "Acts as internal medicine restoring the psyche to its essential calm.",
    },
  ];

  return (
    <section className="py-20 sm:py-24 bg-surface border-y border-border/80 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-background border border-border p-7 sm:p-12 shadow-lift relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 border border-amber-500/30 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800 dark:text-amber-300">
                <Sun className="h-3.5 w-3.5 text-amber-600" />
                <span>The Core Therapeutic Objective</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight text-foreground leading-tight">
                Cultivating Sattva as Internal Medicine
              </h2>

              <p className="text-base text-muted-foreground leading-relaxed font-sans">
                In classical Ayurvedic psychology, cultivating <strong className="text-foreground">Sattva (light, clarity, harmony)</strong>{" "}
                acts as a natural psycho-spiritual balm. Rather than suppressing symptoms with harsh force,
                purified sound gently dissolves the agitation of Rajas and the inertia of Tamas, restoring
                the mind to its pristine, unburdened state.
              </p>

              {/* Visual Pillar Tiles */}
              <div className="space-y-3 pt-2">
                {sattvaPillars.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-surface border border-border flex items-start gap-3 shadow-soft"
                  >
                    <div className="h-7 w-7 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                      <Check className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold font-serif text-foreground">
                        {p.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5 font-sans">
                        {p.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Divine Healing Meditation Visual Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/30 shadow-lift bg-surface group">
                <div className="relative aspect-[4/3] sm:aspect-[1/1] w-full overflow-hidden bg-background">
                  <img
                    src={meditationImg}
                    alt="Divine Sound Healing and Sattvic Meditation"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-[0.98] contrast-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-black mb-1.5 shadow-sm">
                      <HeartPulse className="h-3 w-3" />
                      <span>Sattva Awakening</span>
                    </div>
                    <p className="text-sm sm:text-base font-serif font-bold text-white leading-snug">
                      Nāda Yoga & Emotional Purification
                    </p>
                    <blockquote className="text-xs text-stone-200 mt-1 font-serif italic border-l-2 border-amber-400 pl-2">
                      “Aesthetic sound illuminates Sattva, leading to internal restoration.”
                    </blockquote>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
