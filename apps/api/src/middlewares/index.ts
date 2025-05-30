import { cors as honoCors } from "hono/cors";

export const cors = honoCors({
	origin: [process.env.WEB_URL as string, process.env.MOBILE_URL as string],
	allowHeaders: ["Content-Type", "Authorization"],
	credentials: true,
});
