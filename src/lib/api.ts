const isDev =
  (typeof process !== "undefined" && process.env?.["NODE_ENV"] === "development") ||
  (typeof import.meta !== "undefined" && import.meta.env?.DEV);

export const BASE_URL = isDev
  ? "http://localhost:8787/api/v1"
  : "https://backend.astrosutraai.workers.dev/api/v1";

const TOKEN_KEYS = {
  ACCESS: "ks_access_token",
  REFRESH: "ks_refresh_token",
};

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEYS.ACCESS);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(TOKEN_KEYS.REFRESH);
}

export function storeTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(TOKEN_KEYS.ACCESS, accessToken);
  localStorage.setItem(TOKEN_KEYS.REFRESH, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEYS.ACCESS);
  localStorage.removeItem(TOKEN_KEYS.REFRESH);
}

type ApiResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
};

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      clearTokens();
      return false;
    }

    const json: ApiResponse<{ accessToken: string; refreshToken: string }> = await res.json();
    if (json.success && json.data) {
      storeTokens(json.data.accessToken, json.data.refreshToken);
      return true;
    }

    clearTokens();
    return false;
  } catch {
    clearTokens();
    return false;
  }
}

async function request<T = any>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<ApiResponse<T>> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Auto-refresh on 401
  if (res.status === 401 && retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return request<T>(path, options, false);
    }
  }

  const json: ApiResponse<T> = await res.json();
  return json;
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

  put: <T = any>(path: string, body?: any) => {
    const options: RequestInit = { method: "PUT" };
    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }
    return request<T>(path, options);
  },
};

// Expose the fully typed API SDK object
export const api = {
  // Raw HTTP request helpers for backward compatibility
  get: http.get,
  post: http.post,
  patch: http.patch,
  delete: http.delete,
  put: http.put,

  // ── Authentication ──
  auth: {
    register: (email: string, password: string, fullName: string) =>
      http.post("/auth/register", { email, password, fullName }),
    login: (email: string, password: string) =>
      http.post("/auth/login", { email, password }),
    logout: () => {
      clearTokens();
      return http.post("/auth/logout");
    },
    me: () => http.get("/auth/me"),
    changePassword: (password: string) =>
      http.post("/auth/change-password", { password }),
    googleLogin: (idToken: string, category?: string) =>
      http.post("/auth/google", { idToken, category }),
  },

  // ── Tracks ──
  tracks: {
    list: (params?: Record<string, any>) => {
      const query = params ? "?" + new URLSearchParams(params).toString() : "";
      return http.get(`/tracks${query}`);
    },
    listAdmin: (params?: Record<string, any>) => {
      const query = params ? "?" + new URLSearchParams(params).toString() : "";
      return http.get(`/tracks/admin/list${query}`);
    },
    get: (id: string) => http.get(`/tracks/${id}`),
    create: (data: any) => http.post("/tracks", data),
    update: (id: string, data: any) => http.patch(`/tracks/${id}`, data),
    publish: (id: string) => http.patch(`/tracks/${id}/publish`),
    archive: (id: string) => http.patch(`/tracks/${id}/archive`),
    unpublish: (id: string) => http.patch(`/tracks/${id}/unpublish`),
    remove: (id: string) => http.delete(`/tracks/${id}`),
    delete: (id: string) => http.delete(`/tracks/${id}`),
    listTags: () => http.get("/tracks/tags"),
    createTag: (name: string, description?: string) =>
      http.post("/tracks/tags", { name, description }),
    getStats: () => http.get("/tracks/admin/stats"),
  },

  // ── Programs ──
  programs: {
    list: (params?: Record<string, any>) => {
      const query = params ? "?" + new URLSearchParams(params).toString() : "";
      return http.get(`/programs${query}`);
    },
    listAdmin: (params?: Record<string, any>) => {
      const query = params ? "?" + new URLSearchParams(params).toString() : "";
      return http.get(`/programs/admin/list${query}`);
    },
    getStats: () => http.get("/programs/admin/stats"),
    get: (id: string) => http.get(`/programs/${id}`),
    getTracks: (id: string) => http.get(`/programs/${id}/tracks`),
    create: (data: any) => http.post("/programs", data),
    update: (id: string, data: any) => http.patch(`/programs/${id}`, data),
    publish: (id: string) => http.patch(`/programs/${id}/publish`),
    unpublish: (id: string) => http.patch(`/programs/${id}/unpublish`),
    archive: (id: string) => http.patch(`/programs/${id}/archive`),
    remove: (id: string) => http.delete(`/programs/${id}`),
    getPregnancySchedules: (id: string) => http.get(`/programs/${id}/pregnancy-schedules`),
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

  // ── Storage uploads ──
  storage: {
    uploadAudio: (file: File, trackId?: string) => {
      const formData = new FormData();
      formData.append("file", file);
      if (trackId) {
        formData.append("trackId", trackId);
      }
      return request<{
        trackId: string;
        key: string;
        size: number;
        contentType: string;
      }>("/storage/upload/audio", {
        method: "POST",
        body: formData,
      });
    },
    multipartStart: (filename: string, contentType: string) =>
      http.post<{ uploadId: string; key: string }>("/storage/upload/audio/multipart/start", {
        filename,
        contentType,
      }),
    multipartUploadPart: (key: string, uploadId: string, partNumber: number, data: ArrayBuffer) =>
      request<{ partNumber: number; etag: string }>(
        `/storage/upload/audio/multipart/part?uploadId=${uploadId}&key=${encodeURIComponent(key)}&partNumber=${partNumber}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream",
          },
          body: data,
        }
      ),
    multipartComplete: (key: string, uploadId: string, parts: { partNumber: number; etag: string }[], trackId?: string) =>
      http.post<{ trackId: string; key: string; size: number }>("/storage/upload/audio/multipart/complete", {
        key,
        uploadId,
        parts,
        trackId,
      }),
    multipartAbort: (key: string, uploadId: string) =>
      http.post<void>("/storage/upload/audio/multipart/abort", {
        key,
        uploadId,
      }),
    uploadImage: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return request<{
        key: string;
        size: number;
        contentType: string;
      }>("/storage/upload/image", {
        method: "POST",
        body: formData,
      });
    },
    deleteFile: (key: string) => http.delete("/storage/file", { key }),
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
  admin: {
    getOverview: () => http.get("/admin/overview"),
    users: {
      listAdmin: (params?: any) => {
        const query = params ? "?" + new URLSearchParams(
          Object.entries(params).reduce((acc: any, [k, v]) => {
            if (v !== undefined && v !== null && v !== "") acc[k] = String(v);
            return acc;
          }, {})
        ).toString() : "";
        return http.get(`/admin/users${query}`);
      },
      getStats: () => http.get("/admin/users/stats"),
      getDetails: (id: string) => http.get(`/admin/users/${id}`),
      deactivate: (id: string) => http.post(`/admin/users/${id}/deactivate`),
      reactivate: (id: string) => http.post(`/admin/users/${id}/reactivate`),
      changeSubscription: (id: string, planId: string, durationDays: number = 30) =>
        http.post(`/admin/users/${id}/subscription`, { planId, durationDays }),
    },
    subscriptions: {
      list: (params?: any) => {
        const query = params ? "?" + new URLSearchParams(
          Object.entries(params).reduce((acc: any, [k, v]) => {
            if (v !== undefined && v !== null && v !== "") acc[k] = String(v);
            return acc;
          }, {})
        ).toString() : "";
        return http.get(`/admin/subscriptions${query}`);
      },
      getStats: () => http.get("/admin/subscriptions/stats"),
      getDetails: (id: string) => http.get(`/admin/subscriptions/${id}`),
      cancel: (id: string) => http.post(`/admin/subscriptions/${id}/cancel`),
      extend: (id: string, days: number) => http.post(`/admin/subscriptions/${id}/extend`, { days }),
      listPlans: () => http.get("/admin/plans"),
      updatePlan: (id: string, body: any) => http.put(`/admin/plans/${id}`, body),
      listPayments: (params?: any) => {
        const query = params ? "?" + new URLSearchParams(
          Object.entries(params).reduce((acc: any, [k, v]) => {
            if (v !== undefined && v !== null && v !== "") acc[k] = String(v);
            return acc;
          }, {})
        ).toString() : "";
        return http.get(`/admin/payments${query}`);
      },
    },
    analytics: {
      getDashboard: (params?: any) => {
        const query = params ? "?" + new URLSearchParams(
          Object.entries(params).reduce((acc: any, [k, v]) => {
            if (v !== undefined && v !== null && v !== "") acc[k] = String(v);
            return acc;
          }, {})
        ).toString() : "";
        return http.get(`/admin/analytics${query}`);
      },
    },
    getHealth: () => http.get("/admin/health"),
  },
};
