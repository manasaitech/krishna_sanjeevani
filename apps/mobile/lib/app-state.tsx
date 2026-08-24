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
import { Platform } from "react-native";
import { type CategoryId, type Track, tracks as staticTracks, programs as staticPrograms } from "@/lib/content";
import { api, storeTokens, clearTokens, getAccessToken, BASE_URL, loadPersistedTokens, registerAuthFailureHandler } from "@/lib/api";
import { Alert } from "react-native";
import { playerService } from "./player-service";
import { AVPlaybackStatus } from "expo-av";
import { router } from "expo-router";
import { signOutGoogle } from "./google-auth";

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
  // Auth
  user: any | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (data: { email: string; password: string; fullName: string; category: string }) => Promise<{ success: boolean; message: string; errors?: any[] }>;
  loginWithGoogle: (idToken: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  updateProfile: (fullName?: string, language?: string) => Promise<{ success: boolean; message: string }>;

  // Data
  tracks: Track[];
  programs: any[];
  loading: boolean;
  fetchTracksAndPrograms: (cat: CategoryId) => Promise<void>;

  // Player & App
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
  play: (t: Track, programId?: string) => void;
  toggle: () => void;
  seek: (s: number) => void;
  skip: (delta: number) => void;
  stop: () => void;
  trackProgress: Record<string, number>;
  buffering: boolean;
  historyList: any[];
  continueListeningList: any[];
  fetchHistoryAndContinueListening: () => Promise<void>;

  // Authoritative Audio Player additions
  currentTrack: Track | null;
  currentProgram: any | null;
  queue: Track[];
  queueIndex: number;
  volume: number;
  muted: boolean;
  playbackRate: number;
  error: string | null;
  setVolume: (v: number) => void;
  setMuted: (m: boolean) => void;
  setPlaybackRate: (r: number) => void;
  next: () => void;
  previous: () => void;
  close: () => void;
  setQueue: (tracks: Track[], index?: number) => void;
  addToQueue: (track: Track) => void;
  clearQueue: () => void;

  // Notifications additions
  notifications: any[];
  unreadCount: number;
  notificationsLoading: boolean;
  notificationsError: string | null;
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  // ── Auth State ──
  const [user, setUser] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ── Data State ──
  const [tracksList, setTracksList] = useState<Track[]>([]);
  const [programsList, setProgramsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ── Player & UI State ──
  const [category, setCategory] = useState<CategoryId>("devotional");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [savedPrograms, setSavedPrograms] = useState<string[]>([]);
  const [current, setCurrent] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [buffering, setBuffering] = useState(false);
  const [currentProgramId, setCurrentProgramId] = useState<string | null>(null);
  const [trackPositions, setTrackPositions] = useState<Record<string, number>>({});
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [continueListeningList, setContinueListeningList] = useState<any[]>([]);

  // Authoritative Audio Player States
  const [queue, setQueueState] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.8);
  const [muted, setMutedState] = useState<boolean>(false);
  const [error, setErrorState] = useState<string | null>(null);

  // Notifications States
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notificationsLoading, setNotificationsLoading] = useState<boolean>(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);

  const queueRef = useRef<Track[]>([]);
  const queueIndexRef = useRef<number>(0);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    queueIndexRef.current = queueIndex;
  }, [queueIndex]);

  const currentRef = useRef<Track | null>(null);
  const currentProgramIdRef = useRef<string | null>(null);
  const retryCountRef = useRef(0);
  const lastSyncedPosRef = useRef<number>(0);
  const statusCallbackRef = useRef<(status: AVPlaybackStatus) => void>(() => {});

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  useEffect(() => {
    currentProgramIdRef.current = currentProgramId;
  }, [currentProgramId]);

  const [trackProgress, setTrackProgress] = useState<Record<string, number>>(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
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

  const theme = categoryThemes[category];

  // ── Audio player references for Web ──
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<any>(null);

  const getAudioElement = useCallback(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return null;
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
        }
      });

      // Handle pause/play from browser control/interruptions
      audio.addEventListener("play", () => setPlaying(true));
      audio.addEventListener("pause", () => setPlaying(false));
    }
    return audioRef.current;
  }, []);

  // ── Fetch Functions ──
  const fetchTracksAndPrograms = useCallback(async (cat: CategoryId) => {
    setLoading(true);
    try {
      const [tRes, pRes] = await Promise.all([
        api.tracks.list({ category: cat }),
        api.programs.list({ category: cat }),
      ]);
      if (tRes.success && tRes.data) {
        const tList = Array.isArray(tRes.data) ? tRes.data : (tRes.data.data || []);
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
        const pList = Array.isArray(pRes.data) ? pRes.data : (pRes.data.data || []);
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
    } catch {
      // Keep existing list on failure
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTracksAndPrograms(category);
  }, [category, fetchTracksAndPrograms]);

  // Register auth failure callback
  useEffect(() => {
    registerAuthFailureHandler(() => {
      Alert.alert("Session Expired", "Your session has expired. Please log in again.");
      clearTokens().then(() => {
        setUser(null);
        router.replace("/welcome");
      }).catch(err => console.warn(err));
    });
  }, []);

  // Restore Session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await loadPersistedTokens();
        const token = getAccessToken();
        if (!token) {
          setAuthLoading(false);
          return;
        }
        const res = await api.auth.me();
        if (res.success && res.data) {
          setUser(res.data);
          if (res.data.profile?.category) {
            setCategory(res.data.profile.category as CategoryId);
          }
        } else {
          await clearTokens();
          setUser(null);
        }
      } catch {
        await clearTokens();
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

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
        api.progress.continueListening()
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

  const fetchNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    setNotificationsError(null);
    try {
      const [listRes, countRes] = await Promise.all([
        api.notifications.list(),
        api.notifications.unreadCount()
      ]);
      if (listRes.success && Array.isArray(listRes.data)) {
        setNotificationsList(listRes.data);
      } else {
        throw new Error(listRes.message || "Failed to fetch notifications");
      }
      if (countRes.success && countRes.data) {
        setUnreadCount(countRes.data.count);
      }
    } catch (err: any) {
      console.warn("Failed to fetch notifications", err);
      setNotificationsError(err.message || "Failed to load notifications");
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  const markNotificationRead = useCallback(async (id: string) => {
    // Optimistic Update
    setNotificationsList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      const res = await api.notifications.markAsRead(id);
      if (!res.success) {
        throw new Error(res.message);
      }
    } catch (err) {
      console.warn("Failed to mark notification read, rolling back...", err);
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const markAllNotificationsRead = useCallback(async () => {
    // Optimistic Update
    setNotificationsList((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      const res = await api.notifications.markAllAsRead();
      if (!res.success) {
        throw new Error(res.message);
      }
    } catch (err) {
      console.warn("Failed to mark all notifications read, rolling back...", err);
      fetchNotifications();
    }
  }, [fetchNotifications]);

  useEffect(() => {
    if (user) {
      fetchFavorites();
      fetchHistoryAndContinueListening();
      fetchNotifications();
    } else {
      setFavorites([]);
      setHistoryList([]);
      setContinueListeningList([]);
      setNotificationsList([]);
      setUnreadCount(0);
      setNotificationsError(null);
    }
  }, [user, fetchFavorites, fetchHistoryAndContinueListening, fetchNotifications]);

  const toggleFavorite = useCallback(async (id: string) => {
    const isFav = favorites.includes(id);

    // Optimistic UI update
    setFavorites((prev) =>
      isFav ? prev.filter((x) => x !== id) : [...prev, id]
    );

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
      setFavorites((prev) =>
        isFav ? [...prev, id] : prev.filter((x) => x !== id)
      );
      Alert.alert("Error", "Failed to update favorite. Please check connection.");
    }
  }, [favorites, fetchHistoryAndContinueListening]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await api.auth.login(email, password);
      if (res.success && res.data) {
        await storeTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
        const me = await api.auth.me();
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
      return { success: false, message: "Network error" };
    }
  }, []);

  const register = useCallback(async (data: { email: string; password: string; fullName: string; category: string }) => {
    try {
      const res = await api.auth.register(data.email, data.password, data.fullName, data.category);
      if (res.success && res.data) {
        await storeTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
        const me = await api.auth.me();
        if (me.success && me.data) {
          setUser(me.data);
          if (me.data.profile?.category) {
            setCategory(me.data.profile.category as CategoryId);
          }
        }
        return { success: true, message: "Registration successful" };
      }
      return { success: false, message: res.message || "Registration failed", errors: res.errors };
    } catch {
      return { success: false, message: "Network error" };
    }
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    try {
      const res = await api.auth.loginWithGoogle(idToken);
      if (res.success && res.data) {
        await storeTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
        const me = await api.auth.me();
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
      return { success: false, message: "Network error" };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch {
      // Continue locally on backend error
    }
    // Clear Google Credential Manager session so the next sign-in
    // correctly presents the account selector instead of auto-selecting.
    await signOutGoogle();
    await clearTokens();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (fullName?: string, language?: string) => {
    try {
      const res = await api.auth.updateProfile(fullName, language);
      if (res.success) {
        setUser((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            profile: {
              ...prev.profile,
              ...(fullName && { fullName }),
              ...(language && { language }),
            },
          };
        });
        return { success: true, message: "Profile updated successfully" };
      }
      return { success: false, message: res.message || "Failed to update profile" };
    } catch {
      return { success: false, message: "Network connection error" };
    }
  }, []);

  // Sleep Timer Handler
  useEffect(() => {
    if (sleepTimer === null || !playing) return;
    const ms = sleepTimer * 60 * 1000;
    const timerId = setTimeout(() => {
      if (Platform.OS === "web" && audioRef.current) {
        audioRef.current.pause();
      }
      setPlaying(false);
      setSleepTimer(null);
    }, ms);
    return () => clearTimeout(timerId);
  }, [sleepTimer, playing]);

  // Native Playback Sync Helpers
  const syncProgressToBackend = useCallback(async (trackId: string, position: number, duration: number, complete = false) => {
    const programId = currentProgramIdRef.current;
    try {
      await api.progress.update(trackId, position, duration, complete, programId || undefined);
    } catch (err) {
      console.warn("Failed to sync progress to backend", err);
    }
  }, []);

  const currentProgram = useMemo(() => {
    return programsList.find((p) => p.id === currentProgramId) || null;
  }, [programsList, currentProgramId]);

  const play = useCallback(async (t: Track, programId?: string) => {
    setCurrent(t);
    setCurrentProgramId(programId ?? null);
    setPosition(0);
    setPlaying(false);
    setBuffering(true);
    retryCountRef.current = 0;
    lastSyncedPosRef.current = 0;
    setErrorState(null);

    // Setup Queue
    let newQueue: Track[] = [];
    let newIndex = 0;

    if (programId) {
      try {
        const res = await api.programs.getTracks(programId);
        if (res.success && Array.isArray(res.data)) {
          const tList = res.data.map((pt: any) => {
            const track = pt.track || pt;
            return {
              ...track,
              art: track.thumbnailKey ? `${BASE_URL}/storage/file/${track.thumbnailKey}` : undefined,
              raga: track.subtitle || "",
              purpose: (track.purposeTags && track.purposeTags[0]?.name) || track.description || "Healing",
            };
          });
          newQueue = tList;
          const idx = newQueue.findIndex((q) => q.id === t.id);
          newIndex = idx !== -1 ? idx : 0;
        } else {
          newQueue = [t];
          newIndex = 0;
        }
      } catch (err) {
        newQueue = [t];
        newIndex = 0;
      }
    } else {
      const catTracks = tracksList.filter((track) => track.category === category);
      newQueue = catTracks.length > 0 ? catTracks : [t];
      const idx = newQueue.findIndex((q) => q.id === t.id);
      newIndex = idx !== -1 ? idx : 0;
    }

    setQueueState(newQueue);
    setQueueIndex(newIndex);

    if (Platform.OS !== "web" || typeof window === "undefined") {
      try {
        const res = await api.stream.getTicket(t.id);
        if (!res.success || !res.data) {
          throw new Error(res.message || "Failed to get streaming ticket");
        }

        const { streamUrl } = res.data;
        const origin = BASE_URL.endsWith("/api/v1") ? BASE_URL.slice(0, -7) : BASE_URL;
        const absoluteStreamUrl = `${origin}${streamUrl}`;

        // Get saved position from backend D1
        let initialPos = 0;
        try {
          const progressRes = await api.progress.getTrackProgress(t.id);
          if (progressRes.success && progressRes.data) {
            initialPos = progressRes.data.position || 0;
          }
        } catch (err) {
          console.warn("Failed to get track progress from backend", err);
        }

        await playerService.load(
          absoluteStreamUrl,
          initialPos,
          speed,
          volume,
          muted,
          (status) => statusCallbackRef.current(status)
        );
        await playerService.play();
      } catch (err: any) {
        console.error("Failed to load and play HLS track on mobile", err);
        setBuffering(false);
        setErrorState(err.message || "Playback error");
        Alert.alert("Playback Error", "Failed to load audio stream.");
      }
      return;
    }

    const audio = getAudioElement();
    if (!audio) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    audio.src = "";
    audio.setAttribute("data-track-id", t.id);
    audio.volume = muted ? 0 : volume;

    try {
      const res = await api.stream.getTicket(t.id);
      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to get streaming ticket");
      }

      const { streamUrl } = res.data;
      const origin = BASE_URL.endsWith("/api/v1") ? BASE_URL.slice(0, -7) : BASE_URL;
      const absoluteStreamUrl = `${origin}${streamUrl}`;

      let HlsClass: any = null;
      try {
        HlsClass = require("hls.js").default || require("hls.js");
      } catch (err) {
        console.warn("Failed to load hls.js on web", err);
      }

      if (HlsClass && HlsClass.isSupported()) {
        const hls = new HlsClass();
        hlsRef.current = hls;
        hls.loadSource(absoluteStreamUrl);
        hls.attachMedia(audio);
        hls.on(HlsClass.Events.MANIFEST_PARSED, () => {
          audio.playbackRate = speed;
          audio.play()
            .then(() => setPlaying(true))
            .catch((err) => console.error("Playback failed to start", err));
        });
        hls.on(HlsClass.Events.ERROR, (event: any, data: any) => {
          if (data.fatal) {
            switch (data.type) {
              case HlsClass.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case HlsClass.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                hlsRef.current = null;
                break;
            }
          }
        });
      } else if (audio.canPlayType("application/vnd.apple.mpegurl")) {
        audio.src = absoluteStreamUrl;
        audio.addEventListener("canplay", () => {
          audio.playbackRate = speed;
          audio.play()
            .then(() => setPlaying(true))
            .catch((err) => console.error("Native playback failed to start", err));
        }, { once: true });
      } else {
        console.error("HLS streaming is not supported in this browser");
      }
    } catch (err: any) {
      console.error("Failed to load and play HLS track", err);
      setErrorState(err.message || "Playback error");
    }
  }, [getAudioElement, speed, volume, muted, tracksList, category]);

  const next = useCallback(() => {
    const q = queueRef.current;
    const idx = queueIndexRef.current;
    if (idx + 1 < q.length) {
      const nextTrack = q[idx + 1];
      play(nextTrack, currentProgramIdRef.current || undefined);
    } else {
      setPlaying(false);
      if (currentProgramIdRef.current) {
        router.replace("/session-complete");
      }
    }
  }, [play]);

  const previous = useCallback(() => {
    const threshold = 3; // 3 seconds threshold
    if (position > threshold) {
      if (Platform.OS === "web" && audioRef.current) {
        audioRef.current.currentTime = 0;
      } else {
        playerService.seek(0).catch((err) => console.warn(err));
      }
      setPosition(0);
    } else {
      const idx = queueIndexRef.current;
      if (idx > 0) {
        const prevTrack = queueRef.current[idx - 1];
        play(prevTrack, currentProgramIdRef.current || undefined);
      } else {
        if (Platform.OS === "web" && audioRef.current) {
          audioRef.current.currentTime = 0;
        } else {
          playerService.seek(0).catch((err) => console.warn(err));
        }
        setPosition(0);
      }
    }
  }, [position, play]);

  const handlePlaybackComplete = useCallback(() => {
    const currentTrack = currentRef.current;
    if (!currentTrack) return;

    setTrackProgress((prev) => ({
      ...prev,
      [currentTrack.id]: 100,
    }));

    syncProgressToBackend(currentTrack.id, currentTrack.duration, currentTrack.duration, true);

    setTrackPositions((prev) => ({
      ...prev,
      [currentTrack.id]: 0,
    }));

    fetchHistoryAndContinueListening();
    
    // Trigger auto-next
    next();
  }, [syncProgressToBackend, fetchHistoryAndContinueListening, next]);

  const handlePlaybackError = useCallback(async (errorMsg: string) => {
    const currentTrack = currentRef.current;
    if (!currentTrack) return;

    if (retryCountRef.current < 1) {
      retryCountRef.current += 1;
      console.log("Playback error, renewing stream ticket...", errorMsg);
      try {
        const res = await api.stream.getTicket(currentTrack.id);
        if (res.success && res.data) {
          const { streamUrl } = res.data;
          const origin = BASE_URL.endsWith("/api/v1") ? BASE_URL.slice(0, -7) : BASE_URL;
          const absoluteStreamUrl = `${origin}${streamUrl}`;

          const currentPos = trackPositions[currentTrack.id] || 0;
          await playerService.load(
            absoluteStreamUrl,
            currentPos,
            speed,
            volume,
            muted,
            (status) => statusCallbackRef.current(status)
          );
          await playerService.play();
          return;
        }
      } catch (err) {
        console.error("Stream ticket renewal failed", err);
      }
    }

    await playerService.unload();
    setPlaying(false);
    setBuffering(false);
    setErrorState(errorMsg);
    Alert.alert("Playback Error", "Failed to stream audio. Please check your connection.");
  }, [speed, trackPositions, volume, muted]);

  // Sync ref to always run the latest callback on expo-av events
  useEffect(() => {
    statusCallbackRef.current = (status: AVPlaybackStatus) => {
      if (!status.isLoaded) {
        if (status.error) {
          console.error("Playback error status update", status.error);
          handlePlaybackError(status.error);
        }
        return;
      }

      setBuffering(status.isBuffering);
      setPlaying(status.isPlaying);

      const posSeconds = Math.round(status.positionMillis / 1000);
      setPosition(posSeconds);

      if (status.durationMillis) {
        const progressPercent = Math.round((status.positionMillis / status.durationMillis) * 100);

        const currentTrackId = currentRef.current?.id || "";
        if (currentTrackId) {
          setTrackPositions((prev) => {
            if (prev[currentTrackId] !== posSeconds) {
              return { ...prev, [currentTrackId]: posSeconds };
            }
            return prev;
          });

          setTrackProgress((prev) => {
            if (prev[currentTrackId] !== progressPercent) {
              return { ...prev, [currentTrackId]: progressPercent };
            }
            return prev;
          });

          // Sync progress to backend: every 10 seconds or when completing
          const durSeconds = Math.round(status.durationMillis / 1000);
          const shouldSync = Math.abs(posSeconds - lastSyncedPosRef.current) >= 10 || progressPercent >= 99;
          if (shouldSync) {
            lastSyncedPosRef.current = posSeconds;
            syncProgressToBackend(currentTrackId, posSeconds, durSeconds, progressPercent >= 99);
          }
        }
      }

      if (status.didJustFinish) {
        handlePlaybackComplete();
      }
    };
  });

  const value = useMemo<AppState>(
    () => ({
      user,
      isAuthenticated: !!user,
      authLoading,
      login,
      register,
      loginWithGoogle,
      logout,
      updateProfile,

      tracks: tracksList,
      programs: programsList,
      loading,
      fetchTracksAndPrograms,

      category,
      setCategory,
      theme,
      favorites,
      toggleFavorite,
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
      setSpeed: (s) => {
        setSpeed(s);
        if (Platform.OS === "web" && audioRef.current) {
          audioRef.current.playbackRate = s;
        } else {
          playerService.setSpeed(s).catch((err) => console.warn(err));
        }
      },
      sleepTimer,
      setSleepTimer,
      play,
      toggle: () => {
        if (Platform.OS === "web" && audioRef.current) {
          const audio = audioRef.current;
          if (playing) {
            audio.pause();
            setPlaying(false);
          } else {
            audio.play()
              .then(() => setPlaying(true))
              .catch((err) => console.error("Playback failed to start", err));
          }
        } else {
          if (playing) {
            playerService.pause().catch((err) => console.warn(err));
            setPlaying(false);
            // Sync final position when pausing
            const track = currentRef.current;
            if (track) {
              syncProgressToBackend(track.id, position, track.duration, false);
            }
          } else {
            playerService.play().catch((err) => console.warn(err));
            setPlaying(true);
          }
        }
      },
      seek: (s) => {
        if (Platform.OS === "web" && audioRef.current) {
          audioRef.current.currentTime = s;
        } else {
          playerService.seek(s).catch((err) => console.warn(err));
        }
        setPosition(s);
      },
      skip: (delta) => {
        if (Platform.OS === "web" && audioRef.current) {
          const audio = audioRef.current;
          const newPos = Math.max(0, Math.min(current ? current.duration : 0, audio.currentTime + delta));
          audio.currentTime = newPos;
          setPosition(newPos);
        } else {
          const newPos = Math.max(0, Math.min(current ? current.duration : 0, position + delta));
          playerService.seek(newPos).catch((err) => console.warn(err));
          setPosition(newPos);
        }
      },
      stop: () => {
        if (Platform.OS === "web" && audioRef.current) {
          audioRef.current.pause();
        } else {
          playerService.stop().catch((err) => console.warn(err));
          // Sync final position when stopping
          const track = currentRef.current;
          if (track) {
            syncProgressToBackend(track.id, position, track.duration, false);
          }
        }
        setPlaying(false);
      },
      trackProgress,
      buffering,
      historyList,
      continueListeningList,
      fetchHistoryAndContinueListening,

      // New properties
      currentTrack: current,
      currentProgram,
      queue,
      queueIndex,
      volume,
      muted,
      playbackRate: speed,
      error,
      setVolume: (v) => {
        const bound = Math.max(0, Math.min(1, v));
        setVolumeState(bound);
        if (!muted) {
          if (Platform.OS === "web" && audioRef.current) {
            audioRef.current.volume = bound;
          } else {
            playerService.setVolume(bound).catch((err) => console.warn(err));
          }
        }
      },
      setMuted: (m) => {
        setMutedState(m);
        if (Platform.OS === "web" && audioRef.current) {
          audioRef.current.muted = m;
        } else {
          playerService.setMuted(m).catch((err) => console.warn(err));
        }
      },
      setPlaybackRate: (r) => {
        setSpeed(r);
        if (Platform.OS === "web" && audioRef.current) {
          audioRef.current.playbackRate = r;
        } else {
          playerService.setSpeed(r).catch((err) => console.warn(err));
        }
      },
      next,
      previous,
      close: () => {
        if (Platform.OS === "web") {
          if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
          }
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
          }
        } else {
          playerService.unload().catch((err) => console.warn("PlayerService close unload failed", err));
        }
        setCurrent(null);
        setCurrentProgramId(null);
        setQueueState([]);
        setQueueIndex(0);
        setPlaying(false);
        setPosition(0);
      },
      setQueue: (tracks, index = 0) => {
        setQueueState(tracks);
        setQueueIndex(Math.max(0, Math.min(tracks.length - 1, index)));
      },
      addToQueue: (track) => {
        setQueueState((prev) => {
          if (prev.some((t) => t.id === track.id)) return prev;
          return [...prev, track];
        });
      },
      clearQueue: () => {
        setQueueState([]);
        setQueueIndex(0);
      },

      // Notifications additions
      notifications: notificationsList,
      unreadCount,
      notificationsLoading,
      notificationsError,
      fetchNotifications,
      markNotificationRead,
      markAllNotificationsRead,
    }),
    [
      user,
      authLoading,
      login,
      register,
      loginWithGoogle,
      logout,
      updateProfile,
      tracksList,
      programsList,
      loading,
      fetchTracksAndPrograms,
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
      trackProgress,
      buffering,
      historyList,
      continueListeningList,
      fetchHistoryAndContinueListening,
      currentProgram,
      queue,
      queueIndex,
      volume,
      muted,
      error,
      next,
      previous,
      notificationsList,
      unreadCount,
      notificationsLoading,
      notificationsError,
      fetchNotifications,
      markNotificationRead,
      markAllNotificationsRead,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
