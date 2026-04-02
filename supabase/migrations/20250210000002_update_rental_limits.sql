-- Update rental limits to 2-week rolling window system
-- Tier 1: 1 item per 2 weeks
-- Tier 2: 2 items per 2 weeks
-- Tier 3: 2 items per 2 weeks

-- First, ensure the required columns exist
ALTER TABLE public.membership_tiers
ADD COLUMN IF NOT EXISTS monthly_rental_limit INT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS rental_duration_days INT DEFAULT 7,
ADD COLUMN IF NOT EXISTS archive_access BOOLEAN DEFAULT FALSE;

-- Add rental window column (default 14 days = 2 weeks)
ALTER TABLE public.membership_tiers
ADD COLUMN IF NOT EXISTS rental_window_days INT DEFAULT 14;

-- Update Tier 0 (Free): Cannot rent
UPDATE public.membership_tiers SET
  monthly_rental_limit = 0,
  rental_duration_days = 0,
  rental_window_days = 14,
  archive_access = FALSE
WHERE id = 0;

-- Update Tier 1: 1 item per 2 weeks, 7 days max duration
UPDATE public.membership_tiers SET
  monthly_rental_limit = 1,
  rental_duration_days = 7,
  rental_window_days = 14,
  archive_access = FALSE
WHERE id = 1;

-- Update Tier 2: 2 items per 2 weeks, 14 days max duration
UPDATE public.membership_tiers SET
  monthly_rental_limit = 2,
  rental_duration_days = 14,
  rental_window_days = 14,
  archive_access = FALSE
WHERE id = 2;

-- Update Tier 3: 2 items per 2 weeks, 21 days max duration, archive access
UPDATE public.membership_tiers SET
  monthly_rental_limit = 2,
  rental_duration_days = 21,
  rental_window_days = 14,
  archive_access = TRUE
WHERE id = 3;

-- Update the check_rental_limit function to use rolling window instead of monthly
CREATE OR REPLACE FUNCTION public.check_rental_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_tier INT;
  v_limit INT;
  v_window_days INT;
  v_current_count INT;
BEGIN
  -- Get user's tier
  SELECT membership_tier INTO v_tier
  FROM public.profiles
  WHERE id = p_user_id;

  -- Get tier's rental limit and window
  SELECT monthly_rental_limit, COALESCE(rental_window_days, 14)
  INTO v_limit, v_window_days
  FROM public.membership_tiers
  WHERE id = v_tier;

  -- If unlimited (NULL) or 0 (free tier can't rent), handle appropriately
  IF v_limit IS NULL THEN
    RETURN TRUE;
  END IF;

  IF v_limit = 0 THEN
    RETURN FALSE;
  END IF;

  -- Count active rentals in the rolling window
  SELECT COUNT(*) INTO v_current_count
  FROM public.rentals
  WHERE user_id = p_user_id
    AND status NOT IN ('cancelled', 'returned', 'completed')
    AND created_at >= (CURRENT_DATE - (v_window_days || ' days')::INTERVAL);

  RETURN v_current_count < v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments explaining the fields
COMMENT ON COLUMN public.membership_tiers.monthly_rental_limit IS 'Number of rentals allowed per rental_window_days period (0 = cannot rent, NULL = unlimited)';
COMMENT ON COLUMN public.membership_tiers.rental_window_days IS 'Rolling window in days for rental limit (default 14 = 2 weeks)';
