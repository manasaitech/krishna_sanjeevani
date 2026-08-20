import { Hono } from "hono";
import { DiscoverController } from "./discover.controller";
import { requireAuth } from "../auth/auth.middleware";
import { Env } from "../../shared/config/env";

const discover = new Hono<{ Bindings: Env }>();

// Public Routes
discover.get("/", DiscoverController.getCatalog);
discover.get("/surawalis/:id", DiscoverController.getSurawaliDetails);

// Protected Routes (Require Authentication)
discover.post("/subscribe", requireAuth(), DiscoverController.createSubscription);
discover.get("/subscriptions", requireAuth(), DiscoverController.listSubscriptions);
discover.post("/subscriptions/:id/cancel", requireAuth(), DiscoverController.cancelSubscription);

export default discover;
