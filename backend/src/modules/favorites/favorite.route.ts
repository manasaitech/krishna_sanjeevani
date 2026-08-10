import { Hono } from "hono";
import { FavoriteController } from "./favorite.controller";
import { requireAuth } from "../auth/auth.middleware";
import { Env } from "../../shared/config/env";

const favoritesRoute = new Hono<{ Bindings: Env }>();

favoritesRoute.use("*", requireAuth());

favoritesRoute.get("/", FavoriteController.list);
favoritesRoute.post("/", FavoriteController.add);
favoritesRoute.delete("/:itemId", FavoriteController.remove);
favoritesRoute.get("/:itemId/status", FavoriteController.status);

export default favoritesRoute;
