import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
	host: "smtp.ethereal.email",
	port: 587,
	secure: false, // true for 465, false for other ports
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASSWORD,
	},
});
