-- Add notification-specific columns to user_settings
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS push_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS daily_reminder_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS streak_reminder_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS daily_reminder_time TEXT DEFAULT '09:00',
  ADD COLUMN IF NOT EXISTS streak_reminder_time TEXT DEFAULT '18:00';
