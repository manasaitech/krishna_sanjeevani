import { Hono } from "hono";
import { requireRole } from "../auth/auth.middleware";
import { AdminController } from "./admin.controller";

const adminRoute = new Hono();

// Enforce auth and admin authorization role checking at endpoint level
adminRoute.get("/overview", requireRole("admin", "super_admin"), AdminController.getOverview);

// User Management Admin Endpoints
adminRoute.get("/users", requireRole("admin", "super_admin"), AdminController.listUsers);
adminRoute.get("/users/stats", requireRole("admin", "super_admin"), AdminController.getUserStats);
adminRoute.get("/users/:id", requireRole("admin", "super_admin"), AdminController.getUserDetails);
adminRoute.post("/users/:id/deactivate", requireRole("admin", "super_admin"), AdminController.deactivateUser);
adminRoute.post("/users/:id/reactivate", requireRole("admin", "super_admin"), AdminController.reactivateUser);
adminRoute.post("/users/:id/subscription", requireRole("admin", "super_admin"), AdminController.changeUserSubscriptionTier);

// Subscriptions & Billing Admin Endpoints
adminRoute.get("/subscriptions", requireRole("admin", "super_admin"), AdminController.listSubscriptions);
adminRoute.get("/subscriptions/stats", requireRole("admin", "super_admin"), AdminController.getSubscriptionStats);
adminRoute.get("/subscriptions/:id", requireRole("admin", "super_admin"), AdminController.getSubscriptionDetails);
adminRoute.post("/subscriptions/:id/cancel", requireRole("admin", "super_admin"), AdminController.cancelSubscription);
adminRoute.post("/subscriptions/:id/extend", requireRole("admin", "super_admin"), AdminController.extendSubscription);
adminRoute.get("/plans", requireRole("admin", "super_admin"), AdminController.listPlans);
adminRoute.put("/plans/:id", requireRole("admin", "super_admin"), AdminController.updatePlan);
adminRoute.get("/payments", requireRole("admin", "super_admin"), AdminController.listPayments);
adminRoute.get("/analytics", requireRole("admin", "super_admin"), AdminController.getAnalytics);
adminRoute.get("/health", requireRole("admin", "super_admin"), AdminController.getHealth);

export default adminRoute;
