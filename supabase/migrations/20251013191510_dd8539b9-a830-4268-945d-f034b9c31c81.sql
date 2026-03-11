-- Add missing columns to categories table
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS slug_en TEXT,
ADD COLUMN IF NOT EXISTS slug_ka TEXT,
ADD COLUMN IF NOT EXISTS path_en TEXT,
ADD COLUMN IF NOT EXISTS path_ka TEXT,
ADD COLUMN IF NOT EXISTS show_in_nav BOOLEAN DEFAULT true;