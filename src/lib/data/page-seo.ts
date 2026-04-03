/**
 * Server-side data fetching for page SEO
 * Used in Next.js generateMetadata functions
 */

import { supabaseServer } from "@/integrations/supabase/server";

export interface PageSEOData {
  title_ka: string | null;
  title_en: string | null;
  title_hy: string | null;
  description_ka: string | null;
  description_en: string | null;
  description_hy: string | null;
  keywords_ka: string | null;
  keywords_en: string | null;
  keywords_hy: string | null;
  og_image: string | null;
  robots: string | null;
}

export async function getPageSEO(slug: string): Promise<PageSEOData | null> {
  const { data, error } = await (supabaseServer as any)
    .from("page_seo")
    .select("title_ka, title_en, title_hy, description_ka, description_en, description_hy, keywords_ka, keywords_en, keywords_hy, og_image, robots")
    .eq("page_slug", slug)
    .single();

  if (error || !data) return null;
  return data as PageSEOData;
}
