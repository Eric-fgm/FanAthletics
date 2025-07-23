export interface Event {
	id: string;
	name: string;
	organization: string;
	domtelApp: string | null;
	image: string;
	icon: string;
	startAt: string;
	endAt: string;
	createdAt: string;
	updatedAt: string;
}

export type EventPayload = {
	name: string;
	organization: string;
	image: string;
	icon: string;
	domtelApp?: string;
};

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

export interface DisciplinePayload {
	eventId: string;
	name: string;
	organization?: string;
	record: string;
	icon: string;
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

export interface Competition {
	id: string;
	disciplineId: string;
	seriesCount: number;
	note: string | null;
	trials: unknown;
	startAt: Date;
	endedAt: Date | null;
}
