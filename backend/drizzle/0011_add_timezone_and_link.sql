ALTER TABLE user_profiles ADD COLUMN timezone TEXT DEFAULT 'Asia/Kolkata';
ALTER TABLE notifications ADD COLUMN link TEXT;
ALTER TABLE notifications ADD COLUMN date_key TEXT;
