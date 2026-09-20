import { NINE_EMOTIONAL_STATES } from "@/lib/science-data";
import { Sparkles, Compass, Heart, Smile, Droplets, Flame, Shield, AlertTriangle, Eye, Sparkle, Sun } from "lucide-react";

export function EmotionWheel() {
  const bhavaIcons = [Heart, Smile, Droplets, Flame, Shield, AlertTriangle, Eye, Sparkle, Sun];
  const bhavaColors = [
    "#E11D48", // Rati (Love) - Rose
    "#D97706", // Hāsa (Laughter) - Amber
    "#2563EB", // Śoka (Sorrow) - Blue
    "#DC2626", // Krodha (Anger) - Red
    "#9333EA", // Utsāha (Valour) - Purple
    "#4B5563", // Bhaya (Fear) - Slate
    "#059669", // Jugupsā (Disgust) - Emerald
    "#0891B2", // Vismaya (Wonder) - Cyan
    "#B8860B", // Śama (Serenity) - Gold
  ];

  return (
    <section className="py-20 sm:py-24 bg-surface border-y border-border/80 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-cat-light border border-cat/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cat shadow-sm mb-3">
            <Compass className="h-3.5 w-3.5 text-cat" />
            <span>Nāṭyaśāstra Emotional Spectrum</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif tracking-tight text-foreground">
            The Nine Enduring Emotional States (Bhāvas)
          </h2>

          <p className="mt-4 text-base sm:text-lg text-muted-foreground font-sans">
            Human consciousness possesses nine enduring emotional archetypes. Through
            therapeutic raga composition, these emotions are harmonized and sublimated into Sattva.
          </p>
        </div>

        {/* 9 Bhāva Visual Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {NINE_EMOTIONAL_STATES.map((state, idx) => {
            const Icon = bhavaIcons[idx % bhavaIcons.length];
            const color = bhavaColors[idx % bhavaColors.length];

            return (
              <div
                key={idx}
                className="rounded-2xl bg-background border border-border p-4 sm:p-5 shadow-soft hover:shadow-lift hover:border-cat/40 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform shadow-sm"
                    style={{ backgroundColor: color }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-bold font-serif text-foreground">
                        {state.term}
                      </span>
                      <span className="text-xs font-serif italic text-muted-foreground">
                        ({state.sanskrit})
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 font-sans">
                      {state.meaning}
                    </p>
                  </div>
                </div>

                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 border"
                  style={{
                    backgroundColor: `${color}15`,
                    color: color,
                    borderColor: `${color}40`,
                  }}
                >
                  {state.rasa}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
