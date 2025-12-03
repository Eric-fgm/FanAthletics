import { db, operators, tables } from "@fan-athletics/database";
import type {
	CompetitorResults,
	Participant,
	User,
} from "@fan-athletics/shared/types";
import { Hono } from "hono";

export type TeamMembership = {
	athleteId: string;
};

export default new Hono<{
	Variables: { user: User; participant: Participant };
}>()
	.basePath("/:eventId")
	.post("/participate", async (c) => {
		const user = c.get("user");
		const eventId = c.req.param("eventId");

		const player = await db.query.participant.findFirst({
			where: (participant, { eq, and }) =>
				and(
					eq(participant.userId, user.id),
					eq(participant.referenceId, eventId),
				),
		});

		if (player)
			return c.json(
				{ message: "This user has already been registered to this game!" },
				400,
			);

		const event = await db.query.event.findFirst({
			where: (event, { eq }) => eq(event.id, eventId),
		});

		if (!event) return c.json({ message: "Such event does not exist!" }, 404);

		if (event.status !== "available")
			return c.json(
				{
					message:
						"You cannot participate because this event is currently unavailable!",
				},
				400,
			);

		const gameSpecification = await db.query.gameSpecification.findFirst({
			where: (gs, { eq }) => eq(gs.eventId, event.id),
		});

		await db.insert(tables.participant).values({
			userId: user.id,
			referenceId: eventId,
			type: "PLAYER",
			budget: gameSpecification ? gameSpecification.budget : 500,
		});

		return c.json({ message: "User participation successfully saved." }, 200);
	})
	.get("/participation", async (c) => {
		const user = c.get("user");
		const eventId = c.req.param("eventId");

		const participant = await db.query.participant.findFirst({
			where: (participant, { eq, and }) =>
				and(
					eq(participant.userId, user.id),
					eq(participant.referenceId, eventId),
				),
		});

		return c.json(participant ?? null);
	})
	.get("/participants", async (c) => {
		const eventId = c.req.param("eventId");

		const event = await db.query.event.findFirst({
			where: (event, { eq }) => eq(event.id, eventId),
		});

		if (!event) return c.json({ message: "Such event does not exist!" }, 404);

		const usersWithParticipation = await db
			.select()
			.from(tables.user)
			.innerJoin(
				tables.participant,
				operators.eq(tables.user.id, tables.participant.userId),
			)
			.where(operators.eq(tables.participant.referenceId, eventId))
			.orderBy(operators.desc(tables.participant.lastPoints));

		return c.json(
			await Promise.all(
				usersWithParticipation.map(async (userWithParticipation) => ({
					...userWithParticipation,
					team: (
						await db
							.select()
							.from(tables.athlete)
							.innerJoin(
								tables.teamMember,
								operators.eq(tables.athlete.id, tables.teamMember.athleteId),
							)
							.where(
								operators.eq(
									tables.teamMember.participantId,
									userWithParticipation.participant.id,
								),
							)
					).map(({ athlete }) => athlete),
				})),
			),
		);
	})
	.get("/game-specification", async (c) => {
		const eventId = c.req.param("eventId");

		const gameSpecification = await db.query.gameSpecification.findFirst({
			where: (game, { eq }) => eq(game.eventId, eventId),
		});

		if (!gameSpecification) {
			const [defaultGameSpecification] = await db
				.insert(tables.gameSpecification)
				.values({
					eventId: eventId,
					numberOfTeamMembers: 8,
					budget: 500,
					maxExchanges: 8,
					minAthleteCost: 50,
					maxAthleteCost: 100,
					sexParity: true,
				})
				.returning();

			return c.json(defaultGameSpecification);
		}
		return c.json(gameSpecification);
	}).post("/count-points", async (c) => {
		const eventId = c.req.param("eventId");

		const disciplineIds = (
			await db.query.discipline.findMany({
				where: (discipline, { eq }) => eq(discipline.eventId, eventId),
			})
		)
			.filter((dis) => !dis.name.endsWith("pk"))
			.map((dis) => dis.id);

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

		const onlyNotCounted = filtered.filter((c) => !c.pointsAlreadyCounted);
		for (const c of onlyNotCounted) {
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
								operators.eq(
									tables.teamMember.pointsGathered,
									member.pointsGathered,
								),
							),
						);
				}
			}

			// for (const participId of participantIds) {
			// 	let pointsToAdd: number;
			// 	if (competitor.place === null) pointsToAdd = 0;
			// 	else {
			// 		const competitorResults = competitor.results as {
			// 			score: string;
			// 			ranking: string;
			// 		};
			// 		pointsToAdd = Math.max(
			// 			8 - Number.parseInt(competitorResults.ranking) + 1,
			// 			0,
			// 		);
			// 		// Kapitan musi mieć podwójne punkty - trzeba to dodać.
			// 	}
			// 	await db
			// 		.update(tables.participant)
			// 		.set({
			// 			lastPoints: sql`${tables.participant.lastPoints} + ${pointsToAdd}`,
			// 		})
			// 		.where(eq(tables.participant.id, participId));
			// const particip = await db.query.participant.findFirst({
			// 	where: (participant, { eq }) => eq(participant.id, participId)
			// });
			// }
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

		return c.json({ message: "Points successfully counted." }, 200);
	})
	.use(async (c, next) => {
		const user = c.get("user");
		const eventId = c.req.param("eventId");

		const participant = await db.query.participant.findFirst({
			where: (participant, { eq, and }) =>
				and(
					eq(participant.userId, user.id),
					eq(participant.referenceId, eventId),
				),
		});

		if (!participant) {
			return c.json({ message: "Unauthorized participant" }, 401);
		}

		c.set("participant", participant);

		return await next();
	})
	.get("/participation/team", async (c) => {
		const participant = c.get("participant");

		const teamMembers = await db.query.teamMember.findMany({
			where: (teamMember, { and, eq }) =>
				and(
					eq(teamMember.participantId, participant.id),
					eq(teamMember.stillInTeam, true),
				),
		});

		const athletesIds = teamMembers.map((member) => member.athleteId);

		const athletes = await db.query.athlete.findMany({
			where: (athlete, { inArray }) => inArray(athlete.id, athletesIds),
		});

		const results = teamMembers.map((member) => ({
			...athletes.find((ath) => ath.id === member.athleteId),
			isCaptain: member.isCaptain,
			pointsGathered: member.pointsGathered,
		}));

		return c.json(results);
	})
	.get("/is-game-active", async (c) => {
		const eventId = c.req.param("eventId");

		const gameSpecification = await db.query.gameSpecification.findFirst({
			where: (table, { eq }) => eq(table.eventId, eventId),
		});

		if (!gameSpecification)
			return c.json({ message: "Game specification not found" }, 404);

		console.log("Active:", gameSpecification.isActive);

		const eventDisciplinesIds = (
			await db.query.discipline.findMany({
				where: (table, { eq }) => eq(table.eventId, eventId),
			})
		).map((d) => d.id);

		const eventCompetitions = await db.query.competition.findMany({
			where: (table, { inArray }) =>
				inArray(table.disciplineId, eventDisciplinesIds),
		});

		const firstCompetitionDateTime = eventCompetitions
			.sort((a, b) => {
				if (a.startAt.toUTCString() < b.startAt.toUTCString()) return -1;
				return 1;
			})
			.map((c) => c.startAt)[0];

		firstCompetitionDateTime?.setMinutes(
			firstCompetitionDateTime.getMinutes() - 5,
		);

		return c.json({
			gameActive: gameSpecification.isActive,
			nearestDate: gameSpecification.nearestDate,
			gameFinished: gameSpecification.finished,
			firstCompetitionDateTime:
				firstCompetitionDateTime !== undefined
					? firstCompetitionDateTime
					: null,
		});
	})
	.use(async (c, next) => {
		const eventId = c.req.param("eventId");

		const event = await db.query.event.findFirst({
			where: (event, { eq }) => eq(event.id, eventId),
		});

		if (event?.status !== "available") {
			return c.json({ message: "Event is currently unavailable" }, 403);
		}

		const gameActive = await isGameActive(c.req.param("eventId"));
		if (!gameActive)
			return c.json({ message: "Game is not active right now!" }, 423);

		return await next();
	})
	.post("/participation/team", async (c) => {
		const body = await c.req.json<TeamMembership>();
		const participant = c.get("participant");

		const athlete = await db.query.athlete.findFirst({
			where: (athlete, { and, eq }) =>
				and(
					eq(athlete.id, body.athleteId),
					eq(athlete.eventId, participant.referenceId),
				),
		});

		if (!athlete)
			return c.json({ message: "Such athlete does not exist!" }, 404);

		const inTeamAlready = await db.query.teamMember.findFirst({
			where: (teamMember, { eq, and }) =>
				and(
					eq(teamMember.participantId, participant.id),
					eq(teamMember.athleteId, athlete.id),
					eq(teamMember.stillInTeam, true),
				),
		});

		if (inTeamAlready)
			return c.json({ message: "This athlete is already in the team!" }, 409);

		const participantAthletes = (
			await db.query.teamMember.findMany({
				where: (teamMember, { eq }) =>
					eq(teamMember.participantId, participant.id),
			})
		).filter((athlete) => athlete.stillInTeam);

		if (participantAthletes.length >= 8)
			return c.json({ message: "Your team is already full!" }, 409);

		if (participant.budget < athlete.cost)
			return c.json(
				{ message: "You do not have enough funds to hire this athlete." },
				409,
			);

		const previouslyHired = await db.query.teamMember.findFirst({
			where: (teamMember, { and, eq }) =>
				and(
					eq(teamMember.participantId, participant.id),
					eq(teamMember.athleteId, athlete.id),
					eq(teamMember.stillInTeam, false),
				),
		});

		if (previouslyHired !== null && previouslyHired !== undefined) {
			await db
				.update(tables.teamMember)
				.set({
					stillInTeam: true,
				})
				.where(
					operators.and(
						operators.eq(tables.teamMember.participantId, participant.id),
						operators.eq(tables.teamMember.athleteId, athlete.id),
					),
				);
		} else {
			await db.insert(tables.teamMember).values({
				athleteId: athlete.id,
				participantId: participant.id,
			});
		}

		await db
			.update(tables.participant)
			.set({ budget: participant.budget - athlete.cost })
			.where(operators.eq(tables.participant.id, participant.id));

		return c.json({ message: "Athlete successfully added to the team." }, 200);
	})
	.delete("/participation/team", async (c) => {
		const body = await c.req.json<TeamMembership>();
		const participant = c.get("participant");

		const athlete = await db.query.athlete.findFirst({
			where: (athlete, { and, eq }) =>
				and(
					eq(athlete.id, body.athleteId),
					eq(athlete.eventId, participant.referenceId),
				),
		});

		if (!athlete)
			return c.json({ message: "Such athlete does not exist!" }, 404);

		if (athlete.eventId !== participant.referenceId)
			return c.json(
				{ message: "Participant and athlete belong to different events!" },
				400,
			);

		// const athleteInTeam = await db.query.teamMember.findFirst({
		//     where: (teamMember, { eq, and }) =>
		//         and(
		//             eq(teamMember.participantId, particip.id),
		//             eq(teamMember.athleteId, athlete.id)
		//         )
		// });

		if (!(await doesAthleteBelongToTeam(participant.id, athlete.id)))
			return c.json(
				{
					message: "This athelete does not belong to this participant's team!",
				},
				409,
			);

		await db
			.update(tables.participant)
			.set({ budget: participant.budget + athlete.cost })
			.where(operators.eq(tables.participant.id, participant.id));

		// await db
		// 	.delete(tables.teamMember)
		// 	.where(
		// 		and(
		// 			eq(tables.teamMember.participantId, participant.id),
		// 			eq(tables.teamMember.athleteId, athlete.id),
		// 		),
		// 	);
		await db
			.update(tables.teamMember)
			.set({
				stillInTeam: false,
			})
			.where(
				operators.and(
					operators.eq(tables.teamMember.participantId, participant.id),
					operators.eq(tables.teamMember.athleteId, athlete.id),
				),
			);

		return c.json({ message: "Athlete successfully deleted from team." }, 200);
	})
	.post("/make-athlete-captain", async (c) => {
		const body = await c.req.json<TeamMembership>();
		const participant = c.get("participant");

		const athlete = await db.query.athlete.findFirst({
			where: (athlete, { and, eq }) =>
				and(
					eq(athlete.id, body.athleteId),
					eq(athlete.eventId, participant.referenceId),
				),
		});

		if (!athlete)
			return c.json({ message: "Such athlete does not exist!" }, 404);

		if (athlete.eventId !== participant.referenceId)
			return c.json(
				{ message: "Participant and athlete belong to different events!" },
				400,
			);

		if (!(await doesAthleteBelongToTeam(participant.id, athlete.id)))
			return c.json(
				{ message: "Athlete does not belong to this participant's team!" },
				409,
			);

		await db
			.update(tables.teamMember)
			.set({ isCaptain: false })
			.where(
				operators.and(
					operators.eq(tables.teamMember.participantId, participant.id),
					operators.eq(tables.teamMember.isCaptain, true),
				),
			);

		await db
			.update(tables.teamMember)
			.set({ isCaptain: true })
			.where(
				operators.and(
					operators.eq(tables.teamMember.participantId, participant.id),
					operators.eq(tables.teamMember.athleteId, athlete.id),
				),
			);

		return c.json(
			{ message: "Captain privilege successfully assigned to athlete." },
			200,
		);
	})
	.post("/delete-captain-privilege", async (c) => {
		const body = await c.req.json<TeamMembership>();
		const participant = c.get("participant");

		const athlete = await db.query.athlete.findFirst({
			where: (athlete, { and, eq }) =>
				and(
					eq(athlete.id, body.athleteId),
					eq(athlete.eventId, participant.referenceId),
				),
		});
		if (!athlete)
			return c.json({ message: "Such athlete does not exist!" }, 404);

		if (athlete.eventId !== participant.referenceId)
			return c.json(
				{ message: "Participant and athlete belong to different events!" },
				400,
			);

		if (!(await doesAthleteBelongToTeam(participant.id, athlete.id)))
			return c.json(
				{ message: "Athlete does not belong to this participant's team!" },
				409,
			);

		const member = await db.query.teamMember.findFirst({
			where: (teamMember, { eq, and }) =>
				and(
					eq(teamMember.participantId, participant.id),
					eq(teamMember.athleteId, athlete.id),
				),
		});

		if (!member?.isCaptain)
			return c.json({ message: "This athlete is not a captain yet!" }, 409);

		await db
			.update(tables.teamMember)
			.set({ isCaptain: false })
			.where(
				operators.and(
					operators.eq(tables.teamMember.participantId, participant.id),
					operators.eq(tables.teamMember.athleteId, athlete.id),
				),
			);

		return c.json(
			{ message: "Captain privilege successfully deleted from athlete." },
			200,
		);
	});

async function doesAthleteBelongToTeam(
	participantId: string,
	athleteId: string,
) {
	const athleteInTeam = await db.query.teamMember.findFirst({
		where: (teamMember, { eq, and }) =>
			and(
				eq(teamMember.participantId, participantId),
				eq(teamMember.athleteId, athleteId),
			),
	});
	return !!athleteInTeam;
}

async function isGameActive(eventId: string) {
	const gameSpecification = await db.query.gameSpecification.findFirst({
		where: (table, { eq }) => eq(table.eventId, eventId),
	});

	if (!gameSpecification) return false;
	return gameSpecification.isActive;
}
