-- Create blogs table with bilingual content and SEO fields
CREATE TABLE IF NOT EXISTS public.blogs (
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
    author text,
    publish_date date DEFAULT CURRENT_DATE,
    is_published boolean DEFAULT false,
    is_featured boolean DEFAULT false,
    meta_title_en text,
    meta_title_ka text,
    meta_description_en text,
    meta_description_ka text,
    tags jsonb DEFAULT '[]'::jsonb,
    view_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT blogs_slug_en_unique UNIQUE(slug_en),
    CONSTRAINT blogs_slug_ka_unique UNIQUE(slug_ka)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blogs_slug_en ON public.blogs(slug_en);
CREATE INDEX IF NOT EXISTS idx_blogs_slug_ka ON public.blogs(slug_ka);
CREATE INDEX IF NOT EXISTS idx_blogs_is_published ON public.blogs(is_published);
CREATE INDEX IF NOT EXISTS idx_blogs_is_featured ON public.blogs(is_featured);
CREATE INDEX IF NOT EXISTS idx_blogs_publish_date ON public.blogs(publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON public.blogs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to published blogs
CREATE POLICY "Public can view published blogs"
    ON public.blogs
    FOR SELECT
    USING (is_published = true);

-- Policy: Allow admins full access
CREATE POLICY "Admins have full access to blogs"
    ON public.blogs
    FOR ALL
    USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_blogs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blogs_updated_at
    BEFORE UPDATE ON public.blogs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_blogs_updated_at();

COMMENT ON TABLE public.blogs IS 'Blog posts with bilingual content and SEO optimization';