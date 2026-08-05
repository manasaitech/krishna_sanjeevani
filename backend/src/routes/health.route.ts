import { Hono } from "hono";

const health = new Hono();

health.get("/health", (c) => {
  return c.json({
    success: true,
    message: "Krishna Sanjeevani Backend Running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

export default health;
