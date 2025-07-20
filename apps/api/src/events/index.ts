import { db, operators, tables } from "@fan-athletics/database";
import type { EventPayload } from "@fan-athletics/shared/types";
import { Hono } from "hono";
import {
	getAthletes,
	getCompetitions,
	saveAthletes,
	saveDiscplineWithCompetition,
} from "#/domtel";

const EVENT_IMAGE_PLACEHOLDER =
	"https://assets.aws.worldathletics.org/large/610276d3511e6525b0b00ef6.jpg";
const EVENT_ICON_PLACEHOLDER =
	"https://img.olympics.com/images/image/private/t_s_fog_logo_m/f_auto/primary/w993kgqcncimz5gw0uza";

export default new Hono()
	.get("/", async (c) => {
		const events = await db.select().from(tables.event);

		return c.json(events);
	})
	.get("/:eventId", async (c) => {
		const eventId = c.req.param("eventId");

		const foundEvent = await db.query.event.findMany({
			where: (event, { eq }) => eq(event.id, eventId),
			limit: 100,
		});

		if (!foundEvent) {
			return c.notFound();
		}

		return c.json(foundEvent);
	})
	.get("/:eventId/disciplines", async (c) => {
		const eventId = c.req.param("eventId");

		const disciplines = await db.query.discipline.findMany({
			where: (discipline, { eq }) => eq(discipline.eventId, eventId),
			limit: 100,
		});

		return c.json(disciplines);
	})
	.get("/:eventId/athletes", async (c) => {
		const eventId = c.req.param("eventId");

		const athletes = await db.query.athlete.findMany({
			with: {
				athleteDisciplines: {
					with: {
						discipline: true,
					},
				},
			},
			where: (athlete, { eq }) => eq(athlete.eventId, eventId),
			limit: 100,
		});

		return c.json(
			athletes.map(({ athleteDisciplines, ...restAthlete }) => ({
				...restAthlete,
				disciplines: athleteDisciplines.map(({ discipline }) => discipline),
			})),
		);
	})
	.post("/", async (c) => {
		const body = await c.req.json<EventPayload>();

		const [event] = await db
			.insert(tables.event)
			.values({
				name: body.name,
				organization: body.organization,
				image: body.image ?? EVENT_IMAGE_PLACEHOLDER,
				icon: body.icon ?? EVENT_ICON_PLACEHOLDER,
				startAt: new Date(),
				endAt: new Date(),
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		if (!event) {
			return c.json({ message: "Database error!" }, 500);
		}

		if (body.domtelApp) {
			const competitions = await getCompetitions(body.domtelApp);

			for (const competition of competitions) {
				await saveDiscplineWithCompetition(event.id, competition);
			}

			const athletes = await getAthletes(body.domtelApp);
			await saveAthletes(event.id, athletes);
		}

		return c.json({ message: "Event successfully created!" }, 201);
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

		return c.json({ message: "Event successfully created!" }, 200);
	})
	.delete("/:eventId", async (c) => {
		const eventId = c.req.param("eventId");

		await db.delete(tables.event).where(operators.eq(tables.event.id, eventId));

		return c.json({ message: "Event successfully deleted" }, 200);
	});
