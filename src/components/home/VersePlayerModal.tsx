import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  ListMusic,
} from "lucide-react";
import { type VerseAudioState, SACRED_TRACKS, type SacredTrack } from "@/lib/use-verse-audio";

interface VersePlayerModalProps {
  audio: VerseAudioState;
}

export function VersePlayerModal({ audio }: VersePlayerModalProps) {
  if (!audio.isModalOpen) return null;

  const currentTrack = audio.currentTrack || SACRED_TRACKS[0];

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = audio.duration ? Math.min(100, Math.max(0, (audio.currentTime / audio.duration) * 100)) : 0;
  const volumePercent = Math.min(100, Math.max(0, audio.volume * 100));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 overflow-y-auto bg-black/60 backdrop-blur-md animate-soft-in"
      onClick={() => audio.setIsModalOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-player-title"
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-[#FAF5EC] border border-[#C9A84C]/35 shadow-2xl overflow-hidden my-auto text-foreground animate-rise"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="relative flex items-center justify-between px-6 py-4 border-b border-amber-900/10 bg-white/75 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#7C1C24] animate-ping" />
            <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#7C1C24] font-sans">
              Now Playing
            </span>
          </div>

          <button
            onClick={() => audio.setIsModalOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative p-5 sm:p-7 max-h-[82vh] overflow-y-auto space-y-6">
          {/* Current Song Playing Showcase Card */}
          <div className="flex flex-col items-center text-center">
            {/* Main Current Song Artwork */}
            <div className="relative h-44 w-44 sm:h-52 sm:w-52 rounded-3xl overflow-hidden border-2 border-[#C9A84C]/60 shadow-xl bg-white flex items-center justify-center p-2 group">
              <div className="absolute inset-0 bg-gradient-to-t from-amber-900/10 to-transparent pointer-events-none" />
              <img
                src={currentTrack.image}
                alt={currentTrack.title}
                className="h-full w-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-500"
              />
              {audio.isPlaying && (
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#7C1C24] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md">
                  <Sparkles className="h-3 w-3 animate-spin" style={{ animationDuration: "4s" }} />
                  <span>PLAYING</span>
                </div>
              )}
            </div>

            {/* Song Meta Information */}
            <div className="mt-4">
              <h2 id="modal-player-title" className="text-xl sm:text-2xl font-bold font-serif text-[#4D0F1B] tracking-tight">
                {currentTrack.title}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-[#8A7963] mt-1">
                {currentTrack.artist} • <span className="text-[#7C1C24] font-semibold">{currentTrack.raga}</span>
              </p>
            </div>
          </div>

          {/* Audio Scrubber & Controls Card */}
          <div className="rounded-2xl bg-white/95 border border-amber-900/10 p-5 shadow-sm space-y-4">
            {/* Time Indicators */}
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground font-sans">
              <span>{formatTime(audio.currentTime)}</span>
              <span className="text-[10.5px] uppercase tracking-wider text-[#7C1C24] font-bold">
                {audio.isPlaying ? "PLAYING" : "PAUSED"}
              </span>
              <span>{formatTime(audio.duration)}</span>
            </div>

            {/* Scrubber Range Slider with colored line behind pointer */}
            <div className="relative py-1 flex items-center">
              <input
                type="range"
                min={0}
                max={audio.duration || 100}
                value={audio.currentTime}
                onChange={(e) => audio.seek(Number(e.target.value))}
                style={{
                  background: `linear-gradient(to right, #7C1C24 0%, #7C1C24 ${progressPercent}%, #EFE9E0 ${progressPercent}%, #EFE9E0 100%)`,
                }}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#7C1C24] transition-all"
                aria-label="Audio progress scrubber"
              />
            </div>

            {/* Playback Control Buttons */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => audio.seek(0)}
                className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-[#7C1C24] transition-colors cursor-pointer"
                title="Replay from start"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Replay</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={audio.togglePlay}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-[#7C1C24] text-white font-bold shadow-xl shadow-[#7C1C24]/35 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  aria-label={audio.isPlaying ? "Pause" : "Play"}
                >
                  {audio.isPlaying ? (
                    <Pause className="h-6 w-6 fill-white" />
                  ) : (
                    <Play className="h-6 w-6 fill-white translate-x-0.5" />
                  )}
                </button>
              </div>

              {/* Volume Slider with colored line behind pointer */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => audio.setVolume(audio.volume > 0 ? 0 : 0.85)}
                  className="text-muted-foreground hover:text-[#7C1C24] transition-colors cursor-pointer"
                  aria-label="Toggle mute"
                >
                  {audio.volume === 0 ? (
                    <VolumeX className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-[#7C1C24]" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={audio.volume}
                  onChange={(e) => audio.setVolume(Number(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, #7C1C24 0%, #7C1C24 ${volumePercent}%, #EFE9E0 ${volumePercent}%, #EFE9E0 100%)`,
                  }}
                  className="w-16 sm:w-20 h-1.5 rounded-full appearance-none cursor-pointer accent-[#7C1C24]"
                  aria-label="Volume slider"
                />
              </div>
            </div>
          </div>

          {/* 3 Suggested Songs (Click to Play) */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListMusic className="h-4 w-4 text-[#7C1C24]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#4D0F1B] font-sans">
                  Suggested Songs (3)
                </h3>
              </div>
              <span className="text-[11px] text-muted-foreground font-medium">Click to Play</span>
            </div>

            <div className="space-y-2">
              {SACRED_TRACKS.map((song, idx) => {
                const isCurrent = currentTrack.id === song.id;
                return (
                  <div
                    key={song.id}
                    onClick={() => audio.playTrack(song)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      isCurrent
                        ? "bg-[#7C1C24]/10 border-[#7C1C24]/50 shadow-sm"
                        : "bg-white/80 border-amber-900/10 hover:bg-white hover:border-[#C9A84C]/40"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-bold text-muted-foreground w-4 text-center">
                        {idx + 1}
                      </span>
                      <div className="h-11 w-11 rounded-xl overflow-hidden border border-amber-900/15 bg-white shrink-0 flex items-center justify-center p-0.5">
                        <img
                          src={song.image}
                          alt={song.title}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs sm:text-sm font-semibold truncate ${isCurrent ? "text-[#7C1C24]" : "text-foreground"}`}>
                          {song.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {song.artist} • <span className="text-[#C9A84C] font-medium">{song.raga}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-medium text-muted-foreground">{song.durationText}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          audio.playTrack(song);
                        }}
                        className={`h-9 w-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          isCurrent && audio.isPlaying
                            ? "bg-[#7C1C24] text-white shadow-md"
                            : "bg-[#FAF5EC] border border-amber-900/15 text-[#7C1C24] hover:bg-[#7C1C24] hover:text-white"
                        }`}
                        title={isCurrent && audio.isPlaying ? "Pause track" : "Play track"}
                      >
                        {isCurrent && audio.isPlaying ? (
                          <Pause className="h-4 w-4 fill-current" />
                        ) : (
                          <Play className="h-4 w-4 fill-current translate-x-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
