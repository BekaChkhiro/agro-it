/**
 * Server-side data fetching for blogs
 * Used in Next.js Server Components and generateMetadata functions
 */

import { supabaseServer } from "@/integrations/supabase/server";
import type { Blog } from "./types";

/**
 * Get all blogs
 */
export async function getBlogs(): Promise<Blog[]> {
  const { data, error } = await supabaseServer
    .from("blogs")
    .select("*")
    .order("publish_date", { ascending: false });

  if (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }

  return data || [];
}

/**
 * Get published blogs only
 */
export async function getPublishedBlogs(): Promise<Blog[]> {
  const { data, error } = await supabaseServer
    .from("blogs")
    .select("*")
    .eq("is_published", true)
    .order("publish_date", { ascending: false });

  if (error) {
    console.error("Error fetching published blogs:", error);
    return [];
  }

  return data || [];
}

/**
 * Get featured blogs
 */
export async function getFeaturedBlogs(limit: number = 3): Promise<Blog[]> {
  const { data, error } = await supabaseServer
    .from("blogs")
    .select("*")
    .eq("is_published", true)
    .eq("is_featured", true)
    .order("publish_date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching featured blogs:", error);
    return [];
  }

  return data || [];
}

/**
 * Get blog by slug
 */
export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  const { data, error } = await supabaseServer
    .from("blogs")
    .select("*")
    .or(`slug_en.eq.${slug},slug_ka.eq.${slug},slug_hy.eq.${slug}`)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    console.error("Error fetching blog by slug:", error);
    return null;
  }

  return data;
}

/**
 * Get blog by ID
 */
export async function getBlogById(id: string): Promise<Blog | null> {
  const { data, error } = await supabaseServer
    .from("blogs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching blog by ID:", error);
    return null;
  }

  return data;
}

/**
 * Get all blog slugs for static generation
 */
export async function getAllBlogSlugs(): Promise<Array<{
  slug_en: string | null;
  slug_ka: string | null;
}>> {
  const { data, error } = await supabaseServer
    .from("blogs")
    .select("slug_en, slug_ka")
    .eq("is_published", true);

  if (error) {
    console.error("Error fetching blog slugs:", error);
    return [];
  }

  return data || [];
}

/**
 * Get recent blogs
 */
export async function getRecentBlogs(limit: number = 5): Promise<Blog[]> {
  const { data, error } = await supabaseServer
    .from("blogs")
    .select("*")
    .eq("is_published", true)
    .order("publish_date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent blogs:", error);
    return [];
  }

  return data || [];
}
