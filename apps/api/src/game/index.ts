import { db, tables } from "@fan-athletics/database";
import type { Participant, User } from "@fan-athletics/shared/types";
import { and, eq, sql } from "drizzle-orm";
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

		await db.insert(tables.participant).values({
			userId: user.id,
			referenceId: eventId,
			type: "PLAYER",
			budget: 300,
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
				eq(tables.user.id, tables.participant.userId),
			)
			.where(eq(tables.participant.referenceId, eventId));

		return c.json(usersWithParticipation);
	})
	.use(async (c, next) => {
		const user = c.get("user");
		const eventId = c.req.param("eventId");

		const participant = await db.query.participant.findFirst({
			where: (participant, { eq }) =>
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
			where: (teamMember, { eq }) =>
				eq(teamMember.participantId, participant.id),
		});

		const athletesIds = teamMembers.map((member) => member.athleteId);

		const athletes = await db.query.athlete.findMany({
			where: (athlete, { inArray }) => inArray(athlete.id, athletesIds),
		});

		const results = teamMembers.map((member) => ({
			...athletes.find((ath) => ath.id === member.athleteId),
			isCaptain: member.isCaptain,
		}));

		return c.json(results);
	})
	.post("/participation/team", async (c) => {
		const body = await c.req.json<TeamMembership>();
		const participant = c.get("participant");

		const athlete = await db.query.athlete.findFirst({
			where: (athlete, { eq }) =>
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
				),
		});

		if (inTeamAlready)
			return c.json({ message: "This athlete is already in the team!" }, 409);

		const participantAthletes = await db.query.teamMember.findMany({
			where: (teamMember, { eq }) =>
				eq(teamMember.participantId, participant.id),
		});

		if (participantAthletes.length >= 8)
			return c.json({ message: "Your team is already full!" }, 409);

		if (participant.budget < athlete.cost)
			return c.json(
				{ message: "You do not have enough funds to hire this athlete." },
				409,
			);

		await db.insert(tables.teamMember).values({
			athleteId: athlete.id,
			participantId: participant.id,
		});

		await db
			.update(tables.participant)
			.set({ budget: participant.budget - athlete.cost })
			.where(eq(tables.participant.id, participant.id));

		return c.json({ message: "Athlete successfully added to the team." }, 200);
	})
	.delete("/participation/team", async (c) => {
		const body = await c.req.json<TeamMembership>();
		const participant = c.get("participant");

		const athlete = await db.query.athlete.findFirst({
			where: (athlete, { eq }) =>
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
			.where(eq(tables.participant.id, participant.id));

		await db
			.delete(tables.teamMember)
			.where(
				and(
					eq(tables.teamMember.participantId, participant.id),
					eq(tables.teamMember.athleteId, athlete.id),
				),
			);

		return c.json({ message: "Athlete successfully deleted from team." }, 200);
	})
	.post("/make-athlete-captain", async (c) => {
		const body = await c.req.json<TeamMembership>();
		const participant = c.get("participant");

		const athlete = await db.query.athlete.findFirst({
			where: (athlete, { eq }) =>
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
				and(
					eq(tables.teamMember.participantId, participant.id),
					eq(tables.teamMember.isCaptain, true),
				),
			);

		await db
			.update(tables.teamMember)
			.set({ isCaptain: true })
			.where(
				and(
					eq(tables.teamMember.participantId, participant.id),
					eq(tables.teamMember.athleteId, athlete.id),
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
			where: (athlete, { eq }) =>
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
				and(
					eq(tables.teamMember.participantId, participant.id),
					eq(tables.teamMember.athleteId, athlete.id),
				),
			);

		return c.json(
			{ message: "Captain privilege successfully deleted from athlete." },
			200,
		);
	})
	.post("/count-points", async (c) => {
		const eventId = c.req.param("eventId");

		const disciplineIds = (
			await db.query.discipline.findMany({
				where: (discipline, { eq }) => eq(discipline.eventId, eventId),
			})
		).map((dis) => dis.id);

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

		const competitionIds = filtered.map((c) => c.id);

		process.stdout.write(`COMPETITION IDS:  ${competitionIds}`);

		// var idx = [];
		// for (var i = 0; i < competitions.length; i++) {
		// 	const comp = competitions[i];
		// 	if (comp?.round === 3)
		// 		continue;
		// 	for (var j = 0; j < competitions.length; j++) {
		// 		if (i == j)
		// 			continue;
		// 		const comp2 = competitions[j];
		// 		if (comp2?.round === 3) {
		// 			idx.push(i);
		// 			break;
		// 		}
		// 	}
		// }

		// var competitionIds = [];
		// const competitionIds = competitions.filter(comp => !(comp.id in idx))
		// for (var i = 0; i < competitions.length; i++) {
		// 	if (i in idx)
		// 		continue;
		// 	competitionIds.push(competitions[i]?.id);
		// }

		const competitors = await db.query.competitor.findMany({
			where: (competitor, { inArray }) =>
				inArray(competitor.competitionId, competitionIds),
		});

		for (const competitor of competitors) {
			const participantIds = (
				await db.query.teamMember.findMany({
					where: (member, { eq }) => eq(member.athleteId, competitor.athleteId),
				})
			).map((mem) => mem.participantId);

			for (const participId of participantIds) {
				let pointsToAdd: number;
				if (competitor.place === null) pointsToAdd = 0;
				else {
					const competitorResults = competitor.results as {
						score: string;
						ranking: string;
					};
					pointsToAdd = Math.max(
						8 - Number.parseInt(competitorResults.ranking) + 1,
						0,
					);
					// Kapitan musi mieć podwójne punkty - trzeba to dodać.
				}
				await db
					.update(tables.participant)
					.set({
						lastPoints: sql`${tables.participant.lastPoints} + ${pointsToAdd}`,
					})
					.where(eq(tables.participant.id, participId));
				// const particip = await db.query.participant.findFirst({
				// 	where: (participant, { eq }) => eq(participant.id, participId)
				// });
			}
		}

		return c.json({ message: "Points successfully counted." }, 200);
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
