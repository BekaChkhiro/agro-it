-- Drop the existing overcomplicated success_stories table if it exists
DROP TABLE IF EXISTS public.success_stories CASCADE;

-- Create simplified success_stories table
CREATE TABLE public.success_stories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name text NOT NULL,
    story_text_en text NOT NULL,
    story_text_ka text NOT NULL,
    date date DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access
CREATE POLICY "Public can view success stories"
    ON public.success_stories
    FOR SELECT
    USING (true);

-- Policy: Allow admins full access
CREATE POLICY "Admins have full access to success stories"
    ON public.success_stories
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_success_stories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER success_stories_updated_at
    BEFORE UPDATE ON public.success_stories
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_success_stories_updated_at();

-- Add comment to the table
COMMENT ON TABLE public.success_stories IS 'Simple customer success stories with customer name, date, and bilingual text';
