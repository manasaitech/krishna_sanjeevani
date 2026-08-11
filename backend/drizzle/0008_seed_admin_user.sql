-- Seed default admin user 'test@example.com' with password 'admin12345'
-- First create user if it doesn't exist (keeping a constant UUID if fresh)
INSERT OR IGNORE INTO `users` (`id`, `email`, `password_hash`, `role`, `status`, `email_verified`, `created_at`, `updated_at`) VALUES
('e68fd1e8-aabb-40e0-94a6-058b834cf73f', 'test@example.com', '$2b$10$DSLVSPYRo/mdIuZGYtEOmunzxMb5cUGY2fIlny55tXzRkPysM5eDy', 'admin', 'active', 1, 1785938527000, 1785938527000);

-- Update the password hash, role, and status to match seed values if the email already existed (prevents FK failures)
UPDATE `users` SET 
  `password_hash` = '$2b$10$DSLVSPYRo/mdIuZGYtEOmunzxMb5cUGY2fIlny55tXzRkPysM5eDy',
  `role` = 'admin',
  `status` = 'active'
WHERE `email` = 'test@example.com';

-- Insert the admin profile if it doesn't exist
INSERT OR IGNORE INTO `user_profiles` (`id`, `user_id`, `full_name`, `category`, `language`, `created_at`, `updated_at`) VALUES
('admin-profile-id-seed', (SELECT `id` FROM `users` WHERE `email` = 'test@example.com'), 'Sanjeevni Admin', 'devotional', 'en', 1785938527000, 1785938527000);
