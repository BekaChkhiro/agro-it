-- Create junction table for many-to-many relationship between products and categories
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(product_id, category_id)
);

-- Enable RLS on product_categories
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_categories
CREATE POLICY "Product categories are viewable by everyone"
ON public.product_categories
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert product categories"
ON public.product_categories
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update product categories"
ON public.product_categories
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete product categories"
ON public.product_categories
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Migrate existing product category relationships to junction table
INSERT INTO public.product_categories (product_id, category_id)
SELECT id, category_id
FROM public.products
WHERE category_id IS NOT NULL
ON CONFLICT (product_id, category_id) DO NOTHING;

-- Remove the old category_id column from products (keep for now for backwards compatibility)
-- We'll remove it later after confirming everything works
-- ALTER TABLE public.products DROP COLUMN category_id;