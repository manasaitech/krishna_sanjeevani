import { cors } from "hono/cors";

export const corsMiddleware = cors({
  origin: (origin) => {
    if (!origin) return null;
    
    // Allow local development servers
    if (
      origin === "http://localhost:5173" ||
      origin === "http://localhost:5176" ||
      origin === "http://localhost:8081" ||
      origin === "http://127.0.0.1:5173"
    ) {
      return origin;
    }
    
    // Allow Cloudflare staging / production domains (pages.dev and workers.dev)
    if (
      origin.endsWith(".workers.dev") ||
      origin.endsWith(".pages.dev") ||
      origin === "https://krishna-sanjeevni-web.astrosutraai.workers.dev"
    ) {
      return origin;
    }
    
    return null;
  },
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});
