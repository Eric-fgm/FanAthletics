import { db } from "@fan-athletics/database";
import { Hono } from "hono";

export default new Hono().get("/:id", async (c) => {
	const id = c.req.param("id");

	const foundUser = await db.query.user.findFirst({
		where: (users, { eq }) => eq(users.id, id),
	});

	if (!foundUser) {
		throw new Error("Not found user");
	}

	return c.json(foundUser);
});
