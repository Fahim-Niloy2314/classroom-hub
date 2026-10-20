CREATE TABLE `hub_activity` (
	`id` text PRIMARY KEY NOT NULL,
	`day` text NOT NULL,
	`seen` integer NOT NULL,
	`route` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `hub_alerts` (
	`id` text PRIMARY KEY NOT NULL,
	`state` text NOT NULL,
	`attempts` integer NOT NULL,
	`retry` integer NOT NULL,
	`summary` text NOT NULL,
	`provider_id` text
);
--> statement-breakpoint
CREATE TABLE `hub_inbox` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`created` text NOT NULL,
	`status` text NOT NULL,
	`payload` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `hub_inbox_request_id_unique` ON `hub_inbox` (`request_id`);--> statement-breakpoint
CREATE TABLE `hub_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `hub_sessions` (
	`token` text PRIMARY KEY NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `hub_state` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
