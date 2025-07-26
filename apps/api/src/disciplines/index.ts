import { db, operators, tables } from "@fan-athletics/database";
import { Hono } from "hono";
import { clamp } from "#/utils/math";

export default new Hono()
	.get("/", async (c) => {
		const { page, perPage, name, eventId, athleteId } = c.req.query();

		const limit = clamp(perPage ? Number.parseInt(perPage, 10) : 50, 5, 100);
		const offset =
			clamp(page ? Number.parseInt(page, 10) - 1 : 0, 0, 999) * limit;

		const filters = [];

		if (name) filters.push(operators.ilike(tables.discipline.name, name));
		if (eventId) filters.push(operators.eq(tables.discipline.eventId, eventId));
		if (athleteId)
			filters.push(operators.eq(tables.athleteDiscipline.athleteId, athleteId));

		const result = await db
			.selectDistinct()
			.from(tables.discipline)
			.innerJoin(
				tables.athleteDiscipline,
				operators.eq(
					tables.athleteDiscipline.disciplineId,
					tables.discipline.id,
				),
			)
			.where(operators.and(...filters))
			.limit(limit)
			.offset(offset);

		return c.json(result.map(({ discipline }) => discipline));
	})
	.get("/:disciplineId", async (c) => {
		const id = c.req.param("disciplineId");

		const discipline = await db.query.discipline.findFirst({
			where: (discipline, { eq }) => eq(discipline.id, id),
		});

		if (!discipline) return c.notFound();

		return c.json(discipline);
	});
// .get("/:disciplineId/competitions", async (c) => {
// 	const disciplineId = c.req.param("disciplineId");

// 	const competitions = await db
// 		.select()
// 		.from(tables.competition)
// 		.where(operators.eq(tables.competition.disciplineId, disciplineId));

// 	return c.json(competitions);
// });
// .get("/competitions", async (c) => {
// 	const eventId: string = c.req.param("eventId");

// 	const eventDisciplines = await db
// 		.select()
// 		.from(tables.discipline)
// 		.where(operators.eq(tables.discipline.eventId, eventId));
// 	let eventCompetitions: Competition[] = [];
// 	for (const discipline of eventDisciplines) {
// 		const disciplineCompetitions = await db.query.competition.findMany({
// 			where: (competition, { eq }) =>
// 				eq(competition.disciplineId, discipline.id),
// 		});
// 		// console.log(disciplineCompetitions);
// 		eventCompetitions = eventCompetitions.concat(disciplineCompetitions);
// 	}
// 	console.log(eventCompetitions.length);
// 	return c.json(eventCompetitions);
// })

// .delete("/", async (c) => {
// 	const eventId = c.req.param("eventId");

// 	const disciplinesIds: { id: string }[] = await db
// 		.select({ id: tables.discipline.id })
// 		.from(tables.discipline)
// 		.where(operators.eq(tables.discipline.eventId, eventId));
// 	for (const discipline of disciplinesIds) {
// 		await db
// 			.delete(tables.competition)
// 			.where(operators.eq(tables.competition.disciplineId, discipline.id));
// 	}
// 	await db
// 		.delete(tables.discipline)
// 		.where(operators.eq(tables.discipline.eventId, eventId));
// 	console.log(
// 		`Disciplines successfully deleted from event witch id is ${eventId}.`,
// 	);
// 	return c.json({ message: "All events successfully deleted" }, 200);
// })
