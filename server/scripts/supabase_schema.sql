-- Supabase PostgreSQL schema for Ministry Report System
-- Run this in Supabase SQL editor

-- Enable UUID and crypto if not already
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fullname TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','leader','member')),
  country TEXT,
  contact TEXT,
  address TEXT,
  profile_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  worship_time INTEGER DEFAULT 0,
  bible_reading_time INTEGER DEFAULT 0,
  study_attendants INTEGER DEFAULT 0,
  unique_attendants INTEGER DEFAULT 0,
  newcomers INTEGER DEFAULT 0,
  meditation_time INTEGER DEFAULT 0,
  prayer_time INTEGER DEFAULT 0,
  sermons_listened INTEGER DEFAULT 0,
  articles_written INTEGER DEFAULT 0,
  exercise_time INTEGER DEFAULT 0,
  reflections TEXT,
  thanksgiving TEXT,
  repentance TEXT,
  prayer_requests TEXT,
  other_work TEXT,
  tomorrow_tasks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_user_date ON reports(user_id, date);
CREATE INDEX IF NOT EXISTS idx_reports_date ON reports(date);

-- Attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  mime_type TEXT,
  size INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attachments_report ON attachments(report_id);

-- updated_at triggers
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_reports_updated_at ON reports;
CREATE TRIGGER trg_reports_updated_at
BEFORE UPDATE ON reports
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Optional RLS setup example (disabled by default)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
-- Create policies as needed when using supabase-js client-side access.
