import {
	boolean,
	integer,
	json,
	pgTable,
	primaryKey,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

/** */

export const user = pgTable("user", {
	id: uuid().primaryKey().defaultRandom(),
	name: varchar({ length: 255 }).notNull(),
	firstName: varchar({ length: 255 }).notNull(),
	lastName: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull().unique(),
	emailVerified: boolean().notNull(),
	image: varchar({ length: 255 }),
	createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const session = pgTable("session", {
	id: uuid().primaryKey().defaultRandom(),
	userId: uuid()
		.references(() => user.id)
		.notNull(),
	token: varchar({ length: 255 }).notNull(),
	ipAddress: varchar({ length: 255 }),
	userAgent: varchar({ length: 255 }),
	expiresAt: timestamp({ withTimezone: true }).notNull(),
	createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const account = pgTable("account", {
	id: uuid().primaryKey().defaultRandom(),
	userId: uuid()
		.references(() => user.id)
		.notNull(),
	accountId: varchar({ length: 255 }).notNull(),
	providerId: varchar({ length: 255 }).notNull(),
	accessToken: varchar({ length: 255 }),
	refreshToken: varchar({ length: 255 }),
	scope: varchar({ length: 255 }),
	idToken: varchar({ length: 255 }),
	password: varchar({ length: 255 }),
	accessTokenExpiresAt: timestamp({ withTimezone: true }),
	refreshTokenExpiresAt: timestamp({ withTimezone: true }),
	createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const verification = pgTable("verification", {
	id: uuid().primaryKey().defaultRandom(),
	identifier: varchar({ length: 255 }).notNull(),
	value: varchar({ length: 255 }).notNull(),
	expiresAt: timestamp({ withTimezone: true }).notNull(),
	createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const event = pgTable("event", {
	id: uuid().primaryKey().defaultRandom(),
	name: varchar({ length: 255 }).notNull(),
	organization: varchar({ length: 255 }).notNull(),
	image: varchar({ length: 255 }).notNull(),
	icon: varchar({ length: 255 }).notNull(),
	startAt: timestamp({ withTimezone: true }).notNull(),
	endAt: timestamp({ withTimezone: true }).notNull(),
	createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const participant = pgTable("participant", {
	id: uuid().primaryKey().defaultRandom(),
	userId: uuid()
		.references(() => user.id)
		.notNull(),
	referenceId: uuid().notNull(),
	type: varchar({ length: 255 }).notNull(),
	budget: integer().notNull(),
	lastPoints: integer().default(0).notNull(),
	createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const discipline = pgTable("discipline", {
	id: uuid().primaryKey().defaultRandom(),
	eventId: uuid()
		.references(() => event.id)
		.notNull(),
	name: varchar({ length: 255 }).notNull(),
	record: varchar({ length: 255 }).notNull(),
	icon: varchar({ length: 255 }).notNull(),
	createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const athlete = pgTable("athlete", {
	id: uuid().primaryKey().defaultRandom(),
	eventId: uuid()
		.references(() => event.id)
		.notNull(),
	number: integer().notNull(),
	firstName: varchar({ length: 255 }).notNull(),
	lastName: varchar({ length: 255 }).notNull(),
	cost: integer().notNull(),
	coach: varchar({ length: 255 }).notNull(),
	createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const athleteDiscipline = pgTable(
	"athlete_discipline",
	{
		athleteId: uuid()
			.references(() => athlete.id)
			.notNull(),
		disciplineId: uuid()
			.references(() => discipline.id)
			.notNull(),
	},
	(table) => [
		primaryKey({
			columns: [table.athleteId, table.disciplineId],
		}),
	],
);

export const athleteMeta = pgTable("athlete_meta", {
	athleteId: uuid()
		.references(() => athlete.id)
		.notNull(),
	key: varchar({ length: 255 }).notNull(),
	value: varchar({ length: 255 }).notNull(),
});

export const teamMember = pgTable(
	"team_member",
	{
		athleteId: uuid()
			.references(() => athlete.id)
			.notNull(),
		participantId: uuid()
			.references(() => participant.id)
			.notNull(),
		isCaptain: boolean().default(false).notNull(),
	},
	(table) => [
		primaryKey({
			columns: [table.athleteId, table.participantId],
		}),
	],
);

export const competition = pgTable("competition", {
	id: uuid().primaryKey().defaultRandom(),
	disciplineId: uuid()
		.references(() => discipline.id)
		.notNull(),
	seriesCount: integer().default(1).notNull(),
	note: varchar({ length: 255 }),
	trials: json().notNull(),
	startAt: timestamp({ withTimezone: true }).notNull(),
	endedAt: timestamp({ withTimezone: true }),
});

export const competitor = pgTable(
	"competitor",
	{
		competitionId: uuid()
			.references(() => competition.id)
			.notNull(),
		athleteId: uuid()
			.references(() => athlete.id)
			.notNull(),
		series: integer().default(1).notNull(),
		place: integer().notNull(),
		results: json().notNull(),
	},
	(table) => [
		primaryKey({
			columns: [table.competitionId, table.athleteId],
		}),
	],
);

export const league = pgTable("league", {
	id: uuid().primaryKey().defaultRandom(),
	ownerId: uuid()
		.references(() => user.id)
		.notNull(),
	name: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }),
	limit: integer(),
	createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
