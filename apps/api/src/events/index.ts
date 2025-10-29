import { db, operators, tables } from "@fan-athletics/database";
import { Hono } from "hono";

export default new Hono()
	.get("/", async (c) => {
		const { available } = c.req.query();

		const filters = [];
		const nowDate = new Date();

		if (available === "date")
			filters.push(
				operators.gt(tables.event.startAt, nowDate),
				operators.lt(tables.event.endAt, nowDate),
			);

		const events = await db
			.select()
			.from(tables.event)
			.where(operators.and(...filters));

		return c.json(events);
	})
	.get("/:eventId", async (c) => {
		const eventId = c.req.param("eventId");

		const foundEvent = await db.query.event.findMany({
			where: (event, { eq }) => eq(event.id, eventId),
			limit: 100,
		});

		if (!foundEvent) {
			return c.notFound();
		}

		return c.json(foundEvent);
	})
	.get("/:eventId/competitions", async (c) => {
		const eventId = c.req.param("eventId");

		const competitions = await db
			.select()
			.from(tables.competition)
			.innerJoin(
				tables.discipline,
				operators.eq(tables.discipline.id, tables.competition.disciplineId),
			)
			.where(operators.eq(tables.discipline.eventId, eventId))
			.limit(10);

		const competitionsWithCompetitors = await Promise.all(
			competitions.map(async ({ competition, discipline }) => ({
				...competition,
				discipline,
				competitors: (
					await db.query.competitor.findMany({
						with: {
							athlete: true,
						},
						where: (competitor, { eq }) =>
							eq(competitor.competitionId, competition.id),
					})
				).map(({ athlete, place, results }) => ({
					...athlete,
					place,
					results,
				})),
			})),
		);

		return c.json(competitionsWithCompetitors);
	})
	.get("/:eventId/disciplines", async (c) => {
		const eventId = c.req.param("eventId");

		const disciplines = await db.query.discipline.findMany({
			where: (discipline, { eq }) => eq(discipline.eventId, eventId),
			limit: 100,
		});

		return c.json(disciplines);
	})
	.get("/:eventId/athletes", async (c) => {
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
			// limit: 100,
		});

		return c.json(
			athletes.map(({ athleteDisciplines, ...restAthlete }) => ({
				...restAthlete,
				disciplines: athleteDisciplines.map(({ discipline }) => discipline),
			})),
		);
	});
