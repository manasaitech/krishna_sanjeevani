import { Hono } from "hono";
import { requireAuth } from "../auth/auth.middleware";
import { SubscriptionController } from "./subscription.controller";

const subscriptionRoute = new Hono();

// Public plan browsing
subscriptionRoute.get("/plans", SubscriptionController.listPlans);

// Authenticated user operations
subscriptionRoute.get("/me", requireAuth(), SubscriptionController.getMe);
subscriptionRoute.post("/create-order", requireAuth(), SubscriptionController.createOrder);
subscriptionRoute.post("/verify", requireAuth(), SubscriptionController.verify);
subscriptionRoute.get("/payments", requireAuth(), SubscriptionController.listPayments);

export default subscriptionRoute;
