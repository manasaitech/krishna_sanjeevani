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
import { api, storeTokens, clearTokens, getAccessToken } from "@/lib/api";

// ── Auth Types ─────────────────────────────────────────
export type AuthUser = {
  id: string;
  email: string;
  role: string;
  status: string;
  emailVerified: number;
  profile: {
    fullName: string;
    profileImage: string | null;
    category: string;
    language: string | null;
  } | null;
};

type AppState = {
  // Auth
  user: AuthUser | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (data: { email: string; password: string; fullName: string; category: string }) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;

  // Player & App
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
  close: () => void;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  // ── Auth State ────────────────────────────────────────
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ── Player State ──────────────────────────────────────
  const [category, setCategory] = useState<CategoryId>("devotional");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [savedPrograms, setSavedPrograms] = useState<string[]>([]);
  const [current, setCurrent] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(72);
  const [muted, setMuted] = useState(false);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);

  // ── Auth Actions ──────────────────────────────────────
  const restoreSession = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setAuthLoading(false);
      return;
    }

    try {
      const res = await api.get<AuthUser>("/auth/me");
      if (res.success && res.data) {
        setUser(res.data);
        // Sync category from profile
        if (res.data.profile?.category) {
          setCategory(res.data.profile.category as CategoryId);
        }
      } else {
        clearTokens();
      }
    } catch {
      clearTokens();
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await api.post<{
        user: { id: string; email: string; role: string };
        tokens: { accessToken: string; refreshToken: string };
      }>("/auth/login", { email, password });

      if (res.success && res.data) {
        storeTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
        // Fetch full profile
        const me = await api.get<AuthUser>("/auth/me");
        if (me.success && me.data) {
          setUser(me.data);
          if (me.data.profile?.category) {
            setCategory(me.data.profile.category as CategoryId);
          }
        }
        return { success: true, message: "Login successful" };
      }
      return { success: false, message: res.message || "Login failed" };
    } catch {
      return { success: false, message: "Network error. Please try again." };
    }
  }, []);

  const register = useCallback(async (data: { email: string; password: string; fullName: string; category: string }) => {
    try {
      const res = await api.post<{
        user: { id: string; email: string; role: string };
        tokens: { accessToken: string; refreshToken: string };
      }>("/auth/register", data);

      if (res.success && res.data) {
        storeTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
        const me = await api.get<AuthUser>("/auth/me");
        if (me.success && me.data) {
          setUser(me.data);
          if (me.data.profile?.category) {
            setCategory(me.data.profile.category as CategoryId);
          }
        }
        return { success: true, message: "Account created successfully" };
      }
      return { success: false, message: res.message || "Registration failed" };
    } catch {
      return { success: false, message: "Network error. Please try again." };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Continue even if network fails
    } finally {
      clearTokens();
      setUser(null);
    }
  }, []);

  // Restore session on mount
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // ── Player Effects ────────────────────────────────────
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

  // ── Context Value ─────────────────────────────────────
  const value = useMemo<AppState>(
    () => ({
      // Auth
      user,
      isAuthenticated: !!user,
      authLoading,
      login,
      register,
      logout,
      restoreSession,

      // App
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
      close: () => {
        setCurrent(null);
        setPlaying(false);
      },
    }),
    [
      user,
      authLoading,
      login,
      register,
      logout,
      restoreSession,
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
