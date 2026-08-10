import { cors } from "hono/cors";

export const corsMiddleware = cors({
  origin: (origin) => {
    // Allow any origin dynamically to prevent CORS blockages
    return origin;
  },
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});
