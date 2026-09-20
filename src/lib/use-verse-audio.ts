import { useEffect, useRef, useState, useCallback } from "react";
import { KULASEKHARA_VERSE } from "./home-data";
import { useApp } from "./app-state";

import chaitanyaImg from "@/assets/18fc75d6-df05-469c-9855-d79c4931636d.webp";
import fluteImg from "@/assets/cbabb2a5-2787-4997-986f-daf7b88017ff.webp";
import kulashekaraImg from "@/assets/kulashekara-cutout.webp";

export interface SacredTrack {
  id: string;
  title: string;
  artist: string;
  raga: string;
  durationText: string;
  audioPath: string;
  image: string;
}

export const SACRED_TRACKS: SacredTrack[] = [
  {
    id: "track_kulasekhara",
    title: "Mukundamālā Stotra — Verse 24",
    artist: "King Kulasekhara Alvar",
    raga: "Vedic Classical Raga",
    durationText: "2:48",
    audioPath: "/audio/kulasekhara-verse.mp3",
    image: kulashekaraImg,
  },
  {
    id: "track_mahamantra",
    title: "Hare Krishna Mahamantra",
    artist: "Transcendental Kirtan",
    raga: "Raga Kalyani",
    durationText: "4:45",
    audioPath: "/audio/hare-krishna-mahamantra.mp3",
    image: fluteImg,
  },
  {
    id: "track_chaitanya",
    title: "Śrī Śikṣāṣṭakam — Verse 1",
    artist: "Lord Sri Chaitanya Mahaprabhu",
    raga: "Raga Yaman",
    durationText: "3:12",
    audioPath: "/audio/chaitanya-verse.mp3",
    image: chaitanyaImg,
  },
];

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
  currentTrack: SacredTrack;
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  playTrack: (track: SacredTrack) => void;
  seek: (time: number) => void;
  setVolume: (val: number) => void;
  setIsModalOpen: (open: boolean) => void;
  setIsMiniPlayerVisible: (visible: boolean) => void;
}

export function useVerseAudio(): VerseAudioState {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(168);
  const [volume, setVolumeState] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMiniPlayerVisible, setIsMiniPlayerVisible] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<SacredTrack>(SACRED_TRACKS[0]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isSimulatedRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  const app = useApp();

  useEffect(() => {
    if (app.playing && isPlaying) {
      if (audioRef.current && !isSimulatedRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    }
  }, [app.playing, isPlaying]);

  // Initialize Audio
  useEffect(() => {
    const audio = new Audio();
    audio.src = currentTrack.audioPath;
    audio.preload = "auto";
    audio.volume = volume;
    audio.loop = false;
    audioRef.current = audio;

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

    return () => {
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
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

    if (app.playing) {
      app.stop();
    }

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
  }, [app]);

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

  const playTrack = useCallback((track: SacredTrack) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrack.id === track.id) {
      togglePlay();
      return;
    }

    // Switch track source
    setCurrentTrack(track);
    audio.pause();
    audio.src = track.audioPath;
    audio.currentTime = 0;
    setCurrentTime(0);
    audio.load();

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        })
        .catch(() => {
          setIsPlaying(true);
        });
    }
  }, [currentTrack.id, togglePlay]);

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
    currentTrack,
    togglePlay,
    play,
    pause,
    playTrack,
    seek,
    setVolume,
    setIsModalOpen,
    setIsMiniPlayerVisible,
  };
}
