import "dotenv/config";
import auth from "@/auth";
import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();

app
	.basePath("/api")
	.on(["POST", "GET"], "/v1/auth/*", (c) => auth.handler(c.req.raw));

serve({ fetch: app.fetch, port: 8000 });
