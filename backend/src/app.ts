import { Hono } from "hono";
import { corsMiddleware } from "./config/cors";
import routes from "./routes";

const app = new Hono();

// Global CORS Middleware
app.use("*", corsMiddleware);

// Versioned API Routes
app.route("/api/v1", routes);

// Global Error Handler
app.onError((err, c) => {
  console.error("Global Error Caught:", err);
  return c.json(
    {
      success: false,
      message: err.message || "Internal Server Error",
    },
    500
  );
});

export default app;
