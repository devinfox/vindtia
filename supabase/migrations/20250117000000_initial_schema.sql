-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES
-- =====================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  stripe_customer_id TEXT UNIQUE,
  membership_tier INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- DESIGNERS
-- =====================================================
CREATE TABLE public.designers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.designers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Designers are publicly readable"
  ON public.designers FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Only admins can modify designers"
  ON public.designers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- PRODUCTS
-- =====================================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  designer_id UUID REFERENCES public.designers(id) ON DELETE SET NULL,
  description TEXT,
  price_per_rental NUMERIC(10,2) NOT NULL,
  size TEXT,
  color TEXT,
  category TEXT,
  condition TEXT,
  archive BOOLEAN DEFAULT FALSE,
  tier_required INT DEFAULT 1 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products visible based on user tier"
  ON public.products FOR SELECT
  TO PUBLIC
  USING (
    -- Allow if not archived AND user tier >= required tier
    archive = FALSE
    AND tier_required <= COALESCE(
      (SELECT membership_tier FROM public.profiles WHERE id = auth.uid()),
      0
    )
  );

CREATE POLICY "Only admins can modify products"
  ON public.products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- PRODUCT_MEDIA
-- =====================================================
CREATE TABLE public.product_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.product_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product media follows product visibility"
  ON public.product_media FOR SELECT
  TO PUBLIC
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_media.product_id
      AND products.archive = FALSE
      AND products.tier_required <= COALESCE(
        (SELECT membership_tier FROM public.profiles WHERE id = auth.uid()),
        0
      )
    )
  );

CREATE POLICY "Only admins can modify product media"
  ON public.product_media FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- INVENTORY
-- =====================================================
CREATE TABLE public.inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inventory is publicly readable"
  ON public.inventory FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Only admins can modify inventory"
  ON public.inventory FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- RENTALS
-- =====================================================
CREATE TABLE public.rentals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rentals"
  ON public.rentals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rentals"
  ON public.rentals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all rentals"
  ON public.rentals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update rentals"
  ON public.rentals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- ORDERS
-- =====================================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rental_id UUID REFERENCES public.rentals(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  stripe_payment_intent TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- ADMIN_ROLES
-- =====================================================
CREATE TABLE public.admin_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin roles"
  ON public.admin_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles ar
      WHERE ar.user_id = auth.uid()
      AND ar.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Only super admins can manage admin roles"
  ON public.admin_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- =====================================================
-- MEMBERSHIP_TIERS
-- =====================================================
CREATE TABLE public.membership_tiers (
  id INT PRIMARY KEY,
  name TEXT NOT NULL,
  price_id TEXT, -- Stripe price ID
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.membership_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Membership tiers are publicly readable"
  ON public.membership_tiers FOR SELECT
  TO PUBLIC
  USING (true);

-- Seed membership tiers
INSERT INTO public.membership_tiers (id, name, features) VALUES
  (0, 'Free', '[]'::jsonb),
  (1, 'Tier 1', '["Access to select archive pieces", "Priority booking"]'::jsonb),
  (2, 'Tier 2', '["All Tier 1 benefits", "Extended rental periods", "Exclusive collections"]'::jsonb),
  (3, 'Tier 3', '["All Tier 2 benefits", "Concierge service", "First access to new pieces"]'::jsonb);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);
CREATE INDEX idx_products_designer ON public.products(designer_id);
CREATE INDEX idx_products_tier ON public.products(tier_required);
CREATE INDEX idx_product_media_product ON public.product_media(product_id);
CREATE INDEX idx_rentals_user ON public.rentals(user_id);
CREATE INDEX idx_rentals_product ON public.rentals(product_id);
CREATE INDEX idx_orders_user ON public.orders(user_id);
