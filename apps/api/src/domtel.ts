import { db, tables } from "@fan-athletics/database";
import { domtel } from "#/utils/constants";
import { fetchCSV } from "#/utils/file";

export const getCompetitions = async (domtelName: string) => {
	const daysResponse = await fetch(
		`https://${domtelName}.domtel-sport.pl/api/program_dzien.php`,
	);

	if (!daysResponse.ok) {
		console.error("Error during days fetching, status: ", daysResponse.status);
		return [];
	}

	const daysData = (await daysResponse.json()) as Record<string, unknown>;
	const days = Object.keys(daysData);

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	let competitions: any[] = [];
	for (const day of days) {
		const response = await fetch(
			`https://${domtelName}.domtel-sport.pl/api/program_dzien.php?dzien=${day}`,
		);
		if (response.ok) {
			const competitionsData = (await response.json()) as Record<
				string,
				{ dzien: string }
			>;
			const competitionsOfDay = [];
			const competitionsNumbers = Object.keys(competitionsData);
			for (const key of competitionsNumbers)
				competitionsOfDay.push(
					// biome-ignore lint/style/noNonNullAssertion: <explanation>
					competitionsData[key as keyof typeof competitionsData]!,
				);

			for (const competition of competitionsOfDay)
				competition.dzien = (daysData[day] as { Data: string }).Data;

			console.log(competitionsOfDay.length);
			competitions = competitions.concat(competitionsOfDay);
		} else {
			console.error(
				"Error during competitions fetching, status: ",
				response.status,
			);
			return competitions;
		}
	}
	return competitions;
};

export const saveDiscplineWithCompetition = async (
	eventId: string,
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	comp: any,
) => {
	const compName: string = comp.Konkurencja;
	if (compName === "cer") return;

	const domtelCompetition =
		domtel.disciplines[compName as keyof (typeof domtel)["disciplines"]] ?? {};

	const [discipline] = await db
		.insert(tables.discipline)
		.values({
			eventId: eventId,
			icon: "trophy",
			name: domtelCompetition.name ?? compName,
			record: domtelCompetition.record ?? "-",
		})
		.onConflictDoNothing()
		.returning();

	const disciplineId =
		discipline?.id ??
		(
			await db.query.discipline.findFirst({
				columns: { id: true },
				where: (discipline, { eq, and }) =>
					and(eq(discipline.eventId, eventId), eq(discipline.name, compName)),
			})
		)?.id;

	if (!disciplineId) return;

	await db
		.insert(tables.competition)
		.values({
			disciplineId: disciplineId,
			seriesCount: comp.seriaMax,
			note: comp.seria,
			trials: {} as JSON,
			startAt: new Date(`${comp.dzien}T${comp.Godzina}:00`),
		})
		.onConflictDoNothing();
};

export const getAthletes = async (domtelName: string) => {
	return (
		await fetchCSV(
			`https://${domtelName}.domtel-sport.pl/api/zawodnicy_spis.php`,
			(row) => {
				console.log(row);

				if (
					row &&
					typeof row === "object" &&
					"Numer" in row &&
					"Data" in row &&
					"Klub" in row &&
					typeof row.Numer === "string" &&
					typeof row.Data === "string" &&
					typeof row.Klub === "string"
				) {
					return {
						number: row.Numer,
						name: row.Data,
						club: row.Klub,
					};
				}
				return null;
			},
		)
	).filter((row) => !!row);
};

export const saveAthletes = async (
	eventId: string,
	_athletes: { number: string; name: string; club: string }[],
) => {
	const CHUNK_SIZE = 100;
	const athletes = [..._athletes];

	while (athletes.length) {
		const nowDate = new Date();
		const chunkOfAthletes = athletes.splice(CHUNK_SIZE);

		if (!chunkOfAthletes.length) return;

		await db.insert(tables.athlete).values(
			chunkOfAthletes.map((athlete) => {
				const [lastName = "?", firstName = "?"] = athlete.name.split(" ");
				return {
					eventId,
					firstName,
					lastName,
					number: Number.parseInt(athlete.number, 10),
					coach: athlete.club,
					cost: 100,
					updatedAt: nowDate,
					createdAt: nowDate,
				};
			}),
		);
	}
};
