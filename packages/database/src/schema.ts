import { relations, sql } from "drizzle-orm";
import {
	boolean,
	integer,
	json,
	pgTable,
	primaryKey,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

// ###########
// #  AUTH   #
// ###########

export const user = pgTable("user", {
	id: text().primaryKey().default(sql`gen_random_uuid()`),
	name: varchar({ length: 255 }),
	note: varchar({ length: 255 }),
	role: varchar({ length: 255 }).default("user").notNull(),
	email: varchar({ length: 255 }).notNull().unique(),
	emailVerified: boolean().notNull(),
	image: text(),
	createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const session = pgTable("session", {
	id: text().primaryKey().default(sql`gen_random_uuid()`),
	userId: text()
		.references(() => user.id)
		.notNull(),
	token: text().notNull(),
	ipAddress: text(),
	userAgent: text(),
	expiresAt: timestamp({ withTimezone: true }).notNull(),
	createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const account = pgTable("account", {
	id: text().primaryKey().default(sql`gen_random_uuid()`),
	userId: text()
		.references(() => user.id)
		.notNull(),
	accountId: text().notNull(),
	providerId: text().notNull(),
	accessToken: text(),
	refreshToken: text(),
	scope: text(),
	idToken: text(),
	password: text(),
	accessTokenExpiresAt: timestamp({ withTimezone: true }),
	refreshTokenExpiresAt: timestamp({ withTimezone: true }),
	createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const verification = pgTable("verification", {
	id: text().primaryKey().default(sql`gen_random_uuid()`),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp({ withTimezone: true }).notNull(),
	createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

// #############
// #   EVENT   #
// #############

export const event = pgTable("event", {
	id: text().primaryKey().default(sql`gen_random_uuid()`),
	name: varchar({ length: 255 }).notNull(),
	organization: varchar({ length: 255 }).notNull(),
	domtelApp: varchar({ length: 255 }),
	image: varchar({ length: 255 }).notNull(),
	icon: varchar({ length: 255 }).notNull(),
	startAt: timestamp({ withTimezone: true }).notNull(),
	endAt: timestamp({ withTimezone: true }).notNull(),
	createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const participant = pgTable("participant", {
	id: text().primaryKey().default(sql`gen_random_uuid()`),
	userId: text()
		.references(() => user.id)
		.notNull(),
	referenceId: text().notNull(),
	type: varchar({ length: 255 }).notNull(),
	budget: integer().notNull(),
	lastPoints: integer().default(0).notNull(),
	createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const discipline = pgTable("discipline", {
	id: text().primaryKey().default(sql`gen_random_uuid()`),
	eventId: text()
		.references(() => event.id)
		.notNull(),
	name: varchar({ length: 255 }).notNull(),
	organization: varchar({ length: 255 }),
	record: varchar({ length: 255 }).notNull(),
	icon: varchar({ length: 255 }).notNull(),
	createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const athlete = pgTable("athlete", {
	id: text().primaryKey().default(sql`gen_random_uuid()`),
	eventId: text()
		.references(() => event.id)
		.notNull(),
	imageUrl: varchar({ length: 255 }),
	number: integer().notNull(),
	firstName: varchar({ length: 255 }).notNull(),
	lastName: varchar({ length: 255 }).notNull(),
	birthdate: varchar({ length: 255 }),
	cost: integer().notNull(),
	coach: varchar({ length: 255 }).notNull(),
	club: varchar({ length: 255 }),
	nationality: varchar({ length: 255 }).notNull(),
	sex: varchar({ length: 1 }),
	createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const personalRecords = pgTable("personal_records", {
	id: text().primaryKey().default(sql`gen_random_uuid()`),
	athleteId: text()
		.references(() => athlete.id)
		.notNull(),
	disciplineName: varchar({ length: 255 }).notNull(),
	result: varchar({ length: 255 }).notNull(),
	date: varchar({ length: 255 }),
	location: varchar({ length: 255 }),
	resultPoints: integer(),
	isWorldRecord: boolean().default(false).notNull(),
});

export const seasonBests = pgTable("season_bests", {
	id: text().primaryKey().default(sql`gen_random_uuid()`),
	athleteId: text()
		.references(() => athlete.id)
		.notNull(),
	disciplineName: varchar({ length: 255 }).notNull(),
	result: varchar({ length: 255 }).notNull(),
	date: varchar({ length: 255 }),
	location: varchar({ length: 255 }),
	resultPoints: integer(),
});

export const honours = pgTable("honours", {
	id: text().primaryKey().default(sql`gen_random_uuid()`),
	athleteId: text()
		.references(() => athlete.id)
		.notNull(),
	championships: varchar({ length: 255 }).notNull(),
	year: integer(),
	place: integer().notNull(),
	result: varchar({ length: 255 }).notNull(),
});

export const athleteDiscipline = pgTable(
	"athlete_discipline",
	{
		athleteId: text()
			.references(() => athlete.id)
			.notNull(),
		disciplineId: text()
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
	athleteId: text()
		.references(() => athlete.id)
		.notNull(),
	key: varchar({ length: 255 }).notNull(),
	value: varchar({ length: 255 }).notNull(),
});

export const teamMember = pgTable(
	"team_member",
	{
		athleteId: text()
			.references(() => athlete.id)
			.notNull(),
		participantId: text()
			.references(() => participant.id)
			.notNull(),
		isCaptain: boolean().default(false).notNull(),
		pointsGathered: integer().default(0).notNull(),
	},
	(table) => [
		primaryKey({
			columns: [table.athleteId, table.participantId],
		}),
	],
);

export const competition = pgTable("competition", {
	id: text().primaryKey().default(sql`gen_random_uuid()`),
	disciplineId: text()
		.references(() => discipline.id)
		.notNull(),
	series: integer().default(1).notNull(),
	round: integer().default(1).notNull(),
	note: varchar({ length: 255 }),
	trials: json().notNull(),
	startAt: timestamp({ withTimezone: true }).notNull(),
	endedAt: timestamp({ withTimezone: true }),
});

export const competitor = pgTable(
	"competitor",
	{
		competitionId: text()
			.references(() => competition.id)
			.notNull(),
		athleteId: text()
			.references(() => athlete.id)
			.notNull(),
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
	id: text().primaryKey().default(sql`gen_random_uuid()`),
	ownerId: text()
		.references(() => user.id)
		.notNull(),
	name: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }),
	limit: integer(),
	createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const disciplineRelations = relations(discipline, ({ one, many }) => ({
	event: one(event),
	athleteDisciplines: many(athleteDiscipline),
}));

export const athleteRelations = relations(athlete, ({ one, many }) => ({
	event: one(event),
	athleteDisciplines: many(athleteDiscipline),
}));

export const athleteDisciplineRelations = relations(
	athleteDiscipline,
	({ one }) => ({
		athlete: one(athlete, {
			fields: [athleteDiscipline.athleteId],
			references: [athlete.id],
		}),
		discipline: one(discipline, {
			fields: [athleteDiscipline.disciplineId],
			references: [discipline.id],
		}),
	}),
);

export const competitorRelations = relations(competitor, ({ one }) => ({
	athlete: one(athlete, {
		fields: [competitor.athleteId],
		references: [athlete.id],
	}),
	competition: one(competition, {
		fields: [competitor.competitionId],
		references: [competition.id],
	}),
}));
