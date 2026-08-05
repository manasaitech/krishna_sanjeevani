import { Hono } from "hono";
import { ApiResponse } from "../shared/responses";
import { APP_CONFIG } from "../shared/config/app";

const health = new Hono();

health.get("/health", (c) => {
  return ApiResponse.success(c, {
    version: APP_CONFIG.VERSION,
    timestamp: new Date().toISOString(),
  }, "Krishna Sanjeevani Backend Running");
});

export default health;
