import { Platform } from "react-native";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

const getBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === "web") {
      return "http://localhost:8787/api/v1";
    }
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const ip = hostUri.split(":")[0];
      return `http://${ip}:8787/api/v1`;
    }
    return "http://10.0.2.2:8787/api/v1";
  }
  return "https://backend.astrosutraai.workers.dev/api/v1";
};

export const BASE_URL = getBaseUrl();

const KEYS = {
  ACCESS_TOKEN: "ks_mobile_access_token",
  REFRESH_TOKEN: "ks_mobile_refresh_token",
};

async function setItem(key: string, value: string) {
  if (Platform.OS === "web") {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("Storage error on web", e);
    }
    return;
  }
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (e) {
    console.warn("SecureStore setItem error", e);
  }
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }
  try {
    return await SecureStore.getItemAsync(key);
  } catch (e) {
    console.warn("SecureStore getItem error", e);
    return null;
  }
}

async function deleteItem(key: string) {
  if (Platform.OS === "web") {
    try {
      localStorage.removeItem(key);
    } catch (e) {}
    return;
  }
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (e) {
    console.warn("SecureStore deleteItem error", e);
  }
}

let _accessToken: string | null = null;
let _refreshToken: string | null = null;
let _onAuthFailure: (() => void) | null = null;
let _refreshPromise: Promise<boolean> | null = null;

export function registerAuthFailureHandler(handler: () => void) {
  _onAuthFailure = handler;
}

export async function loadPersistedTokens(): Promise<void> {
  _accessToken = await getItem(KEYS.ACCESS_TOKEN);
  _refreshToken = await getItem(KEYS.REFRESH_TOKEN);
}

export function getAccessToken(): string | null {
  return _accessToken;
}

export function getRefreshToken(): string | null {
  return _refreshToken;
}

export async function storeTokens(accessToken: string, refreshToken: string) {
  _accessToken = accessToken;
  _refreshToken = refreshToken;
  await setItem(KEYS.ACCESS_TOKEN, accessToken);
  await setItem(KEYS.REFRESH_TOKEN, refreshToken);
}

export async function clearTokens() {
  _accessToken = null;
  _refreshToken = null;
  await deleteItem(KEYS.ACCESS_TOKEN);
  await deleteItem(KEYS.REFRESH_TOKEN);
}

type ApiResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
};

async function refreshAccessToken(): Promise<boolean> {
  if (_refreshPromise) {
    return _refreshPromise;
  }

  _refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        await clearTokens();
        return false;
      }

      const json: ApiResponse<{ accessToken: string; refreshToken: string }> = await res.json();
      if (json.success && json.data) {
        await storeTokens(json.data.accessToken, json.data.refreshToken);
        return true;
      }

      await clearTokens();
      return false;
    } catch {
      await clearTokens();
      return false;
    } finally {
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
}

async function request<T = any>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<ApiResponse<T>> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Support 15s network timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    // Auto-refresh on 401
    if (res.status === 401) {
      if (retry) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          return request<T>(path, options, false);
        }
      }
      // Refresh failed or already retried and failed
      if (_onAuthFailure) {
        _onAuthFailure();
      }
      return {
        success: false,
        message: "Session expired. Please login again.",
        errors: [{ name: "UnauthorizedError", message: "Session expired. Please log in again." }],
      };
    }

    if (res.status === 403) {
      return {
        success: false,
        message: "Access Denied",
        errors: [{ name: "ForbiddenError", message: "You do not have permission to perform this action." }],
      };
    }

    if (res.status === 404) {
      return {
        success: false,
        message: "Not Found",
        errors: [{ name: "NotFoundError", message: "The requested resource was not found." }],
      };
    }

    if (res.status === 429) {
      return {
        success: false,
        message: "Too Many Requests",
        errors: [{ name: "RateLimitError", message: "Too many requests. Please try again later." }],
      };
    }

    if (res.status >= 500) {
      return {
        success: false,
        message: "Server Error",
        errors: [{ name: "ServerError", message: "Server encountered an error. Please try again later." }],
      };
    }

    let json: any;
    try {
      json = await res.json();
    } catch {
      json = {
        success: res.ok,
        message: res.statusText || "Response processed successfully",
      };
    }
    return json;

  } catch (err: any) {
    clearTimeout(timeoutId);

    const isTimeout = err.name === "AbortError";
    return {
      success: false,
      message: isTimeout ? "Request timed out" : "Network connection error",
      errors: [
        {
          name: isTimeout ? "TimeoutError" : "NetworkError",
          message: isTimeout
            ? "The server took too long to respond. Please check your connection."
            : "No internet connection detected. Please verify your network and try again.",
        },
      ],
    };
  }
}

const http = {
  get: <T = any>(path: string) => request<T>(path, { method: "GET" }),

  post: <T = any>(path: string, body?: any) => {
    const options: RequestInit = { method: "POST" };
    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }
    return request<T>(path, options);
  },

  patch: <T = any>(path: string, body?: any) => {
    const options: RequestInit = { method: "PATCH" };
    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }
    return request<T>(path, options);
  },

  delete: <T = any>(path: string, body?: any) => {
    const options: RequestInit = { method: "DELETE" };
    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }
    return request<T>(path, options);
  },
};

// Expose the fully typed API SDK object
export const api = {
  // Low-level HTTP methods for backward compatibility
  get: http.get,
  post: http.post,
  patch: http.patch,
  delete: http.delete,

  // ── Authentication ──
  auth: {
    register: (email: string, password: string, fullName: string, category: string) =>
      http.post("/auth/register", { email, password, fullName, category }),
    login: (email: string, password: string) =>
      http.post("/auth/login", { email, password }),
    loginWithGoogle: (idToken: string, category?: string) =>
      http.post("/auth/google", { idToken, category }),
    logout: async () => {
      await clearTokens();
      return http.post("/auth/logout");
    },
    me: () => http.get("/auth/me"),
    changePassword: (password: string) =>
      http.post("/auth/change-password", { password }),
    updateProfile: (fullName?: string, language?: string) =>
      http.patch("/auth/profile", { fullName, language }),
  },

  // ── Tracks ──
  tracks: {
    list: (params?: Record<string, any>) => {
      let query = "";
      if (params) {
        const queryParts = Object.keys(params).map(
          (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
        );
        if (queryParts.length > 0) {
          query = "?" + queryParts.join("&");
        }
      }
      return http.get(`/tracks${query}`);
    },
    get: (id: string) => http.get(`/tracks/${id}`),
    create: (data: any) => http.post("/tracks", data),
    update: (id: string, data: any) => http.patch(`/tracks/${id}`, data),
    publish: (id: string) => http.patch(`/tracks/${id}/publish`),
    archive: (id: string) => http.patch(`/tracks/${id}/archive`),
    remove: (id: string) => http.delete(`/tracks/${id}`),
    listTags: () => http.get("/tracks/tags"),
    createTag: (name: string, description?: string) =>
      http.post("/tracks/tags", { name, description }),
  },

  // ── Programs ──
  programs: {
    list: (params?: Record<string, any>) => {
      let query = "";
      if (params) {
        const queryParts = Object.keys(params).map(
          (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
        );
        if (queryParts.length > 0) {
          query = "?" + queryParts.join("&");
        }
      }
      return http.get(`/programs${query}`);
    },
    get: (id: string) => http.get(`/programs/${id}`),
    getTracks: (id: string) => http.get(`/programs/${id}/tracks`),
    create: (data: any) => http.post("/programs", data),
    update: (id: string, data: any) => http.patch(`/programs/${id}`, data),
    publish: (id: string) => http.patch(`/programs/${id}/publish`),
    archive: (id: string) => http.patch(`/programs/${id}/archive`),
    remove: (id: string) => http.delete(`/programs/${id}`),
    addTrack: (id: string, trackId: string, sequence: number, isRequired = true) =>
      http.post(`/programs/${id}/tracks`, { trackId, sequence, isRequired }),
    removeTrack: (id: string, trackId: string) =>
      http.delete(`/programs/${id}/tracks/${trackId}`),
    reorderTracks: (id: string, trackList: Array<{ trackId: string; sequence: number }>) =>
      http.patch(`/programs/${id}/tracks/reorder`, { tracks: trackList }),
    duplicate: (id: string) => http.post(`/programs/${id}/duplicate`),
  },

  // ── Pregnancy Engine ──
  pregnancy: {
    listPrograms: () => http.get("/pregnancy/programs"),
    getToday: () => http.get("/pregnancy/today"),
    getByWeek: (week: number) => http.get(`/pregnancy/week/${week}`),
    getByMonth: (month: number) => http.get(`/pregnancy/month/${month}`),
    saveUserInfo: (data: { edd?: string | null | undefined; currentWeek?: number | null | undefined }) =>
      http.post("/pregnancy/user-info", data),
    createSchedule: (data: any) => http.post("/pregnancy/schedule", data),
    updateSchedule: (id: string, data: any) => http.patch(`/pregnancy/schedule/${id}`, data),
    removeSchedule: (id: string) => http.delete(`/pregnancy/schedule/${id}`),
  },

  // ── Unified Progress Engine ──
  progress: {
    get: (programId: string) => http.get(`/programs/${programId}/progress`),
    completeTrack: (programId: string, trackId: string, complete = true) =>
      http.post(`/programs/${programId}/tracks/${trackId}/complete`, { complete }),
    update: (
      trackId: string,
      position: number,
      duration: number,
      completed = false,
      programId?: string
    ) => http.post("/progress/update", { trackId, position, duration, completed, programId }),
    continueListening: () => http.get("/progress/continue-listening"),
    history: () => http.get("/progress/history"),
    getTrackProgress: (trackId: string) => http.get(`/progress/track/${trackId}`),
  },

  // ── Favorites Management ──
  favorites: {
    list: (itemType?: "track" | "program") =>
      http.get(`/favorites${itemType ? `?itemType=${itemType}` : ""}`),
    add: (itemId: string, itemType: "track" | "program") =>
      http.post("/favorites", { itemId, itemType }),
    remove: (itemId: string) => http.delete(`/favorites/${itemId}`),
    status: (itemId: string) => http.get(`/favorites/${itemId}/status`),
  },

  // ── Playback Stream Tickets ──
  stream: {
    getTicket: (trackId: string) => http.post(`/stream/${trackId}/ticket`),
  },

  // ── Plans & Subscriptions ──
  plans: {
    list: () => http.get("/subscriptions/plans"),
  },
  subscriptions: {
    getCurrent: () => http.get("/subscriptions/me"),
    createOrder: (planId: string) => http.post("/subscriptions/create-order", { planId }),
    verifyPayment: (orderId: string, paymentId: string, signature: string) =>
      http.post("/subscriptions/verify", { orderId, paymentId, signature }),
  },
  payments: {
    list: () => http.get("/subscriptions/payments"),
  },
  // ── Discover & Subscriptions ──
  discover: {
    getCatalog: () => http.get<any>("/discover"),
    getSurawali: (id: string) => http.get<any>(`/discover/surawalis/${id}`),
    subscribe: (surawaliId: string, plan: string, paymentId: string) =>
      http.post<any>("/discover/subscribe", { surawaliId, plan, paymentId }),
    listSubscriptions: () => http.get<any[]>("/discover/subscriptions"),
    cancelSubscription: (id: string) => http.post<any>(`/discover/subscriptions/${id}/cancel`),
  },
  // ── Notifications ──
  notifications: {
    list: () => http.get("/notifications"),
    unreadCount: () => http.get("/notifications/unread/count"),
    markAsRead: (id: string) => http.post(`/notifications/${id}/read`),
    markAllAsRead: () => http.post("/notifications/read/all"),
  },
};
