-- Add video description fields to products table
ALTER TABLE products 
ADD COLUMN video_description_en TEXT,
ADD COLUMN video_description_ka TEXT;