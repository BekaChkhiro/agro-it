-- Add hierarchical category support
-- This migration adds parent-child relationships and navigation display control

-- Add new columns to categories table
ALTER TABLE public.categories
  ADD COLUMN parent_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
  ADD COLUMN slug_en text,
  ADD COLUMN slug_ka text,
  ADD COLUMN show_in_nav boolean DEFAULT true,
  ADD COLUMN display_order integer DEFAULT 0,
  ADD COLUMN path_en text,
  ADD COLUMN path_ka text;

-- Add unique constraints for slugs
ALTER TABLE public.categories
  ADD CONSTRAINT categories_slug_en_unique UNIQUE (slug_en),
  ADD CONSTRAINT categories_slug_ka_unique UNIQUE (slug_ka);

-- Add index for parent_id for faster queries
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);

-- Add index for display_order for faster sorting
CREATE INDEX idx_categories_display_order ON public.categories(display_order);

-- Add check constraint to prevent self-referencing
ALTER TABLE public.categories
  ADD CONSTRAINT categories_no_self_reference CHECK (id != parent_id);

-- Create a function to get category hierarchy
CREATE OR REPLACE FUNCTION public.get_category_tree()
RETURNS TABLE (
  id uuid,
  parent_id uuid,
  name_en text,
  name_ka text,
  slug_en text,
  slug_ka text,
  path_en text,
  path_ka text,
  description_en text,
  description_ka text,
  icon text,
  show_in_nav boolean,
  display_order integer,
  level integer
)
LANGUAGE sql
STABLE
AS $$
  WITH RECURSIVE category_tree AS (
    -- Base case: top-level categories (no parent)
    SELECT
      c.id,
      c.parent_id,
      c.name_en,
      c.name_ka,
      c.slug_en,
      c.slug_ka,
      c.path_en,
      c.path_ka,
      c.description_en,
      c.description_ka,
      c.icon,
      c.show_in_nav,
      c.display_order,
      0 as level
    FROM public.categories c
    WHERE c.parent_id IS NULL

    UNION ALL

    -- Recursive case: child categories
    SELECT
      c.id,
      c.parent_id,
      c.name_en,
      c.name_ka,
      c.slug_en,
      c.slug_ka,
      c.path_en,
      c.path_ka,
      c.description_en,
      c.description_ka,
      c.icon,
      c.show_in_nav,
      c.display_order,
      ct.level + 1
    FROM public.categories c
    INNER JOIN category_tree ct ON c.parent_id = ct.id
  )
  SELECT * FROM category_tree
  ORDER BY level, display_order, name_en;
$$;

-- Create a function to get navigation categories (only top-level with show_in_nav = true)
CREATE OR REPLACE FUNCTION public.get_nav_categories()
RETURNS TABLE (
  id uuid,
  name_en text,
  name_ka text,
  slug_en text,
  slug_ka text,
  path_en text,
  path_ka text,
  icon text,
  display_order integer
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    id,
    name_en,
    name_ka,
    slug_en,
    slug_ka,
    path_en,
    path_ka,
    icon,
    display_order
  FROM public.categories
  WHERE parent_id IS NULL
    AND show_in_nav = true
  ORDER BY display_order, name_en;
$$;

-- Create a function to get subcategories for a given parent
CREATE OR REPLACE FUNCTION public.get_subcategories(parent_category_id uuid)
RETURNS TABLE (
  id uuid,
  name_en text,
  name_ka text,
  slug_en text,
  slug_ka text,
  path_en text,
  path_ka text,
  icon text,
  display_order integer
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    id,
    name_en,
    name_ka,
    slug_en,
    slug_ka,
    path_en,
    path_ka,
    icon,
    display_order
  FROM public.categories
  WHERE parent_id = parent_category_id
  ORDER BY display_order, name_en;
$$;

-- Comment on table and columns
COMMENT ON COLUMN public.categories.parent_id IS 'Reference to parent category for hierarchical structure';
COMMENT ON COLUMN public.categories.slug_en IS 'URL-friendly English identifier';
COMMENT ON COLUMN public.categories.slug_ka IS 'URL-friendly Georgian identifier';
COMMENT ON COLUMN public.categories.show_in_nav IS 'Whether to display this category in main navigation';
COMMENT ON COLUMN public.categories.display_order IS 'Order for displaying categories (lower numbers first)';
COMMENT ON COLUMN public.categories.path_en IS 'Full URL path for English version';
COMMENT ON COLUMN public.categories.path_ka IS 'Full URL path for Georgian version';
