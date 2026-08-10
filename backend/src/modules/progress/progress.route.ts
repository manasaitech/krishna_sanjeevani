import { Hono } from "hono";
import { ProgressController } from "./progress.controller";
import { requireAuth } from "../auth/auth.middleware";
import { Env } from "../../shared/config/env";

const progressRoute = new Hono<{ Bindings: Env }>();

progressRoute.use("*", requireAuth());

progressRoute.post("/update", ProgressController.update);
progressRoute.get("/continue-listening", ProgressController.getContinueListening);
progressRoute.get("/history", ProgressController.getHistory);
progressRoute.get("/track/:trackId", ProgressController.getTrackProgress);

export default progressRoute;
