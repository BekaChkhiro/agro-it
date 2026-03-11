-- Database Schema Export
-- Generated: 2025-11-20T16:51:57.701Z

-- Enum Types
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;


-- Tables (will be created if they do not exist)
-- Note: Run this on a fresh database or manually drop existing tables first


-- Table: categories
DROP TABLE IF EXISTS public.categories CASCADE;
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  display_order integer DEFAULT 0,
  parent_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
  show_in_nav boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  name_en text NOT NULL,
  name_ka text NOT NULL,
  name_ru text,
  description_en text,
  description_ka text,
  description_ru text,
  icon text,
  slug_en text UNIQUE,
  slug_ka text UNIQUE,
  slug_ru text UNIQUE,
  path_en text,
  path_ka text,
  path_ru text,
  banner_image_url text
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Table: products
DROP TABLE IF EXISTS public.products CASCADE;
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  is_featured boolean DEFAULT false,
  name_en text NOT NULL,
  name_ka text NOT NULL,
  name_ru text,
  description_en text,
  description_ka text,
  description_ru text,
  slug_en text UNIQUE,
  slug_ka text UNIQUE,
  slug_ru text UNIQUE,
  image_url text,
  gallery_image_urls jsonb,
  video_url text,
  video_description_en text,
  video_description_ka text,
  video_description_ru text,
  specs_en jsonb,
  specs_ka jsonb,
  specs_ru jsonb,
  additional_info_en text,
  additional_info_ka text,
  additional_info_ru text,
  price numeric,
  related_product_ids jsonb DEFAULT '[]'::jsonb
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Table: product_categories
DROP TABLE IF EXISTS public.product_categories CASCADE;
CREATE TABLE public.product_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(product_id, category_id)
);
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Table: blogs
DROP TABLE IF EXISTS public.blogs CASCADE;
CREATE TABLE public.blogs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  publish_date date DEFAULT CURRENT_DATE,
  is_published boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  view_count integer DEFAULT 0,
  title_en text NOT NULL,
  title_ka text NOT NULL,
  title_ru text,
  slug_en text UNIQUE,
  slug_ka text UNIQUE,
  slug_ru text UNIQUE,
  excerpt_en text,
  excerpt_ka text,
  excerpt_ru text,
  content_en text,
  content_ka text,
  content_ru text,
  featured_image_url text,
  gallery_image_urls jsonb DEFAULT '[]'::jsonb,
  author text,
  tags jsonb DEFAULT '[]'::jsonb,
  meta_title_en text,
  meta_title_ka text,
  meta_title_ru text,
  meta_description_en text,
  meta_description_ka text,
  meta_description_ru text
);
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Table: success_stories
DROP TABLE IF EXISTS public.success_stories CASCADE;
CREATE TABLE public.success_stories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  publish_date date DEFAULT CURRENT_DATE,
  is_published boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  view_count integer DEFAULT 0,
  title_en text NOT NULL,
  title_ka text NOT NULL,
  title_ru text,
  slug_en text UNIQUE,
  slug_ka text UNIQUE,
  slug_ru text UNIQUE,
  excerpt_en text,
  excerpt_ka text,
  excerpt_ru text,
  content_en text,
  content_ka text,
  content_ru text,
  featured_image_url text,
  gallery_image_urls jsonb DEFAULT '[]'::jsonb,
  customer_name_en text,
  customer_name_ka text,
  customer_name_ru text,
  customer_location_en text,
  customer_location_ka text,
  customer_location_ru text,
  customer_company text,
  customer_testimonial_en text,
  customer_testimonial_ka text,
  customer_testimonial_ru text,
  product_ids jsonb DEFAULT '[]'::jsonb,
  results_achieved jsonb DEFAULT '[]'::jsonb,
  meta_title_en text,
  meta_title_ka text,
  meta_title_ru text,
  meta_description_en text,
  meta_description_ka text,
  meta_description_ru text
);
ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;

-- Table: team_members
DROP TABLE IF EXISTS public.team_members CASCADE;
CREATE TABLE public.team_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  display_order integer DEFAULT 0,
  name_en text NOT NULL,
  name_ka text NOT NULL,
  name_ru text,
  position_en text NOT NULL,
  position_ka text NOT NULL,
  position_ru text,
  image_url text,
  email text,
  phone text
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Table: contact_submissions
DROP TABLE IF EXISTS public.contact_submissions CASCADE;
CREATE TABLE public.contact_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  category text,
  message text NOT NULL,
  status text DEFAULT 'new'
);
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Table: user_roles
DROP TABLE IF EXISTS public.user_roles CASCADE;
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies

-- Categories policies
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Products policies
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Product categories policies
CREATE POLICY "Product categories are viewable by everyone" ON public.product_categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert product categories" ON public.product_categories FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update product categories" ON public.product_categories FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete product categories" ON public.product_categories FOR DELETE USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Blogs policies
CREATE POLICY "Public can view published blogs" ON public.blogs FOR SELECT USING (is_published = true);
CREATE POLICY "Admins have full access to blogs" ON public.blogs FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Success stories policies
CREATE POLICY "Public can view published success stories" ON public.success_stories FOR SELECT USING (is_published = true);
CREATE POLICY "Admins have full access to success stories" ON public.success_stories FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Team members policies
CREATE POLICY "Team members are viewable by everyone" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Admins can insert team members" ON public.team_members FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update team members" ON public.team_members FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete team members" ON public.team_members FOR DELETE USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Contact submissions policies
CREATE POLICY "Anyone can submit contact form" ON public.contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all contact submissions" ON public.contact_submissions FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update contact submissions" ON public.contact_submissions FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete contact submissions" ON public.contact_submissions FOR DELETE USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Deny non-admin authenticated SELECT on contact_submissions" ON public.contact_submissions FOR SELECT USING (false);

-- User roles policies
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can insert user roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update user roles" ON public.user_roles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete user roles" ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Functions

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_blogs_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_success_stories_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contact_submissions_updated_at BEFORE UPDATE ON public.contact_submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_blogs_updated_at BEFORE UPDATE ON public.blogs FOR EACH ROW EXECUTE FUNCTION public.handle_blogs_updated_at();
CREATE TRIGGER update_success_stories_updated_at BEFORE UPDATE ON public.success_stories FOR EACH ROW EXECUTE FUNCTION public.handle_success_stories_updated_at();
