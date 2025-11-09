import type { File, GoogleGenAI } from "@google/genai";
import { createPartFromUri, createUserContent } from "@google/genai";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

const idsSchema = z.array(z.string());

const model = (ai: GoogleGenAI) => ({
	generate({ file, budget }: { file: File; budget: number }) {
		if (!file.uri || !file.mimeType) {
			throw new Error("File URI is required for model generation.");
		}

		return ai.models.generateContent({
			model: "gemini-2.5-pro",
			contents: createUserContent([
				createPartFromUri(file.uri, file.mimeType),
				"\n\n",
				"You're playing a fantasy athletics game. Build a team of 8 athletes under a fixed budget, each athlete has a cost. Using historical performance data, select the combination of athletes that will maximize total fantasy points.",
				"\n",
				`Respond with a JSON array of ids of the selected athletes. Ensure the total cost does not exceed the budget of ${budget}.`,
			]),
			config: {
				responseMimeType: "application/json",
				responseJsonSchema: zodToJsonSchema(idsSchema),
			},
		});
	},
});

export default model;
