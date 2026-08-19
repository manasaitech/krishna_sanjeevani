import { useState } from "react";
import { THERAPEUTIC_RASAS } from "@/lib/science-data";
import { Sparkles, Heart, Activity, CheckCircle2, Music } from "lucide-react";

export function RasaLanguage() {
  const [activeRasaId, setActiveRasaId] = useState("santa");

  const activeRasa = THERAPEUTIC_RASAS.find((r) => r.id === activeRasaId) || THERAPEUTIC_RASAS[0];

  return (
    <section id="rasa" className="py-20 sm:py-28 bg-background relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-cat-light border border-cat/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cat shadow-sm mb-3">
            <Heart className="h-3.5 w-3.5 text-cat" />
            <span>Aesthetic Psychology</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif tracking-tight text-foreground">
            The Language of Rasa
          </h2>

          <p className="mt-4 text-base sm:text-lg text-muted-foreground font-sans">
            In Nāṭyaśāstra and classical musicology, emotional experiences are transmuted into
            relishable aesthetic essences (<span className="text-cat font-serif italic">Rasas</span>).
            Ayurvedic therapy identifies five primary Rasas as directly applicable to therapeutic sound.
          </p>
        </div>

        {/* 5 Rasa Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
          {THERAPEUTIC_RASAS.map((rasa) => {
            const isSelected = rasa.id === activeRasaId;
            return (
              <button
                key={rasa.id}
                onClick={() => setActiveRasaId(rasa.id)}
                className={`press px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                  isSelected
                    ? "bg-cat text-cat-foreground shadow-lift scale-105"
                    : "bg-surface border border-border text-foreground hover:bg-muted"
                }`}
              >
                <span className="font-serif text-base">{rasa.sanskrit}</span>
                <span>{rasa.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active Rasa Showcase Card */}
        <div className="rounded-card bg-surface border border-border p-7 sm:p-10 shadow-lift relative overflow-hidden transition-all duration-500 animate-soft-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-border/70 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-widest text-cat font-sans">
                  Therapeutic Rasa
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs font-semibold text-muted-foreground">
                  {activeRasa.gunaProfile}
                </span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-bold font-serif text-foreground mt-1">
                {activeRasa.name} <span className="font-serif text-2xl text-cat">({activeRasa.sanskrit})</span>
              </h3>

              <p className="text-sm sm:text-base font-serif italic text-muted-foreground mt-0.5">
                {activeRasa.translation}
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-cat-light px-4 py-1.5 text-xs font-semibold text-cat self-start md:self-auto">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Target: {activeRasa.id === "karuna" ? "Vāta / Pitta" : activeRasa.id === "kapha" ? "Kapha" : "Tridoṣa"}</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-cat font-sans mb-1.5">
                  Therapeutic Mechanism:
                </h4>
                <p className="text-sm sm:text-base text-foreground/90 leading-relaxed font-sans">
                  {activeRasa.therapeuticEffect}
                </p>
              </div>

              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-sans mb-1">
                  Somatic Humors Targeted:
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                  {activeRasa.doshaTarget}
                </p>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl bg-background border border-border/80 p-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-cat font-sans flex items-center gap-1.5 mb-1.5">
                  <Music className="h-3.5 w-3.5" />
                  <span>Musical Parameters:</span>
                </h4>
                <p className="text-sm text-foreground/90 leading-relaxed font-sans">
                  {activeRasa.musicalAttributes}
                </p>
              </div>

              <div className="pt-3 border-t border-border/50">
                <p className="text-xs font-serif italic text-muted-foreground">
                  “{activeRasa.note}”
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
