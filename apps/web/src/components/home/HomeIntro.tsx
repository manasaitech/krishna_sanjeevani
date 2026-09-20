import { Sparkles, Music, ShieldCheck, HeartHandshake, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ragaMusiciansImg } from "@/lib/home-data";

export function HomeIntro() {
  const synthesisPoints = [
    {
      icon: Music,
      title: "Traditional Indian Ragas",
      subtitle: "Sur Sanjeevan Heritage",
      desc: "Microtonal swaras and praharas tuned to circadian rhythms.",
    },
    {
      icon: Sparkles,
      title: "Hare Krishna Mahamantra",
      subtitle: "Transcendental Potency",
      desc: "Vibrational sound purifying the subtle mirror of consciousness.",
    },
    {
      icon: ShieldCheck,
      title: "Ayurvedic Raga Chikitsa",
      subtitle: "Doṣa & Guṇa Equilibrium",
      desc: "Cultivating Sattva (clarity) to pacify Vata, Pitta, and Kapha.",
    },
    {
      icon: HeartHandshake,
      title: "Modern Supportive Care",
      subtitle: "Integrative Wellness",
      desc: "Providing calming soundscapes for retreat and palliative recovery.",
    },
  ];

  return (
    <section id="intro" className="relative py-20 sm:py-28 bg-background overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-cat-light border border-cat/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cat shadow-sm mb-3">
            <Sparkles className="h-3.5 w-3.5 text-cat" />
            <span>The Concept & Synthesis</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif tracking-tight text-foreground">
            Krishna Sanjeevani
          </h2>

          <p className="mt-2 text-base sm:text-xl font-serif italic text-cat font-semibold">
            The Divine Therapeutic Music
          </p>
        </div>

        {/* Visual Showcase: Left Image Feature + Right 4 Interactive Tiles */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Visual Artwork Showcase Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden border-2 border-cat/30 shadow-lift bg-surface group">
              <div className="relative aspect-[4/3] sm:aspect-[1/1] w-full overflow-hidden bg-background">
                <img
                  src={ragaMusiciansImg}
                  alt="Classical Indian Raga Musicians"
                  className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700 filter brightness-[0.98] contrast-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300 font-sans block mb-1">
                    Authentic Acoustic Lineage
                  </span>
                  <p className="text-base sm:text-lg font-serif font-bold leading-snug text-white">
                    Sur Sanjeevan & Devotional Kīrtana in Harmony
                  </p>
                  <p className="text-xs text-stone-200 mt-1.5 font-sans leading-relaxed">
                    Bridging diagnostic Indian raga theory with the transcendental healing vibration of sacred mantras.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: 4 Visual Pillars */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {synthesisPoints.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="group rounded-2xl bg-surface border border-border p-5 sm:p-6 shadow-soft hover:shadow-lift hover:border-cat/40 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-10 w-10 rounded-xl bg-cat-light border border-cat/25 flex items-center justify-center text-cat group-hover:scale-105 transition-transform">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-bold text-cat font-sans uppercase tracking-wider">
                        0{index + 1}
                      </span>
                    </div>

                    <span className="text-[10px] uppercase font-bold tracking-wider text-cat font-sans block">
                      {item.subtitle}
                    </span>

                    <h3 className="text-base sm:text-lg font-bold font-serif text-foreground mt-0.5">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-1.5 text-xs font-semibold text-cat group-hover:translate-x-1 transition-transform">
                    <span>Learn More</span>
                    <span>→</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
