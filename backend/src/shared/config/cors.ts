import { cors } from "hono/cors";

export const corsMiddleware = cors({
  origin: [
    "http://localhost:5173", // React Web (Default Vite)
    "http://localhost:5176", // React Web (Configured Port)
    "http://localhost:8081", // Expo Web (if used)
  ],
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
});
