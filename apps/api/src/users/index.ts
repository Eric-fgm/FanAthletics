import { db } from "@fan-athletics/database";
import { Hono } from "hono";

export default new Hono().get("/:userId", async (c) => {
	const userId = c.req.param("userId");

	const foundUser = await db.query.user.findFirst({
		where: (users, { eq }) => eq(users.id, userId),
	});

	if (!foundUser) {
		return c.notFound();
	}

	return c.json(foundUser);
});
