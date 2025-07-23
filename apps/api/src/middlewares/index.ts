import type { Context, Next } from "hono";
import { cors as honoCors } from "hono/cors";
import { authApi } from "#/auth";

export const cors = honoCors({
	origin: [process.env.WEB_URL as string, process.env.MOBILE_URL as string],
	allowHeaders: ["Content-Type", "Authorization"],
	credentials: true,
});

export const requireUser =
	(role?: "user" | "admin") => async (c: Context, next: Next) => {
		const session = await authApi.getSession({ headers: c.req.raw.headers });

		if (!session || (role && session.user.role !== role)) {
			return c.json({ message: "Unauthorized" }, 401);
		}

		c.set("user", session.user);
		c.set("session", session.session);
		return next();
	};
