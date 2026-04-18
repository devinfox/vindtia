-- Add must_change_password column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE;

-- Allow users to update their own must_change_password field (needed for password reset flow)
-- The existing "Users can update their own profile" policy already covers this
