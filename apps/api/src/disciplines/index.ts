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
        // const domtelName = c.req.param("domtelName");
        // const eventId = c.req.param("eventId");
        const body: DomtelNeededData = await c.req.json<DomtelNeededData>();
        console.log(body);

        const days: string[] = await getDays(body.domtelName);
        console.log(days);
        // let disciplines: {} = {};
        let competitions: any[] = [];

        for (const day of days)
            competitions = competitions.concat(await getCompetitionsOfDay(body.domtelName, day))
        
        // let counter = 0;
        for (const comp of competitions) {
            const compName: string = comp.Konkurencja;
            if (compName === "cer")
                continue;
            // console.log(compName, Object.keys(disciplines).includes(compName));
            // if (!(Object.keys(disciplines).includes(compName))) {
            //     counter++;
            //     disciplines[compName] = {
            //         eventId: body.eventId,
            //         name: compName,
            //         record: 0,
            //         icon: 0,
            //     }
            // }
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
                    console.log("Error during insert: ", err);
                }
            } else {
                console.log(`${compName} discipline already exists in the database.`);
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
    .delete("/:eventId/disciplines", async (c) => {
        const eventId = c.req.param("eventId");

        await db.delete(tables.discipline).where(eq(tables.discipline.eventId, eventId));
        console.log(`Disciplines successfully deleted from event witch id is ${eventId}.`);
        return c.json("OK");
    })
    .delete("/:eventId/discipline/:disciplineId", async (c) => {
        const eventId = c.req.param("eventId");
        const disciplineId = c.req.param("disciplineId");
        console.log(eventId, disciplineId);

        await db.delete(tables.discipline).where(eq(tables.discipline.id, disciplineId));
        console.log(`Discipline with id ${disciplineId} successfully deleted from event with id ${eventId}.`);
        return c.json("OK");
    })

async function getDays(domtelName: string) {
    const response = await fetch(`https://${domtelName}.domtel-sport.pl/api/program_dzien.php`);
    if (response.ok) {
        const daysData = await response.json();
        console.log(daysData);
        const days = Object.keys(daysData);
        return days;
    }
    console.error("Error during days fetching, status: ", response.status);
    return [];
}

async function getCompetitionsOfDay(domtelName: string, dayId: string) {
    const response = await fetch(`https://${domtelName}.domtel-sport.pl/api/program_dzien.php?dzien=${dayId}`);
    if (response.ok) {
        const competitionsData = await response.json();
        const competitionsOfDay = [];
        const competitionsNumbers = Object.keys(competitionsData);
        console.log(competitionsNumbers.length);
        for (const key of competitionsNumbers)
            competitionsOfDay.push(competitionsData[key]);
        
        return competitionsOfDay;
    }
    console.error("Error during competitions fetching, status: ", response.status);
    return [];
}