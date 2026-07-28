CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT,
  title TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Existing DBs created before auth
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id)
  WHERE user_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT,
  name TEXT,
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_title TEXT,
  company TEXT,
  location TEXT,
  start_date DATE,
  end_date DATE,
  description TEXT,
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT,
  url TEXT,
  description TEXT,
  tech_stack TEXT[],
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  institution TEXT,
  degree TEXT,
  field TEXT,
  start_date TEXT,
  end_date TEXT
);

CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT,
  provider TEXT,
  issue_date TEXT,
  expiry_date TEXT,
  credential_id TEXT,
  credential_url TEXT
);

CREATE TABLE IF NOT EXISTS generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  job_title TEXT,
  company_name TEXT,
  job_description TEXT,
  generated_resume_json JSONB,
  generated_cover_letter TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE generations ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE generations ADD COLUMN IF NOT EXISTS output_mode TEXT DEFAULT 'both';
ALTER TABLE generations ADD COLUMN IF NOT EXISTS resume_template TEXT DEFAULT 'color';

CREATE INDEX IF NOT EXISTS idx_skills_profile ON skills(profile_id);
CREATE INDEX IF NOT EXISTS idx_experience_profile ON experience(profile_id);
CREATE INDEX IF NOT EXISTS idx_projects_profile ON projects(profile_id);
CREATE INDEX IF NOT EXISTS idx_education_profile ON education(profile_id);
CREATE INDEX IF NOT EXISTS idx_certifications_profile ON certifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_generations_profile ON generations(profile_id);
CREATE INDEX IF NOT EXISTS idx_generations_user ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Remove pre-auth orphan rows so every profile belongs to a user
DELETE FROM profiles WHERE user_id IS NULL;

