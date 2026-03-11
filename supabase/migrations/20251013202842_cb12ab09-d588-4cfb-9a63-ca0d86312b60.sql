-- Add banner_image_url column to categories table
ALTER TABLE public.categories
ADD COLUMN banner_image_url text;