-- Add slug fields to products table for SEO-friendly URLs
-- Migration: Add product slug fields
-- Created: 2025-10-14

-- Add slug columns to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS slug_en TEXT,
ADD COLUMN IF NOT EXISTS slug_ka TEXT;

-- Add unique constraints for slugs to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_en_key
ON public.products(slug_en)
WHERE slug_en IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS products_slug_ka_key
ON public.products(slug_ka)
WHERE slug_ka IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.products.slug_en IS 'SEO-friendly URL slug in English (e.g., "tfb-mulcher")';
COMMENT ON COLUMN public.products.slug_ka IS 'SEO-friendly URL slug in Georgian transliterated to Latin (e.g., "tfb-mulcheri")';