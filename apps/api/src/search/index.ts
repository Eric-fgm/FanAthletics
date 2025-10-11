import { db } from "@fan-athletics/database";
import { Hono } from "hono";

export default new Hono().get("/", async (c) => {
	const { query: rawQuery = "" } = c.req.query();

	const query = rawQuery.trim();

	const athletesResult = await db.query.athlete.findMany({
		limit: 5,
		with: {
			event: true,
		},
		where: (athlete, { ilike, sql }) =>
			ilike(
				sql`${athlete.firstName} || ' ' || ${athlete.lastName}`,
				`%${query}%`,
			),
	});

	const disciplinesResult = await db.query.discipline.findMany({
		limit: 5,
		with: {
			event: true,
		},
		where: (discipline, { ilike }) => ilike(discipline.name, `%${query}%`),
	});

	return c.json({
		athletes: athletesResult,
		disciplines: disciplinesResult,
	});
});
