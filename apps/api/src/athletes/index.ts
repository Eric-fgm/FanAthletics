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

		return c.json(
			await Promise.all(
				result.map(async ({ athlete, athlete_discipline }) => ({
					...athlete,
					disciplines: await db.query.discipline.findMany({
						where: (table) =>
							operators.eq(table.id, athlete_discipline.disciplineId),
					}),
				})),
			),
		);
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

		const { athleteDisciplines, ...restAthlete } = foundAthlete;

		return c.json({
			...restAthlete,
			disciplines: athleteDisciplines.map(({ discipline }) => discipline),
		});
	})
	.get("/:athleteId/personal-records", async (c) => {
		const athleteId = c.req.param("athleteId");

		const foundPersonalRecords = await db.query.personalRecords.findMany({
			where: (personalRecord, { eq }) =>
				eq(personalRecord.athleteId, athleteId),
		});

		if (!foundPersonalRecords) {
			return c.notFound();
		}

		return c.json(foundPersonalRecords);
	})
	.get("/:athleteId/season-bests", async (c) => {
		const athleteId = c.req.param("athleteId");

		const foundSeasonBests = await db.query.seasonBests.findMany({
			where: (seasonBest, { eq }) => eq(seasonBest.athleteId, athleteId),
		});

		if (!foundSeasonBests) {
			return c.notFound();
		}

		return c.json(foundSeasonBests);
	});
