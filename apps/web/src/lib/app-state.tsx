import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
  type ReactNode,
} from "react";
import {
  type CategoryId,
  type Track,
  tracks as staticTracks,
  programs as staticPrograms,
  notifications as staticNotifications,
} from "@/lib/content";
import { api, storeTokens, clearTokens, getAccessToken, BASE_URL } from "@/lib/api";
import Hls from "hls.js";

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
  loginWithGoogle: (
    idToken: string,
    category?: string,
  ) => Promise<{ success: boolean; message: string }>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    category: string;
  }) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;

  // Data State
  tracks: Track[];
  programs: any[];
  loading: boolean;
  fetchTracksAndPrograms: (cat: CategoryId) => Promise<void>;

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
  play: (t: Track, programId?: string) => void;
  toggle: () => void;
  seek: (s: number) => void;
  skip: (delta: number) => void;
  next: () => void;
  previous: () => void;
  stop: () => void;
  close: () => void;
  trackProgress: Record<string, number>;
  historyList: any[];
  continueListeningList: any[];
  fetchHistoryAndContinueListening: () => Promise<void>;
  notifications: Array<{
    id: string;
    kind: string;
    title: string;
    time: string;
    body: string;
    unread: boolean;
    group: string;
  }>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  // ── Auth State ────────────────────────────────────────
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ── Data State ────────────────────────────────────────
  const [tracksList, setTracksList] = useState<Track[]>([]);
  const [programsList, setProgramsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
  const [currentProgramId, setCurrentProgramId] = useState<string | null>(null);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [continueListeningList, setContinueListeningList] = useState<any[]>([]);
  const [notificationsList, setNotificationsList] = useState(() => [...staticNotifications]);

  const markAsRead = useCallback((id: string) => {
    setNotificationsList((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotificationsList((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, []);

  const currentRef = useRef<Track | null>(null);
  const currentProgramIdRef = useRef<string | null>(null);
  const lastSyncedPosRef = useRef<number>(0);

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  const [trackProgress, setTrackProgress] = useState<Record<string, number>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ks_track_progress");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return {};
        }
      }
    }
    return {};
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const getAudioElement = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!audioRef.current) {
      const audio = new Audio();
      audioRef.current = audio;

      // Update position on timeupdate
      audio.addEventListener("timeupdate", () => {
        const currentPos = Math.round(audio.currentTime);
        setPosition(currentPos);

        // Update progress percentage
        if (audio.duration && audio.duration > 0) {
          const progressPercent = Math.round((audio.currentTime / audio.duration) * 100);
          setTrackProgress((prev) => {
            const currentTrackId = audio.getAttribute("data-track-id") || "";
            if (currentTrackId && prev[currentTrackId] !== progressPercent) {
              const updated = { ...prev, [currentTrackId]: progressPercent };
              localStorage.setItem("ks_track_progress", JSON.stringify(updated));
              return updated;
            }
            return prev;
          });

          // Sync position to D1 on 10s intervals
          const currentTrack = currentRef.current;
          if (currentTrack && !currentTrack.audioUrl) {
            const posSeconds = Math.round(audio.currentTime);
            const shouldSync =
              Math.abs(posSeconds - lastSyncedPosRef.current) >= 10 || progressPercent >= 99;
            if (shouldSync) {
              lastSyncedPosRef.current = posSeconds;
              api.progress
                .update(
                  currentTrack.id,
                  posSeconds,
                  Math.round(audio.duration),
                  progressPercent >= 99,
                  currentProgramIdRef.current || undefined,
                )
                .catch((err) => console.warn(err));
            }
          }
        }
      });

      // Handle pause/play from browser control/interruptions
      audio.addEventListener("play", () => setPlaying(true));
      audio.addEventListener("pause", () => {
        setPlaying(false);
        const currentTrack = currentRef.current;
        if (currentTrack && !currentTrack.audioUrl) {
          api.progress
            .update(
              currentTrack.id,
              Math.round(audio.currentTime),
              Math.round(audio.duration || currentTrack.duration),
              false,
              currentProgramIdRef.current || undefined,
            )
            .catch((err) => console.warn(err));
        }
      });
    }
    return audioRef.current;
  }, []);

  // ── Fetch Functions ───────────────────────────────────
  const fetchTracksAndPrograms = useCallback(async (cat: CategoryId) => {
    setLoading(true);
    try {
      const [tRes, pRes] = await Promise.all([
        api.tracks.list({ category: cat }),
        api.programs.list({ category: cat }),
      ]);
      if (tRes.success && tRes.data) {
        const tList = Array.isArray(tRes.data) ? tRes.data : tRes.data.data || [];
        const mappedTracks = tList.map((t: any) => ({
          ...t,
          art: t.thumbnailKey ? `${BASE_URL}/storage/file/${t.thumbnailKey}` : undefined,
          raga: t.subtitle || "",
          purpose: (t.purposeTags && t.purposeTags[0]?.name) || t.description || "Healing",
        }));
        setTracksList(mappedTracks);

        // Update live arrays in content.ts
        staticTracks.length = 0;
        staticTracks.push(...mappedTracks);
      }
      if (pRes.success && pRes.data) {
        const pList = Array.isArray(pRes.data) ? pRes.data : pRes.data.data || [];
        const mappedPrograms = pList.map((p: any) => ({
          ...p,
          art: p.thumbnailKey ? `${BASE_URL}/storage/file/${p.thumbnailKey}` : undefined,
          benefits: p.description ? [p.description] : ["Curated therapeutic music"],
          usage: "Daily recommended session",
          trackIds: [],
        }));
        setProgramsList(mappedPrograms);

        staticPrograms.length = 0;
        staticPrograms.push(...mappedPrograms);
      }
    } catch (err) {
      console.error("Failed to load tracks or programs from API", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync category-specific files
  useEffect(() => {
    fetchTracksAndPrograms(category);
  }, [category, fetchTracksAndPrograms]);

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

  const loginWithGoogle = useCallback(async (idToken: string, category?: string) => {
    try {
      const res = await api.auth.googleLogin(idToken, category);

      if (res.success && res.data) {
        storeTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
        const me = await api.get<AuthUser>("/auth/me");
        if (me.success && me.data) {
          setUser(me.data);
          if (me.data.profile?.category) {
            setCategory(me.data.profile.category as CategoryId);
          }
        }
        return { success: true, message: "Login successful" };
      }
      return { success: false, message: res.message || "Google login failed" };
    } catch {
      return { success: false, message: "Network error. Please try again." };
    }
  }, []);

  const register = useCallback(
    async (data: { email: string; password: string; fullName: string; category: string }) => {
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
    },
    [],
  );

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

  // Clean up player on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  // Sync playback speed
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = speed;
    }
  }, [speed]);

  // Sync volume and muted
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = muted ? 0 : volume / 100;
    }
  }, [volume, muted]);

  // Sleep timer implementation
  useEffect(() => {
    if (sleepTimer === null || !playing) return;
    const ms = sleepTimer * 60 * 1000;
    const timerId = setTimeout(() => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        setPlaying(false);
      }
      setSleepTimer(null);
    }, ms);
    return () => clearTimeout(timerId);
  }, [sleepTimer, playing]);

  const fetchFavorites = useCallback(async () => {
    try {
      const res = await api.favorites.list("track");
      if (res.success && Array.isArray(res.data)) {
        setFavorites(res.data.map((fav: any) => fav.id));
      }
    } catch (err) {
      console.warn("Failed to fetch favorites", err);
    }
  }, []);

  const fetchHistoryAndContinueListening = useCallback(async () => {
    try {
      const [histRes, contRes] = await Promise.all([
        api.progress.history(),
        api.progress.continueListening(),
      ]);
      if (histRes.success && Array.isArray(histRes.data)) {
        setHistoryList(histRes.data);
      }
      if (contRes.success && Array.isArray(contRes.data)) {
        setContinueListeningList(contRes.data);
      }
    } catch (err) {
      console.warn("Failed to fetch history/continue lists", err);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchFavorites();
      fetchHistoryAndContinueListening();
    } else {
      setFavorites([]);
      setHistoryList([]);
      setContinueListeningList([]);
    }
  }, [user, fetchFavorites, fetchHistoryAndContinueListening]);

  const toggleFavorite = useCallback(
    async (id: string) => {
      const isFav = favorites.includes(id);

      // Optimistic UI update
      setFavorites((prev) => (isFav ? prev.filter((x) => x !== id) : [...prev, id]));

      try {
        if (isFav) {
          const res = await api.favorites.remove(id);
          if (!res.success) throw new Error("API call failed");
        } else {
          const res = await api.favorites.add(id, "track");
          if (!res.success) throw new Error("API call failed");
        }
        fetchHistoryAndContinueListening();
      } catch (err) {
        console.error("Failed to toggle favorite", err);
        // Revert optimistic update on error
        setFavorites((prev) => (isFav ? [...prev, id] : prev.filter((x) => x !== id)));
      }
    },
    [favorites, fetchHistoryAndContinueListening],
  );

  const play = useCallback(
    async (t: Track, programId?: string) => {
      if (typeof window === "undefined") return;

      const audio = getAudioElement();
      if (!audio) return;

      // Reset previous HLS/source
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      audio.src = "";

      setCurrent(t);
      setCurrentProgramId(programId ?? null);
      currentProgramIdRef.current = programId ?? null;
      setPosition(0);
      setPlaying(false);
      audio.setAttribute("data-track-id", t.id);
      lastSyncedPosRef.current = 0;

      // Get saved position from backend D1 (skip if playing a direct public URL)
      let initialPos = 0;
      if (!t.audioUrl) {
        try {
          const progressRes = await api.progress.getTrackProgress(t.id);
          if (progressRes.success && progressRes.data) {
            initialPos = progressRes.data.position || 0;
          }
        } catch (err) {
          console.warn("Failed to get track progress", err);
        }
      }

      try {
        let absoluteStreamUrl = "";
        if (t.audioUrl) {
          absoluteStreamUrl = t.audioUrl;
        } else {
          // 1. Get playback ticket
          const res = await api.stream.getTicket(t.id);
          if (!res.success || !res.data) {
            throw new Error(res.message || "Failed to get streaming ticket");
          }

          const { streamUrl } = res.data;
          const origin = BASE_URL.endsWith("/api/v1") ? BASE_URL.slice(0, -7) : BASE_URL;
          absoluteStreamUrl = `${origin}${streamUrl}`;
        }

        const isM3u8 = absoluteStreamUrl.includes(".m3u8");

        // 2. Play stream using Hls.js or native playback
        if (isM3u8 && Hls.isSupported()) {
          const hls = new Hls();
          hlsRef.current = hls;
          hls.loadSource(absoluteStreamUrl);
          hls.attachMedia(audio);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            audio.playbackRate = speed;
            audio.volume = muted ? 0 : volume / 100;
            audio.currentTime = initialPos;
            audio
              .play()
              .then(() => setPlaying(true))
              .catch((err) => console.error("Playback failed to start", err));
          });
          hls.on(Hls.Events.ERROR, async (event, data) => {
            if (data.fatal) {
              if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                const statusCode = data.response?.code;
                // If unauthorized or forbidden, the streaming ticket has expired!
                if (statusCode === 401 || statusCode === 403) {
                  console.log(
                    "Stream ticket expired (HTTP " + statusCode + "), renewing ticket...",
                  );
                  try {
                    const currentTrack = currentRef.current;
                    if (currentTrack && !currentTrack.audioUrl) {
                      const res = await api.stream.getTicket(currentTrack.id);
                      if (res.success && res.data) {
                        const { streamUrl } = res.data;
                        const origin = BASE_URL.endsWith("/api/v1")
                          ? BASE_URL.slice(0, -7)
                          : BASE_URL;
                        const absoluteStreamUrl = `${origin}${streamUrl}`;

                        // Save current position before reloading
                        const currentPos = audio.currentTime;

                        hls.loadSource(absoluteStreamUrl);
                        audio.currentTime = currentPos;
                        audio
                          .play()
                          .then(() => setPlaying(true))
                          .catch((e) => console.error(e));
                        return;
                      }
                    }
                  } catch (err) {
                    console.error("Failed to renew stream ticket", err);
                  }
                }
                hls.startLoad();
              } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              } else {
                hls.destroy();
                hlsRef.current = null;
              }
            }
          });
        } else if (!isM3u8 || audio.canPlayType("application/vnd.apple.mpegurl")) {
          // Native MP3/M4A/etc. playback (e.g. direct public URLs or non-HLS safari streams)
          audio.src = absoluteStreamUrl;
          audio.addEventListener(
            "canplay",
            () => {
              audio.playbackRate = speed;
              audio.volume = muted ? 0 : volume / 100;
              audio.currentTime = initialPos;
              audio
                .play()
                .then(() => setPlaying(true))
                .catch((err) => console.error("Native playback failed to start", err));
            },
            { once: true },
          );

          if (!t.audioUrl) {
            audio.addEventListener(
              "error",
              async () => {
                const error = audio.error;
                if (
                  error &&
                  (error.code === error.MEDIA_ERR_NETWORK ||
                    error.code === error.MEDIA_ERR_SRC_NOT_SUPPORTED)
                ) {
                  console.log("Native audio element network error, attempting ticket renewal...");
                  try {
                    const currentTrack = currentRef.current;
                    if (currentTrack) {
                      const res = await api.stream.getTicket(currentTrack.id);
                      if (res.success && res.data) {
                        const { streamUrl } = res.data;
                        const origin = BASE_URL.endsWith("/api/v1")
                          ? BASE_URL.slice(0, -7)
                          : BASE_URL;
                        const absoluteStreamUrl = `${origin}${streamUrl}`;
                        const currentPos = audio.currentTime;
                        audio.src = absoluteStreamUrl;
                        audio.currentTime = currentPos;
                        audio
                          .play()
                          .then(() => setPlaying(true))
                          .catch((e) => console.error(e));
                      }
                    }
                  } catch (err) {
                    console.error("Failed to renew ticket natively", err);
                  }
                }
              },
              { once: true },
            );
          }
        } else {
          console.error("HLS streaming is not supported in this browser");
        }
      } catch (err) {
        console.error("Failed to load and play HLS track", err);
      }
    },
    [getAudioElement, speed, volume, muted],
  );

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch((err) => console.error("Playback failed to start", err));
    }
  }, [playing, current]);

  const seek = useCallback((s: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = s;
      setPosition(s);
    }
  }, []);

  const skip = useCallback(
    (delta: number) => {
      const audio = audioRef.current;
      if (audio && current) {
        const newPos = Math.max(0, Math.min(current.duration, audio.currentTime + delta));
        audio.currentTime = newPos;
        setPosition(newPos);
      }
    },
    [current],
  );

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
    setPlaying(false);
  }, []);

  const close = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = "";
    }
    setCurrent(null);
    setPlaying(false);
    setPosition(0);
  }, []);

  const queue = useMemo(() => {
    if (!current || tracksList.length === 0) return tracksList.slice(0, 5);
    const i = tracksList.findIndex((t) => t.id === current.id);
    if (i === -1) return tracksList.slice(0, 5);
    return [...tracksList.slice(i + 1), ...tracksList.slice(0, i)].slice(0, 6);
  }, [current, tracksList]);

  const step = useCallback(
    (dir: 1 | -1) => {
      if (!current || tracksList.length === 0) return;
      const i = tracksList.findIndex((t) => t.id === current.id);
      const idx = i === -1 ? 0 : i;
      const nextTrack = tracksList[(idx + dir + tracksList.length) % tracksList.length];
      if (nextTrack) play(nextTrack);
    },
    [current, play, tracksList],
  );

  // Sync ended event to play next track
  const stepRef = useRef(step);
  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    const audio = getAudioElement();
    if (!audio) return;
    const handleEnded = () => {
      stepRef.current(1); // Go to next track
    };
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [getAudioElement]);

  // ── Context Value ─────────────────────────────────────
  const value = useMemo<AppState>(
    () => ({
      // Auth
      user,
      isAuthenticated: !!user,
      authLoading,
      login,
      loginWithGoogle,
      register,
      logout,
      restoreSession,

      // Data state
      tracks: tracksList,
      programs: programsList,
      loading,
      fetchTracksAndPrograms,

      // App
      category,
      setCategory,
      favorites,
      toggleFavorite,
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
      toggle,
      seek,
      skip,
      next: () => step(1),
      previous: () => step(-1),
      stop: () => {
        const audio = audioRef.current;
        if (audio) {
          audio.pause();
          const currentTrack = currentRef.current;
          if (currentTrack && !currentTrack.audioUrl) {
            api.progress
              .update(
                currentTrack.id,
                Math.round(audio.currentTime),
                Math.round(audio.duration || currentTrack.duration),
                false,
                currentProgramIdRef.current || undefined,
              )
              .catch((err) => console.warn(err));
          }
        }
        setPlaying(false);
      },
      close,
      trackProgress,
      historyList,
      continueListeningList,
      fetchHistoryAndContinueListening,
      notifications: notificationsList,
      markAsRead,
      markAllAsRead,
    }),
    [
      user,
      authLoading,
      login,
      loginWithGoogle,
      register,
      logout,
      restoreSession,
      tracksList,
      programsList,
      loading,
      fetchTracksAndPrograms,
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
      toggle,
      seek,
      skip,
      stop,
      close,
      trackProgress,
      historyList,
      continueListeningList,
      notificationsList,
      markAsRead,
      markAllAsRead,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
