import { Link } from "@tanstack/react-router";
import { useApp } from "@/lib/app-state";
import { Sparkles, ArrowRight, Play, User } from "lucide-react";

export function ScienceCTA() {
  const { user } = useApp();

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-surface to-background border-t border-border text-foreground text-center relative overflow-hidden">
      {/* Ambient Halo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[400px] bg-cat-light/50 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-cat-light border border-cat/25 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cat shadow-sm mb-6">
          <Sparkles className="h-3.5 w-3.5 text-cat" />
          <span>Vedic Raga Streaming</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-bold font-serif tracking-tight text-foreground leading-tight">
          Explore Krishna Sanjeevani
        </h2>

        <p className="mt-4 text-base sm:text-xl font-serif italic text-cat tracking-wide max-w-2xl mx-auto font-medium">
          Experience the therapeutic power of scientifically calibrated Vedic ragas.
        </p>

        <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed font-sans">
          Listen to curated Morning, Afternoon, Evening, and Midnight raga streams sequenced to
          align with your biological rhythms and cultivate inner stillness.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {user ? (
            <Link
              to="/home"
              className="press inline-flex items-center gap-2 rounded-btn bg-cat px-8 py-4 text-base font-semibold text-cat-foreground shadow-lift hover:brightness-105"
            >
              <User className="h-5 w-5" />
              <span>Enter Your Listening Sanctuary</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              to="/register"
              className="press inline-flex items-center gap-2 rounded-btn bg-cat px-8 py-4 text-base font-semibold text-cat-foreground shadow-lift hover:brightness-105"
            >
              <Play className="h-4 w-4 fill-cat-foreground" />
              <span>Enter the Experience</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
