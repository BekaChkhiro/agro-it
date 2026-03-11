-- Add is_featured column to categories table
ALTER TABLE public.categories 
ADD COLUMN is_featured boolean DEFAULT false;

-- Create index for faster queries on featured categories
CREATE INDEX idx_categories_is_featured ON public.categories(is_featured) WHERE is_featured = true;