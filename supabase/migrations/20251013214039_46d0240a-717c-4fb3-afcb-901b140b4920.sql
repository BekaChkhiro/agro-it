-- Add related_product_ids column to products table
-- This allows admins to manually specify related products for cross-selling
ALTER TABLE public.products ADD COLUMN related_product_ids jsonb DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.products.related_product_ids IS 'Array of product IDs that are related to this product for cross-selling';