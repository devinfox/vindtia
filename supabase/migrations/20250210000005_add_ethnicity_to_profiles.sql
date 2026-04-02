-- Add ethnicity column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ethnicity TEXT;

-- Add comment for documentation
COMMENT ON COLUMN profiles.ethnicity IS 'User ethnicity for AI outfit generation personalization';
