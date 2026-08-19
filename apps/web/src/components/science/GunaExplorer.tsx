import { useState } from "react";
import { GUNAS_DATA } from "@/lib/science-data";
import threeGunasImg from "@/assets/three-gunas-diagram.png";
import { Sparkles, Sun, Flame, Moon, CheckCircle2, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export function GunaExplorer() {
  const [selectedGuna, setSelectedGuna] = useState<"sattva" | "rajas" | "tamas">("sattva");

  const guna = GUNAS_DATA[selectedGuna];

  const icons = {
    sattva: Sun,
    rajas: Flame,
    tamas: Moon,
  };

  const gunaVisuals = {
    sattva: {
      color: "#B8860B",
      bgClass: "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200",
      accent: "text-amber-600",
      indicator: "bg-amber-400",
      vibration: "High Frequency · Harmonic Alignment",
    },
    rajas: {
      color: "#C84B31",
      bgClass: "bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200",
      accent: "text-rose-600",
      indicator: "bg-rose-500",
      vibration: "Kinetic Frequency · Dynamic Motion",
    },
    tamas: {
      color: "#5C1D24",
      bgClass: "bg-stone-900/10 border-stone-800/30 text-stone-900 dark:text-stone-200",
      accent: "text-cat",
      indicator: "bg-cat",
      vibration: "Dense Frequency · Inertial Grounding",
    },
  };

  return (
    <section id="gunas" className="py-20 sm:py-28 bg-surface border-y border-border/80 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-cat-light border border-cat/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cat shadow-sm mb-3">
            <Sparkles className="h-3.5 w-3.5 text-cat" />
            <span>Vedic Psycho-Acoustic Dynamics</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif tracking-tight text-foreground">
            The Three Guṇas
          </h2>

          <p className="mt-4 text-base sm:text-lg text-muted-foreground font-sans">
            In Ayurvedic psychology and Vedic music therapy, sound is calibrated to modulate the
            three universal energetic qualities: <strong className="text-foreground">Sattva</strong> (Harmony),{" "}
            <strong className="text-foreground">Rajas</strong> (Passion), and{" "}
            <strong className="text-foreground">Tamas</strong> (Inertia).
          </p>
        </div>

        {/* Visual Diagram & Interactive Model Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Sacred Geometry Diagram Card */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative rounded-3xl overflow-hidden border-2 border-cat/30 shadow-lift bg-background p-3 w-full max-w-md group">
              <div className="relative rounded-2xl overflow-hidden aspect-square w-full bg-stone-100 flex items-center justify-center">
                <img
                  src={threeGunasImg}
                  alt="The Three Gunas Triangle Diagram — Vedic Music Therapy Consciousness Modulation"
                  className="h-full w-full object-contain filter contrast-[1.03] group-hover:scale-[1.02] transition-transform duration-500"
                />
              </div>

              {/* Diagram Legend & Color Mapping */}
              <div className="mt-3.5 p-3.5 rounded-xl bg-surface border border-border/70 text-xs space-y-2">
                <div className="flex items-center justify-between font-serif font-bold text-foreground">
                  <span>Ternary Modulation Matrix</span>
                  <span className="text-[10px] font-sans uppercase tracking-wider text-cat font-semibold">
                    Consciousness Map
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 pt-1 text-[11px] text-center font-sans font-medium">
                  <button
                    onClick={() => setSelectedGuna("sattva")}
                    className={`py-1.5 px-1 rounded-lg border transition-all ${
                      selectedGuna === "sattva"
                        ? "bg-amber-500/20 border-amber-500 text-amber-900 dark:text-amber-300 font-bold shadow-sm"
                        : "bg-background border-border/60 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    ● Gold (Sattva)
                  </button>

                  <button
                    onClick={() => setSelectedGuna("rajas")}
                    className={`py-1.5 px-1 rounded-lg border transition-all ${
                      selectedGuna === "rajas"
                        ? "bg-rose-500/20 border-rose-500 text-rose-900 dark:text-rose-300 font-bold shadow-sm"
                        : "bg-background border-border/60 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    ● Crimson (Rajas)
                  </button>

                  <button
                    onClick={() => setSelectedGuna("tamas")}
                    className={`py-1.5 px-1 rounded-lg border transition-all ${
                      selectedGuna === "tamas"
                        ? "bg-stone-800/20 border-cat text-cat dark:text-rose-200 font-bold shadow-sm"
                        : "bg-background border-border/60 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    ● Deep Crimson
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Interactive Cards */}
          <div className="lg:col-span-7 space-y-5">
            {/* Quick 3-Tab Selector Buttons */}
            <div className="grid grid-cols-3 gap-3">
              {(["sattva", "rajas", "tamas"] as const).map((key) => {
                const item = GUNAS_DATA[key];
                const isSelected = selectedGuna === key;
                const IconComponent = icons[key];
                const visual = gunaVisuals[key];

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedGuna(key)}
                    className={`p-3.5 sm:p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 shadow-soft ${
                      isSelected
                        ? `${visual.bgClass} border-2 shadow-lift scale-[1.03]`
                        : "bg-background border-border hover:bg-surface text-muted-foreground"
                    }`}
                  >
                    <IconComponent className={`h-5 w-5 ${isSelected ? visual.accent : "text-muted-foreground"}`} />
                    <span className="text-sm font-bold font-serif text-foreground block">
                      {item.name}
                    </span>
                    <span className="text-[10px] font-sans font-medium uppercase tracking-wider block opacity-75">
                      {key === "sattva" ? "Balance" : key === "rajas" ? "Energy" : "Inertia"}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Selected Guṇa Detailed Card */}
            <div className="rounded-2xl bg-background border border-border p-6 sm:p-7 shadow-lift relative overflow-hidden transition-all animate-soft-in">
              <div
                className="absolute top-0 inset-x-0 h-1.5"
                style={{ backgroundColor: gunaVisuals[selectedGuna].color }}
              />

              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-cat font-sans block">
                    Consciousness Attribute
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold font-serif text-foreground mt-0.5">
                    {guna.name} <span className="font-serif text-lg text-cat">({guna.sanskrit})</span>
                  </h3>
                </div>

                <span
                  className="px-3 py-1 rounded-full text-xs font-bold font-sans uppercase tracking-wider border shadow-sm"
                  style={{
                    backgroundColor: guna.lightBg,
                    borderColor: gunaVisuals[selectedGuna].color,
                    color: gunaVisuals[selectedGuna].color,
                  }}
                >
                  {guna.subhead}
                </span>
              </div>

              {/* Core Attributes Visual Grid */}
              <div className="mt-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-sans block mb-2">
                  Psycho-Physical Manifestation:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {guna.qualities.map((q, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-xl bg-surface border border-border/70 text-xs text-foreground font-sans"
                    >
                      <CheckCircle2
                        className="h-3.5 w-3.5 shrink-0"
                        style={{ color: gunaVisuals[selectedGuna].color }}
                      />
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Therapeutic Music Modulation Role */}
              <div className="mt-4 p-4 rounded-xl bg-cat-light/40 border border-cat/25">
                <div className="flex items-center gap-2 text-xs font-bold text-cat font-sans mb-1">
                  <Zap className="h-3.5 w-3.5" />
                  <span>Vedic Sound Therapy Action</span>
                </div>
                <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed font-sans">
                  {guna.musicRole}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
