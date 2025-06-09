import { db, tables } from "@fan-athletics/database";
import { Hono } from "hono";
import { eq } from "drizzle-orm";

export type EventBasicData = {
	name: string,
	organization: string
	image: string,
	icon: string,
}

export default new Hono().get("/", async (c) => {
	await db.update(tables.user).set({role: 'admin'});
	for (var us in tables.user) {
		console.log(us);
	}

	const events = await db.select().from(tables.event);
	console.log(events);
	return c.json(events);
}).post("/", async (c) => {
	const body = await c.req.json<EventBasicData>();
	console.log("RAW BODY:", body);
	const res = await db.insert(tables.event).values({
		name: body.name,
		organization: body.organization,
		image: body.image != null && body.image != undefined && body.image != '' ? body.image : "https://assets.aws.worldathletics.org/large/610276d3511e6525b0b00ef6.jpg",
		icon: body.icon != null && body.icon != undefined && body.icon != '' ? body.icon : "https://img.olympics.com/images/image/private/t_s_fog_logo_m/f_auto/primary/w993kgqcncimz5gw0uza",
		startAt: new Date(),
		endAt: new Date(),
		createdAt: new Date(),
		updatedAt: new Date()
	}).returning();

	console.log(body.name, body.organization);
	console.log("RES:", res);
	return c.json({message: "Event successfully created!"}, 200);
}).delete("/:id", async (c) => {
	const id = c.req.param("id");

	console.log("Deleting event with id: ", id);
	const res = await db.delete(tables.event).where(eq(tables.event.id, id)).returning();
	console.log(res);

	return c.json({message: "Event successfully deleted"}, 200);
});
