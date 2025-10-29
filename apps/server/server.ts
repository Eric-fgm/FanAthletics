import express, { type Request, type Response } from "express";
import cors from "cors";
import { spawn } from "node:child_process";
import "dotenv/config";

const app = express();

app.use(cors());
app.use(express.json());

interface ScrapeRequestBody {
  url?: string;
}

interface ScrapeResponse {
  title?: string;
  error?: string;
}

app.post("/api/scrape", (req: Request<{}, {}, ScrapeRequestBody>, res: Response) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "No url address in request" });
  }

  const process = spawn("python3", ["scraper.py", url]);

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
        res.status(500).json({ error: "Error while parsing JSON from Python" });
      }
    } else {
      res.status(500).json({ error: errorOutput || `Process ended with code: ${code}` });
    }
  });
});

const PORT = Number.parseInt(process.env.SCRAPER_PORT as string);
app.listen(PORT, () => console.log(`Scraper server working on http://localhost:${PORT}`));
