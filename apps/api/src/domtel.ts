import { db, operators, tables } from "@fan-athletics/database";
import { domtel } from "#/utils/constants";
import { fetchCSV } from "#/utils/file";

type Schedule = Record<
	string,
	{
		Data: string;
	}
>;

type Curriculum = Record<
	string,
	{
		Godzina: string;
		Wyniki: 0 | 1;
		Pelna_nazwa: string;
		Plec: string;
		Nazwa_FINISH: string;
		Konkurencja: string;
		seria: string;
		runda: string;
		NazwaRundy: string;
		seriaMax: string;
		Godzina_zak1?: string | null;
	}
>;

interface CompetitionDetails {
	Pelna_nazwa: string;
	Plec: string;
	Nazwa_FINISH: string;
	Konkurencja: string;
	Typ: string;
	NazwaRundy: string;
	Data: string;
	Godzina: string;
	Godzina_zak?: string | null;
	Wiatr: string;
	NrBiegu: string;
}

interface CompetitionResult {
	Miejsce: string;
	Pozycja_Tor: string;
	Grupa_Seria: string;
	NrStart: string;
	Zawodnik: string;
	DataUr: string;
	Klub: string;
	PB: string;
	SB: string;
	WYS1: null;
	WIATR1: null;
	WYS2: null;
	WIATR2: null;
	WYS3: null;
	WIATR3: null;
	WYS4: null;
	WIATR4: null;
	WYS5: null;
	WIATR5: null;
	WYS6: null;
	WYS7: null;
	WYS8: null;
	WYS9: null;
	WYS10: null;
	Wys11: null;
	Wys12: null;
	Wys13: null;
	Wys14: null;
	Wys15: null;
	Wys16: null;
	Wys17: null;
	Wys18: null;
	Wynik: string;
	Tysieczne: string;
	Reakcja: string;
	Info: null;
	Punkty: string | null;
	Ranking: string;
	PK: string;
}

type Competition = Record<string, CompetitionDetails | CompetitionResult>;

const getSchedule = async (app: string) => {
	const response = await fetch(
		`https://${app}.domtel-sport.pl/api/program_dzien.php`,
	);

	if (!response.ok) {
		throw new Error("Error while fetching schedule");
	}

	const schedule = (await response.json()) as Schedule;

	return Object.values(schedule).map(({ Data }) => Data);
};

const getCurriculum = async (app: string, day: number | string) => {
	const response = await fetch(
		`https://${app}.domtel-sport.pl/api/program_dzien.php?dzien=${day}`,
	);

	if (!response.ok) {
		throw new Error("Error while fetching curriculum");
	}

	const curriculum = (await response.json()) as Curriculum;

	return Object.values(curriculum);
};

const getCompetitionsWithResults = async (
	app: string,
	name: string,
	round: number,
	series: number,
) => {
	const response = await fetch(
		`https://${app}.domtel-sport.pl/api/konkurencja.php?konkur=${name}&runda=${round}&seria=${series}`,
	);

	if (!response.ok) {
		throw new Error("Error while fetching competitions");
	}

	const competitions = (await response.json()) as Competition;

	const [details, ...results] = Object.values(competitions);

	return {
		details: details as CompetitionDetails,
		results: results.filter(
			(result) => result && (result as CompetitionResult).Miejsce,
		) as CompetitionResult[],
	};
};

const upsertCompetition = async (
	disciplineId: string,
	round: number,
	series: number,
	payload: CompetitionDetails,
) => {
	const foundCompetition = await db.query.competition.findFirst({
		where: (table, { and, eq }) =>
			and(
				eq(table.disciplineId, disciplineId),
				eq(table.round, round),
				eq(table.series, series),
			),
	});

	if (foundCompetition) {
		await db
			.update(tables.competition)
			.set({
				endedAt: payload.Godzina_zak
					? new Date(`${payload.Data}T${payload.Godzina_zak}`)
					: undefined,
				trials: {
					wind: payload.Wiatr,
				},
			})
			.where(
				operators.and(
					operators.eq(tables.competition.disciplineId, disciplineId),
					operators.eq(tables.competition.round, round),
					operators.eq(tables.competition.series, series),
				),
			);

		return foundCompetition;
	}

	const [competition] = await db
		.insert(tables.competition)
		.values({
			disciplineId,
			round,
			series,
			note: payload.NazwaRundy,
			trials: {
				wind: payload.Wiatr,
			},
			startAt: new Date(`${payload.Data}T${payload.Godzina}`),
			endedAt: payload.Godzina_zak
				? new Date(`${payload.Data}T${payload.Godzina_zak}`)
				: undefined,
		})
		.returning();

	if (!competition) {
		throw new Error("Error while upserting competition");
	}

	return competition;
};

export const processCompetitionsAndResults = async (
	app: string,
	eventId: string,
) => {
	const schedule = await getSchedule(app);
	const curriculums = (
		await Promise.all(schedule.map((_, index) => getCurriculum(app, index + 1)))
	).flat();

	for (const { Konkurencja, seria, seriaMax } of curriculums) {
		try {
			const round = Number.parseInt(seria, 10);
			const metadata = domtel.disciplines[
				Konkurencja as keyof (typeof domtel)["disciplines"]
			] ?? {
				name: Konkurencja,
				record: "-",
			};

			const discipline = await db.query.discipline.findFirst({
				where: (table, { and, eq }) =>
					and(eq(table.name, metadata.name), eq(table.eventId, eventId)),
			});

			if (discipline) {
				for (
					let series = 1;
					series <= Number.parseInt(seriaMax, 10);
					series++
				) {
					const { details, results } = await getCompetitionsWithResults(
						app,
						Konkurencja,
						round,
						series,
					);

					const competition = await upsertCompetition(
						discipline.id,
						round,
						series,
						details,
					);

					await Promise.all(
						results.map(async (result) => {
							const athlete = await db.query.athlete.findFirst({
								where: (table, { and, eq }) =>
									and(
										eq(table.eventId, eventId),
										eq(table.number, Number.parseInt(result.NrStart, 10)),
									),
							});
							if (athlete) {
								await db
									.insert(tables.competitor)
									.values({
										athleteId: athlete.id,
										competitionId: competition.id,
										place: result.Miejsce !== "0" ? Number.parseInt(result.Miejsce, 10) : 9999,
										results: {
											score: result.Wynik,
											ranking: result.Ranking,
										},
									})
									.onConflictDoNothing();
								await db
									.insert(tables.athleteDiscipline)
									.values({
										athleteId: athlete.id,
										disciplineId: discipline.id,
									})
									.onConflictDoNothing();
							}
						}),
					);
				}
			}
		} catch (e) {
			console.log(e);
		}
	}
};

export const getDisciplines = async (app: string) => {
	const responses = await Promise.all(
		["M", "K"].map((gender) =>
			fetch(`https://${app}.domtel-sport.pl/api/program.php?plec=${gender}`),
		),
	);

	if (responses.some((response) => !response.ok)) {
		throw new Error("Error while fetching disciplines");
	}

	const disciplinesLists = (await Promise.all(
		responses.map((response) => response.json()),
	)) as Record<string, { Konkurencja: string }>[];

	return disciplinesLists
		.flatMap((disciplines) => Object.values(disciplines))
		.map(({ Konkurencja }) => Konkurencja);
};

export const saveDiscplines = async (
	eventId: string,
	disciplines: string[],
) => {
	await Promise.all(
		disciplines.map(async (discipline) => {
			const metadata = domtel.disciplines[
				discipline as keyof (typeof domtel)["disciplines"]
			] ?? {
				name: discipline,
				record: "-",
			};

			await db.insert(tables.discipline).values({
				...metadata,
				eventId,
				icon: "trophy",
			});
		}),
	);
};

export const getAthletes = async (domtelName: string) => {
	return (
		await fetchCSV(
			`https://${domtelName}.domtel-sport.pl/api/zawodnicy_spis.php`,
			(row) => {
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
					imageUrl: "https://starter.pzla.pl/foto/277503.jpg?m=20230118093122",
					cost: 100,
					updatedAt: nowDate,
					createdAt: nowDate,
				};
			}),
		);
	}
};
