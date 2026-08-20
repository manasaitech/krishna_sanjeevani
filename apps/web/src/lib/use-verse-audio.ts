import { useEffect, useRef, useState, useCallback } from "react";
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

export function useVerseAudio(): VerseAudioState {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(168); // ~2:48 default verse duration
  const [volume, setVolumeState] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMiniPlayerVisible, setIsMiniPlayerVisible] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isSimulatedRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  // Initialize Audio
  useEffect(() => {
    const audio = new Audio();
    audio.src = KULASEKHARA_VERSE.audioPath;
    audio.preload = "auto";
    audio.volume = volume;
    audio.loop = false;
    audioRef.current = audio;

    // Trigger load and play immediately on mount
    audio.load();
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
          removeUnlockListeners();
        })
        .catch(() => {
          setAutoplayBlocked(true);
        });
    }

    const onCanPlay = () => {
      setIsLoaded(true);
    };

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
        isSimulatedRef.current = false;
        setIsLoaded(true);
      }
    };

    const onTimeUpdate = () => {
      if (!isSimulatedRef.current) {
        setCurrentTime(audio.currentTime);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const onError = () => {
      isSimulatedRef.current = true;
      setIsLoaded(true);
    };

    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    // Bypassing autoplay blocks with user gesture unlock listeners
    const unlockAutoplay = () => {
      audio.play()
        .then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
          removeUnlockListeners();
        })
        .catch(err => console.log("Autoplay unlock failed", err));
    };

    const removeUnlockListeners = () => {
      window.removeEventListener("click", unlockAutoplay);
      window.removeEventListener("touchstart", unlockAutoplay);
      window.removeEventListener("keydown", unlockAutoplay);
    };

    window.addEventListener("click", unlockAutoplay);
    window.addEventListener("touchstart", unlockAutoplay);
    window.addEventListener("keydown", unlockAutoplay);

    return () => {
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      removeUnlockListeners();
      audio.pause();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Simulated timer for fallback audio
  useEffect(() => {
    if (isPlaying && isSimulatedRef.current) {
      timerRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, duration]);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!isSimulatedRef.current) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setAutoplayBlocked(false);
          })
          .catch((err) => {
            if (err.name === "NotAllowedError") {
              setAutoplayBlocked(true);
            } else {
              isSimulatedRef.current = true;
              setIsPlaying(true);
              setAutoplayBlocked(false);
            }
          });
      }
    } else {
      setIsPlaying(true);
      setAutoplayBlocked(false);
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current && !isSimulatedRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    if (audioRef.current && !isSimulatedRef.current) {
      audioRef.current.currentTime = time;
    }
    setCurrentTime(time);
  }, []);

  const setVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    setVolumeState(clamped);
    setIsMuted(clamped === 0);
  }, []);

  return {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    autoplayBlocked,
    isModalOpen,
    isMiniPlayerVisible,
    isLoaded,
    togglePlay,
    play,
    pause,
    seek,
    setVolume,
    setIsModalOpen,
    setIsMiniPlayerVisible,
  };
}
