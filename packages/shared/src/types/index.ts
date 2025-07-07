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
	id: string;
	eventId: string;
	name: string;
	organization: string | null;
	record: string;
	icon: string;
	createdAt: string;
	updatedAt: string;
}

export interface Athlete {
	id: string;
	eventId: string;
	number: number;
	imageUrl: string | null;
	firstName: string;
	lastName: string;
	cost: number;
	coach: string;
	createdAt: string;
	updatedAt: string;
}

export interface AthleteWithDisciplines extends Athlete {
	disciplines: Discipline[];
}
