import { expo } from "@better-auth/expo";
import { db, tables } from "@fan-athletics/database";
import emailer from "@fan-athletics/emailer";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { Hono } from "hono";

const auth = betterAuth({
	basePath: "/api/v1/auth",
	database: drizzleAdapter(db, { provider: "pg", schema: tables }),
	trustedOrigins: [
		process.env.WEB_URL as string,
		process.env.MOBILE_URL as string,
	],
	onAPIError: {
		errorURL: `${process.env.WEB_URL}/sign-in`,
	},
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		},
		facebook: {
			clientId: process.env.FACEBOOK_CLIENT_ID as string,
			clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
		},
	},
	user: {
		additionalFields: {
			note: {
				type: "string",
			},
			role: {
				type: "string",
			},
		},
	},
	databaseHooks: {
		user: {
			update: {
				before: async (userData) => ({
					data: { ...userData, role: undefined },
				}),
			},
		},
	},
	plugins: [
		expo(),
		magicLink({
			async sendMagicLink({ email, url }) {
				await emailer.sendEmail({
					to: email,
					subject: "FanAthletics - Sign in with a magic link",
					html: emailer.templates.withLogo(`<a href="${url}">Click here</a>`),
				});
			},
		}),
	],
});

export default new Hono().on(["POST", "GET"], "/*", (c) =>
	auth.handler(c.req.raw),
);
