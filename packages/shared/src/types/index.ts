export interface Event {
	id: string;
	name: string;
	organization: string;
	image: string;
	icon: string;
	startAt: string;
	endAt: string;
	createdAt: string;
	updatedAt: string;
}

export interface User {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	createdAt: Date;
	updatedAt: Date;
	note: string;
	role: string;
	image?: string | null;
}

export interface Discipline {
	id: string,
	eventId: string,
	name: string,
	record: string,
	icon: string,
	createdAt: Date,
	updatedAt: Date
}
