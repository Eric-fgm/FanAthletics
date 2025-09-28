import { db, tables } from "@fan-athletics/database";
import type { Participant, User } from "@fan-athletics/shared/types";
import { and, eq } from "drizzle-orm";
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
