-- Create payments table
CREATE TABLE `payments` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `plan_id` text NOT NULL,
  `amount` integer NOT NULL,
  `currency` text DEFAULT 'INR' NOT NULL,
  `status` text NOT NULL,
  `order_id` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON UPDATE no action ON DELETE no action
);

-- Seed initial plans
INSERT OR IGNORE INTO `plans` (`id`, `name`, `price`, `currency`, `interval`, `is_active`, `created_at`, `updated_at`) VALUES
('free', 'Sanjeevni Free', 0, 'INR', 'month', 1, 1785938527000, 1785938527000),
('standard', 'Sanjeevni Standard', 19900, 'INR', 'month', 1, 1785938527000, 1785938527000),
('premium', 'Sanjeevni Premium', 29900, 'INR', 'month', 1, 1785938527000, 1785938527000);
