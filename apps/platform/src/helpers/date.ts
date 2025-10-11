const MONTHS = [
	"Sty",
	"Lut",
	"Mar",
	"Kwi",
	"Maj",
	"Cze",
	"Lip",
	"Sie",
	"Wrz",
	"Paź",
	"Lis",
	"Gru",
];

export const formatDate = (date: Date) => {
	const day = String(date.getDate()).padStart(2, "0");
	const month = MONTHS[date.getMonth()];
	const year = date.getFullYear();

	return `${day} ${month} ${year}`;
};

export const diffDays = (date1: string | Date, date2: string | Date) => {
	const d1: Date = new Date(date1);
	const d2: Date = new Date(date2);

	const diffTime: number = Math.abs(d2.getTime() - d1.getTime());
	return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};
