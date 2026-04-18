-- Add SKU field to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku TEXT UNIQUE;

-- Create index for faster SKU lookups
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
