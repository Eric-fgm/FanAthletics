import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getAI = (apiKey: string): GoogleGenAI => {
	if (ai) return ai;

	ai = new GoogleGenAI({ apiKey });

	return ai;
};

export default getAI;
