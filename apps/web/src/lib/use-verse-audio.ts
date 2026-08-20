import { useEffect, useState, useCallback } from "react";
import { KULASEKHARA_VERSE } from "./home-data";

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
}

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

// Active hook listeners to trigger re-renders
const listeners = new Set<() => void>();

function emitUpdate() {
  listeners.forEach((l) => l());
}

function initGlobalAudio() {
  if (typeof window === "undefined" || globalAudio) return;

  const audio = new Audio();
  audio.src = KULASEKHARA_VERSE.audioPath;
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
  }, []);

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
  };
}
