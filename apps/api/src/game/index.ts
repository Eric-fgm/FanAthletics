import { db } from "@fan-athletics/database";
import { eq, and } from "drizzle-orm";
import { Hono } from "hono";
import { participant, teamMember } from "../../../../packages/database/dist/schema";

export type ParticipationBasicInfo = {
    userId: string,
    eventId: string
}

export type TeamMembership = {
    participantId: string,
    athleteId: string
}

export default new Hono()
    .post("/participate", async (c) => {
        process.stdout.write("I'm in participation endpoint.\n");
        const body = await c.req.json<ParticipationBasicInfo>();
        console.log("RAW BODY: ", body);
        process.stdout.write(`RAW BODY: ${JSON.stringify(body)}`);

        const player = await db.query.participant.findFirst({
            where: (participant, { eq, and }) => and(eq(participant.userId, body.userId), eq(participant.referenceId, body.eventId))
        });

        if (player)
            return c.json({message: "This user has already been registered to this game!"}, 400);

        const event = await db.query.event.findFirst({
            where: (event, { eq }) => eq(event.id, body.eventId)
        });

        if (!event)
            return c.json({message: "Such event does not exist!"}, 404);

        await db.insert(participant).values({
            userId: body.userId,
            referenceId: body.eventId,
            type: "PLAYER",
            budget: 300
        })

        return c.json({message: "User participation successfully saved."}, 200);
    })
    .post("/addTeamMember", async (c) => {
        const body = await c.req.json<TeamMembership>();
        console.log("RAW BODY: ", body);
        process.stdout.write(`RAW BODY: ${JSON.stringify(body)}`);

        const particip = await db.query.participant.findFirst({
            where: (participant, { eq }) => eq(participant.id, body.participantId)
        });
        
        if (!particip)
            return c.json({message: "Such participant does not exist!"}, 404);

        const athlete = await db.query.athlete.findFirst({
            where: (athlete, { eq }) => eq(athlete.id, body.athleteId)
        });

        if (!athlete)
            return c.json({message: "Such athlete does not exist!"}, 404);

        if (athlete.eventId != particip.referenceId)
            return c.json({message: "Participant and athlete belong to different events!"}, 400);

        const inTeamAlready = await db.query.teamMember.findFirst({
            where: (teamMember, { eq, and }) =>
                and(
                    eq(teamMember.participantId, particip.id),
                    eq(teamMember.athleteId, athlete.id)
                )
        });

        if (inTeamAlready)
            return c.json({message: "This athlete is already in the team!"}, 409);

        const participantAthletes = await db.query.teamMember.findMany({
            where: (teamMember, { eq }) => eq(teamMember.participantId, particip.id)
        });

        if (participantAthletes.length >= 8)
            return c.json({message: "Your team is already full!"}, 409);

        if (particip.budget < athlete.cost)
            return c.json({message: "You do not have enough funds to hire this athlete."}, 409);

        await db.insert(teamMember).values({
            athleteId: athlete.id,
            participantId: particip.id
        });

        await db.update(participant).set({ budget: particip.budget - athlete.cost})
            .where(eq(participant.id, particip.id));

        return c.json({message: "Athlete successfully added to the team."}, 200);
    })
    .delete("/deleteTeamMember", async (c) => {
        const body = await c.req.json<TeamMembership>();
        console.log("RAW BODY: ", body);
        process.stdout.write(`RAW BODY: ${JSON.stringify(body)}`);

        const particip = await db.query.participant.findFirst({
            where: (participant, { eq }) => eq(participant.id, body.participantId)
        });
        
        if (!particip)
            return c.json({message: "Such participant does not exist!"}, 404);

        const athlete = await db.query.athlete.findFirst({
            where: (athlete, { eq }) => eq(athlete.id, body.athleteId)
        });

        if (!athlete)
            return c.json({message: "Such athlete does not exist!"}, 404);

        if (athlete.eventId != particip.referenceId)
            return c.json({message: "Participant and athlete belong to different events!"}, 400);

        // const athleteInTeam = await db.query.teamMember.findFirst({
        //     where: (teamMember, { eq, and }) => 
        //         and(
        //             eq(teamMember.participantId, particip.id),
        //             eq(teamMember.athleteId, athlete.id)
        //         )
        // });

        if (!await doesAthleteBelongToTeam(particip.id, athlete.id))
            return c.json({message: "This athelete does not belong to this participant's team!"}, 409);

        await db.update(participant).set({ budget: particip.budget + athlete.cost })
            .where(eq(participant.id, particip.id));
        
        await db.delete(teamMember).where(
            and(
                eq(teamMember.participantId, particip.id),
                eq(teamMember.athleteId, athlete.id)
            )
        );

        return c.json({message: "Athlete successfully deleted from team."}, 200);
    })
    .post("/makeAthleteAsCaptain", async (c) => {
        const body = await c.req.json<TeamMembership>();
        console.log("RAW BODY: ", body);
        process.stdout.write(`RAW BODY: ${JSON.stringify(body)}`);

        const particip = await db.query.participant.findFirst({
            where: (participant, { eq }) => eq(participant.id, body.participantId)
        });
        
        if (!particip)
            return c.json({message: "Such participant does not exist!"}, 404);

        const athlete = await db.query.athlete.findFirst({
            where: (athlete, { eq }) => eq(athlete.id, body.athleteId)
        });

        if (!athlete)
            return c.json({message: "Such athlete does not exist!"}, 404);

        if (athlete.eventId != particip.referenceId)
            return c.json({message: "Participant and athlete belong to different events!"}, 400);

        if (!await doesAthleteBelongToTeam(particip.id, athlete.id))
            return c.json({message: "Athlete does not belong to this participant's team!"}, 409);

        await db.update(teamMember).set({ isCaptain: false }).where(
            and(
                eq(teamMember.participantId, particip.id),
                eq(teamMember.isCaptain, true)
            )
        );
        
        await db.update(teamMember).set({ isCaptain: true }).where(
            and(
                eq(teamMember.participantId, particip.id),
                eq(teamMember.athleteId, athlete.id),
            )
        );

        return c.json({message: "Captain privilege successfully assigned to athlete."}, 200);
    })
    .post("/deleteCaptainPrivilege", async (c) => {
        const body = await c.req.json<TeamMembership>();
        console.log("RAW BODY: ", body);

        const particip = await db.query.participant.findFirst({
            where: (participant, { eq }) => eq(participant.id, body.participantId)
        });
        
        if (!particip)
            return c.json({message: "Such participant does not exist!"}, 404);

        const athlete = await db.query.athlete.findFirst({
            where: (athlete, { eq }) => eq(athlete.id, body.athleteId)
        });

        if (!athlete)
            return c.json({message: "Such athlete does not exist!"}, 404);

        if (athlete.eventId != particip.referenceId)
            return c.json({message: "Participant and athlete belong to different events!"}, 400);

        if (!await doesAthleteBelongToTeam(particip.id, athlete.id))
            return c.json({message: "Athlete does not belong to this participant's team!"}, 409);
        
        const member = await db.query.teamMember.findFirst({
            where: (teamMember, { eq, and }) =>
                and(
                    eq(teamMember.participantId, particip.id),
                    eq(teamMember.athleteId, athlete.id)
                )
        })

        if (!member?.isCaptain)
            return c.json({message: "This athlete is not a captain yet!"}, 409);

        await db.update(teamMember).set({ isCaptain: false }).where(
            and(
                eq(teamMember.participantId, particip.id),
                eq(teamMember.athleteId, athlete.id)
            )
        );

        return c.json({message: "Captain privilege successfully deleted from athlete."}, 200);
    })
    .get("/eventParticipants/:eventId", async (c) => {
        const eventId = c.req.param("eventId");
        console.log("EVENT ID: ", eventId);

        const event = await db.query.event.findFirst({
            where: (event, { eq }) => eq(event.id, eventId)
        });

        if (!event)
            return c.json({message: "Such event does not exist!"}, 404);

        const participants = await db.query.participant.findMany({
            where: (participant, { eq }) => eq(participant.referenceId, eventId)
        });

        return c.json(participants);
    })
    .get("/participantsTeamMembers/:participantId", async (c) => {
        const participantId = c.req.param("participantId");
        console.log("PARTICIPANT ID: ", participantId);

        const particip = await db.query.participant.findFirst({
            where: (participant, { eq }) => eq(participant.id, participantId)
        });

        if (!particip)
            return c.json({message: "Such participant does not exist!"}, 404);

        const teamMembers = await db.query.teamMember.findMany({
            where: (teamMember, { eq }) => eq(teamMember.participantId, particip.id)
        });

        const athletesIds = teamMembers.map(member => member.athleteId);
        
        const athletes = await db.query.athlete.findMany({
            where: (athlete, { inArray }) => inArray(athlete.id, athletesIds)
        });

        const results = teamMembers.map(member => ({
            participantId: member.participantId,
            athlete: athletes.find(ath => ath.id === member.athleteId),
            isCaptain: member.isCaptain
        }));

        return c.json(results);
    })

async function doesAthleteBelongToTeam(participantId: string, athleteId: string) {
    const athleteInTeam = await db.query.teamMember.findFirst({
            where: (teamMember, { eq, and }) => 
                and(
                    eq(teamMember.participantId, participantId),
                    eq(teamMember.athleteId, athleteId)
                )
        });
    process.stdout.write(`ATHLETE IN TEAM: ${JSON.stringify(athleteInTeam)}, ${athleteInTeam ? true : false}`);
    return athleteInTeam ? true : false;
}