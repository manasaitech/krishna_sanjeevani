// ─────────────────────────────────────────────────────────────
// Surawali Mode — Backend Routes Aggregator
// Encapsulates all Surawali endpoints: tracks, programs, pregnancy,
// discover catalog, favorites, and surawali subscriptions/notifications.
// ─────────────────────────────────────────────────────────────

import { Hono } from "hono";
import { Env } from "../../shared/config/env";
import trackRoute from "../../modules/tracks/track.route";
import programRoute from "../../modules/programs/program.route";
import pregnancyRoute from "../../modules/programs/pregnancy.route";
import discoverRoute from "../../modules/discover/discover.route";
import favoritesRoute from "../../modules/favorites/favorite.route";
import progressRoute from "../../modules/progress/progress.route";
import subscriptionRoute from "../../modules/subscriptions/subscription.route";
import notificationsRoute from "../../modules/notifications/notification.route";
import streamRoute from "../../routes/stream.route";

export const surawaliRoutes = new Hono<{ Bindings: Env }>();

surawaliRoutes.route("/tracks", trackRoute);
surawaliRoutes.route("/programs", programRoute);
surawaliRoutes.route("/pregnancy", pregnancyRoute);
surawaliRoutes.route("/discover", discoverRoute);
surawaliRoutes.route("/favorites", favoritesRoute);
surawaliRoutes.route("/progress", progressRoute);
surawaliRoutes.route("/subscriptions", subscriptionRoute);
surawaliRoutes.route("/notifications", notificationsRoute);
surawaliRoutes.route("/stream", streamRoute);

export default surawaliRoutes;
