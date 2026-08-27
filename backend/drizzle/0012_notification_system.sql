-- Add eventId and status columns to notifications table
ALTER TABLE notifications ADD COLUMN event_id TEXT;
ALTER TABLE notifications ADD COLUMN status TEXT DEFAULT 'sent';

-- Backfill event_id for any existing rows (use the id as a fallback)
UPDATE notifications SET event_id = id WHERE event_id IS NULL;

-- Create unique index for idempotency on event_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_event_id ON notifications(event_id);

-- Create notification_jobs table for delayed/scheduled job processing
CREATE TABLE IF NOT EXISTS notification_jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  execute_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payload TEXT,
  created_at INTEGER NOT NULL,
  processed_at INTEGER
);

-- Index for efficiently querying pending jobs by execution time
CREATE INDEX IF NOT EXISTS idx_notification_jobs_pending ON notification_jobs(status, execute_at);
