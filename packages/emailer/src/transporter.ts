import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: Number.parseInt(process.env.SMTP_PORT as string),
	secure: false,
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASSWORD,
	},
});
