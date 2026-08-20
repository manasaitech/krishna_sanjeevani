CREATE TABLE `ailments` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL UNIQUE,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);

CREATE TABLE `surawalis` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL UNIQUE,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);

CREATE TABLE `timings` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL UNIQUE,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);

CREATE TABLE `ailment_surawalis` (
	`id` text PRIMARY KEY NOT NULL,
	`ailment_id` text NOT NULL REFERENCES `ailments`(`id`) ON DELETE CASCADE,
	`surawali_id` text NOT NULL REFERENCES `surawalis`(`id`) ON DELETE CASCADE,
	`timing_id` text NOT NULL REFERENCES `timings`(`id`) ON DELETE CASCADE,
	`created_at` integer NOT NULL
);

CREATE TABLE `pregnancy_mappings` (
	`id` text PRIMARY KEY NOT NULL,
	`pregnancy_month` integer NOT NULL,
	`surawali_id` text NOT NULL REFERENCES `surawalis`(`id`) ON DELETE CASCADE,
	`timing_id` text NOT NULL REFERENCES `timings`(`id`) ON DELETE CASCADE,
	`music_track` text NOT NULL,
	`created_at` integer NOT NULL
);

CREATE TABLE `corporate_ragas` (
	`id` text PRIMARY KEY NOT NULL,
	`raga_name` text NOT NULL,
	`week_day` text NOT NULL,
	`timing_id` text NOT NULL REFERENCES `timings`(`id`) ON DELETE CASCADE,
	`created_at` integer NOT NULL
);

CREATE TABLE `surawali_subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
	`surawali_id` text NOT NULL REFERENCES `surawalis`(`id`) ON DELETE CASCADE,
	`plan` text NOT NULL,
	`status` text NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer NOT NULL,
	`payment_id` text NOT NULL,
	`payment_provider` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
