ALTER TABLE `play_history` ADD COLUMN `program_id` text REFERENCES `programs`(`id`) ON DELETE cascade;
--> statement-breakpoint
ALTER TABLE `play_history` ADD COLUMN `last_position` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `play_history` ADD COLUMN `updated_at` integer DEFAULT 0 NOT NULL;
