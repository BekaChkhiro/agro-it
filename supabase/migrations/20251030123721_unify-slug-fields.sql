-- Unify slug handling across content tables by consolidating into a single field.
-- This migration drops legacy language-specific slug columns and replaces them
-- with a single `slug` column used by both locales.

BEGIN;

---------------------------------------------
-- Categories
---------------------------------------------

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS slug text;

UPDATE public.categories
SET slug = COALESCE(slug_en, slug_ka, slug);

DROP FUNCTION IF EXISTS public.get_category_tree();
DROP FUNCTION IF EXISTS public.get_nav_categories();
DROP FUNCTION IF EXISTS public.get_subcategories(uuid);

ALTER TABLE public.categories
  DROP CONSTRAINT IF EXISTS categories_slug_en_unique,
  DROP CONSTRAINT IF EXISTS categories_slug_ka_unique;

ALTER TABLE public.categories
  ALTER COLUMN slug SET NOT NULL;

ALTER TABLE public.categories
  ADD CONSTRAINT categories_slug_unique UNIQUE (slug);

ALTER TABLE public.categories
  DROP COLUMN IF EXISTS slug_en,
  DROP COLUMN IF EXISTS slug_ka;

-- Recreate helper functions without language-specific slug columns
CREATE OR REPLACE FUNCTION public.get_category_tree()
RETURNS TABLE (
  id uuid,
  parent_id uuid,
  name_en text,
  name_ka text,
  slug text,
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
    SELECT
      c.id,
      c.parent_id,
      c.name_en,
      c.name_ka,
      c.slug,
      c.path_en,
      c.path_ka,
      c.description_en,
      c.description_ka,
      c.icon,
      c.show_in_nav,
      c.display_order,
      0 AS level
    FROM public.categories c
    WHERE c.parent_id IS NULL

    UNION ALL

    SELECT
      c.id,
      c.parent_id,
      c.name_en,
      c.name_ka,
      c.slug,
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

CREATE OR REPLACE FUNCTION public.get_nav_categories()
RETURNS TABLE (
  id uuid,
  name_en text,
  name_ka text,
  slug text,
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
    slug,
    path_en,
    path_ka,
    icon,
    display_order
  FROM public.categories
  WHERE parent_id IS NULL
    AND show_in_nav = true
  ORDER BY display_order, name_en;
$$;

CREATE OR REPLACE FUNCTION public.get_subcategories(parent_category_id uuid)
RETURNS TABLE (
  id uuid,
  name_en text,
  name_ka text,
  slug text,
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
    slug,
    path_en,
    path_ka,
    icon,
    display_order
  FROM public.categories
  WHERE parent_id = parent_category_id
  ORDER BY display_order, name_en;
$$;

COMMENT ON COLUMN public.categories.slug IS 'SEO-friendly URL identifier used for all locales';

---------------------------------------------
-- Products
---------------------------------------------

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS slug text;

UPDATE public.products
SET slug = COALESCE(slug_en, slug_ka, slug);

DROP INDEX IF EXISTS public.products_slug_en_key;
DROP INDEX IF EXISTS public.products_slug_ka_key;

ALTER TABLE public.products
  ALTER COLUMN slug SET NOT NULL;

ALTER TABLE public.products
  ADD CONSTRAINT products_slug_unique UNIQUE (slug);

ALTER TABLE public.products
  DROP COLUMN IF EXISTS slug_en,
  DROP COLUMN IF EXISTS slug_ka;

COMMENT ON COLUMN public.products.slug IS 'SEO-friendly URL identifier used for all locales';

---------------------------------------------
-- Blogs
---------------------------------------------

ALTER TABLE public.blogs
  ADD COLUMN IF NOT EXISTS slug text;

UPDATE public.blogs
SET slug = COALESCE(slug_en, slug_ka, slug);

ALTER TABLE public.blogs
  DROP CONSTRAINT IF EXISTS blogs_slug_en_unique,
  DROP CONSTRAINT IF EXISTS blogs_slug_ka_unique;

DROP INDEX IF EXISTS public.idx_blogs_slug_en;
DROP INDEX IF EXISTS public.idx_blogs_slug_ka;

ALTER TABLE public.blogs
  ALTER COLUMN slug SET NOT NULL;

ALTER TABLE public.blogs
  ADD CONSTRAINT blogs_slug_unique UNIQUE (slug);

ALTER TABLE public.blogs
  DROP COLUMN IF EXISTS slug_en,
  DROP COLUMN IF EXISTS slug_ka;

CREATE INDEX IF NOT EXISTS idx_blogs_slug ON public.blogs(slug);

COMMENT ON COLUMN public.blogs.slug IS 'SEO-friendly URL identifier used for all locales';

---------------------------------------------
-- Success Stories
---------------------------------------------

ALTER TABLE public.success_stories
  ADD COLUMN IF NOT EXISTS slug text;

UPDATE public.success_stories
SET slug = COALESCE(slug_en, slug_ka, slug);

ALTER TABLE public.success_stories
  DROP CONSTRAINT IF EXISTS success_stories_slug_en_unique,
  DROP CONSTRAINT IF EXISTS success_stories_slug_ka_unique;

DROP INDEX IF EXISTS public.idx_success_stories_slug_en;
DROP INDEX IF EXISTS public.idx_success_stories_slug_ka;

ALTER TABLE public.success_stories
  ALTER COLUMN slug SET NOT NULL;

ALTER TABLE public.success_stories
  ADD CONSTRAINT success_stories_slug_unique UNIQUE (slug);

ALTER TABLE public.success_stories
  DROP COLUMN IF EXISTS slug_en,
  DROP COLUMN IF EXISTS slug_ka;

CREATE INDEX IF NOT EXISTS idx_success_stories_slug ON public.success_stories(slug);

COMMENT ON COLUMN public.success_stories.slug IS 'SEO-friendly URL identifier used for all locales';

COMMIT;
