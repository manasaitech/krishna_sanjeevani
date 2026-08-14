import { Hono } from "hono";
import healthRoute from "./health.route";
import authRoute from "../modules/auth/auth.route";
import storageRoute from "../modules/storage/storage.route";
import trackRoute from "../modules/tracks/track.route";
import programRoute from "../modules/programs/program.route";
import pregnancyRoute from "../modules/programs/pregnancy.route";
import streamRoute from "./stream.route";
import favoritesRoute from "../modules/favorites/favorite.route";
import progressRoute from "../modules/progress/progress.route";
import subscriptionRoute from "../modules/subscriptions/subscription.route";
import adminRoute from "../modules/admin/admin.route";
import notificationsRoute from "../modules/notifications/notification.route";

const routes = new Hono();

routes.route("/", healthRoute);
routes.route("/auth", authRoute);
routes.route("/storage", storageRoute);
routes.route("/tracks", trackRoute);
routes.route("/programs", programRoute);
routes.route("/pregnancy", pregnancyRoute);
routes.route("/stream", streamRoute);
routes.route("/favorites", favoritesRoute);
routes.route("/progress", progressRoute);
routes.route("/subscriptions", subscriptionRoute);
routes.route("/admin", adminRoute);
routes.route("/notifications", notificationsRoute);

export default routes;
