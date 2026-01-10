export interface Event {
	id: string;
	name: string;
	organization: string;
	domtelApp: string | null;
	image: string;
	icon: string;
	status: "idle" | "unavailable" | "available";
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
	domtelPhotos?: boolean;
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

export interface Participant {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	userId: string;
	referenceId: string;
	type: string;
	budget: number;
	lastPoints: number;
}

export interface UserWithParticipation {
	user: User;
	participant: Participant;
	place: number;
	team: Athlete[];
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
	code: string;
	organization?: string | null;
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
	birthdate: string | null;
	cost: number;
	coach: string;
	club: string | null;
	sex: "M" | "K";
	nationality: string;
	createdAt: string;
	updatedAt: string;
}

export interface AthletePayload {
	number: number;
	imageUrl: string | null;
	firstName: string;
	lastName: string;
	cost: number;
	coach: string;
}

export interface AthleteWithDisciplines extends Athlete {
	disciplines: Discipline[];
}

export interface Competition {
	id: string;
	disciplineId: string;
	discipline: Discipline;
	series: number;
	round: number;
	note: string | null;
	trials: unknown;
	startAt: Date;
	endedAt: Date | null;
}

export interface Competitor extends Athlete {
	results: CompetitorResults | null;
	number: number;
	lane: number;
	winPrediction: number;
	// predictionPoints: number;
}

export interface DisciplineCompetitor {
	athleteId: string;
	competitionId: string;
	lane: number | null;
	winPrediction: number;
	// predictionPoints: number;
	results: CompetitorResults | null;
}

export interface CompetitorResults {
	place: number;
	ranking: string;
	result: string;
}

export interface CompetitionWithCompetitors extends Competition {
	competitors: Competitor[];
}

export interface PersonalRecord {
	id: string;
	athleteId: string;
	disciplineName: string;
	disciplineCode: string;
	result: string;
	date: string | null;
	location: string | null;
	resultPoints: number | null;
	isWorldRecord: boolean;
}

export interface SeasonBest {
	id: string;
	athleteId: string;
	disciplineName: string;
	disciplineCode: string;
	result: string;
	date: string | null;
	location: string | null;
	resultPoints: number | null;
}

export interface Honour {
	id: string;
	athleteId: string;
	championships: string;
	year: number | null;
	place: number;
	result: string;
}

export interface UserTeam {
	id: string;
	eventId: string;
	eventName: string;
	eventIcon: string | null;
	budget: number;
	points: number;
	athletes: Athlete[];
}

export interface AthleteWithCaptain extends Athlete {
	isCaptain: boolean;
}

export interface GameSpecification {
	id: string;
	eventId: string;
	numberOfTeamMembers: number;
	budget: number;
	maxExchanges: number;
	minAthleteCost: number;
	maxAthleteCost: number;
	sexParity: boolean;
}
