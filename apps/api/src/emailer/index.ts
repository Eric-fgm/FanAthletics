import withLogo from "@/emailer/templates/with-logo";
import { transporter } from "@/emailer/transporter";

export default {
	templates: {
		withLogo,
	},
	async sendEmail({
		to,
		subject,
		html,
	}: { to: string | string[]; subject: string; html: string }) {
		const recipients = typeof to === "string" ? [to] : to;

		const { accepted } = await transporter.sendMail({
			from: `"${process.env.SENDER_NAME}" <${process.env.SENDER_EMAIL}>`,
			to: recipients,
			subject,
			html,
		});

		if (accepted.length !== recipients.length) {
			throw new Error("Could not sent all emails");
		}
	},
};
