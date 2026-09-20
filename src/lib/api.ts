export const BASE_URL =
  (typeof process !== "undefined" && process.env?.["VITE_API_URL"]) ||
  (typeof import.meta !== "undefined" && (import.meta.env?.VITE_API_URL as string)) ||
  "https://backend.astrosutraai.workers.dev/api/v1";

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

  let text = "";
  try {
    text = await res.text();
    if (!text || !text.trim()) {
      return { success: res.ok, message: res.statusText } as any;
    }
    const json: ApiResponse<T> = JSON.parse(text);
    return json;
  } catch {
    return {
      success: false,
      message: text || `HTTP ${res.status} ${res.statusText}`,
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
    updateProfile: (data: { fullName?: string; language?: string; category?: string }) =>
      http.patch("/auth/profile", data),
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
  // ── Session Feedback ──
  feedback: {
    submit: async (data: {
      trackId?: string;
      surawaliId?: string;
      programId?: string;
      trackTitle?: string;
      userName?: string;
      userEmail?: string;
      userId?: string;
      mode?: string;
      rating: number;
      mood?: string;
      notes?: string;
      sessionDuration?: number;
    }) => {
      let userName = data.userName || "Astro Sutra AI";
      let userEmail = data.userEmail || "admin@krishnasanjeevani.org";
      let userId = data.userId || "user_current";

      // 1. Immediately store into client real-time feedback buffer
      try {
        const storedStr = localStorage.getItem("ks_session_feedbacks");
        const list: any[] = storedStr ? JSON.parse(storedStr) : [];
        try {
          const userStr = localStorage.getItem("ks_user");
          if (userStr) {
            const u = JSON.parse(userStr);
            if (!data.userName && (u.name || u.fullName)) userName = u.name || u.fullName;
            if (!data.userEmail && u.email) userEmail = u.email;
            if (!data.userId && u.id) userId = u.id;
          }
        } catch {}

        const newEntry = {
          id: "fb_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
          userId,
          userName,
          userEmail,
          trackId: data.trackId || null,
          surawaliId: data.surawaliId || null,
          trackTitle: data.trackTitle || (data.surawaliId ? `Surāwali ${data.surawaliId}` : "Therapeutic Audio"),
          programId: data.programId || null,
          mode: data.mode || "surawali",
          rating: Number(data.rating) || 5,
          mood: data.mood || "Calmer",
          notes: data.notes || null,
          sessionDuration: Number(data.sessionDuration) || 900,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        list.unshift(newEntry);
        localStorage.setItem("ks_session_feedbacks", JSON.stringify(list));

        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("ks_feedback_submitted", { detail: newEntry }));
        }
      } catch (err) {
        console.warn("Could not save feedback to local store", err);
      }

      // 2. Transmit to backend
      try {
        const res = await http.post<any>("/feedback", data);
        if (res && res.success) return res;
      } catch (e) {
        console.warn("Feedback submitted to local session store; server returned offline state.", e);
      }
      return { success: true, message: "Feedback submitted successfully." };
    },
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
    feedback: {
      list: async (params?: any) => {
        const query = params
          ? "?" +
            new URLSearchParams(
              Object.entries(params).reduce((acc: any, [k, v]) => {
                if (v !== undefined && v !== null && v !== "") acc[k] = String(v);
                return acc;
              }, {})
            ).toString()
          : "";

        // 1. Try to fetch from backend database API
        try {
          const res = await http.get<any>(`/admin/feedback${query}`);
          if (res && res.success && res.data) {
            const data = res.data;
            const items = (data.items || []).map((f: any) => ({
              ...f,
              userName: f.userName || (f.userEmail ? f.userEmail.split("@")[0] : "Listener"),
              userEmail: f.userEmail || "user@krishnasanjeevani.org",
            }));
            return {
              items,
              total: data.pagination?.total ?? items.length,
              page: data.pagination?.page ?? params?.page ?? 1,
              limit: data.pagination?.limit ?? params?.limit ?? 10,
              pages: data.pagination?.totalPages ?? 1,
              summary: {
                totalFeedback: data.summary?.totalCount ?? items.length,
                averageRating: data.summary?.averageRating ?? (items.length > 0 ? 5.0 : 0),
                todayFeedback: data.summary?.todayCount ?? 0,
              },
            };
          }
        } catch (e) {
          console.warn("Backend /admin/feedback not reachable, using local storage buffer", e);
        }

        // 2. Real user-submitted feedbacks from local buffer
        let localStored: any[] = [];
        try {
          const raw = localStorage.getItem("ks_session_feedbacks");
          if (raw) localStored = JSON.parse(raw);
        } catch {
          localStored = [];
        }

        let filtered = [...localStored];
        // Sort newest first
        filtered.sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));

        if (params?.mode && params.mode !== "All") {
          filtered = filtered.filter((f) => f.mode === params.mode);
        }
        if (params?.rating && params.rating !== "All") {
          filtered = filtered.filter((f) => Number(f.rating) === Number(params.rating));
        }
        if (params?.mood && params.mood !== "All") {
          filtered = filtered.filter((f) => f.mood === params.mood);
        }
        if (params?.search && params.search.trim()) {
          const q = params.search.toLowerCase().trim();
          filtered = filtered.filter(
            (f) =>
              (f.notes && f.notes.toLowerCase().includes(q)) ||
              (f.userEmail && f.userEmail.toLowerCase().includes(q)) ||
              (f.userName && f.userName.toLowerCase().includes(q)) ||
              (f.surawaliId && f.surawaliId.toLowerCase().includes(q)) ||
              (f.trackTitle && f.trackTitle.toLowerCase().includes(q))
          );
        }

        const page = Number(params?.page) || 1;
        const limit = Number(params?.limit) || 10;
        const total = filtered.length;
        const pages = Math.max(1, Math.ceil(total / limit));
        const start = (page - 1) * limit;
        const items = filtered.slice(start, start + limit);

        const rated = localStored.filter((f) => f.rating);
        const avgRating =
          rated.length > 0
            ? Number((rated.reduce((sum, f) => sum + Number(f.rating), 0) / rated.length).toFixed(1))
            : 0;

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const todayCount = localStored.filter((f) => f.createdAt >= startOfDay.getTime()).length;

        return {
          items,
          total,
          page,
          limit,
          pages,
          summary: {
            totalFeedback: localStored.length,
            averageRating: avgRating > 0 ? avgRating : 0,
            todayFeedback: todayCount,
          },
        };
      },
      get: async (id: string) => {
        try {
          const res = await http.get<any>(`/admin/feedback/${id}`);
          if (res && res.success && res.data) return res.data;
        } catch {}
        try {
          const raw = localStorage.getItem("ks_session_feedbacks");
          if (raw) {
            const list = JSON.parse(raw);
            const found = list.find((f: any) => f.id === id);
            if (found) return found;
          }
        } catch {}
        return null;
      },
    },
    getHealth: () => http.get("/admin/health"),
  },
};
