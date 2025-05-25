import { boolean, date, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

/** */

export const user = pgTable("user", {
	id: uuid().primaryKey().defaultRandom(),
	name: varchar({ length: 255 }).notNull(),
	firstName: varchar({ length: 255 }).notNull(),
	lastName: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull().unique(),
	emailVerified: boolean().notNull(),
	image: varchar({ length: 255 }),
	createdAt: date().notNull(),
	updatedAt: date().notNull(),
});

export const session = pgTable("session", {
	id: uuid().primaryKey().defaultRandom(),
	userId: uuid()
		.references(() => user.id)
		.notNull(),
	token: varchar({ length: 255 }).notNull(),
	ipAddress: varchar({ length: 255 }),
	userAgent: varchar({ length: 255 }),
	expiresAt: date().notNull(),
	createdAt: date().notNull(),
	updatedAt: date().notNull(),
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
	accessTokenExpiresAt: date(),
	refreshTokenExpiresAt: date(),
	createdAt: date().notNull(),
	updatedAt: date().notNull(),
});

export const verification = pgTable("verification", {
	id: uuid().primaryKey().defaultRandom(),
	identifier: varchar({ length: 255 }).notNull(),
	value: varchar({ length: 255 }).notNull(),
	expiresAt: date().notNull(),
	createdAt: date().notNull(),
	updatedAt: date().notNull(),
});
