import path from "node:path";
import { getAI, getFilesAI, getModelAI } from "@fan-athletics/ai";
import { db, operators, tables } from "@fan-athletics/database";
import type {
	AthletePayload,
	CompetitorResults,
	DisciplinePayload,
	EventPayload,
} from "@fan-athletics/shared/types";
import { Hono } from "hono";
import {
	getAthletes,
	getCompetitionsWithResults,
	getDisciplines,
	processCompetitionsAndResults,
	saveAthletes,
	saveDiscplines,
} from "#/domtel";
import { requireUser } from "#/middlewares";
import { convertToPolishDateTime } from "#/utils/functions";

const EVENT_IMAGE_PLACEHOLDER =
	"https://assets.aws.worldathletics.org/large/610276d3511e6525b0b00ef6.jpg";
const EVENT_ICON_PLACEHOLDER =
	"https://img.olympics.com/images/image/private/t_s_fog_logo_m/f_auto/primary/w993kgqcncimz5gw0uza";

const adminApp = new Hono().use(requireUser("admin"));

const eventsApp = new Hono()
	.post("/", async (c) => {
		const body = await c.req.json<EventPayload>();

		const [event] = await db
			.insert(tables.event)
			.values({
				name: body.name,
				organization: body.organization,
				image:
					body.image && body.image !== ""
						? body.image
						: EVENT_IMAGE_PLACEHOLDER,
				icon:
					body.icon && body.icon !== "" ? body.icon : EVENT_ICON_PLACEHOLDER,
				domtelApp: body.domtelApp,
				domtelPhotos: body.domtelPhotos,
				startAt: new Date(),
				endAt: new Date(),
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		if (!event) {
			return c.json({ message: "Database error!" }, 500);
		}

		// Domyślnie ustawiany jest budżet i maksymana liczba wymian.
		await db.insert(tables.gameSpecification).values({
			eventId: event.id,
		});

		if (event.domtelApp) {
			const disciplines = await getDisciplines(event.domtelApp);
			await saveDiscplines(event.id, disciplines);

			const athletes = await getAthletes(event.domtelApp);

			await saveAthletes(event.id, athletes);
			// TODO tutaj trzeba będzie dodać nadawanie kosztu zawodnikom

			await processCompetitionsAndResults(event.domtelApp, event.id, false);
		}

		getResultsPeriodically(event.id);
		blockGame(event.id);
		countPoints(event.id);

		return c.json({ message: "Event successfully created!" }, 201);
	})
	.post("/:eventId/pull", async (c) => {
		const eventId = c.req.param("eventId");
		const foundEvent = await db.query.event.findFirst({
			where: (event, { eq }) => eq(event.id, eventId),
		});

		if (!foundEvent || !foundEvent.domtelApp) {
			return c.notFound();
		}

		try {
			await processCompetitionsAndResults(foundEvent.domtelApp, foundEvent.id);
		} catch (e) {
			console.log(e);
		}

		return c.json({ message: "Competitions successfully processed!" }, 200);
	})
	.put("/:eventId", async (c) => {
		const body = await c.req.json<Partial<EventPayload>>();
		const eventId = c.req.param("eventId");

		await db
			.update(tables.event)
			.set({
				...body,
				updatedAt: new Date(),
			})
			.where(operators.eq(tables.event.id, eventId));

		return c.json({ message: "Event successfully updated!" }, 200);
	})
	.delete("/:eventId", async (c) => {
		const eventId = c.req.param("eventId");

		const foundEvent = await db.query.event.findFirst({
			where: (event, { eq }) => eq(event.id, eventId),
		});

		if (!foundEvent) {
			return c.notFound();
		}
		if (foundEvent.startAt <= new Date()) {
			return c.json(
				{ message: "Event has already started, so it cannot be deleted!" },
				400,
			);
		}

		await db.delete(tables.event).where(operators.eq(tables.event.id, eventId));

		return c.json({ message: "Event successfully created!" }, 200);
	});

const disciplinesApp = new Hono()
	.post("/", async (c) => {
		const payload = await c.req.json<DisciplinePayload>();
		const nowDate = new Date();

		await db.insert(tables.discipline).values({
			...payload,
			updatedAt: nowDate,
			createdAt: nowDate,
		});

		return c.json({ message: "Discipline successfully created!" }, 201);
	})
	.put("/:disciplineId", async (c) => {
		const payload = await c.req.json<Partial<DisciplinePayload>>();
		const disciplineId = c.req.param("disciplineId");

		await db
			.update(tables.discipline)
			.set({ ...payload, updatedAt: new Date() })
			.where(operators.eq(tables.discipline.id, disciplineId));

		return c.json({ message: "Discipline successfully updated!" }, 200);
	})
	.delete("/:disciplineId", async (c) => {
		const disciplineId = c.req.param("disciplineId");

		await db
			.delete(tables.competition)
			.where(operators.eq(tables.competition.disciplineId, disciplineId));

		await db
			.delete(tables.discipline)
			.where(operators.eq(tables.discipline.id, disciplineId));

		return c.json({ message: "Discipline successfully deleted" }, 200);
	});

const athletesApp = new Hono().put("/:athleteId", async (c) => {
	const payload = await c.req.json<Partial<AthletePayload>>();
	const athleteId = c.req.param("athleteId");

	await db
		.update(tables.athlete)
		.set({ ...payload, updatedAt: new Date() })
		.where(operators.eq(tables.athlete.id, athleteId));

	return c.json({ message: "Athlete successfully updated!" }, 200);
});

const aiApp = new Hono().post("/:eventId", async (c) => {
	const eventId = c.req.param("eventId");
	const payload = await db.query.gameSpecification.findFirst({
		where: (table, { eq }) => eq(table.eventId, eventId),
	});

	if (!payload)
		return c.json(
			{
				message: "Cannot create AI team because game specification is unknown.",
			},
			404,
		);

	const ai = getAI(process.env.GEMINI_API_KEY as string);
	const files = getFilesAI(ai);
	const model = getModelAI(ai);

	const aiFilePathname = path.join(
		__dirname,
		"../temp",
		`ai-${eventId}-data.txt`,
	);

	const uploadedFile = await files.upload(aiFilePathname);
	const promptResult = await model.generate({
		file: uploadedFile,
		budget: payload.budget,
		numberOfAthletes: payload.numberOfTeamMembers,
	});

	if (!promptResult.text) {
		return c.json({ message: "AI generation error!" }, 500);
	}

	const athletesIds = JSON.parse(promptResult.text) as string[];

	const athletes = await db.query.athlete.findMany({
		where: (athlete, { eq, and, inArray }) =>
			and(eq(athlete.eventId, eventId), inArray(athlete.id, athletesIds)),
	});

	await db
		.delete(tables.aiTeamMember)
		.where(operators.eq(tables.aiTeamMember.eventId, eventId));

	for (const athlete of athletes) {
		await db.insert(tables.aiTeamMember).values({
			athleteId: athlete.id,
			eventId: eventId,
		});
	}

	return c.json(athletes, 200);
});

async function getResultsPeriodically(eventId: string) {
	let event = await db.query.event.findFirst({
		where: (table, { eq }) => eq(table.id, eventId),
	});

	while (!event) {
		event = await db.query.event.findFirst({
			where: (table, { eq }) => eq(table.id, eventId),
		});
	}

	if (!event) return "Unexpected error: Event not found";

	const eventDisciplinesIds = (
		await db.query.discipline.findMany({
			where: (table, { eq }) => eq(table.eventId, event.id),
		})
	).map((d) => d.id);

	const interval = setInterval(async () => {
		const eventCompetitions = await Promise.all(
			(
				await db.query.competition.findMany({
					where: (table, { inArray }) =>
						inArray(table.disciplineId, eventDisciplinesIds),
				})
			)
				.filter((c) => !c.finished)
				.map(async (competition) => {
					const competitionDiscipline = await db.query.discipline.findFirst({
						where: (table, { eq }) => eq(table.id, competition.disciplineId),
					});

					const competitors = await db.query.competitor.findMany({
						where: (table, { eq }) => eq(table.competitionId, competition.id),
					});

					return {
						...competition,
						disciplineName: competitionDiscipline?.code ?? null,
						competitors: competitors,
					};
				}),
		);

		console.log(
			"Number of uncompleted competitions: ",
			eventCompetitions.length,
		);

		if (eventCompetitions.length <= 0) {
			clearInterval(interval);
			return;
		}
		// Można dodać usuwanie sprawdzania wyników konkurencji, jeżeli przy którejś z kolei próbie nie zwraca wyników.
		// Na przykład jeśli minęły trzy dni od kiedy konkurencja się rozpoczęła, to przerywamy nasłuchiwanie - to natomiast
		// powoduje problem przy pobieraniu wyników wydarzenia z przeszłości.
		// Można ewentualnie dodać to sprawdzenie na końcu tej funkcji.

		if (event.domtelApp === null) return "Event is not connected to domtel.";

		const currentDateTime = new Date();
		for (const competition of eventCompetitions) {
			if (!competition.disciplineName) {
				console.warn("Discipline code unknown.");
				continue;
			}

			if (competition.startAt > currentDateTime) {
				console.info(
					`${competition.disciplineName} ${competition.round} ${competition.series} has not started yet.`,
				);
				continue;
			}

			const { details, results } = await getCompetitionsWithResults(
				event.domtelApp,
				competition.disciplineName,
				competition.round,
				competition.series,
			);

			if (results.length !== competition.competitors.length) {
				console.info(
					`${competition.disciplineName} ${competition.round} ${competition.series}: All competitors not fetched yet.`,
				);
				continue;
			}

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
							.update(tables.competitor)
							.set({
								results: {
									result: result.Wynik,
									ranking: result.Ranking,
									place:
										result.Miejsce !== "0"
											? Number.parseInt(result.Miejsce, 10)
											: 9999,
								},
							})
							.where(
								operators.and(
									operators.eq(tables.competitor.athleteId, athlete.id),
									operators.eq(tables.competitor.competitionId, competition.id),
								),
							);
					}
				}),
			);

			await db
				.update(tables.competition)
				.set({
					finished: true,
				})
				.where(operators.eq(tables.competition.id, competition.id));
		}

		return;
	}, 30 * 1000);

	return;
}

async function blockGame(eventId: string) {
	async function setGameIsActive(
		active: boolean,
		date: Date | null,
		finished: boolean,
	) {
		console.log(active, date, finished);
		await db
			.update(tables.gameSpecification)
			.set({
				isActive: active,
				nearestDate: date,
				finished: finished,
			})
			.where(operators.eq(tables.gameSpecification.eventId, eventId));
	}

	let event = await db.query.event.findFirst({
		where: (table, { eq }) => eq(table.id, eventId),
	});

	while (!event) {
		event = await db.query.event.findFirst({
			where: (table, { eq }) => eq(table.id, eventId),
		});
	}

	if (!event) throw new Error("Unexpected error: Event not found");

	const daysDiff: number = Math.ceil(
		(event.endAt.getTime() - event.startAt.getTime()) / (1000 * 3600 * 24),
	);

	const days: string[] = Array.from({ length: daysDiff + 1 }, (_, i) =>
		convertToPolishDateTime(
			new Date(event.startAt.getTime() + i * (1000 * 3600 * 24)),
			"date",
		),
	);

	const eventDisciplinesIds = (
		await db.query.discipline.findMany({
			where: (table, { eq }) => eq(table.eventId, event.id),
		})
	).map((d) => d.id);

	const eventCompetitions = await db.query.competition.findMany({
		where: (table, { inArray }) =>
			inArray(table.disciplineId, eventDisciplinesIds),
	});

	const daysCompetitions = Array.from({ length: daysDiff + 1 }, (_, i) =>
		eventCompetitions.filter(
			(c) => convertToPolishDateTime(c.startAt, "date") === days[i],
		),
	);

	const firstAndLast: { first: Date; last: Date }[] = Array(daysDiff + 1);

	daysCompetitions.forEach((dayCompetitions, i) => {
		const dayCompetitionsStart = dayCompetitions
			.map((c) => new Date(c.startAt))
			.sort((a, b) => {
				if (
					convertToPolishDateTime(a, "time") <
					convertToPolishDateTime(b, "time")
				)
					return -1;
				return 1;
			});

		const lastIndex = dayCompetitionsStart.length - 1;

		firstAndLast[i] = {
			first: dayCompetitionsStart[0] ?? event.startAt,
			last:
				lastIndex >= 0 && dayCompetitionsStart[lastIndex]
					? dayCompetitionsStart[lastIndex]
					: event.startAt,
		};
		firstAndLast[i].first.setMinutes(firstAndLast[i].first.getMinutes() - 5);
		firstAndLast[i].last.setMinutes(firstAndLast[i].last.getMinutes() + 10);
	});

	console.log(firstAndLast);

	setInterval(async () => {
		// Trzeba odświeżać dane o konkurencjach pobierając je na nowo z bazy.
		const eventCompetitions = await db.query.competition.findMany({
			where: (table, { inArray }) =>
				inArray(table.disciplineId, eventDisciplinesIds),
		});

		const daysCompetitions = Array.from({ length: daysDiff + 1 }, (_, i) =>
			eventCompetitions.filter(
				(c) => convertToPolishDateTime(c.startAt, "date") === days[i],
			),
		);

		const currentDateTime = new Date();
		// const currentDay = convertToPolishDateTime(currentDateTime, "date");
		// const currentDay = event.endAt.toLocaleDateString("pl-PL", {
		// 	day: "2-digit",
		// 	month: "2-digit",
		// 	year: "numeric",
		// });
		const currentDay = "2025.01.01";
		const currentTime = convertToPolishDateTime(currentDateTime, "time");
		// const currentTimes = [
		// 	"08:00",
		// 	"09:50",
		// 	"09:00",
		// 	"12:50",
		// 	"13:00",
		// 	"13:20",
		// 	"13:26",
		// 	"17:12",
		// 	"17:15",
		// 	"17:30",
		// 	"17:34",
		// 	"18:02",
		// 	"19:55",
		// 	"21:00",
		// 	"21:30",
		// ];
		// const currentTime =
		// 	currentTimes[Math.floor(Math.random() * currentTimes.length)];
		const index = days.indexOf(currentDay);

		console.log(currentDay, currentTime, days, index);
		console.log(
			"BLOCK: Number of finished competitions: ",
			eventCompetitions.filter((c) => c.finished).length,
		);

		if (index === -1) {
			// Przed dniem rozpoczynającym grę
			console.log(convertToPolishDateTime(event.startAt, "date"), currentDay);
			console.log(currentDay < convertToPolishDateTime(event.startAt, "date"));
			if (currentDay < convertToPolishDateTime(event.startAt, "date"))
				await setGameIsActive(
					true,
					firstAndLast[0]?.first ?? event.startAt,
					false,
				);
			// Po wydarzeniu
			else await setGameIsActive(false, null, true);
			return;
		}

		// console.log(firstAndLast[index]?.first.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }),
		// 	currentTime <
		// 		firstAndLast[index].first.toLocaleTimeString("pl-PL", {
		// 			hour: "2-digit",
		// 			minute: "2-digit",
		// 		}))//, lastCompetition[1].toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }));
		// console.log(firstAndLast[index]?.last.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }), currentTime,
		// 	currentTime >
		// 		firstAndLast[index].last.toLocaleTimeString("pl-PL", {
		// 			hour: "2-digit",
		// 			minute: "2-digit",
		// 		}));

		// console.log(currentTime, currentTime < firstCompetition[0].toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }), currentTime > lastCompetition[1].toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }));

		// Przed rozpoczęciem gry w danym dniu wydarzenia
		if (
			firstAndLast[index] &&
			currentTime < convertToPolishDateTime(firstAndLast[index].first, "time")
		) {
			await setGameIsActive(true, firstAndLast[index]?.first, false);
			return;
		}
		// Po zakończeniu gry w danym dniu wydarzenia
		if (
			firstAndLast[index] &&
			currentTime > convertToPolishDateTime(firstAndLast[index].last, "time") &&
			!daysCompetitions[index]?.some((c) => !c.finished)
		) {
			const nextFirst = firstAndLast[index + 1]?.first;
			if (nextFirst) await setGameIsActive(true, nextFirst, false);
			else await setGameIsActive(false, null, true);
			return;
		}

		// Gra nieaktywna
		const nextLast = firstAndLast[index]?.last;
		if (nextLast) await setGameIsActive(false, nextLast, false);
		else await setGameIsActive(false, null, true);
		return;
	}, 5 * 1000);
}

async function countPoints(eventId: string) {
	const disciplineIds = (
		await db.query.discipline.findMany({
			where: (discipline, { eq }) => eq(discipline.eventId, eventId),
		})
	)
		.filter((dis) => !dis.name.endsWith("pk"))
		.map((dis) => dis.id);

	const interval = setInterval(async () => {
		const competitions = await db.query.competition.findMany({
			where: (competition, { inArray }) =>
				inArray(competition.disciplineId, disciplineIds),
		});

		const filtered = [];

		for (const disciplineId of disciplineIds) {
			const comps = competitions.filter((c) => c.disciplineId === disciplineId);

			if (comps.length === 0) continue;

			const round3Exists = comps.some((c) => c.round === 3);

			if (round3Exists) {
				for (const comp of comps) {
					if (comp.round === 3) filtered.push(comp);
				}
			} else {
				for (const comp of comps) filtered.push(comp);
			}
		}

		const finishedAndCounted = filtered.filter(
			(c) => c.finished && c.pointsAlreadyCounted,
		);

		if (finishedAndCounted.length === filtered.length) {
			console.info("ALL COMPETITIONS ALREADY COUNTED");
			clearInterval(interval);
			return;
		}

		const onlyFinishedAndNotCounted = filtered.filter(
			(c) => c.finished && !c.pointsAlreadyCounted,
		);
		console.log(
			"COMPETITIONS TO BE COUNTED: ",
			onlyFinishedAndNotCounted.length,
		);

		for (const c of onlyFinishedAndNotCounted) {
			await db
				.update(tables.competition)
				.set({
					pointsAlreadyCounted: true,
				})
				.where(operators.eq(tables.competition.id, c.id));
		}

		const competitionIds = filtered
			.filter((c) => !c.pointsAlreadyCounted)
			.map((c) => c.id);

		const competitors = await db.query.competitor.findMany({
			where: (competitor, { inArray }) =>
				inArray(competitor.competitionId, competitionIds),
		});

		for (const competitor of competitors) {
			if (competitor.results) {
				const competitorResults = competitor.results as CompetitorResults;
				const pointsToAdd =
					competitorResults.ranking === "" && competitor.results.place === 0 // Ma DNF, DQ albo DNS
						? 0
						: competitorResults.ranking === ""
							? Math.max(8 - competitor.results.place + 1, 0) // Jest w finale
							: Math.max(8 - Number.parseInt(competitorResults.ranking) + 1, 0); // Konkurencja nie ma finałów
				console.log(
					competitorResults.ranking,
					typeof competitorResults.ranking,
					pointsToAdd,
					Number.parseInt(competitorResults.ranking),
				);

				const teamMembers = await db.query.teamMember.findMany({
					where: (member, { and, eq }) =>
						and(
							eq(member.athleteId, competitor.athleteId),
							eq(member.stillInTeam, true),
						),
				});

				for (const member of teamMembers) {
					await db
						.update(tables.teamMember)
						.set({
							pointsGathered: operators.sql`${tables.teamMember.pointsGathered} + ${member.isCaptain ? pointsToAdd * 2 : pointsToAdd}`,
						})
						.where(
							operators.and(
								operators.eq(
									tables.teamMember.participantId,
									member.participantId,
								),
								operators.eq(tables.teamMember.athleteId, member.athleteId),
								operators.eq(tables.teamMember.isCaptain, member.isCaptain),
								operators.eq(
									tables.teamMember.pointsGathered,
									member.pointsGathered,
								),
							),
						);
				}

				const aiTeamMembers = await db.query.aiTeamMember.findMany({
					where: (table, { eq }) => eq(table.athleteId, competitor.athleteId),
				});

				for (const aiTeamMember of aiTeamMembers) {
					await db
						.update(tables.aiTeamMember)
						.set({
							pointsGathered: operators.sql`${tables.aiTeamMember.pointsGathered} + ${pointsToAdd}`,
						})
						.where(
							operators.eq(
								tables.aiTeamMember.athleteId,
								aiTeamMember.athleteId,
							),
						);
				}
			}
		}

		const participants = await db.query.participant.findMany({
			where: (particip, { eq }) => eq(particip.referenceId, eventId),
		});

		for (const participant of participants) {
			const teamMembers = await db.query.teamMember.findMany({
				where: (member, { eq }) => eq(member.participantId, participant.id),
			});

			const allPoints = teamMembers.reduce((a, b) => {
				return a + b.pointsGathered;
			}, 0);

			await db
				.update(tables.participant)
				.set({
					lastPoints: allPoints,
				})
				.where(operators.eq(tables.participant.id, participant.id));
		}
	}, 5000);

	return;
}

adminApp.route("/events", eventsApp);
adminApp.route("/disciplines", disciplinesApp);
adminApp.route("/athletes", athletesApp);
adminApp.route("/ai", aiApp);

console.log(adminApp.routes);

export default adminApp;
