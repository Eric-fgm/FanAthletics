import { db, tables } from "./index.js";

const clearDatabase = async () => {
	console.log("[INFO] Starting...");

	for (const table of [
		...Object.keys(tables),
		"athlete_meta",
		"team_member",
		"athlete_discipline",
		"personal_records",
		"game_specification",
		"season_bests",
	]) {
		const dropQueries = [
			`DROP TABLE IF EXISTS "public.${table}" CASCADE`,
			`DROP TABLE IF EXISTS "${table}" CASCADE`,
		];

		for (const query of dropQueries) {
			try {
				await db.execute(query);
			} catch (err) {
				console.error(`Failed to drop table "${table}":`, err);
			}
		}
		console.log(`[INFO] Drop ${table}`);
	}

	console.log("[INFO] Finished");
};

clearDatabase();
