import { Hono } from "hono";

export default new Hono().basePath("/domtel/:eventName/athletes").get("/", async (c) => {
    const eventName = c.req.param("eventName");

    const athletes = null;
    return c.json(athletes);
})