import { Hono } from "hono";
import { corsMiddleware } from "./shared/config/cors";
import routes from "./routes";
import { AppError } from "./shared/errors";
import { logger } from "./shared/logger";
import { ApiResponse } from "./shared/responses";

const app = new Hono();

// Global CORS Middleware
app.use("*", corsMiddleware);

// Versioned API Routes
app.route("/api/v1", routes);

// Global Error Handler
app.onError((err, c) => {
  // Use structured logger
  logger.error("Unhandled Exception caught by Global Handler", err);

  if (err instanceof AppError) {
    return ApiResponse.error(c, err.message, err.status, err.errors);
  }

  return ApiResponse.error(
    c,
    err.message || "Internal Server Error",
    500
  );
});

export default app;
