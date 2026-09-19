// ─────────────────────────────────────────────────────────────
// Emotion Remediation Mode — Backend Routes Aggregator
// Encapsulates all Emotion Remediation endpoints: content, search,
// subscriptions. Zero dependency on Surawali modules.
// ─────────────────────────────────────────────────────────────

import { Hono } from "hono";
import { Env } from "../../shared/config/env";
import { emotionContentRoute } from "./content";
import { emotionSearchRoute } from "./search";
import { emotionSubscriptionRoute } from "./subscriptions";
import { emotionReviewRoute } from "./admin/review.route";

export const emotionRoutes = new Hono<{ Bindings: Env }>();

emotionRoutes.route("/content", emotionContentRoute);
emotionRoutes.route("/search", emotionSearchRoute);
emotionRoutes.route("/subscriptions", emotionSubscriptionRoute);
emotionRoutes.route("/admin/review", emotionReviewRoute);

export default emotionRoutes;
