-- ============================================================
-- SEO Module: Create tables for SEO management
-- ============================================================

-- 1. seo_settings (singleton pattern)
CREATE TABLE IF NOT EXISTS public.seo_settings (
    id text PRIMARY KEY DEFAULT 'default' CHECK (id = 'default'),
    site_name_ka text NOT NULL DEFAULT 'AGROIT - იტალიური აგროტექნიკა საქართველოში',
    site_name_en text NOT NULL DEFAULT 'AGROIT - Italian Agricultural Equipment in Georgia',
    site_name_hy text DEFAULT 'AGROIT',
    default_description_ka text DEFAULT 'პროფესიული იტალიური აგროტექნიკა ვენახებისთვის, ბაღებისთვის და კაკლოვანი კულტურების გადამუშავებისთვის.',
    default_description_en text DEFAULT 'Professional Italian agricultural machinery for vineyards, orchards, and dry fruit processing.',
    default_description_hy text,
    default_keywords_ka text DEFAULT 'აგროტექნიკა, ვენახის ტექნიკა, ბაღის აღჭურვილობა, საქართველო, იტალიური ტექნიკა',
    default_keywords_en text DEFAULT 'agricultural equipment, vineyard machinery, orchard equipment, Georgia, Italian machinery',
    default_keywords_hy text,
    default_og_image text DEFAULT '/og-default.jpg',
    google_verification text DEFAULT 'BjtK5MQIj7K6hsU6sr6E632R9IC5j5Z2sY60HF6tBMY',
    google_analytics_id text,
    google_tag_manager_id text,
    facebook_pixel_id text,
    social_links jsonb DEFAULT '{"facebook": "https://www.facebook.com/agroitgeorgia", "instagram": ""}'::jsonb,
    organization_schema jsonb DEFAULT '{}'::jsonb,
    local_business_schema jsonb DEFAULT '{}'::jsonb,
    robots_txt_content text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 2. page_seo
CREATE TABLE IF NOT EXISTS public.page_seo (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    page_slug text UNIQUE NOT NULL,
    title_ka text,
    title_en text,
    title_hy text,
    description_ka text,
    description_en text,
    description_hy text,
    keywords_ka text,
    keywords_en text,
    keywords_hy text,
    og_title_ka text,
    og_title_en text,
    og_title_hy text,
    og_description_ka text,
    og_description_en text,
    og_description_hy text,
    og_image text,
    canonical_url text,
    robots text DEFAULT 'index, follow',
    schema_type text DEFAULT 'WebPage',
    custom_schema_json jsonb,
    sitemap_priority decimal(2,1) DEFAULT 0.5 CHECK (sitemap_priority >= 0.0 AND sitemap_priority <= 1.0),
    sitemap_changefreq text DEFAULT 'weekly' CHECK (sitemap_changefreq IN ('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never')),
    exclude_from_sitemap boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_seo_slug ON public.page_seo(page_slug);

-- 3. redirects
CREATE TABLE IF NOT EXISTS public.redirects (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    from_path text NOT NULL,
    to_path text NOT NULL,
    status_code integer NOT NULL DEFAULT 301 CHECK (status_code IN (301, 302, 307, 308)),
    is_regex boolean DEFAULT false,
    is_active boolean DEFAULT true,
    notes text,
    hit_count integer DEFAULT 0,
    last_hit_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT redirects_from_path_unique UNIQUE(from_path)
);

CREATE INDEX IF NOT EXISTS idx_redirects_from_path ON public.redirects(from_path);
CREATE INDEX IF NOT EXISTS idx_redirects_is_active ON public.redirects(is_active);

-- ============================================================
-- Add SEO fields to existing tables
-- ============================================================

-- Products: add meta SEO fields
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS meta_title_ka text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS meta_title_en text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS meta_title_hy text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS meta_description_ka text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS meta_description_en text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS meta_description_hy text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS og_image_override text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS robots_override text;

-- Categories: add meta SEO fields
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS meta_title_ka text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS meta_title_en text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS meta_title_hy text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS meta_description_ka text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS meta_description_en text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS meta_description_hy text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS og_image_override text;

-- Blogs: add focus keyword and OG image override
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS focus_keyword_ka text;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS focus_keyword_en text;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS focus_keyword_hy text;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS og_image_override text;

-- Success Stories: add OG image override
ALTER TABLE public.success_stories ADD COLUMN IF NOT EXISTS og_image_override text;

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_seo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;

-- seo_settings: public read, admin write
CREATE POLICY "Public can view SEO settings"
    ON public.seo_settings FOR SELECT USING (true);

CREATE POLICY "Admins can manage SEO settings"
    ON public.seo_settings FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- page_seo: public read, admin write
CREATE POLICY "Public can view page SEO"
    ON public.page_seo FOR SELECT USING (true);

CREATE POLICY "Admins can manage page SEO"
    ON public.page_seo FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- redirects: public read (needed by middleware), admin write
CREATE POLICY "Public can view active redirects"
    ON public.redirects FOR SELECT USING (true);

CREATE POLICY "Admins can manage redirects"
    ON public.redirects FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================
-- Updated_at triggers
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_seo_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER seo_settings_updated_at
    BEFORE UPDATE ON public.seo_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_seo_settings_updated_at();

CREATE OR REPLACE FUNCTION public.handle_page_seo_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER page_seo_updated_at
    BEFORE UPDATE ON public.page_seo
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_page_seo_updated_at();

CREATE OR REPLACE FUNCTION public.handle_redirects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER redirects_updated_at
    BEFORE UPDATE ON public.redirects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_redirects_updated_at();

-- ============================================================
-- Insert default data
-- ============================================================

INSERT INTO public.seo_settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

-- Insert default page SEO entries for known static pages
INSERT INTO public.page_seo (page_slug, title_ka, title_en, description_ka, description_en, keywords_ka, keywords_en, sitemap_priority, sitemap_changefreq) VALUES
    ('home', 'AGROIT - იტალიური აგროტექნიკა საქართველოში', 'AGROIT - Italian Agricultural Equipment in Georgia', 'პროფესიული იტალიური აგროტექნიკა ვენახებისთვის, ბაღებისთვის და კაკლოვანი კულტურების გადამუშავებისთვის.', 'Professional Italian agricultural machinery for vineyards, orchards, and dry fruit processing.', 'აგროტექნიკა, ვენახის ტექნიკა, ბაღის აღჭურვილობა', 'agricultural equipment, vineyard machinery, orchard equipment', 1.0, 'daily'),
    ('about', 'ჩვენ შესახებ', 'About Us', 'AGROIT - იტალიური აგროტექნიკის ოფიციალური დისტრიბუტორი საქართველოში', 'AGROIT - Official distributor of Italian agricultural equipment in Georgia', 'AGROIT, ჩვენ შესახებ, აგროტექნიკა', 'AGROIT, about us, agricultural equipment', 0.7, 'monthly'),
    ('contact', 'კონტაქტი', 'Contact', 'დაგვიკავშირდით აგროტექნიკის შეძენის ან კონსულტაციისთვის', 'Contact us for agricultural equipment purchase or consultation', 'კონტაქტი, დაკავშირება', 'contact, get in touch', 0.6, 'monthly'),
    ('products', 'პროდუქცია', 'Products', 'იტალიური აგროტექნიკის სრული კატალოგი', 'Complete catalog of Italian agricultural equipment', 'პროდუქცია, კატალოგი, აგროტექნიკა', 'products, catalog, agricultural equipment', 0.9, 'weekly'),
    ('blog', 'ბლოგი', 'Blog', 'სტატიები აგროტექნიკის და სოფლის მეურნეობის შესახებ', 'Articles about agricultural equipment and farming', 'ბლოგი, სტატიები, სოფლის მეურნეობა', 'blog, articles, agriculture', 0.7, 'daily'),
    ('success-stories', 'წარმატების ისტორიები', 'Success Stories', 'ჩვენი კლიენტების წარმატების ისტორიები', 'Our customers success stories', 'წარმატების ისტორიები, კლიენტები', 'success stories, customers', 0.6, 'weekly')
ON CONFLICT (page_slug) DO NOTHING;

COMMENT ON TABLE public.seo_settings IS 'Singleton table for global SEO configuration';
COMMENT ON TABLE public.page_seo IS 'Per-page SEO metadata for static pages';
COMMENT ON TABLE public.redirects IS 'URL redirect rules managed from admin panel';
