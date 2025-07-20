import { db, operators, tables } from "@fan-athletics/database";
import { Hono } from "hono";
import { clamp } from "#/utils/math";

export default new Hono()
	.get("/", async (c) => {
		const { page, perPage, name, eventId, disciplineId } = c.req.query();

		const limit = clamp(perPage ? Number.parseInt(perPage, 10) : 50, 5, 100);
		const offset =
			clamp(page ? Number.parseInt(page, 10) - 1 : 0, 0, 999) * limit;

		const filters = [];

		if (name)
			filters.push(
				operators.ilike(tables.athlete.firstName, name),
				operators.ilike(tables.athlete.lastName, name),
			);
		if (eventId) filters.push(operators.eq(tables.athlete.eventId, eventId));
		if (disciplineId)
			filters.push(
				operators.eq(tables.athleteDiscipline.disciplineId, disciplineId),
			);

		const result = await db
			.selectDistinct()
			.from(tables.athlete)
			.innerJoin(
				tables.athleteDiscipline,
				operators.eq(tables.athleteDiscipline.athleteId, tables.athlete.id),
			)
			.where(operators.or(...filters))
			.limit(limit)
			.offset(offset);

		return c.json(result.map(({ athlete }) => athlete));
	})
	.get("/:athleteId", async (c) => {
		const athleteId = c.req.param("athleteId");

		const foundAthlete = await db.query.athlete.findFirst({
			with: {
				athleteDisciplines: {
					with: {
						discipline: true,
					},
				},
			},
			where: (athlete, { eq }) => eq(athlete.id, athleteId),
		});

		if (!foundAthlete) {
			return c.notFound();
		}

		return c.json(foundAthlete);
	});
