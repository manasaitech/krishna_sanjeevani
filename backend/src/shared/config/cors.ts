import { cors } from "hono/cors";

export const corsMiddleware = cors({
  origin: [
    "https://krishna-sanjeevni-web.astrosutraai.workers.dev",
    "http://localhost:5173",
    "http://localhost:5176",
    "http://localhost:8081",
  ],
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});
