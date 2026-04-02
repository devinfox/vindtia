-- Add style field to products (masculine, feminine, or unisex)
ALTER TABLE products ADD COLUMN IF NOT EXISTS style TEXT DEFAULT 'unisex';

-- Add constraint to ensure valid values
ALTER TABLE products ADD CONSTRAINT products_style_check
CHECK (style IN ('masculine', 'feminine', 'unisex'));

-- Add gender_identity and style_preference to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender_identity TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS presentation_style_preference TEXT[] DEFAULT ARRAY['masculine', 'feminine']::TEXT[];

-- Add constraint for gender_identity
ALTER TABLE profiles ADD CONSTRAINT profiles_gender_identity_check
CHECK (gender_identity IS NULL OR gender_identity IN ('male', 'female', 'nonbinary'));

-- Comment on columns for clarity
COMMENT ON COLUMN products.style IS 'The style presentation of the product: masculine, feminine, or unisex';
COMMENT ON COLUMN profiles.gender_identity IS 'User''s gender identity: male, female, or nonbinary';
COMMENT ON COLUMN profiles.presentation_style_preference IS 'Array of style presentations the user prefers to see: masculine, feminine, or both';
