-- Add slug column to designers for URL-friendly lookups
ALTER TABLE public.designers ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Add featured flag to show on homepage
ALTER TABLE public.designers ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Add additional brand data fields
ALTER TABLE public.designers ADD COLUMN IF NOT EXISTS founded TEXT;
ALTER TABLE public.designers ADD COLUMN IF NOT EXISTS origin TEXT;
ALTER TABLE public.designers ADD COLUMN IF NOT EXISTS headquarters TEXT;
ALTER TABLE public.designers ADD COLUMN IF NOT EXISTS signature TEXT;

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_designers_slug ON public.designers(slug);

-- Create index for featured lookups
CREATE INDEX IF NOT EXISTS idx_designers_featured ON public.designers(featured) WHERE featured = true;
