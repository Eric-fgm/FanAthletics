import { Readable } from "node:stream";
import csv from "csv-parser";

export const fetchCSV = async <T>(
	url: string,
	parse?: (row: unknown) => T,
): Promise<T[]> => {
	const response = await fetch(url);

	if (!response.ok || !response.body) {
		throw new Error(`Fetch failed: ${response.status}`);
	}

	const nodeStream = Readable.fromWeb(response.body);

	const results: T[] = [];

	return new Promise((resolve, reject) => {
		nodeStream
			.pipe(csv())
			.on("data", (row) => {
				results.push(parse ? parse(row) : row);
			})
			.on("end", () => {
				resolve(results);
			})
			.on("error", reject);
	});
};
