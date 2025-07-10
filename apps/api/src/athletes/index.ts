import { Hono } from "hono";
import { db, tables } from "@fan-athletics/database";

export default new Hono().basePath("/:eventId/athletes").get("/", async (c) => {
	const eventId = c.req.param("eventId");

	const athletes = await db.query.athlete.findMany({
		with: {
			athleteDisciplines: {
				with: {
					discipline: true,
				},
			},
		},
		where: (athlete, { eq }) => eq(athlete.eventId, eventId),
	});

	return c.json(
		athletes.map(({ athleteDisciplines, ...restAthlete }) => ({
			...restAthlete,
			disciplines: athleteDisciplines.map(({ discipline }) => discipline),
		})),
	);
});
