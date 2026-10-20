CREATE TABLE "hub_activity" (
	"id" text PRIMARY KEY NOT NULL,
	"day" text NOT NULL,
	"seen" bigint NOT NULL,
	"route" text NOT NULL
);
;
CREATE TABLE "hub_alerts" (
	"id" text PRIMARY KEY NOT NULL,
	"state" text NOT NULL,
	"attempts" integer NOT NULL,
	"retry" bigint NOT NULL,
	"summary" text NOT NULL,
	"provider_id" text
);
;
CREATE TABLE "hub_inbox" (
	"id" text PRIMARY KEY NOT NULL,
	"request_id" text NOT NULL,
	"created" text NOT NULL,
	"status" text NOT NULL,
	"payload" text NOT NULL
);
;
CREATE UNIQUE INDEX "hub_inbox_request_id_unique" ON "hub_inbox" ("request_id");;
CREATE TABLE "hub_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer NOT NULL,
	"expires" bigint NOT NULL
);
;
CREATE TABLE "hub_sessions" (
	"token" text PRIMARY KEY NOT NULL,
	"expires" bigint NOT NULL
);
;
CREATE TABLE "hub_state" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL
);
