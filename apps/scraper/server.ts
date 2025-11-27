import { spawn } from "node:child_process";
import cors from "cors";
import express, { type Request, type Response } from "express";
import "dotenv/config";

const app = express();

app.use(cors());
app.use(express.json());

interface ScrapeRequestBody {
	url?: string;
	sex?: string;
}

interface AssignPointsBody {
	result?: string;
	discipline?: string;
	sex?: string;
}

interface ScrapeResponse {
	title?: string;
	error?: string;
}

app.post(
	"/api/scrape",
	(
		req: Request<
			Record<string, never>,
			Record<string, never>,
			ScrapeRequestBody
		>,
		res: Response,
	) => {
		const { url, sex } = req.body;

		if (!url) {
			return res.status(400).json({ error: "No url address in request" });
		}

		if (!sex) {
			return res.status(400).json({ error: "No sex in request" });
		}

		const process = spawn("python3", ["scraper.py", url, sex]);

		let output = "";
		let errorOutput = "";

		process.stdout.on("data", (data: Buffer) => {
			output += data.toString();
		});

		process.stderr.on("data", (data: Buffer) => {
			errorOutput += data.toString();
		});

		process.on("close", (code: number | null) => {
			if (code === 0) {
				try {
					const jsonResult: ScrapeResponse = JSON.parse(output);
					res.json(jsonResult);
				} catch (e) {
					res
						.status(500)
						.json({ error: "Error while parsing JSON from Python" });
				}
			} else {
				res
					.status(500)
					.json({ error: errorOutput || `Process ended with code: ${code}` });
			}
		});
	},
).post(
	"/api/assign-points",
	(
		req: Request<
			{},
			{},
			AssignPointsBody
		>,
		res: Response
	) => {
		const { result, discipline, sex } = req.body;
		
		if (!result) {
			return res.status(400).json({ error: "No result in request" });
		}

		if (!discipline) {
			return res.status(400).json({ error: "No discipline in request" });
		}

		if (!sex) {
			return res.status(400).json({ error: "No sex in request" });
		}

		const process = spawn("python3", ["points.py", result, discipline, sex]);

		let output = "";
		let errorOutput = "";

		process.stdout.on("data", (data: Buffer) => {
			output += data.toString();
		});

		process.stderr.on("data", (data: Buffer) => {
			errorOutput += data.toString();
		});

		process.on("close", (code: number | null) => {
			if (code === 0) {
				const value = Number(output.trim());

				if (isNaN(value)) {
					res
						.status(500)
						.json({ error: "Not valid number returned "});
				} else {
					console.log(result, discipline, sex, value);
					res.json({ "points": value });
				}
			
			} else {
				res
					.status(500)
					.json({ error: errorOutput || `Process ended with code: ${code}` });
			}
		});
	}
);

const PORT = Number.parseInt(process.env.SCRAPER_PORT as string);
app.listen(PORT, () =>
	console.log(`🐍 Scraper server working on http://localhost:${PORT}`),
);
