-- Ensure all legacy category assignments exist in product_categories
INSERT INTO public.product_categories (product_id, category_id)
SELECT id, category_id
FROM public.products
WHERE category_id IS NOT NULL
ON CONFLICT (product_id, category_id) DO NOTHING;

-- Remove legacy foreign key from products now that the junction table is authoritative
ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_category_id_fkey,
  DROP COLUMN IF EXISTS category_id;
