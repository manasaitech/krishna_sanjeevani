import { KULASEKHARA_VERSE } from "@/lib/home-data";
import { Sparkles } from "lucide-react";

export function SpiritualVerseSection() {
  return (
    <section className="relative py-20 sm:py-28 bg-cat-light/40 border-y border-cat/20 text-foreground overflow-hidden text-center">
      {/* Background Decorative Manuscript Watermark */}
      <div className="absolute inset-0 bg-[radial-gradient(#c9a84c_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Motif */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="h-px w-12 bg-cat/30" />
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-cat font-sans flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-cat" />
            Sacred Inspiration
          </span>
          <span className="h-px w-12 bg-cat/30" />
        </div>

        {/* Sanskrit Verse */}
        <blockquote className="space-y-6">
          <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-semibold leading-relaxed text-foreground whitespace-pre-line">
            {KULASEKHARA_VERSE.sanskrit}
          </p>

          {/* Separation Motif */}
          <div className="flex items-center justify-center gap-2 my-6">
            <span className="w-1.5 h-1.5 rounded-full bg-cat/30" />
            <span className="w-3 h-3 rounded-full bg-cat" />
            <span className="w-1.5 h-1.5 rounded-full bg-cat/30" />
          </div>

          {/* Transliteration */}
          <p className="text-sm sm:text-base font-serif italic text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            "{KULASEKHARA_VERSE.transliteration}"
          </p>

          {/* English Meaning */}
          <p className="text-base sm:text-xl font-serif font-bold text-cat max-w-xl mx-auto">
            {KULASEKHARA_VERSE.meaning}
          </p>
        </blockquote>

        {/* Author Credit */}
        <div className="mt-8 flex flex-col items-center">
          <div className="h-px w-24 bg-cat/30 mb-3" />
          <cite className="not-italic text-sm font-bold text-foreground font-serif">
            {KULASEKHARA_VERSE.author}
          </cite>
          <span className="text-xs text-cat uppercase tracking-widest font-sans mt-0.5 font-semibold">
            {KULASEKHARA_VERSE.title}
          </span>
        </div>
      </div>
    </section>
  );
}
