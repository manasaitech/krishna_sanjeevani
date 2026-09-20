import { Waves, Music2, Sparkles, Flame, Heart } from "lucide-react";
import soundVibrationImg from "@/assets/caf22ea5-bc7e-46d8-a845-876858c2a009.webp";

export function MusicMantraStory() {
  const soundLayers = [
    {
      title: "Acoustic Frequency (Sur)",
      subtitle: "Microtonal Precision",
      desc: "Calibrated swaras that soothe sympathetic neural arousal.",
      icon: Music2,
    },
    {
      title: "Sacred Syllables (Mantra)",
      subtitle: "Transcendental Potency",
      desc: "Cleansing the mirror of the heart from psychic fatigue.",
      icon: Sparkles,
    },
    {
      title: "Consciousness (Ceto)",
      subtitle: "Awakening Sattva",
      desc: "Diffusing cooling moonlight that subdues agitation and fear.",
      icon: Flame,
    },
    {
      title: "Wholeness (Sanjeevani)",
      subtitle: "Restorative Equilibrium",
      desc: "Holistic life-giving balm aligning body, mind, and soul.",
      icon: Heart,
    },
  ];

  return (
    <section className="relative py-20 sm:py-28 bg-surface border-y border-border text-foreground overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Visual Artwork & Overview */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-cat-light border border-cat/25 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cat shadow-sm">
              <Waves className="h-3.5 w-3.5 text-cat" />
              <span>The Healing Continuum</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight text-foreground leading-tight">
              Music · Mantra · Consciousness · Wellbeing
            </h2>

            <div className="relative rounded-2xl overflow-hidden border border-cat/30 shadow-soft aspect-[16/10] group">
              <img
                src={soundVibrationImg}
                alt="Sacred Sound Vibration and Consciousness"
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-[0.98]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-4 right-4 text-white text-xs font-medium font-serif">
                “Sound is the primal vibration (Nāda Brahma) that awakens consciousness.”
              </div>
            </div>
          </div>

          {/* Right Column: 4-Step Visual Flow Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {soundLayers.map((layer, idx) => {
              const Icon = layer.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-background border border-border p-4 sm:p-5 shadow-soft hover:shadow-lift hover:border-cat/40 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-9 w-9 rounded-xl bg-cat-light border border-cat/25 flex items-center justify-center text-cat">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-bold text-cat font-sans">
                      STEP 0{idx + 1}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-cat font-sans block">
                      {layer.subtitle}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold font-serif text-foreground mt-0.5">
                      {layer.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed font-sans">
                      {layer.desc}
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
