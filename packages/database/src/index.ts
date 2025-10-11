import {
	and,
	asc,
	desc,
	eq,
	gt,
	ilike,
	inArray,
	like,
	lt,
	or,
	sql,
} from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.js";

export const operators = {
	eq,
	gt,
	lt,
	ilike,
	like,
	inArray,
	and,
	or,
	desc,
	asc,
	sql,
};

export const tables = schema;

export const pool = new Pool({
	connectionString: "postgres://root:admin@localhost:5432/fan-athletics",
});

export const db = drizzle({ client: pool, schema });
