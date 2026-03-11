-- Add Russian translation columns to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS name_ru TEXT,
ADD COLUMN IF NOT EXISTS description_ru TEXT,
ADD COLUMN IF NOT EXISTS slug_ru TEXT,
ADD COLUMN IF NOT EXISTS additional_info_ru TEXT,
ADD COLUMN IF NOT EXISTS video_description_ru TEXT,
ADD COLUMN IF NOT EXISTS specs_ru JSONB;

-- Add Russian translation columns to categories table
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS name_ru TEXT,
ADD COLUMN IF NOT EXISTS description_ru TEXT,
ADD COLUMN IF NOT EXISTS slug_ru TEXT,
ADD COLUMN IF NOT EXISTS path_ru TEXT;

-- Add Russian translation columns to blogs table
ALTER TABLE public.blogs
ADD COLUMN IF NOT EXISTS title_ru TEXT,
ADD COLUMN IF NOT EXISTS slug_ru TEXT,
ADD COLUMN IF NOT EXISTS excerpt_ru TEXT,
ADD COLUMN IF NOT EXISTS content_ru TEXT,
ADD COLUMN IF NOT EXISTS meta_title_ru TEXT,
ADD COLUMN IF NOT EXISTS meta_description_ru TEXT;

-- Add Russian translation columns to success_stories table
ALTER TABLE public.success_stories
ADD COLUMN IF NOT EXISTS title_ru TEXT,
ADD COLUMN IF NOT EXISTS slug_ru TEXT,
ADD COLUMN IF NOT EXISTS excerpt_ru TEXT,
ADD COLUMN IF NOT EXISTS content_ru TEXT,
ADD COLUMN IF NOT EXISTS customer_name_ru TEXT,
ADD COLUMN IF NOT EXISTS customer_location_ru TEXT,
ADD COLUMN IF NOT EXISTS customer_testimonial_ru TEXT,
ADD COLUMN IF NOT EXISTS meta_title_ru TEXT,
ADD COLUMN IF NOT EXISTS meta_description_ru TEXT;