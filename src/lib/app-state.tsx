import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { tracks, type CategoryId, type Track } from "@/lib/content";

type AppState = {
  category: CategoryId;
  setCategory: (c: CategoryId) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  savedPrograms: string[];
  toggleSavedProgram: (id: string) => void;
  current: Track | null;
  playing: boolean;
  position: number;
  speed: number;
  setSpeed: (s: number) => void;
  volume: number;
  setVolume: (v: number) => void;
  muted: boolean;
  toggleMuted: () => void;
  queue: Track[];
  sleepTimer: number | null;
  setSleepTimer: (m: number | null) => void;
  play: (t: Track) => void;
  toggle: () => void;
  seek: (s: number) => void;
  skip: (delta: number) => void;
  next: () => void;
  previous: () => void;
  stop: () => void;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [category, setCategory] = useState<CategoryId>("devotional");
  const [favorites, setFavorites] = useState<string[]>(["t2", "t5"]);
  const [savedPrograms, setSavedPrograms] = useState<string[]>(["p1"]);
  const [current, setCurrent] = useState<Track | null>(tracks[0] ?? null);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(312);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(72);
  const [muted, setMuted] = useState(false);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-category", category);
    }
  }, [category]);

  useEffect(() => {
    if (!playing || !current) return;
    const id = window.setInterval(() => {
      setPosition((p) => (p + speed >= current.duration ? current.duration : p + speed));
    }, 1000);
    return () => window.clearInterval(id);
  }, [playing, current, speed]);

  const play = useCallback((t: Track) => {
    setCurrent((prev) => {
      if (prev?.id !== t.id) setPosition(0);
      return t;
    });
    setPlaying(true);
  }, []);

  const queue = useMemo(() => {
    if (!current) return tracks.slice(0, 5);
    const i = tracks.findIndex((t) => t.id === current.id);
    return [...tracks.slice(i + 1), ...tracks.slice(0, i)].slice(0, 6);
  }, [current]);

  const step = useCallback(
    (dir: 1 | -1) => {
      if (!current) return;
      const i = tracks.findIndex((t) => t.id === current.id);
      const nextTrack = tracks[(i + dir + tracks.length) % tracks.length];
      if (nextTrack) play(nextTrack);
    },
    [current, play],
  );

  const value = useMemo<AppState>(
    () => ({
      category,
      setCategory,
      favorites,
      toggleFavorite: (id) =>
        setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id])),
      isFavorite: (id) => favorites.includes(id),
      savedPrograms,
      toggleSavedProgram: (id) =>
        setSavedPrograms((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id])),
      current,
      playing,
      position,
      speed,
      setSpeed,
      volume,
      setVolume,
      muted,
      toggleMuted: () => setMuted((m) => !m),
      queue,
      sleepTimer,
      setSleepTimer,
      play,
      toggle: () => setPlaying((p) => !p),
      seek: (s) => setPosition(s),
      skip: (delta) =>
        setPosition((p) =>
          Math.max(0, Math.min(current ? current.duration : 0, p + delta)),
        ),
      next: () => step(1),
      previous: () => step(-1),
      stop: () => setPlaying(false),
    }),
    [
      category,
      favorites,
      savedPrograms,
      current,
      playing,
      position,
      speed,
      volume,
      muted,
      queue,
      sleepTimer,
      play,
      step,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
