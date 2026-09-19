// ─────────────────────────────────────────────────────────────
// Backend Mode Isolation Tests
// Verifies route isolation, mode guards, and module independence.
// ─────────────────────────────────────────────────────────────

import { describe, it, expect } from "vitest";
import app from "../src/app";
import { getPaymentCredentials, isMode } from "../src/shared/config/mode";
import type { Env } from "../src/shared/config/env";

describe("Backend Mode Guard & Route Isolation", () => {
  const surawaliEnv: Partial<Env> = {
    APP_MODE: "surawali",
    PAYMENT_MODE: "mock",
    SURAWALI_PAYMENT_KEY: "rzp_surawali_test_key",
    SURAWALI_PAYMENT_SECRET: "rzp_surawali_test_secret",
    EMOTION_PAYMENT_KEY: "rzp_emotion_test_key",
    EMOTION_PAYMENT_SECRET: "rzp_emotion_test_secret",
  };

  const emotionEnv: Partial<Env> = {
    APP_MODE: "emotion_remediation",
    PAYMENT_MODE: "mock",
    SURAWALI_PAYMENT_KEY: "rzp_surawali_test_key",
    SURAWALI_PAYMENT_SECRET: "rzp_surawali_test_secret",
    EMOTION_PAYMENT_KEY: "rzp_emotion_test_key",
    EMOTION_PAYMENT_SECRET: "rzp_emotion_test_secret",
  };

  it("should select Surawali payment credentials when APP_MODE is surawali", () => {
    const creds = getPaymentCredentials(surawaliEnv as Env);
    expect(creds.key).toBe("rzp_surawali_test_key");
    expect(creds.secret).toBe("rzp_surawali_test_secret");
  });

  it("should select Emotion payment credentials when APP_MODE is emotion_remediation", () => {
    const creds = getPaymentCredentials(emotionEnv as Env);
    expect(creds.key).toBe("rzp_emotion_test_key");
    expect(creds.secret).toBe("rzp_emotion_test_secret");
  });

  it("should block Emotion routes with 404 when in Surawali mode", async () => {
    const req = new Request("http://localhost/api/v1/emotion/content/categories", {
      method: "GET",
    });
    const res = await app.fetch(req, surawaliEnv as Env);
    expect(res.status).toBe(404);
    const data: any = await res.json();
    expect(data.error || data.message).toContain("not available in surawali mode");
  });

  it("should block Surawali pregnancy routes with 404 when in Emotion mode", async () => {
    const req = new Request("http://localhost/api/v1/pregnancy/programs", {
      method: "GET",
    });
    const res = await app.fetch(req, emotionEnv as Env);
    expect(res.status).toBe(404);
    const data: any = await res.json();
    expect(data.error || data.message).toContain("not available in emotion_remediation mode");
  });

  it("should allow Emotion trajectories endpoint in Emotion mode", async () => {
    const req = new Request("http://localhost/api/v1/emotion/content/trajectories", {
      method: "GET",
    });
    const res = await app.fetch(req, emotionEnv as Env);
    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data.data).toBeInstanceOf(Array);
    expect(data.data.length).toBeGreaterThan(0);
  });

  it("should serve shared health endpoint in both modes", async () => {
    const req1 = new Request("http://localhost/api/v1/health", { method: "GET" });
    const res1 = await app.fetch(req1, surawaliEnv as Env);
    expect(res1.status).toBe(200);

    const req2 = new Request("http://localhost/api/v1/health", { method: "GET" });
    const res2 = await app.fetch(req2, emotionEnv as Env);
    expect(res2.status).toBe(200);
  });
});
