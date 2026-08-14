import { Hono } from "hono";
import { NotificationController } from "./notification.controller";
import { requireAuth } from "../auth/auth.middleware";
import { Env } from "../../shared/config/env";

const notificationsRoute = new Hono<{ Bindings: Env }>();

notificationsRoute.use("*", requireAuth());

notificationsRoute.get("/", NotificationController.list);
notificationsRoute.get("/unread/count", NotificationController.unreadCount);
notificationsRoute.post("/:id/read", NotificationController.markRead);
notificationsRoute.post("/read/all", NotificationController.markAllRead);

export default notificationsRoute;
