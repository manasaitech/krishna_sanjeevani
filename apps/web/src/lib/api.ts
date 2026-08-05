const BASE_URL = typeof window !== "undefined" && 
  window.location.hostname !== "localhost" && 
  window.location.hostname !== "127.0.0.1"
    ? "https://backend.astrosutraai.workers.dev/api/v1"
    : "http://localhost:8787/api/v1";

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

    const json: ApiResponse<{ tokens: { accessToken: string; refreshToken: string } }> = await res.json();
    if (json.success && json.data) {
      storeTokens(json.data.tokens.accessToken, json.data.tokens.refreshToken);
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
    "Content-Type": "application/json",
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

export const api = {
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

  delete: <T = any>(path: string) => request<T>(path, { method: "DELETE" }),
};
