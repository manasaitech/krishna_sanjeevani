-- Create program_types lookup table
CREATE TABLE `program_types` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `slug` text NOT NULL,
  `description` text,
  `created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `program_types_slug_unique` ON `program_types` (`slug`);
--> statement-breakpoint

-- Seed initial program types
INSERT INTO `program_types` (`id`, `name`, `slug`, `description`, `created_at`) VALUES
('1', 'Therapeutic', 'therapeutic', 'Therapeutic wellness programs targeting stress, focus, sleep, and healing', 1785938527000),
('2', 'Corporate', 'corporate', 'Corporate wellness and mindfulness programs', 1785938527000),
('3', 'Pregnancy', 'pregnancy', 'Trimester and week-specific pregnancy wellness plans', 1785938527000);
--> statement-breakpoint

-- Rebuild programs table to include program_type_id and foreign key link
CREATE TABLE `programs_new` (
  `id` text PRIMARY KEY NOT NULL,
  `title` text NOT NULL,
  `subtitle` text,
  `description` text,
  `thumbnail_key` text,
  `category` text NOT NULL,
  `difficulty` text DEFAULT 'beginner' NOT NULL,
  `estimated_duration` integer,
  `language` text DEFAULT 'hi' NOT NULL,
  `tier` text DEFAULT 'free' NOT NULL,
  `status` text DEFAULT 'draft' NOT NULL,
  `program_type_id` text DEFAULT '1' NOT NULL,
  `created_by` text NOT NULL,
  `updated_by` text,
  `deleted_at` integer,
  `deleted_by` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  FOREIGN KEY (`program_type_id`) REFERENCES `program_types`(`id`) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint

INSERT INTO `programs_new` (`id`, `title`, `subtitle`, `description`, `thumbnail_key`, `category`, `difficulty`, `estimated_duration`, `language`, `tier`, `status`, `program_type_id`, `created_by`, `updated_by`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`)
SELECT `id`, `title`, `subtitle`, `description`, `thumbnail_key`, `category`, `difficulty`, `estimated_duration`, `language`, `tier`, `status`, '1', `created_by`, `updated_by`, `deleted_at`, `deleted_by`, `created_at`, `updated_at` FROM `programs`;
--> statement-breakpoint

DROP TABLE `programs`;
--> statement-breakpoint
ALTER TABLE `programs_new` RENAME TO `programs`;
--> statement-breakpoint

-- Drop old pregnancy tables
DROP TABLE IF EXISTS `pregnancy_schedule`;
--> statement-breakpoint
DROP TABLE IF EXISTS `pregnancy_programs`;
--> statement-breakpoint

-- Recreate pregnancy_schedule linked to programs
CREATE TABLE `pregnancy_schedule` (
  `id` text PRIMARY KEY NOT NULL,
  `program_id` text NOT NULL,
  `pregnancy_month` integer NOT NULL,
  `week` integer NOT NULL,
  `day` integer NOT NULL,
  `unlock_after_days` integer DEFAULT 0,
  `is_required` integer DEFAULT 1 NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

-- Create program_progress table
CREATE TABLE `program_progress` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `program_id` text NOT NULL,
  `completed_tracks` text DEFAULT '[]' NOT NULL,
  `progress_percentage` integer DEFAULT 0 NOT NULL,
  `started_at` integer NOT NULL,
  `completed_at` integer,
  `updated_at` integer NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

-- Rebuild user_profiles to add pregnancy calculation columns
CREATE TABLE `user_profiles_new` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `full_name` text NOT NULL,
  `profile_image` text,
  `category` text NOT NULL,
  `language` text DEFAULT 'en',
  `preferences` text,
  `pregnancy_edd` text,
  `pregnancy_week_start` integer,
  `pregnancy_week_start_week` integer,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

CREATE UNIQUE INDEX `user_profiles_new_user_id_unique` ON `user_profiles_new` (`user_id`);
--> statement-breakpoint

INSERT INTO `user_profiles_new` (`id`, `user_id`, `full_name`, `profile_image`, `category`, `language`, `preferences`, `created_at`, `updated_at`)
SELECT `id`, `user_id`, `full_name`, `profile_image`, `category`, `language`, `preferences`, `created_at`, `updated_at` FROM `user_profiles`;
--> statement-breakpoint

DROP TABLE `user_profiles`;
--> statement-breakpoint
ALTER TABLE `user_profiles_new` RENAME TO `user_profiles`;
