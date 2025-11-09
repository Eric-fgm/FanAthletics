import type { GoogleGenAI } from "@google/genai";

const getFilesAI = (ai: GoogleGenAI) => ({
	upload(path: string) {
		return ai.files.upload({
			file: path,
		});
	},
});

export default getFilesAI;
