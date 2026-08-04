import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  sleepTimer: number | null;
  setSleepTimer: (m: number | null) => void;
  play: (t: Track) => void;
  toggle: () => void;
  seek: (s: number) => void;
  skip: (delta: number) => void;
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
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const raf = useRef<number | null>(null);

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
      sleepTimer,
      setSleepTimer,
      play,
      toggle: () => setPlaying((p) => !p),
      seek: (s) => setPosition(s),
      skip: (delta) =>
        setPosition((p) =>
          Math.max(0, Math.min(current ? current.duration : 0, p + delta)),
        ),
      stop: () => setPlaying(false),
    }),
    [category, favorites, savedPrograms, current, playing, position, speed, sleepTimer, play],
  );

  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
