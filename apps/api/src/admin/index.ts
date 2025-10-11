import { db, operators, tables } from "@fan-athletics/database";
import type {
	AthletePayload,
	DisciplinePayload,
	EventPayload,
} from "@fan-athletics/shared/types";
import { Hono } from "hono";
import {
	getAthletes,
	getDisciplines,
	processCompetitionsAndResults,
	saveAthletes,
	saveDiscplines,
} from "#/domtel";
import { requireUser } from "#/middlewares";

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
				image: body.image ?? EVENT_IMAGE_PLACEHOLDER,
				icon: body.icon ?? EVENT_ICON_PLACEHOLDER,
				domtelApp: body.domtelApp,
				startAt: new Date(),
				endAt: new Date(),
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		if (!event) {
			return c.json({ message: "Database error!" }, 500);
		}

		if (event.domtelApp) {
			const disciplines = await getDisciplines(event.domtelApp);
			await saveDiscplines(event.id, disciplines);

			const athletes = await getAthletes(event.domtelApp);
			await saveAthletes(event.id, athletes);
		}

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

adminApp.route("/events", eventsApp);
adminApp.route("/disciplines", disciplinesApp);
adminApp.route("/athletes", athletesApp);

export default adminApp;
