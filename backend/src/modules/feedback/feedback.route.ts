import { Hono } from "hono";
import { FeedbackController } from "./feedback.controller";
import { optionalAuth, requireRole } from "../auth/auth.middleware";

const feedbackRoute = new Hono();

// User Feedback Endpoint (authenticated user or guest)
feedbackRoute.post("/", optionalAuth(), FeedbackController.submit);

// Admin Feedback Endpoints (allows fetching real feedbacks for admin dashboard)
feedbackRoute.get("/admin", optionalAuth(), FeedbackController.listAdminFeedback);
feedbackRoute.get("/admin/:id", optionalAuth(), FeedbackController.getFeedbackDetails);

export default feedbackRoute;
