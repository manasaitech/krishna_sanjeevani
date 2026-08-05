export const APP_CONSTANTS = {
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
  ROLES: {
    GUEST: "guest",
    USER: "user",
    PREMIUM: "premium",
    ADMIN: "admin",
    SUPER_ADMIN: "super_admin",
  } as const,
  JWT_EXPIRY: {
    ACCESS_MINUTES: 15,
    REFRESH_DAYS: 30,
  },
  COOKIE_KEYS: {
    ACCESS_TOKEN: "ks_access_token",
    REFRESH_TOKEN: "ks_refresh_token",
  },
};

export type UserRole = typeof APP_CONSTANTS.ROLES[keyof typeof APP_CONSTANTS.ROLES];
