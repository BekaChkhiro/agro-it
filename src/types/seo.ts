export interface SEOSettings {
  id: string;
  site_name_ka: string;
  site_name_en: string;
  site_name_hy: string | null;
  default_description_ka: string | null;
  default_description_en: string | null;
  default_description_hy: string | null;
  default_keywords_ka: string | null;
  default_keywords_en: string | null;
  default_keywords_hy: string | null;
  default_og_image: string | null;
  google_verification: string | null;
  google_analytics_id: string | null;
  google_tag_manager_id: string | null;
  facebook_pixel_id: string | null;
  social_links: SocialLinks;
  organization_schema: Record<string, unknown>;
  local_business_schema: Record<string, unknown>;
  robots_txt_content: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  twitter?: string;
  [key: string]: string | undefined;
}

export interface PageSEO {
  id: string;
  page_slug: string;
  title_ka: string | null;
  title_en: string | null;
  title_hy: string | null;
  description_ka: string | null;
  description_en: string | null;
  description_hy: string | null;
  keywords_ka: string | null;
  keywords_en: string | null;
  keywords_hy: string | null;
  og_title_ka: string | null;
  og_title_en: string | null;
  og_title_hy: string | null;
  og_description_ka: string | null;
  og_description_en: string | null;
  og_description_hy: string | null;
  og_image: string | null;
  canonical_url: string | null;
  robots: string | null;
  schema_type: string | null;
  custom_schema_json: Record<string, unknown> | null;
  sitemap_priority: number | null;
  sitemap_changefreq: string | null;
  exclude_from_sitemap: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Redirect {
  id: string;
  from_path: string;
  to_path: string;
  status_code: number;
  is_regex: boolean | null;
  is_active: boolean | null;
  notes: string | null;
  hit_count: number | null;
  last_hit_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface SEOIssue {
  id: string;
  title: string;
  description: string;
  severity: "error" | "warning" | "info";
  entity?: string;
  entityType?: "product" | "category" | "blog" | "page";
  fix?: string;
}

export interface SEOScoreResult {
  score: number;
  issues: SEOIssue[];
  warnings: SEOIssue[];
  passed: SEOIssue[];
}

export interface SERPPreviewData {
  title: string;
  url: string;
  description: string;
}
