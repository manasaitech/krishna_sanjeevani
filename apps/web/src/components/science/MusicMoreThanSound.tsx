import { Sparkles, Ear, BrainCircuit, HeartHandshake, Waves, Zap } from "lucide-react";
import soundVibrationImg from "@/assets/caf22ea5-bc7e-46d8-a845-876858c2a009.webp";

export function MusicMoreThanSound() {
  const principles = [
    {
      icon: Ear,
      title: "Śruti-Madhura & Manorama",
      subtitle: "Pleasing to Ear & Delightful to Mind",
      desc: "Ayurvedic physicians mandated melodic softness to open neural receptivity and soothe defensive stress responses.",
    },
    {
      icon: BrainCircuit,
      title: "Cymatic Modulation of Consciousness",
      subtitle: "Vibrational Realignment",
      desc: "Sound functions as acoustic medicine, sculpting subtle mental waves and transforming passive listening into cellular resonance.",
    },
    {
      icon: HeartHandshake,
      title: "Emotional Purification (Rasa)",
      subtitle: "Balancing Rajas & Tamas",
      desc: "Rather than seeking transient agitation, therapeutic ragas systematically dissolve tension and anchor the psyche in pure Sattva.",
    },
  ];

  return (
    <section className="py-20 sm:py-24 bg-background relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-cat-light border border-cat/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cat shadow-sm mb-3">
            <Sparkles className="h-3.5 w-3.5 text-cat" />
            <span>Vedic Psycho-Acoustics & Cymatics</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif tracking-tight text-foreground">
            Music as More Than Sound
          </h2>

          <p className="mt-3 text-base sm:text-lg text-muted-foreground font-sans">
            In the Vedic worldview, sound (<span className="text-cat font-serif italic">Nāda Brahma</span>) is the
            primal vibrational blueprint that shapes physical matter, brainwave frequencies, and internal vitality.
          </p>
        </div>

        {/* Visual Split: Left Cymatic Vibration Artwork + Right 3 Visual Pillar Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Cymatics & Sacred Sound Visualization */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden border-2 border-cat/30 shadow-lift bg-surface group">
              <div className="relative aspect-[4/3] sm:aspect-[1/1] w-full overflow-hidden bg-background">
                <img
                  src={soundVibrationImg}
                  alt="Cymatics and Sound Healing Sacred Geometry Vibration"
                  className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700 filter brightness-[0.98] contrast-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-cat px-2.5 py-0.5 text-[10px] font-bold text-white mb-2 shadow-sm">
                    <Waves className="h-3 w-3" />
                    <span>Cymatics & Acoustic Geometry</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-white">
                    Sound Vibrations Structuring Physical & Mental Matter
                  </h3>
                  <p className="text-xs text-stone-200 mt-1 font-sans">
                    Just as sound frequencies organize sand into symmetrical mandalas, Vedic ragas organize bio-energies into harmonious health.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 3 Visual Concept Cards */}
          <div className="lg:col-span-7 space-y-4">
            {principles.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="group rounded-2xl bg-surface border border-border p-5 sm:p-6 shadow-soft hover:shadow-lift hover:border-cat/40 transition-all duration-300 flex items-start gap-4"
                >
                  <div className="h-12 w-12 rounded-2xl bg-cat-light border border-cat/25 flex items-center justify-center text-cat shrink-0 group-hover:scale-105 transition-transform shadow-sm mt-0.5">
                    <Icon className="h-6 w-6" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-cat font-sans block">
                        {item.subtitle}
                      </span>
                      <span className="text-xs font-serif font-bold text-cat/70">
                        0{idx + 1}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold font-serif text-foreground mt-0.5">
                      {item.title}
                    </h3>

                    <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
                      {item.desc}
                    </p>
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
