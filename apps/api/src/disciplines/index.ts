import { Hono } from "hono";
import { db, tables } from "@fan-athletics/database";
import { domtelDisciplineRecords } from "../../constants";
import type { Discipline } from "../../../../packages/shared/src/types";
import { eq, and } from "drizzle-orm";

export type DomtelNeededData = {
    eventId: string,
    domtelName: string
}

export default new Hono()
    .post("/domtel/disciplines", async (c) => {
        const body: DomtelNeededData = await c.req.json<DomtelNeededData>();
        console.log(body);

        const competitions = await getCompetitions(body.domtelName);
        console.log(competitions.length);

        for (const comp of competitions) {
            const compName: string = comp.Konkurencja;
            if (compName === "cer")
                continue;

            const noExisting = await db.select().from(tables.discipline).where(and(eq(tables.discipline.eventId, body.eventId), eq(tables.discipline.name, compName)));
            if (noExisting.length <= 0) {
                try {
                    await db.insert(tables.discipline).values({
                        eventId: body.eventId,
                        name: compName,
                        record: Object.keys(domtelDisciplineRecords).includes(compName)
                            ? domtelDisciplineRecords[compName] : "0",
                        icon: "https://icons.iconarchive.com/icons/icons8/windows-8/512/Sports-Running-Man-icon.png",
                        createdAt: new Date(),
                        updatedAt: new Date()
                    })
                } catch (err) {
                    console.log("Error during discipline insert: ", err);
                }
            } else {
                console.log(`${compName} discipline already exists in the database.`);
            }

            const disciplineId = (await db.query.discipline.findFirst({
                where: (discipline, {eq, and}) => and(
                    eq(discipline.eventId, body.eventId),
                    eq(discipline.name, compName)
                )
            }))?.id;
            console.log(compName, disciplineId);
            
            // Trochę prowizoryczne porównywanie notki z serią,
            // trzeba zmienić strukturę bazy.
            const doesCompetitionExist = (await db.query.competition.findFirst({
                where: (competition, {eq, and}) => and(
                    eq(competition.disciplineId, disciplineId),
                    eq(competition.note, comp.seria)
                )
            }));
            
            if (!doesCompetitionExist) {
                try {
                    const fullDateTime = `${comp.dzien}T${comp.Godzina}:00`;
                    console.log(fullDateTime, new Date(fullDateTime).getTime());
                    await db.insert(tables.competition).values({
                        disciplineId: disciplineId,
                        seriesCount: comp.seriaMax,
                        note: comp.seria,
                        trials: {},
                        startAt: new Date(fullDateTime)
                    })
                } catch (err) {
                    console.log("Error during competition insert: ", err);
                }
            } else {
                console.log(`${compName} ${comp.note} already exists in the database.`);
            }
        }
        // console.log(counter, Object.keys(disciplines).length);
        return c.json({message: "Data successfully fetched from domtel."}, 200);
        // if (response.ok) {
        //     const disciplines = await response.json();

        //     return c.json(disciplines);
        // } else {
        //     console.log("Error during fetching, status: ", response.status);
        //     return null;
        // }
    })
    .get("/:eventId/disciplines", async (c) => {
        const eventId: string = c.req.param("eventId");

        const eventDisciplines: Discipline[] = await db.select().from(tables.discipline).where(eq(tables.discipline.eventId, eventId));
        console.log(eventDisciplines.length);
        return c.json(eventDisciplines);
    })
    .get("/:eventId/competitions", async (c) => {
        const eventId: string = c.req.param("eventId");

        const eventDisciplines: Discipline[] = await db.select().from(tables.discipline).where(eq(tables.discipline.eventId, eventId));
        let eventCompetitions: any[] = [];
        for (const discipline of eventDisciplines) {
            const disciplineCompetitions = await db.select().from(tables.competition).where(eq(tables.competition.disciplineId, discipline.id));
            // console.log(disciplineCompetitions);
            eventCompetitions = eventCompetitions.concat(disciplineCompetitions);
        }
        console.log(eventCompetitions.length);
        return c.json(eventCompetitions);
    })
    .delete("/:eventId/disciplines", async (c) => {
        const eventId = c.req.param("eventId");

        const disciplinesIds = await db.select({id: tables.discipline.id}).from(tables.discipline).where(eq(tables.discipline.eventId, eventId));
        for (const discipline of disciplinesIds) {
            await db.delete(tables.competition).where(eq(tables.competition.disciplineId, discipline.id));
        }
        await db.delete(tables.discipline).where(eq(tables.discipline.eventId, eventId));
        console.log(`Disciplines successfully deleted from event witch id is ${eventId}.`);
        return c.json({message: "All events successfully deleted"}, 200);
    })
    .delete("/:eventId/discipline/:disciplineId", async (c) => {
        const eventId = c.req.param("eventId");
        const disciplineId = c.req.param("disciplineId");
        console.log(eventId, disciplineId);

        await db.delete(tables.competition).where(eq(tables.competition.disciplineId, disciplineId));
        await db.delete(tables.discipline).where(eq(tables.discipline.id, disciplineId));
        console.log(`Discipline with id ${disciplineId} successfully deleted from event with id ${eventId}.`);
        return c.json({message: `Event ${eventId} successfully deleted`}, 200);
    })

async function getCompetitions(domtelName: string) {
    let daysData = {};
    let days = [];
    const daysResponse = await fetch(`https://${domtelName}.domtel-sport.pl/api/program_dzien.php`);
    if (daysResponse.ok) {
        daysData = await daysResponse.json();
        console.log(daysData);
        days = Object.keys(daysData);
    } else {
        console.error("Error during days fetching, status: ", daysResponse.status);
        return [];
    }

    let competitions: any[] = []
    for (const day of days) {
        const response = await fetch(`https://${domtelName}.domtel-sport.pl/api/program_dzien.php?dzien=${day}`);
        if (response.ok) {
            const competitionsData = await response.json();
            let competitionsOfDay = [];
            const competitionsNumbers = Object.keys(competitionsData);
            for (const key of competitionsNumbers)
                competitionsOfDay.push(competitionsData[key]);

            for (var comp of competitionsOfDay)
                comp["dzien"] = daysData[day].Data;
            
            console.log(competitionsOfDay.length);
            competitions = competitions.concat(competitionsOfDay);
        } else {
            console.error("Error during competitions fetching, status: ", response.status);
            return competitions;
        }
    }
    return competitions;
}