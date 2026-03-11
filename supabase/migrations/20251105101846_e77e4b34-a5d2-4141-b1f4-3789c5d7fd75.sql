-- Add additional_info columns to products table
ALTER TABLE products 
ADD COLUMN additional_info_en TEXT,
ADD COLUMN additional_info_ka TEXT;