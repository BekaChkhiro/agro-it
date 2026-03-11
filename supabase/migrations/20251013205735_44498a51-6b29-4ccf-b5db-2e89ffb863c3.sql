-- Add gallery_image_urls column to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS gallery_image_urls JSONB;

-- Add comment for documentation
COMMENT ON COLUMN public.products.gallery_image_urls IS 'Array of additional product image URLs stored as JSON';