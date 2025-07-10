import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import auth from "#/auth";
import events from "#/events";
import { cors } from "#/middlewares";
import users from "#/users";
import disciplines from "#/disciplines";
import athletes from "#/athletes";

const app = new Hono();

app
	.basePath("/api")
	.use(cors)
	.route("/v1/auth", auth)
	.route("/v1/events", events)
	.route("/v1/events", disciplines)
	.route("/v1/events", athletes)
	.route("/v1/users", users);

serve({ fetch: app.fetch, port: Number.parseInt(process.env.PORT ?? "8000") });
