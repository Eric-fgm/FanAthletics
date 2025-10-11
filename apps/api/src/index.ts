import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import admin from "#/admin";
import athletes from "#/athletes";
import auth from "#/auth";
import competitions from "#/competitions";
import disciplines from "#/disciplines";
import events from "#/events";
import game from "#/game";
import { cors, requireUser } from "#/middlewares";
import search from "#/search";
import users from "#/users";

const app = new Hono();

app
	.basePath("/api")
	.use(cors)
	.route("/v1/auth", auth)
	.route("/v1/admin", admin)
	.use(requireUser())
	.route("/v1/events", events)
	.route("v1/competitions", competitions)
	.route("v1/disciplines", disciplines)
	.route("v1/athletes", athletes)
	.route("v1/search", search)
	.route("/v1/users", users)
	.route("/v1/game", game);

serve({ fetch: app.fetch, port: Number.parseInt(process.env.PORT ?? "8000") });
