import { useState } from "react";
import { KULASEKHARA_VERSE } from "@/lib/home-data";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Music,
  ListMusic,
  SkipForward,
} from "lucide-react";
import type { VerseAudioState } from "@/lib/use-verse-audio";

import chaitanyaImg from "@/assets/18fc75d6-df05-469c-9855-d79c4931636d.webp";
import fluteImg from "@/assets/cbabb2a5-2787-4997-986f-daf7b88017ff.webp";
import ragaImg from "@/assets/2978e827-6b28-45f0-bbce-575e6023a705.webp";
import prabhupadaImg from "@/assets/prabhupada.webp";

interface VersePlayerModalProps {
  audio: VerseAudioState;
}

const UP_NEXT_SONGS = [
  {
    id: "next_1",
    title: "Śrī Śikṣāṣṭakam — Verse 1",
    artist: "Sri Chaitanya Mahaprabhu",
    duration: "3:12",
    raga: "Raga Yaman",
    image: chaitanyaImg,
  },
  {
    id: "next_2",
    title: "Hare Krishna Mahamantra",
    artist: "Transcendental Kirtan",
    duration: "4:45",
    raga: "Raga Kalyani",
    image: fluteImg,
  },
  {
    id: "next_3",
    title: "Shanti Suktam Soundscape",
    artist: "Vedic Chanting Lineage",
    duration: "3:30",
    raga: "Raga Bhairavi",
    image: prabhupadaImg,
  },
  {
    id: "next_4",
    title: "Pranava Dhyana (Om Resonance)",
    artist: "Therapeutic Meditative Frequency",
    duration: "5:10",
    raga: "Raga Todi",
    image: ragaImg,
  },
];

export function VersePlayerModal({ audio }: VersePlayerModalProps) {
  const [selectedNext, setSelectedNext] = useState<string | null>(null);

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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 overflow-y-auto bg-black/60 backdrop-blur-md animate-soft-in"
      onClick={() => audio.setIsModalOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-player-title"
    >
      <div
        className="relative w-full max-w-xl rounded-3xl bg-[#FAF5EC] border border-[#C9A84C]/30 shadow-2xl overflow-hidden my-auto text-foreground animate-rise"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="relative flex items-center justify-between px-6 py-4 border-b border-amber-900/10 bg-white/70 backdrop-blur-sm">
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
            <div className="relative h-48 w-48 sm:h-56 sm:w-56 rounded-3xl overflow-hidden border-2 border-[#C9A84C]/60 shadow-xl bg-white flex items-center justify-center p-2 group">
              <div className="absolute inset-0 bg-gradient-to-t from-amber-900/10 to-transparent pointer-events-none" />
              <img
                src={KULASEKHARA_VERSE.image}
                alt="King Kulasekhara Alvar"
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
                {KULASEKHARA_VERSE.title}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-[#8A7963] mt-1">
                {KULASEKHARA_VERSE.author} • <span className="text-[#7C1C24] font-semibold">Vedic Soundscape</span>
              </p>
            </div>
          </div>

          {/* Audio Scrubber & Controls Card */}
          <div className="rounded-2xl bg-white/90 border border-amber-900/10 p-4 sm:p-5 shadow-sm space-y-3">
            {/* Time Indicators */}
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground font-sans">
              <span>{formatTime(audio.currentTime)}</span>
              <span className="text-[10.5px] uppercase tracking-wider text-[#7C1C24] font-bold">
                {audio.isPlaying ? "Sacred Frequency Active" : "Paused"}
              </span>
              <span>{formatTime(audio.duration)}</span>
            </div>

            {/* Scrubber Range Slider */}
            <div className="relative py-1">
              <input
                type="range"
                min={0}
                max={audio.duration || 100}
                value={audio.currentTime}
                onChange={(e) => audio.seek(Number(e.target.value))}
                className="w-full h-2 bg-amber-900/10 rounded-lg appearance-none cursor-pointer accent-[#7C1C24]"
                aria-label="Audio scrubber"
              />
            </div>

            {/* Playback Control Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => audio.seek(0)}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Replay from start"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Replay</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={audio.togglePlay}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7C1C24] text-white font-bold shadow-lg shadow-[#7C1C24]/30 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  aria-label={audio.isPlaying ? "Pause" : "Play"}
                >
                  {audio.isPlaying ? (
                    <Pause className="h-5 w-5 fill-white" />
                  ) : (
                    <Play className="h-5 w-5 fill-white translate-x-0.5" />
                  )}
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => audio.setVolume(audio.volume > 0 ? 0 : 0.85)}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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
                  className="w-16 sm:w-20 h-1.5 bg-amber-900/10 rounded-lg appearance-none cursor-pointer accent-[#7C1C24]"
                  aria-label="Volume slider"
                />
              </div>
            </div>
          </div>

          {/* Up Next / Proposed Next Songs Section */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListMusic className="h-4 w-4 text-[#7C1C24]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#4D0F1B] font-sans">
                  Proposed Next Songs (Queue)
                </h3>
              </div>
              <span className="text-[11px] text-muted-foreground font-medium">4 Tracks Queued</span>
            </div>

            <div className="space-y-2">
              {UP_NEXT_SONGS.map((song, idx) => (
                <div
                  key={song.id}
                  onClick={() => setSelectedNext(song.id)}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    selectedNext === song.id
                      ? "bg-[#7C1C24]/10 border-[#7C1C24]/40 shadow-xs"
                      : "bg-white/80 border-amber-900/10 hover:bg-white hover:border-[#C9A84C]/40"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold text-muted-foreground w-4 text-center">
                      {idx + 1}
                    </span>
                    <div className="h-11 w-11 rounded-xl overflow-hidden border border-amber-900/10 bg-surface shrink-0">
                      <img
                        src={song.image}
                        alt={song.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
                        {song.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {song.artist} • <span className="text-[#C9A84C] font-medium">{song.raga}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-medium text-muted-foreground">{song.duration}</span>
                    <button
                      className="h-8 w-8 rounded-full bg-[#FAF5EC] border border-amber-900/15 flex items-center justify-center text-[#7C1C24] hover:bg-[#7C1C24] hover:text-white transition-colors"
                      title="Play track"
                    >
                      <Play className="h-3.5 w-3.5 fill-current translate-x-0.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
