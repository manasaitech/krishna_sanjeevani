import { Hono } from "hono";
import healthRoute from "./health.route";
import authRoute from "../modules/auth/auth.route";
import storageRoute from "../modules/storage/storage.route";
import streamRoute from "./stream.route";

const routes = new Hono();

routes.route("/", healthRoute);
routes.route("/auth", authRoute);
routes.route("/storage", storageRoute);
routes.route("/stream", streamRoute);

export default routes;
