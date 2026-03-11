-- Fix search_path for handle_blogs_updated_at function
CREATE OR REPLACE FUNCTION public.handle_blogs_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Create success_stories table with bilingual content and SEO fields
CREATE TABLE IF NOT EXISTS public.success_stories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title_en text NOT NULL,
    title_ka text NOT NULL,
    slug_en text,
    slug_ka text,
    excerpt_en text,
    excerpt_ka text,
    content_en text,
    content_ka text,
    featured_image_url text,
    gallery_image_urls jsonb DEFAULT '[]'::jsonb,
    customer_name_en text,
    customer_name_ka text,
    customer_location_en text,
    customer_location_ka text,
    customer_company text,
    customer_testimonial_en text,
    customer_testimonial_ka text,
    product_ids jsonb DEFAULT '[]'::jsonb,
    results_achieved jsonb DEFAULT '[]'::jsonb,
    publish_date date DEFAULT CURRENT_DATE,
    is_published boolean DEFAULT false,
    is_featured boolean DEFAULT false,
    meta_title_en text,
    meta_title_ka text,
    meta_description_en text,
    meta_description_ka text,
    view_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT success_stories_slug_en_unique UNIQUE(slug_en),
    CONSTRAINT success_stories_slug_ka_unique UNIQUE(slug_ka)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_success_stories_slug_en ON public.success_stories(slug_en);
CREATE INDEX IF NOT EXISTS idx_success_stories_slug_ka ON public.success_stories(slug_ka);
CREATE INDEX IF NOT EXISTS idx_success_stories_is_published ON public.success_stories(is_published);
CREATE INDEX IF NOT EXISTS idx_success_stories_is_featured ON public.success_stories(is_featured);
CREATE INDEX IF NOT EXISTS idx_success_stories_publish_date ON public.success_stories(publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_success_stories_created_at ON public.success_stories(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to published success stories
CREATE POLICY "Public can view published success stories"
    ON public.success_stories
    FOR SELECT
    USING (is_published = true);

-- Policy: Allow admins full access
CREATE POLICY "Admins have full access to success stories"
    ON public.success_stories
    FOR ALL
    USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_success_stories_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER success_stories_updated_at
    BEFORE UPDATE ON public.success_stories
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_success_stories_updated_at();

COMMENT ON TABLE public.success_stories IS 'Customer success stories with bilingual content and SEO optimization';