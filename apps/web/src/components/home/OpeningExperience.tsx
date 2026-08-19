import { useEffect, useState } from "react";
import { KULASEKHARA_VERSE } from "@/lib/home-data";
import { Volume2, VolumeX, Sparkles, ArrowRight } from "lucide-react";
import type { VerseAudioState } from "@/lib/use-verse-audio";

interface OpeningExperienceProps {
  audio: VerseAudioState;
  onComplete: () => void;
}

export function OpeningExperience({ audio, onComplete }: OpeningExperienceProps) {
  const [stage, setStage] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    audio.play();

    const t1 = setTimeout(() => setStage(1), 100);
    const t2 = setTimeout(() => setStage(2), 1000);
    const t3 = setTimeout(() => setStage(3), 2000);
    const t4 = setTimeout(() => {
      setStage(4);
      setTimeout(() => {
        setIsDismissed(true);
        onComplete();
      }, 700);
    }, 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const handleManualSkip = () => {
    audio.play();
    setStage(4);
    setTimeout(() => {
      setIsDismissed(true);
      onComplete();
    }, 500);
  };

  if (isDismissed) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] bg-[#F5F1EB] text-foreground ${
        stage === 4
          ? "pointer-events-none opacity-0 scale-50 translate-x-[40vw] translate-y-[40vh]"
          : "opacity-100 scale-100 translate-x-0 translate-y-0"
      }`}
      role="region"
      aria-label="Opening Spiritual Invocation"
    >
      {/* Warm ambient manuscript glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#c9a84c_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-breathe" />

      {/* Skip / Enter Action */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        {audio.autoplayBlocked && (
          <button
            onClick={() => audio.play()}
            className="flex items-center gap-2 rounded-full bg-cat-light border border-cat/30 px-3.5 py-1.5 text-xs font-medium text-cat shadow-sm hover:bg-cat/20 transition-colors"
          >
            <VolumeX className="h-3.5 w-3.5 text-cat animate-pulse" />
            Tap to Hear Sacred Verse
          </button>
        )}
        <button
          onClick={handleManualSkip}
          className="flex items-center gap-1.5 rounded-full bg-surface border border-border px-4 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-all shadow-soft"
        >
          <span>Enter Website</span>
          <ArrowRight className="h-3.5 w-3.5 text-cat" />
        </button>
      </div>

      {/* Main Center Composition */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-10 text-center flex flex-col items-center">
        {/* Top Decorative Emblem */}
        <div
          className={`flex items-center gap-2 transition-all duration-700 ${
            stage >= 1 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <span className="h-px w-10 bg-cat/40" />
          <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-cat font-sans flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-cat animate-pulse" />
            Divine Invocation
          </span>
          <span className="h-px w-10 bg-cat/40" />
        </div>

        {/* King Kulasekhara Alvar Portrait */}
        <div
          className={`relative mt-6 mb-5 transition-all duration-1000 ${
            stage >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-90"
          }`}
        >
          <div className="absolute -inset-2 rounded-full bg-cat-light/60 blur-md" />
          <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-full overflow-hidden border-2 border-cat/40 shadow-lift bg-surface flex items-center justify-center">
            <img
              src={KULASEKHARA_VERSE.image}
              alt="King Kulasekhara Alvar"
              className="h-full w-full object-cover object-top"
            />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-surface border border-border rounded-full px-3 py-0.5 shadow-sm">
            <span className="text-[10px] tracking-wider uppercase font-semibold text-cat">
              9th Century
            </span>
          </div>
        </div>

        {/* Author Name */}
        <h2
          className={`text-xl sm:text-2xl font-bold tracking-tight text-foreground transition-all duration-700 delay-100 ${
            stage >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          {KULASEKHARA_VERSE.author}
        </h2>
        <p
          className={`text-xs uppercase tracking-[0.2em] text-cat font-semibold mt-0.5 transition-all duration-700 delay-150 ${
            stage >= 1 ? "opacity-100" : "opacity-0"
          }`}
        >
          {KULASEKHARA_VERSE.title}
        </p>

        {/* Sanskrit Verse in Devanagari */}
        <div
          className={`mt-6 max-w-xl transition-all duration-1000 ${
            stage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="relative rounded-2xl bg-surface border border-border p-5 sm:p-6 shadow-lift">
            <p className="text-base sm:text-lg md:text-xl font-serif leading-relaxed text-foreground whitespace-pre-line font-medium">
              {KULASEKHARA_VERSE.sanskrit}
            </p>

            {/* Translation & Core Exhortation */}
            <div
              className={`mt-4 pt-3 border-t border-border/60 transition-all duration-700 ${
                stage >= 3 ? "opacity-100" : "opacity-0"
              }`}
            >
              <p className="text-xs sm:text-sm font-serif italic text-muted-foreground">
                "{KULASEKHARA_VERSE.transliteration}"
              </p>
              <p className="text-xs sm:text-sm font-serif font-bold text-cat mt-1.5">
                {KULASEKHARA_VERSE.meaning}
              </p>
            </div>
          </div>
        </div>

        {/* Transforming Hint */}
        <div
          className={`mt-6 transition-all duration-500 ${
            stage === 3 ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-cat-light px-3.5 py-1 text-[11px] font-semibold text-cat">
            <Volume2 className="h-3 w-3 animate-pulse" />
            <span>Harmonizing soundscape starting...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
