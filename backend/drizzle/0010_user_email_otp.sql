-- Create otps table for email verification and forgot password recovery codes
CREATE TABLE `otps` (
  `id` text PRIMARY KEY NOT NULL,
  `email` text NOT NULL,
  `code` text NOT NULL,
  `purpose` text NOT NULL, -- 'verification' | 'reset_password'
  `expires_at` integer NOT NULL,
  `created_at` integer NOT NULL
);
