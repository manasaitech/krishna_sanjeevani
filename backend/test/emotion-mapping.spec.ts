// ─────────────────────────────────────────────────────────────
// Emotion Remediation — Mapping, R2 & Review Tests
// Tests Google Sheet mappings, filename normalization,
// dedicated R2 streaming, and review status lifecycle.
// ─────────────────────────────────────────────────────────────

import { describe, it, expect } from "vitest";
import app from "../src/app";
import { EMOTION_TRAJECTORIES } from "../src/modes/emotion-remediation/content";
import type { Env } from "../src/shared/config/env";

describe("Emotion Remediation Mapping & Content", () => {
  const emotionEnv: Partial<Env> = {
    APP_MODE: "emotion_remediation",
    PAYMENT_MODE: "mock",
    SURAWALI_PAYMENT_KEY: "rzp_surawali_test_key",
    SURAWALI_PAYMENT_SECRET: "rzp_surawali_test_secret",
    EMOTION_PAYMENT_KEY: "rzp_emotion_test_key",
    EMOTION_PAYMENT_SECRET: "rzp_emotion_test_secret",
  };

  it("should have exactly 7 emotional transition trajectories", () => {
    expect(EMOTION_TRAJECTORIES).toHaveLength(7);
    const names = EMOTION_TRAJECTORIES.map((t) => t.name);
    expect(names).toContain("Kshobha --> Prashanti");
    expect(names).toContain("Visada --> Prashanti");
    expect(names).toContain("Kshobha --> Utsaha");
    expect(names).toContain("Visada --> Utsaha");
    expect(names).toContain("Utsaha --> Prashanti");
    expect(names).toContain("Kshobha --> Utsaha --> Prashanti");
    expect(names).toContain("Visada --> Utsaha --> Prashanti");
  });

  it("should serve /api/v1/emotion/content/trajectories", async () => {
    const req = new Request("http://localhost/api/v1/emotion/content/trajectories", {
      method: "GET",
    });
    const res = await app.fetch(req, emotionEnv as Env);
    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data.data).toHaveLength(7);
  });

  it("should serve /api/v1/emotion/search with trajectory and dosha search", async () => {
    const req = new Request("http://localhost/api/v1/emotion/search?q=Prashanti", {
      method: "GET",
    });
    const res = await app.fetch(req, emotionEnv as Env);
    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data.data.trajectories.length).toBeGreaterThan(0);
  });

  it("should require authentication for admin review endpoints", async () => {
    const req = new Request("http://localhost/api/v1/emotion/admin/review/list", {
      method: "GET",
    });
    const res = await app.fetch(req, emotionEnv as Env);
    expect(res.status).toBe(401);
  });
});
