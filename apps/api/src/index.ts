import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import auth from "#/auth";
import events from "#/events";
import { cors } from "#/middlewares";

const app = new Hono();

app
	.basePath("/api")
	.use(cors)
	.route("/v1/auth", auth)
	.route("/v1/events", events);

serve({ fetch: app.fetch, port: Number.parseInt(process.env.PORT ?? "8000") });
