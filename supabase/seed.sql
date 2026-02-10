-- Seed membership tiers
-- Run this in Supabase SQL Editor if tiers aren't showing

INSERT INTO public.membership_tiers (id, name, features) VALUES
  (0, 'Free', '[]'::jsonb),
  (1, 'Tier 1', '["Access to select archive pieces", "Priority booking"]'::jsonb),
  (2, 'Tier 2', '["All Tier 1 benefits", "Extended rental periods", "Exclusive collections"]'::jsonb),
  (3, 'Tier 3', '["All Tier 2 benefits", "Concierge service", "First access to new pieces"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
