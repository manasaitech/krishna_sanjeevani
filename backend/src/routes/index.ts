import { Hono } from "hono";
import healthRoute from "./health.route";
import authRoute from "../modules/auth/auth.route";

const routes = new Hono();

routes.route("/", healthRoute);
routes.route("/auth", authRoute);

export default routes;
