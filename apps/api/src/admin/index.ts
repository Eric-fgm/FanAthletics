import { db, operators, tables } from "@fan-athletics/database";
import type { User } from "@fan-athletics/shared/types";
import { Hono } from "hono";
import { requireDev, requireUser } from "#/middlewares";

export default new Hono<{ Variables: { user: User } }>().get(
	"/",
	requireDev,
	requireUser(),
	async (c) => {
		const user = c.get("user");

		await db
			.update(tables.user)
			.set({ role: "admin" })
			.where(operators.eq(tables.user.id, user.id));

		return c.status(204);
	},
);
