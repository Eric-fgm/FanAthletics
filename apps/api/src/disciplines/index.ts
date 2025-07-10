import { Hono } from "hono";
import { db, tables } from "@fan-athletics/database";

export default new Hono()
	.basePath("/:eventId/disciplines")
	.get("/", async (c) => {
		const eventId = c.req.param("eventId");

		const disciplines = await db.query.discipline.findMany({
			where: (discipline, { eq }) => eq(discipline.eventId, eventId),
		});

		return c.json(disciplines);
	})
	.get("/:id", async (c) => {
		const id = c.req.param("id");

		const discipline = await db.query.discipline.findFirst({
			where: (discipline, { eq }) => eq(discipline.id, id),
		});

		if (!discipline) return c.notFound();

		return c.json(discipline);
	});
