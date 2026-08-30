-- Add auth_provider column to users table
ALTER TABLE `users` ADD COLUMN `auth_provider` text NOT NULL DEFAULT 'email';
