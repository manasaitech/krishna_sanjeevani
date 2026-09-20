CREATE TABLE IF NOT EXISTS `feedbacks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`track_id` text,
	`surawali_id` text,
	`program_id` text,
	`mode` text DEFAULT 'surawali' NOT NULL,
	`rating` integer NOT NULL,
	`mood` text,
	`notes` text,
	`session_duration` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`track_id`) REFERENCES `tracks`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `feedbacks_user_id_idx` ON `feedbacks` (`user_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `feedbacks_mode_idx` ON `feedbacks` (`mode`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `feedbacks_created_at_idx` ON `feedbacks` (`created_at`);
