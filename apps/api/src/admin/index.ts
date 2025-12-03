import path from "node:path";
import { getAI, getFilesAI, getModelAI } from "@fan-athletics/ai";
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
				image: body.image && body.image !== "" ? body.image : EVENT_IMAGE_PLACEHOLDER,
				icon: body.icon && body.icon !== "" ? body.icon : EVENT_ICON_PLACEHOLDER,
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

		blockGame(event.id);

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
	const payload = await c.req.json<{ budget: number }>();
	const eventId = c.req.param("eventId");

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
	});

	if (!promptResult.text) {
		return c.json({ message: "AI generation error!" }, 500);
	}

	const athletesIds = JSON.parse(promptResult.text) as string[];

	const athletes = await db.query.athlete.findMany({
		where: (athlete, { eq, and, inArray }) =>
			and(eq(athlete.eventId, eventId), inArray(athlete.id, athletesIds)),
	});

	return c.json(athletes, 200);
});

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
		new Date(
			event.startAt.getTime() + i * (1000 * 3600 * 24),
		).toLocaleDateString("pl-PL", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		}),
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
			(c) =>
				c.startAt.toLocaleDateString("pl-PL", {
					day: "2-digit",
					month: "2-digit",
					year: "numeric",
				}) === days[i],
		),
	);

	const firstAndLast: { first: Date; last: Date }[] = Array(daysDiff + 1);

	daysCompetitions.forEach((dayCompetitions, i) => {
		const dayCompetitionsStart = dayCompetitions
			.map((c) => new Date(c.startAt))
			.sort((a, b) => {
				if (
					a.toLocaleTimeString("pl-PL", {
						hour: "2-digit",
						minute: "2-digit",
					}) <
					b.toLocaleTimeString("pl-PL", {
						hour: "2-digit",
						minute: "2-digit",
					})
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
		const currentDateTime = new Date();
		const currentDay = currentDateTime.toLocaleDateString("pl-PL", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
		// const currentDay = event.endAt.toLocaleDateString("pl-PL", {
		// 	day: "2-digit",
		// 	month: "2-digit",
		// 	year: "numeric",
		// });
		// const currentDay = "22.08.2025";
		const currentTime = currentDateTime.toLocaleTimeString("pl-PL", {
			hour: "2-digit",
			minute: "2-digit",
		});
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

		if (index === -1) {
			// Przed dniem rozpoczynającym grę
			if (
				currentDay <
				event.startAt.toLocaleDateString("pl-PL", {
					day: "2-digit",
					month: "2-digit",
					year: "numeric",
				})
			)
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
			currentTime <
				firstAndLast[index].first.toLocaleTimeString("pl-PL", {
					hour: "2-digit",
					minute: "2-digit",
				})
		) {
			await setGameIsActive(true, firstAndLast[index]?.first, false);
			return;
		}
		// Po zakończeniu gry w danym dniu wydarzenia
		if (
			firstAndLast[index] &&
			currentTime >
				firstAndLast[index].last.toLocaleTimeString("pl-PL", {
					hour: "2-digit",
					minute: "2-digit",
				}) &&
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

adminApp.route("/events", eventsApp);
adminApp.route("/disciplines", disciplinesApp);
adminApp.route("/athletes", athletesApp);
adminApp.route("/ai", aiApp);

console.log(adminApp.routes);

export default adminApp;
