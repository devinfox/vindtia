-- Add user body profile for AI outfit generation
-- This stores photos and measurements to generate personalized outfit visualizations

-- Add body profile columns to the profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS front_photo_url TEXT,
ADD COLUMN IF NOT EXISTS side_photo_url TEXT,
ADD COLUMN IF NOT EXISTS height_cm NUMERIC(5,1),
ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(5,1),
ADD COLUMN IF NOT EXISTS bust_cm NUMERIC(5,1),
ADD COLUMN IF NOT EXISTS waist_cm NUMERIC(5,1),
ADD COLUMN IF NOT EXISTS hips_cm NUMERIC(5,1),
ADD COLUMN IF NOT EXISTS inseam_cm NUMERIC(5,1),
ADD COLUMN IF NOT EXISTS shoulder_width_cm NUMERIC(5,1),
ADD COLUMN IF NOT EXISTS clothing_size_top VARCHAR(10),
ADD COLUMN IF NOT EXISTS clothing_size_bottom VARCHAR(10),
ADD COLUMN IF NOT EXISTS shoe_size VARCHAR(10),
ADD COLUMN IF NOT EXISTS skin_tone VARCHAR(50),
ADD COLUMN IF NOT EXISTS hair_color VARCHAR(50),
ADD COLUMN IF NOT EXISTS hair_length VARCHAR(50),
ADD COLUMN IF NOT EXISTS body_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS style_preferences JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS body_profile_updated_at TIMESTAMPTZ;

-- Create a storage bucket for user profile photos if it doesn't exist
-- Note: This needs to be done via Supabase dashboard or CLI, not SQL
-- But we can create a comment for reference
COMMENT ON COLUMN profiles.front_photo_url IS 'URL to front-facing photo stored in Supabase Storage user-photos bucket';
COMMENT ON COLUMN profiles.side_photo_url IS 'URL to side profile photo stored in Supabase Storage user-photos bucket';
COMMENT ON COLUMN profiles.height_cm IS 'Height in centimeters';
COMMENT ON COLUMN profiles.weight_kg IS 'Weight in kilograms';
COMMENT ON COLUMN profiles.bust_cm IS 'Bust/chest measurement in centimeters';
COMMENT ON COLUMN profiles.waist_cm IS 'Waist measurement in centimeters';
COMMENT ON COLUMN profiles.hips_cm IS 'Hip measurement in centimeters';
COMMENT ON COLUMN profiles.inseam_cm IS 'Inseam/leg length in centimeters';
COMMENT ON COLUMN profiles.shoulder_width_cm IS 'Shoulder width in centimeters';
COMMENT ON COLUMN profiles.clothing_size_top IS 'Top clothing size (XS, S, M, L, XL, XXL, or numeric)';
COMMENT ON COLUMN profiles.clothing_size_bottom IS 'Bottom clothing size (XS, S, M, L, XL, XXL, or numeric like 28, 30, 32)';
COMMENT ON COLUMN profiles.shoe_size IS 'Shoe size (US, EU, or UK with prefix)';
COMMENT ON COLUMN profiles.skin_tone IS 'Skin tone description for AI model generation';
COMMENT ON COLUMN profiles.hair_color IS 'Hair color description';
COMMENT ON COLUMN profiles.hair_length IS 'Hair length (short, medium, long, etc.)';
COMMENT ON COLUMN profiles.body_type IS 'Body type description (hourglass, pear, athletic, etc.)';
COMMENT ON COLUMN profiles.style_preferences IS 'JSON array of preferred style aesthetics';

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_profiles_body_profile_updated
ON profiles(body_profile_updated_at)
WHERE front_photo_url IS NOT NULL OR side_photo_url IS NOT NULL;

-- RLS policies should already be in place for profiles table
-- Users can only read/write their own profile
