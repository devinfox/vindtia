-- =====================================================
-- ADD ERA AND MATERIAL FIELDS TO PRODUCTS
-- =====================================================
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS era TEXT,
ADD COLUMN IF NOT EXISTS material TEXT;

-- Create indexes for filtering
CREATE INDEX IF NOT EXISTS idx_products_era ON public.products(era);
CREATE INDEX IF NOT EXISTS idx_products_material ON public.products(material);
CREATE INDEX IF NOT EXISTS idx_products_size ON public.products(size);
CREATE INDEX IF NOT EXISTS idx_products_color ON public.products(color);

-- =====================================================
-- ADD RENTAL LIMITS TO MEMBERSHIP TIERS
-- =====================================================
ALTER TABLE public.membership_tiers
ADD COLUMN IF NOT EXISTS monthly_rental_limit INT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS rental_duration_days INT DEFAULT 7,
ADD COLUMN IF NOT EXISTS archive_access BOOLEAN DEFAULT FALSE;

-- Update membership tiers with rental limits
UPDATE public.membership_tiers SET
  monthly_rental_limit = NULL,
  rental_duration_days = 0,
  archive_access = FALSE
WHERE id = 0;

UPDATE public.membership_tiers SET
  monthly_rental_limit = 2,
  rental_duration_days = 7,
  archive_access = FALSE
WHERE id = 1;

UPDATE public.membership_tiers SET
  monthly_rental_limit = 5,
  rental_duration_days = 14,
  archive_access = FALSE
WHERE id = 2;

UPDATE public.membership_tiers SET
  monthly_rental_limit = NULL, -- unlimited
  rental_duration_days = 21,
  archive_access = TRUE
WHERE id = 3;

-- =====================================================
-- ENHANCED RENTALS TABLE FOR RETURN LOGISTICS
-- =====================================================
ALTER TABLE public.rentals
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS return_initiated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS return_shipped_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS returned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS return_tracking_number TEXT,
ADD COLUMN IF NOT EXISTS shipping_carrier TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update status check to include more statuses
-- First drop existing check if it exists, then add new one
DO $$
BEGIN
  ALTER TABLE public.rentals DROP CONSTRAINT IF EXISTS rentals_status_check;
  ALTER TABLE public.rentals ADD CONSTRAINT rentals_status_check
    CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'active', 'return_initiated', 'return_shipped', 'returned', 'completed', 'cancelled'));
EXCEPTION
  WHEN others THEN
    NULL;
END $$;

-- =====================================================
-- CLEANING SCHEDULES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.cleaning_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  rental_id UUID REFERENCES public.rentals(id) ON DELETE SET NULL,
  scheduled_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  cleaning_type TEXT DEFAULT 'standard' CHECK (cleaning_type IN ('standard', 'deep', 'spot', 'preservation')),
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.cleaning_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view cleaning schedules"
  ON public.cleaning_schedules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage cleaning schedules"
  ON public.cleaning_schedules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE INDEX IF NOT EXISTS idx_cleaning_schedules_product ON public.cleaning_schedules(product_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_schedules_date ON public.cleaning_schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_cleaning_schedules_status ON public.cleaning_schedules(status);

-- =====================================================
-- FUNCTION TO CHECK RENTAL LIMITS
-- =====================================================
CREATE OR REPLACE FUNCTION public.check_rental_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_tier INT;
  v_limit INT;
  v_current_count INT;
BEGIN
  -- Get user's tier
  SELECT membership_tier INTO v_tier
  FROM public.profiles
  WHERE id = p_user_id;

  -- Get tier's monthly limit
  SELECT monthly_rental_limit INTO v_limit
  FROM public.membership_tiers
  WHERE id = v_tier;

  -- If unlimited (NULL), return true
  IF v_limit IS NULL THEN
    RETURN TRUE;
  END IF;

  -- Count active rentals this month
  SELECT COUNT(*) INTO v_current_count
  FROM public.rentals
  WHERE user_id = p_user_id
    AND status NOT IN ('cancelled', 'returned', 'completed')
    AND created_at >= date_trunc('month', CURRENT_DATE);

  RETURN v_current_count < v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION TO GET USER'S RENTAL DURATION
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_rental_duration(p_user_id UUID)
RETURNS INT AS $$
DECLARE
  v_tier INT;
  v_duration INT;
BEGIN
  SELECT membership_tier INTO v_tier
  FROM public.profiles
  WHERE id = p_user_id;

  SELECT rental_duration_days INTO v_duration
  FROM public.membership_tiers
  WHERE id = v_tier;

  RETURN COALESCE(v_duration, 7);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- AUTO-CREATE CLEANING SCHEDULE ON RETURN
-- =====================================================
CREATE OR REPLACE FUNCTION public.auto_schedule_cleaning()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'returned' AND OLD.status != 'returned' THEN
    INSERT INTO public.cleaning_schedules (product_id, rental_id, scheduled_date)
    VALUES (NEW.product_id, NEW.id, CURRENT_DATE + INTERVAL '1 day');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_rental_returned ON public.rentals;
CREATE TRIGGER on_rental_returned
  AFTER UPDATE ON public.rentals
  FOR EACH ROW EXECUTE FUNCTION public.auto_schedule_cleaning();

-- =====================================================
-- REVENUE ANALYTICS VIEW
-- =====================================================
CREATE OR REPLACE VIEW public.revenue_analytics AS
SELECT
  date_trunc('month', o.created_at) as month,
  COUNT(DISTINCT o.id) as total_orders,
  SUM(o.amount) as total_revenue,
  COUNT(DISTINCT o.user_id) as unique_customers,
  AVG(o.amount) as avg_order_value
FROM public.orders o
WHERE o.status = 'completed'
GROUP BY date_trunc('month', o.created_at)
ORDER BY month DESC;

-- =====================================================
-- MEMBERSHIP ANALYTICS VIEW
-- =====================================================
CREATE OR REPLACE VIEW public.membership_analytics AS
SELECT
  mt.id as tier_id,
  mt.name as tier_name,
  COUNT(p.id) as member_count,
  ROUND(COUNT(p.id) * 100.0 / NULLIF(SUM(COUNT(p.id)) OVER (), 0), 1) as percentage
FROM public.membership_tiers mt
LEFT JOIN public.profiles p ON p.membership_tier = mt.id
GROUP BY mt.id, mt.name
ORDER BY mt.id;

-- =====================================================
-- INVENTORY PERFORMANCE VIEW
-- =====================================================
CREATE OR REPLACE VIEW public.inventory_performance AS
SELECT
  p.id as product_id,
  p.name as product_name,
  d.name as designer_name,
  p.category,
  p.era,
  COALESCE(i.quantity, 0) as current_stock,
  COUNT(r.id) as total_rentals,
  COUNT(CASE WHEN r.status IN ('active', 'shipped', 'delivered') THEN 1 END) as active_rentals,
  SUM(CASE WHEN o.status = 'completed' THEN o.amount ELSE 0 END) as total_revenue,
  CASE
    WHEN COUNT(r.id) > 0 THEN
      ROUND(COUNT(CASE WHEN r.status IN ('active', 'shipped', 'delivered') THEN 1 END) * 100.0 / NULLIF(COALESCE(i.quantity, 0), 0), 1)
    ELSE 0
  END as utilization_rate
FROM public.products p
LEFT JOIN public.designers d ON p.designer_id = d.id
LEFT JOIN public.inventory i ON i.product_id = p.id
LEFT JOIN public.rentals r ON r.product_id = p.id
LEFT JOIN public.orders o ON o.rental_id = r.id
GROUP BY p.id, p.name, d.name, p.category, p.era, i.quantity
ORDER BY total_revenue DESC NULLS LAST;
