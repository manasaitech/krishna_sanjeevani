import { Play, Pause, Maximize2, Sparkles, X } from "lucide-react";
import { type VerseAudioState, VERSE_TRACKS } from "@/lib/use-verse-audio";

interface VerseMiniPlayerProps {
  audio: VerseAudioState;
}

export function VerseMiniPlayer({ audio }: VerseMiniPlayerProps) {
  const activeTrack = (VERSE_TRACKS.find((t) => t.id === audio.currentTrackId) || VERSE_TRACKS[0])!;

  if (!audio.isMiniPlayerVisible) {
    return (
      <button
        onClick={() => audio.setIsMiniPlayerVisible(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-surface border border-cat/40 p-2.5 shadow-lift text-cat hover:bg-cat-light backdrop-blur-md transition-all hover:scale-105"
        title={`Open ${activeTrack.title} Player`}
        aria-label={`Open ${activeTrack.title} Player`}
      >
        <Sparkles className="h-5 w-5 text-cat animate-spin" style={{ animationDuration: "6s" }} />
      </button>
    );
  }

  return (
    <aside
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 max-w-[340px] sm:max-w-[380px] w-[calc(100vw-2.5rem)] rounded-2xl bg-surface/98 border border-border p-3 sm:p-3.5 shadow-lift backdrop-blur-md transition-all duration-300 animate-rise"
      role="complementary"
      aria-label="Mukundamala Verse Audio Player"
    >
      <div className="relative flex items-center justify-between gap-3">
        {/* Left: Thumbnail & Info */}
        <div
          onClick={() => audio.setIsModalOpen(true)}
          className="flex items-center gap-2.5 cursor-pointer group min-w-0 flex-1"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              audio.setIsModalOpen(true);
            }
          }}
          title="Click to view full verse & translation"
        >
          <div className="relative h-11 w-11 shrink-0 rounded-full overflow-hidden border border-cat/40 shadow-sm bg-background group-hover:scale-105 transition-transform">
            <img
              src={activeTrack.image}
              alt={activeTrack.title}
              className="h-full w-full object-cover object-top"
            />
            {audio.isPlaying && (
              <span className="absolute inset-0 rounded-full border border-cat animate-ping opacity-30 pointer-events-none" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-cat font-sans">
                {activeTrack.id === "kulasekhara"
                  ? "Verse 24"
                  : activeTrack.id === "chaitanya"
                    ? "Verse 1"
                    : "Mantra"}
              </span>
              <span className="text-[10px] text-muted-foreground">•</span>
              <span className="text-[10px] text-muted-foreground font-serif italic truncate">
                {activeTrack.id === "kulasekhara"
                  ? "Mukundamālā"
                  : activeTrack.id === "chaitanya"
                    ? "Śikṣāṣṭakam"
                    : "Meditation"}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-foreground truncate group-hover:text-cat transition-colors">
              {activeTrack.artist}
            </p>

            {/* Waveform Bars */}
            <div className="flex items-center gap-0.5 mt-1">
              {[20, 50, 90, 40, 80, 60, 100, 45, 70, 30].map((h, i) => (
                <span
                  key={i}
                  className={`w-0.5 rounded-full bg-cat transition-all ${
                    audio.isPlaying ? "animate-pulse" : "h-1 opacity-30"
                  }`}
                  style={{
                    height: audio.isPlaying ? `${h * 0.12 + 2}px` : "2px",
                    animationDelay: `${i * 90}ms`,
                    animationDuration: "750ms",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={audio.togglePlay}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-cat text-cat-foreground font-bold shadow-sm hover:brightness-105 active:scale-95 transition-all"
            aria-label={audio.isPlaying ? "Pause verse recitation" : "Play verse recitation"}
          >
            {audio.isPlaying ? (
              <Pause className="h-4 w-4 fill-cat-foreground" />
            ) : (
              <Play className="h-4 w-4 fill-cat-foreground translate-x-0.5" />
            )}
          </button>

          <button
            onClick={() => audio.setIsModalOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Expand verse reader"
            aria-label="Expand verse reader"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => audio.setIsMiniPlayerVisible(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Minimize player"
            aria-label="Minimize player"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
