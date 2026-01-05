export function convertToPolishDateTime(
	date: Date,
	timeOrDate: "time" | "date" | "both",
) {
	if (timeOrDate === "time")
		return date.toLocaleTimeString("pl-PL", {
			hour: "2-digit",
			minute: "2-digit",
		});
	if (timeOrDate === "date") {
		const partsOfDate = date
			.toLocaleDateString("pl-PL", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
			})
			.split(".");

		const [day, month, year] = partsOfDate;

		return `${year}.${month}.${day}`;
	}
	return date.toLocaleString("pl-PL", {
		hour: "2-digit",
		minute: "2-digit",
		day: "2-digit",
		month: "2-digit",
		year: "2-digit",
	});
}
