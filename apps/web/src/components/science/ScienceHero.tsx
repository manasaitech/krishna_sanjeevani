import { Sparkles, BookOpen, Brain, Activity } from "lucide-react";
import { manuscriptImg } from "@/lib/home-data";

export function ScienceHero() {
  return (
    <section className="relative pt-24 pb-16 bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. Hero Image at the Top */}
        <div className="relative rounded-3xl overflow-hidden border-2 border-cat/30 shadow-lift bg-surface max-w-5xl mx-auto mb-10 group">
          <div className="relative aspect-[21/9] sm:aspect-[16/7] w-full overflow-hidden bg-background">
            <img
              src={manuscriptImg}
              alt="Sacred Sanskrit Palm Leaf Manuscript & Veena"
              className="h-full w-full object-cover object-center group-hover:scale-[1.01] transition-transform duration-700 filter brightness-[0.98] contrast-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-white">
              <span className="text-xs font-semibold text-amber-200">
                Nāṭyaśāstra & Gāndharva Veda Acoustic Principles
              </span>
              <span className="text-[11px] uppercase tracking-wider text-stone-300 font-sans">
                Vedic Sound Science
              </span>
            </div>
          </div>
        </div>

        {/* 2. Hero Content Below the Image */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-cat-light border border-cat/25 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cat shadow-sm animate-rise">
            <BookOpen className="h-3.5 w-3.5 text-cat" />
            <span>Vedic Therapeutic Music · Research Foundation</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold font-serif tracking-tight text-foreground leading-[1.15]">
            Science Behind Vedic Therapeutic Music
          </h1>

          <p className="text-lg sm:text-2xl font-serif italic text-cat font-semibold">
            Music → Rasa → Guṇas → Doṣas → Vibrational Equilibrium
          </p>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto font-sans pt-1">
            Classical Vedic and Ayurvedic knowledge approaches music not merely as sensory
            diversion, but as an intentional psycho-acoustic science. By calibrating the modal
            architecture of ancient ragas to awaken{" "}
            <strong className="text-foreground font-medium">Sattva (clarity and harmony)</strong>,
            sacred sound acts as a subtle internal medicine that realigns consciousness and restores
            somatic balance.
          </p>

          {/* Quick Nav Anchors */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#gunas"
              className="press inline-flex items-center gap-1.5 rounded-full bg-surface border border-border px-4 py-2 text-xs font-semibold text-foreground hover:border-cat hover:text-cat transition-all shadow-soft"
            >
              <Sparkles className="h-3.5 w-3.5 text-cat" />
              <span>The Three Guṇas</span>
            </a>

            <a
              href="#rasa"
              className="press inline-flex items-center gap-1.5 rounded-full bg-surface border border-border px-4 py-2 text-xs font-semibold text-foreground hover:border-cat hover:text-cat transition-all shadow-soft"
            >
              <Brain className="h-3.5 w-3.5 text-cat" />
              <span>Language of Rasa</span>
            </a>

            <a
              href="#doshas"
              className="press inline-flex items-center gap-1.5 rounded-full bg-surface border border-border px-4 py-2 text-xs font-semibold text-foreground hover:border-cat hover:text-cat transition-all shadow-soft"
            >
              <Activity className="h-3.5 w-3.5 text-cat" />
              <span>Doṣa Balancing</span>
            </a>

            <a
              href="#gandharva"
              className="press inline-flex items-center gap-1.5 rounded-full bg-cat-light border border-cat/30 px-4 py-2 text-xs font-semibold text-cat hover:bg-cat hover:text-cat-foreground transition-all shadow-soft"
            >
              <span>Mūrcchanā & Vādin Model ↓</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
