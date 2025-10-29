import { db, operators, tables } from "@fan-athletics/database";
import type { Athlete, Discipline } from "@fan-athletics/shared/types";
import { Hono } from "hono";
import { clamp } from "#/utils/math";

export default new Hono()
	.get("/", async (c) => {
		// Można usunąć limity, bo zwraca tylko 50 zawodników
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
				operators.sql`${tables.athlete}.id IN (
					SELECT ${tables.athleteDiscipline.athleteId}
					FROM ${tables.athleteDiscipline}
					WHERE ${tables.athleteDiscipline.disciplineId} = ${disciplineId}
				)`,
			);

		const result = await db
			.select({
				athlete: operators.sql<Athlete>`to_jsonb(${tables.athlete})`,
				disciplines: operators.sql<Discipline>`COALESCE(
      json_agg(DISTINCT to_jsonb(${tables.discipline}))
      FILTER (WHERE ${tables.discipline}.id IS NOT NULL),
      '[]'
    )`,
			})
			.from(tables.athlete)
			.leftJoin(
				tables.athleteDiscipline,
				operators.eq(tables.athlete.id, tables.athleteDiscipline.athleteId),
			)
			.leftJoin(
				tables.discipline,
				operators.eq(
					tables.discipline.id,
					tables.athleteDiscipline.disciplineId,
				),
			)
			.where(operators.and(...filters))
			.groupBy(tables.athlete.id)
			.limit(limit)
			.offset(offset);

		return c.json(
			result.map(({ athlete, disciplines }) => ({ ...athlete, disciplines })),
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
