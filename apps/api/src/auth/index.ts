import emailer from "@/emailer";
import { pool } from "@fan-athletics/database";
import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";

export default betterAuth({
	basePath: "/api/v1/auth",
	database: pool,
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
	plugins: [
		magicLink({
			async sendMagicLink({ email, url }) {
				await emailer.sendEmail({
					to: email,
					subject: "FanAthletics - Sign in with a magic link",
					html: emailer.templates.withLogo(url),
				});
			},
		}),
	],
});
