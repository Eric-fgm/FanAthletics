import { db } from "@fan-athletics/database";
import type {
	Athlete,
	Participant,
	User,
	UserTeam,
} from "@fan-athletics/shared/types";
import { Hono } from "hono";

export default new Hono<{ Variables: { user: User } }>()
	.get("/:userId", async (c) => {
		const userId = c.req.param("userId");

		const foundUser = await db.query.user.findFirst({
			where: (users, { eq }) => eq(users.id, userId),
		});

		if (!foundUser) {
			return c.notFound();
		}

		return c.json(foundUser);
	})
	.get("/:userId/teams", async (c) => {
		const userId = c.req.param("userId");

		const participationsFound: Participant[] =
			await db.query.participant.findMany({
				where: (participant, { eq }) => eq(participant.userId, userId),
			});

		const userTeams: UserTeam[] = await Promise.all(
			participationsFound.map(async (participation) => {
				const event = await db.query.event.findFirst({
					where: (event, { eq }) => eq(event.id, participation.referenceId),
				});

				const athletesId: string[] = (
					await db.query.teamMember.findMany({
						where: (teamMember, { and, eq }) =>
							and(
								eq(teamMember.participantId, participation.id),
								eq(teamMember.stillInTeam, true),
							),
					})
				).map((member) => member.athleteId);

				const athletes: Athlete[] = (
					await Promise.all(
						athletesId.map((athleteId) =>
							db.query.athlete.findFirst({
								where: (athlete, { eq }) => eq(athlete.id, athleteId),
							}),
						),
					)
				)
					.filter(
						(athlete): athlete is NonNullable<typeof athlete> =>
							athlete !== null && athlete !== undefined,
					)
					.map((athlete) => ({
						...athlete,
						createdAt: athlete.createdAt.toISOString(),
						updatedAt: athlete.updatedAt.toISOString(),
						sex: athlete.sex ?? "",
					}));

				const userTeamData: UserTeam = {
					id: participation.id,
					eventId: event?.id ?? "",
					eventName: event?.name ?? "",
					eventIcon: event?.icon ?? "",
					budget: participation.budget,
					points: participation.lastPoints,
					athletes: athletes,
				};

				return userTeamData;
			}),
		);

		return c.json(userTeams);
	});
