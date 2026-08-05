export const AUTH_CONSTANTS = {
  SALT_ROUNDS: 10,
  ACCESS_TOKEN_EXPIRY: "15m",
  REFRESH_TOKEN_EXPIRY: "30d",
  REFRESH_TOKEN_EXPIRY_MS: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
  PASSWORD_MIN_LENGTH: 8,
  GENERIC_LOGIN_ERROR: "Invalid email or password",
  GENERIC_REGISTER_ERROR: "Unable to create account",
};
