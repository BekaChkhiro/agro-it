-- Add keywords fields to products and categories for SEO
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS keywords_ka text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS keywords_en text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS keywords_hy text;

ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS keywords_ka text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS keywords_en text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS keywords_hy text;
