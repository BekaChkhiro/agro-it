/**
 * Server-side data fetching for success stories
 * Used in Next.js Server Components and generateMetadata functions
 */

import { supabaseServer } from "@/integrations/supabase/server";
import { generateSlug } from "@/utils/urlHelpers";
import type { SuccessStory } from "./types";

/**
 * Get all success stories
 */
export async function getSuccessStories(): Promise<SuccessStory[]> {
  const { data, error } = await supabaseServer
    .from("success_stories")
    .select("*")
    .order("publish_date", { ascending: false });

  if (error) {
    console.error("Error fetching success stories:", error);
    return [];
  }

  return data || [];
}

/**
 * Get published success stories only
 */
export async function getPublishedSuccessStories(): Promise<SuccessStory[]> {
  const { data, error } = await supabaseServer
    .from("success_stories")
    .select("*")
    .eq("is_published", true)
    .order("publish_date", { ascending: false });

  if (error) {
    console.error("Error fetching published success stories:", error);
    return [];
  }

  return data || [];
}

/**
 * Get featured success stories
 */
export async function getFeaturedSuccessStories(limit: number = 3): Promise<SuccessStory[]> {
  const { data, error } = await supabaseServer
    .from("success_stories")
    .select("*")
    .eq("is_published", true)
    .eq("is_featured", true)
    .order("publish_date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching featured success stories:", error);
    return [];
  }

  return data || [];
}

/**
 * Get success story by slug
 * Supports slug columns and generated slugs from titles
 */
export async function getSuccessStoryBySlug(slug: string): Promise<SuccessStory | null> {
  // First try to find by exact slug match
  let { data, error } = await supabaseServer
    .from("success_stories")
    .select("*")
    .or(`slug_en.eq.${slug},slug_ka.eq.${slug},slug_hy.eq.${slug}`)
    .eq("is_published", true)
    .maybeSingle();

  // If not found by slug, try matching generated slug from titles
  if (!data && !error) {
    const { data: allStories } = await supabaseServer
      .from("success_stories")
      .select("*")
      .eq("is_published", true);

    if (allStories) {
      const matchedStory = allStories.find((story) => {
        const slugFromEn = story.title_en ? generateSlug(story.title_en, false) : null;
        const slugFromKa = story.title_ka ? generateSlug(story.title_ka, true) : null;
        return slugFromEn === slug || slugFromKa === slug;
      });

      if (matchedStory) {
        return matchedStory;
      }
    }
  }

  if (error) {
    console.error("Error fetching success story by slug:", error);
    return null;
  }

  return data;
}

/**
 * Get success story by ID
 */
export async function getSuccessStoryById(id: string): Promise<SuccessStory | null> {
  const { data, error } = await supabaseServer
    .from("success_stories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching success story by ID:", error);
    return null;
  }

  return data;
}

/**
 * Get all success story slugs for static generation
 */
export async function getAllSuccessStorySlugs(): Promise<Array<{
  slug_en: string | null;
  slug_ka: string | null;
  title_en: string;
  title_ka: string;
}>> {
  const { data, error } = await supabaseServer
    .from("success_stories")
    .select("slug_en, slug_ka, title_en, title_ka")
    .eq("is_published", true);

  if (error) {
    console.error("Error fetching success story slugs:", error);
    return [];
  }

  return data || [];
}

/**
 * Get recent success stories
 */
export async function getRecentSuccessStories(limit: number = 3): Promise<SuccessStory[]> {
  const { data, error } = await supabaseServer
    .from("success_stories")
    .select("*")
    .eq("is_published", true)
    .order("publish_date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent success stories:", error);
    return [];
  }

  return data || [];
}
