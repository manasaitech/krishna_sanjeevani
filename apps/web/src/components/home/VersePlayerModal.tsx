import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  ListMusic,
} from "lucide-react";
import { type VerseAudioState, VERSE_TRACKS } from "@/lib/use-verse-audio";

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
  const activeTrack = (VERSE_TRACKS.find((t) => t.id === audio.currentTrackId) || VERSE_TRACKS[0])!;

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

        <div className="relative p-6 sm:p-8 max-h-[85vh] overflow-y-auto no-scrollbar flex flex-col items-center space-y-6">
          {/* Cover Art cover with spin animation */}
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-cat/30 shadow-lift group flex items-center justify-center bg-background">
            <img
              src={activeTrack.image}
              alt={activeTrack.title}
              className={`h-full w-full object-cover transition-transform duration-[10s] ease-linear ${
                audio.isPlaying ? "animate-spin" : ""
              }`}
              style={{ animationDuration: "25s" }}
            />
            <div className="absolute inset-0 bg-black/10 backdrop-brightness-95 pointer-events-none" />
          </div>

          {/* Song Metadata */}
          <div className="text-center space-y-1">
            <h2
              id="modal-verse-title"
              className="text-xl sm:text-2xl font-serif font-bold text-foreground"
            >
              {activeTrack.title}
            </h2>
            <p className="text-xs sm:text-sm font-sans tracking-wide text-cat font-medium uppercase">
              {activeTrack.artist}
            </p>
          </div>

          {/* Music Player Controls & Scrubber */}
          <div className="w-full rounded-2xl bg-background border border-border p-4 sm:p-5 shadow-soft space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-sans">
              <span>{formatTime(audio.currentTime)}</span>
              <span className="text-[10px] uppercase tracking-wider text-cat font-semibold">
                {audio.isPlaying ? "Divine Sound Active" : "Recitation Paused"}
              </span>
              <span>{formatTime(audio.duration)}</span>
            </div>

            {/* Scrubber Range Slider */}
            <div className="relative flex items-center h-4">
              <div className="absolute left-0 right-0 h-1.5 bg-muted rounded-lg pointer-events-none" />
              <div
                className="absolute left-0 h-1.5 bg-cat rounded-lg pointer-events-none"
                style={{ width: `${progressPercent}%` }}
              />
              <input
                type="range"
                min={0}
                max={audio.duration || 100}
                value={audio.currentTime}
                onChange={(e) => audio.seek(Number(e.target.value))}
                className="w-full h-4 bg-transparent appearance-none cursor-pointer accent-cat relative z-10"
                aria-label="Audio scrubber"
              />
            </div>

            {/* Playback Control Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => audio.seek(0)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                title="Replay from start"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Replay</span>
              </button>

              <div className="flex items-center gap-4">
                <button
                  onClick={audio.previousTrack}
                  className="p-2 rounded-full hover:bg-muted text-foreground transition-colors"
                  aria-label="Previous track"
                >
                  <SkipBack className="h-5 w-5" />
                </button>

                <button
                  onClick={audio.togglePlay}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-cat text-cat-foreground font-bold shadow-lift hover:brightness-105 active:scale-95 transition-all"
                  aria-label={audio.isPlaying ? "Pause" : "Play"}
                >
                  {audio.isPlaying ? (
                    <Pause className="h-6 w-6 fill-cat-foreground" />
                  ) : (
                    <Play className="h-6 w-6 fill-cat-foreground translate-x-0.5" />
                  )}
                </button>

                <button
                  onClick={audio.nextTrack}
                  className="p-2 rounded-full hover:bg-muted text-foreground transition-colors"
                  aria-label="Next track"
                >
                  <SkipForward className="h-5 w-5" />
                </button>
              </div>

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

          {/* Playlist Queue */}
          <div className="w-full space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cat font-sans border-b border-border/60 pb-1.5">
              <ListMusic className="h-4 w-4" />
              <span>Sacred Playlists</span>
            </div>

            <div className="space-y-1.5">
              {VERSE_TRACKS.map((t) => {
                const isSelected = t.id === audio.currentTrackId;
                return (
                  <button
                    key={t.id}
                    onClick={() => audio.playTrack(t.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left font-sans transition-all ${
                      isSelected
                        ? "bg-cat-light/50 border-cat/30 shadow-sm"
                        : "bg-surface/50 border-border hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg overflow-hidden border border-border shrink-0 bg-background">
                        <img
                          src={t.image}
                          alt={t.title}
                          className="h-full w-full object-cover object-top"
                        />
                      </div>
                      <div>
                        <span
                          className={`block text-xs sm:text-sm font-semibold leading-tight ${
                            isSelected ? "text-cat" : "text-foreground"
                          }`}
                        >
                          {t.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{t.artist}</span>
                      </div>
                    </div>
                    {isSelected && audio.isPlaying && (
                      <div className="flex gap-0.5 items-end h-3 px-1 shrink-0">
                        <div
                          className="w-0.5 h-3 bg-cat animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <div
                          className="w-0.5 h-2 bg-cat animate-bounce"
                          style={{ animationDelay: "0.3s" }}
                        />
                        <div
                          className="w-0.5 h-3 bg-cat animate-bounce"
                          style={{ animationDelay: "0.5s" }}
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
