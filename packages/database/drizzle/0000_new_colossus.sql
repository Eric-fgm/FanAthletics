CREATE TABLE "account" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"scope" text,
	"idToken" text,
	"password" text,
	"accessTokenExpiresAt" timestamp with time zone,
	"refreshTokenExpiresAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "athlete" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"eventId" text NOT NULL,
	"number" integer NOT NULL,
	"firstName" varchar(255) NOT NULL,
	"lastName" varchar(255) NOT NULL,
	"cost" integer NOT NULL,
	"coach" varchar(255) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "athlete_discipline" (
	"athleteId" text NOT NULL,
	"disciplineId" text NOT NULL,
	CONSTRAINT "athlete_discipline_athleteId_disciplineId_pk" PRIMARY KEY("athleteId","disciplineId")
);
--> statement-breakpoint
CREATE TABLE "athlete_meta" (
	"athleteId" text NOT NULL,
	"key" varchar(255) NOT NULL,
	"value" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competition" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"disciplineId" text NOT NULL,
	"seriesCount" integer DEFAULT 1 NOT NULL,
	"note" varchar(255),
	"trials" json NOT NULL,
	"startAt" timestamp with time zone NOT NULL,
	"endedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "competitor" (
	"competitionId" text NOT NULL,
	"athleteId" text NOT NULL,
	"series" integer DEFAULT 1 NOT NULL,
	"place" integer NOT NULL,
	"results" json NOT NULL,
	CONSTRAINT "competitor_competitionId_athleteId_pk" PRIMARY KEY("competitionId","athleteId")
);
--> statement-breakpoint
CREATE TABLE "discipline" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"eventId" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"record" varchar(255) NOT NULL,
	"icon" varchar(255) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"organization" varchar(255) NOT NULL,
	"image" varchar(255) NOT NULL,
	"icon" varchar(255) NOT NULL,
	"startAt" timestamp with time zone NOT NULL,
	"endAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "league" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ownerId" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"password" varchar(255),
	"limit" integer,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "participant" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"referenceId" text NOT NULL,
	"type" varchar(255) NOT NULL,
	"budget" integer NOT NULL,
	"lastPoints" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"token" text NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"expiresAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_member" (
	"athleteId" text NOT NULL,
	"participantId" text NOT NULL,
	"isCaptain" boolean DEFAULT false NOT NULL,
	CONSTRAINT "team_member_athleteId_participantId_pk" PRIMARY KEY("athleteId","participantId")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255),
	"note" varchar(255),
	"role" varchar(255) DEFAULT 'user' NOT NULL,
	"email" varchar(255) NOT NULL,
	"emailVerified" boolean NOT NULL,
	"image" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "athlete" ADD CONSTRAINT "athlete_eventId_event_id_fk" FOREIGN KEY ("eventId") REFERENCES "public"."event"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "athlete_discipline" ADD CONSTRAINT "athlete_discipline_athleteId_athlete_id_fk" FOREIGN KEY ("athleteId") REFERENCES "public"."athlete"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "athlete_discipline" ADD CONSTRAINT "athlete_discipline_disciplineId_discipline_id_fk" FOREIGN KEY ("disciplineId") REFERENCES "public"."discipline"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "athlete_meta" ADD CONSTRAINT "athlete_meta_athleteId_athlete_id_fk" FOREIGN KEY ("athleteId") REFERENCES "public"."athlete"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition" ADD CONSTRAINT "competition_disciplineId_discipline_id_fk" FOREIGN KEY ("disciplineId") REFERENCES "public"."discipline"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitor" ADD CONSTRAINT "competitor_competitionId_competition_id_fk" FOREIGN KEY ("competitionId") REFERENCES "public"."competition"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitor" ADD CONSTRAINT "competitor_athleteId_athlete_id_fk" FOREIGN KEY ("athleteId") REFERENCES "public"."athlete"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discipline" ADD CONSTRAINT "discipline_eventId_event_id_fk" FOREIGN KEY ("eventId") REFERENCES "public"."event"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "league" ADD CONSTRAINT "league_ownerId_user_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participant" ADD CONSTRAINT "participant_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_member" ADD CONSTRAINT "team_member_athleteId_athlete_id_fk" FOREIGN KEY ("athleteId") REFERENCES "public"."athlete"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_member" ADD CONSTRAINT "team_member_participantId_participant_id_fk" FOREIGN KEY ("participantId") REFERENCES "public"."participant"("id") ON DELETE no action ON UPDATE no action;