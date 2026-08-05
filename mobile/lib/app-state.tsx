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

/** Category-specific color palettes (hex values for RN) */
export const categoryThemes: Record<
  CategoryId,
  { cat: string; catLight: string; catAccent: string; catForeground: string }
> = {
  devotional: {
    cat: "#7A1E2C",
    catLight: "#F2E0E3",
    catAccent: "#C9A84C",
    catForeground: "#FCFCFC",
  },
  secular: {
    cat: "#0F766E",
    catLight: "#E6F5F3",
    catAccent: "#0F766E",
    catForeground: "#FCFCFC",
  },
  pregnancy: {
    cat: "#C07B8A",
    catLight: "#F5E4E8",
    catAccent: "#C07B8A",
    catForeground: "#FCFCFC",
  },
};

type AppState = {
  category: CategoryId;
  setCategory: (c: CategoryId) => void;
  theme: (typeof categoryThemes)["devotional"];
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
  const [current, setCurrent] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(312);
  const [speed, setSpeed] = useState(1);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);

  const theme = categoryThemes[category];

  useEffect(() => {
    if (!playing || !current) return;
    const id = setInterval(() => {
      setPosition((p) =>
        p + speed >= current.duration ? current.duration : p + speed
      );
    }, 1000);
    return () => clearInterval(id);
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
      theme,
      favorites,
      toggleFavorite: (id) =>
        setFavorites((f) =>
          f.includes(id) ? f.filter((x) => x !== id) : [...f, id]
        ),
      isFavorite: (id) => favorites.includes(id),
      savedPrograms,
      toggleSavedProgram: (id) =>
        setSavedPrograms((f) =>
          f.includes(id) ? f.filter((x) => x !== id) : [...f, id]
        ),
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
          Math.max(0, Math.min(current ? current.duration : 0, p + delta))
        ),
      stop: () => setPlaying(false),
    }),
    [
      category,
      theme,
      favorites,
      savedPrograms,
      current,
      playing,
      position,
      speed,
      sleepTimer,
      play,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
