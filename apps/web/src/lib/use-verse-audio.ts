import { useEffect, useState, useCallback } from "react";
import { KULASEKHARA_VERSE, CHAITANYA_SIKSASTAKAM, prabhupadaImg } from "./home-data";
import { BASE_URL } from "./api";
import { useApp } from "./app-state";

export interface VerseTrack {
  id: string;
  title: string;
  artist: string;
  audioPath: string;
  image: string;
}

export interface VerseAudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  autoplayBlocked: boolean;
  isModalOpen: boolean;
  isMiniPlayerVisible: boolean;
  isLoaded: boolean;
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (val: number) => void;
  setIsModalOpen: (open: boolean) => void;
  setIsMiniPlayerVisible: (visible: boolean) => void;
  currentTrackId: string;
  playTrack: (trackId: string) => void;
  nextTrack: () => void;
  previousTrack: () => void;
}

export const VERSE_TRACKS: VerseTrack[] = [
  {
    id: "kulasekhara",
    title: "Mukundamālā Stotra — Verse 24",
    artist: "King Kulasekhara Alvar",
    audioPath: KULASEKHARA_VERSE.audioPath,
    image: KULASEKHARA_VERSE.image,
  },
  {
    id: "chaitanya",
    title: "Śrī Śikṣāṣṭakam — Verse 1",
    artist: "Śrī Caitanya Mahāprabhu",
    audioPath: "/audio/chaitanya-verse.mp3",
    image: CHAITANYA_SIKSASTAKAM.image,
  },
  {
    id: "mahamantra",
    title: "Hare Krishna Mahamantra",
    artist: "Srila Prabhupada Legacy",
    audioPath: "/audio/hare-krishna-mahamantra.mp3",
    image: prabhupadaImg,
  },
];

// Shared Global Audio instance and state
let globalAudio: HTMLAudioElement | null = null;
let globalIsPlaying = false;
let globalCurrentTime = 0;
let globalDuration = 168; // ~2:48 default verse duration
let globalVolume = 0.85;
let globalIsMuted = false;
let globalAutoplayBlocked = false;
let globalIsModalOpen = false;
let globalIsMiniPlayerVisible = true;
let globalIsLoaded = false;
let globalIsSimulated = false;
let globalCurrentTrackId = "kulasekhara";

// Active hook listeners to trigger re-renders
const listeners = new Set<() => void>();

function emitUpdate() {
  listeners.forEach((l) => l());
}

function initGlobalAudio() {
  if (typeof window === "undefined" || globalAudio) return;

  const audio = new Audio();
  const activeTrack = VERSE_TRACKS.find((t) => t.id === globalCurrentTrackId) || VERSE_TRACKS[0];
  if (!activeTrack) return;
  audio.src = activeTrack.audioPath;
  audio.preload = "auto";
  audio.volume = globalVolume;
  audio.loop = false;
  globalAudio = audio;

  const onCanPlay = () => {
    globalIsLoaded = true;
    emitUpdate();
  };

  const onLoadedMetadata = () => {
    if (audio.duration && !isNaN(audio.duration)) {
      globalDuration = audio.duration;
      globalIsSimulated = false;
      globalIsLoaded = true;
      emitUpdate();
    }
  };

  const onTimeUpdate = () => {
    if (!globalIsSimulated) {
      globalCurrentTime = audio.currentTime;
      emitUpdate();
    }
  };

  const onEnded = () => {
    globalIsPlaying = false;
    globalCurrentTime = 0;
    globalIsMiniPlayerVisible = false;
    emitUpdate();
  };

  const onError = () => {
    globalIsSimulated = true;
    globalIsLoaded = true;
    emitUpdate();
  };

  audio.addEventListener("canplay", onCanPlay);
  audio.addEventListener("loadedmetadata", onLoadedMetadata);
  audio.addEventListener("timeupdate", onTimeUpdate);
  audio.addEventListener("ended", onEnded);
  audio.addEventListener("error", onError);

  audio.load();
}

export function useVerseAudio(): VerseAudioState {
  const [, forceUpdate] = useState({});
  const app = useApp();

  useEffect(() => {
    if (app.playing && globalIsPlaying) {
      if (globalAudio && !globalIsSimulated) {
        globalAudio.pause();
      }
      globalIsPlaying = false;
      emitUpdate();
    }
  }, [app.playing]);

  useEffect(() => {
    initGlobalAudio();

    const listener = () => forceUpdate({});
    listeners.add(listener);

    // Simulated timer for fallback audio if media element errors out
    let timerId: number | null = null;
    if (globalIsPlaying && globalIsSimulated) {
      timerId = window.setInterval(() => {
        globalCurrentTime += 1;
        if (globalCurrentTime >= globalDuration) {
          globalIsPlaying = false;
          globalCurrentTime = 0;
          globalIsMiniPlayerVisible = false;
        }
        emitUpdate();
      }, 1000);
    }

    return () => {
      listeners.delete(listener);
      if (timerId) clearInterval(timerId);
    };
  }, [globalIsPlaying]);

  const play = useCallback(() => {
    initGlobalAudio();
    if (!globalAudio) return;

    if (app.playing) {
      app.stop();
    }

    if (!globalIsSimulated) {
      const playPromise = globalAudio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            globalIsPlaying = true;
            globalAutoplayBlocked = false;
            emitUpdate();
          })
          .catch((err) => {
            if (err.name === "NotAllowedError") {
              globalAutoplayBlocked = true;
              emitUpdate();
            } else {
              globalIsSimulated = true;
              globalIsPlaying = true;
              globalAutoplayBlocked = false;
              emitUpdate();
            }
          });
      }
    } else {
      globalIsPlaying = true;
      globalAutoplayBlocked = false;
      emitUpdate();
    }
  }, [app]);

  const pause = useCallback(() => {
    if (globalAudio && !globalIsSimulated) {
      globalAudio.pause();
    }
    globalIsPlaying = false;
    emitUpdate();
  }, []);

  const togglePlay = useCallback(() => {
    if (globalIsPlaying) {
      pause();
    } else {
      play();
    }
  }, [play, pause]);

  const seek = useCallback((time: number) => {
    if (globalAudio && !globalIsSimulated) {
      globalAudio.currentTime = time;
    }
    globalCurrentTime = time;
    emitUpdate();
  }, []);

  const setVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    if (globalAudio) {
      globalAudio.volume = clamped;
    }
    globalVolume = clamped;
    globalIsMuted = clamped === 0;
    emitUpdate();
  }, []);

  const setIsModalOpen = useCallback((open: boolean) => {
    globalIsModalOpen = open;
    emitUpdate();
  }, []);

  const setIsMiniPlayerVisible = useCallback((visible: boolean) => {
    globalIsMiniPlayerVisible = visible;
    emitUpdate();
  }, []);

  const playTrack = useCallback((trackId: string) => {
    initGlobalAudio();
    globalCurrentTrackId = trackId;
    const activeTrack = VERSE_TRACKS.find((t) => t.id === trackId) || VERSE_TRACKS[0];
    if (!activeTrack) return;

    if (app.playing) {
      app.stop();
    }

    if (globalAudio) {
      globalAudio.pause();
      globalAudio.src = activeTrack.audioPath;
      globalAudio.load();
      globalCurrentTime = 0;
      globalIsLoaded = false;
      const playPromise = globalAudio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            globalIsPlaying = true;
            globalAutoplayBlocked = false;
            emitUpdate();
          })
          .catch((err) => {
            console.error(err);
            globalIsPlaying = false;
            emitUpdate();
          });
      }
    }
  }, [app]);

  const nextTrack = useCallback(() => {
    const idx = VERSE_TRACKS.findIndex((t) => t.id === globalCurrentTrackId);
    const nextIdx = (idx + 1) % VERSE_TRACKS.length;
    const nextTrackItem = VERSE_TRACKS[nextIdx];
    if (nextTrackItem) {
      playTrack(nextTrackItem.id);
    }
  }, [playTrack]);

  const previousTrack = useCallback(() => {
    const idx = VERSE_TRACKS.findIndex((t) => t.id === globalCurrentTrackId);
    const prevIdx = (idx - 1 + VERSE_TRACKS.length) % VERSE_TRACKS.length;
    const prevTrackItem = VERSE_TRACKS[prevIdx];
    if (prevTrackItem) {
      playTrack(prevTrackItem.id);
    }
  }, [playTrack]);

  return {
    isPlaying: globalIsPlaying,
    currentTime: globalCurrentTime,
    duration: globalDuration,
    volume: globalVolume,
    isMuted: globalIsMuted,
    autoplayBlocked: globalAutoplayBlocked,
    isModalOpen: globalIsModalOpen,
    isMiniPlayerVisible: globalIsMiniPlayerVisible,
    isLoaded: globalIsLoaded,
    togglePlay,
    play,
    pause,
    seek,
    setVolume,
    setIsModalOpen,
    setIsMiniPlayerVisible,
    currentTrackId: globalCurrentTrackId,
    playTrack,
    nextTrack,
    previousTrack,
  };
}
