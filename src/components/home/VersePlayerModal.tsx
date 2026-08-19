import { KULASEKHARA_VERSE } from "@/lib/home-data";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import type { VerseAudioState } from "@/lib/use-verse-audio";

interface VersePlayerModalProps {
  audio: VerseAudioState;
}

export function VersePlayerModal({ audio }: VersePlayerModalProps) {
  if (!audio.isModalOpen) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto bg-black/40 backdrop-blur-sm animate-soft-in"
      onClick={() => audio.setIsModalOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-verse-title"
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-surface border border-border shadow-lift overflow-hidden my-auto text-foreground animate-rise"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="relative flex items-center justify-between px-6 py-4 border-b border-border bg-background">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-cat animate-ping" />
            <span className="text-xs font-bold uppercase tracking-widest text-cat font-sans">
              Sacred Manuscript Verse
            </span>
          </div>

          <button
            onClick={() => audio.setIsModalOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative p-6 sm:p-8 max-h-[80vh] overflow-y-auto no-scrollbar space-y-6">
          {/* Hero Profile Block */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 rounded-2xl overflow-hidden border-2 border-cat/40 shadow-sm bg-background">
              <img
                src={KULASEKHARA_VERSE.image}
                alt="King Kulasekhara Alvar"
                className="h-full w-full object-cover object-top"
              />
            </div>

            <div className="text-center sm:text-left flex-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-cat-light px-3 py-0.5 text-[11px] font-semibold text-cat">
                <Sparkles className="h-3 w-3 text-cat" />
                9th Century King & Devotee
              </div>
              <h2 id="modal-verse-title" className="text-xl sm:text-2xl font-bold text-foreground mt-2">
                {KULASEKHARA_VERSE.author}
              </h2>
              <p className="text-xs uppercase tracking-wider text-cat font-semibold mt-0.5">
                {KULASEKHARA_VERSE.title}
              </p>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed font-sans">
                King Kulasekhara defined the Holy Name of Sri Krishna as the sovereign medicine (auṣadha) for body, mind, and existential ailments.
              </p>
            </div>
          </div>

          {/* Sanskrit Text & Transliteration Card */}
          <div className="rounded-2xl bg-background border border-border p-5 sm:p-6 shadow-soft space-y-4">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-cat">
                Devanāgarī Recitation
              </span>
              <p className="text-lg sm:text-xl md:text-2xl font-serif font-semibold leading-relaxed text-foreground mt-2 whitespace-pre-line">
                {KULASEKHARA_VERSE.sanskrit}
              </p>
            </div>

            <div className="pt-4 border-t border-border/60 text-center">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-muted-foreground">
                Roman Transliteration
              </span>
              <p className="text-xs sm:text-sm font-serif italic text-muted-foreground mt-1 leading-relaxed whitespace-pre-line">
                {KULASEKHARA_VERSE.transliteration}
              </p>
            </div>

            <div className="pt-4 border-t border-border/60 text-center">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-cat font-bold">
                Core Meaning
              </span>
              <p className="text-sm sm:text-base font-serif font-bold text-cat mt-1">
                {KULASEKHARA_VERSE.meaning}
              </p>
            </div>
          </div>

          {/* Dimensions of Krishna as Auṣadha (Medicine) */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-4 w-4 text-cat" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-cat font-sans">
                Six Dimensions of Healing (Auṣadha)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {KULASEKHARA_VERSE.dimensions.map((dim, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-background border border-border/80 p-3 hover:border-cat/40 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-cat mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-serif font-semibold text-foreground">
                        {dim.sanskrit}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                        {dim.meaning}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audio Scrubber & Controls */}
          <div className="rounded-2xl bg-background border border-border p-4 sm:p-5 shadow-soft space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-sans">
              <span>{formatTime(audio.currentTime)}</span>
              <span className="text-[10px] uppercase tracking-wider text-cat font-semibold">
                {audio.isPlaying ? "Chanting Active" : "Recitation Paused"}
              </span>
              <span>{formatTime(audio.duration)}</span>
            </div>

            {/* Scrubber Range Slider */}
            <div className="relative">
              <input
                type="range"
                min={0}
                max={audio.duration || 100}
                value={audio.currentTime}
                onChange={(e) => audio.seek(Number(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-cat"
                aria-label="Audio scrubber"
              />
              <div
                className="absolute top-0 left-0 h-1.5 bg-cat rounded-lg pointer-events-none"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Playback Control Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => audio.seek(0)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                title="Replay from start"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Replay</span>
              </button>

              <button
                onClick={audio.togglePlay}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-cat text-cat-foreground font-bold shadow-lift hover:brightness-105 active:scale-95 transition-all"
                aria-label={audio.isPlaying ? "Pause" : "Play"}
              >
                {audio.isPlaying ? (
                  <Pause className="h-5 w-5 fill-cat-foreground" />
                ) : (
                  <Play className="h-5 w-5 fill-cat-foreground translate-x-0.5" />
                )}
              </button>

              {/* Volume Slider */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => audio.setVolume(audio.volume > 0 ? 0 : 0.85)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Toggle mute"
                >
                  {audio.volume === 0 ? (
                    <VolumeX className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-cat" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={audio.volume}
                  onChange={(e) => audio.setVolume(Number(e.target.value))}
                  className="w-16 sm:w-20 h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-cat"
                  aria-label="Volume slider"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
