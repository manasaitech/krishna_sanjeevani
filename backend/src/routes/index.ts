import { Hono } from "hono";
import healthRoute from "./health.route";

const routes = new Hono();

routes.route("/", healthRoute);

export default routes;
