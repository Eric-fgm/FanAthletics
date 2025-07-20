import { db, tables } from "./index.js";

const clearDatabase = async () => {
	await Promise.all(
		[
			...Object.keys(tables),
			"athlete_meta",
			"team_member",
			"athlete_discipline",
		].map(async (table) =>
			db.execute(
				`DROP TABLE IF EXISTS "public.${table}" CASCADE; DROP TABLE IF EXISTS "${table}" CASCADE`,
			),
		),
	);
};

clearDatabase();
