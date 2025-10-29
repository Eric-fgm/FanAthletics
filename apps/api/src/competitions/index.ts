import { db, operators, tables } from "@fan-athletics/database";
import { Hono } from "hono";
import { clamp } from "#/utils/math";

export default new Hono().get("/", async (c) => {
	const { page, perPage, eventId, athleteId, disciplineId } = c.req.query();

	const limit = clamp(perPage ? Number.parseInt(perPage, 10) : 50, 5, 100);
	const offset =
		clamp(page ? Number.parseInt(page, 10) - 1 : 0, 0, 999) * limit;

	const filters = [];

	if (eventId) filters.push(operators.eq(tables.discipline.eventId, eventId));
	if (disciplineId)
		filters.push(operators.eq(tables.competition.disciplineId, disciplineId));
	if (athleteId)
		filters.push(operators.eq(tables.competitor.athleteId, athleteId));

	let query = db
		.select()
		.from(tables.competition)
		.innerJoin(
			tables.discipline,
			operators.eq(tables.discipline.id, tables.competition.disciplineId),
		);
	
	if (athleteId) {
		query = query
			.innerJoin(
				tables.competitor,
				operators.eq(tables.competitor.competitionId, tables.competition.id),
			);
	}

	const competitions = await query
		.where(operators.and(...filters))
		.limit(limit)
		.offset(offset);

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
});
