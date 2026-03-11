/**
 * Server-side data fetching for categories
 * Used in Next.js Server Components and generateMetadata functions
 */

import { supabaseServer } from "@/integrations/supabase/server";
import type { Category, CategoryWithParent } from "./types";

/**
 * Get all categories
 */
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabaseServer
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data || [];
}

/**
 * Get all top-level categories (no parent)
 */
export async function getTopLevelCategories(): Promise<Category[]> {
  const { data, error } = await supabaseServer
    .from("categories")
    .select("*")
    .is("parent_id", null)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching top-level categories:", error);
    return [];
  }

  return data || [];
}

/**
 * Get category by slug (supports both ka and en slugs)
 */
export async function getCategoryBySlug(slug: string): Promise<CategoryWithParent | null> {
  const { data, error } = await supabaseServer
    .from("categories")
    .select("*, parent:categories!parent_id(*)")
    .or(`slug_en.eq.${slug},slug_ka.eq.${slug},slug_hy.eq.${slug}`)
    .maybeSingle();

  if (error) {
    console.error("Error fetching category by slug:", error);
    return null;
  }

  if (!data) return null;

  // Supabase returns parent as array, convert to single object
  const parentArray = data.parent as Category[] | null;
  const parent = parentArray?.[0] ?? null;

  return {
    ...data,
    parent,
  } as CategoryWithParent;
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: string): Promise<CategoryWithParent | null> {
  const { data, error } = await supabaseServer
    .from("categories")
    .select("*, parent:categories!parent_id(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching category by ID:", error);
    return null;
  }

  if (!data) return null;

  const parentArray = data.parent as Category[] | null;
  const parent = parentArray?.[0] ?? null;

  return {
    ...data,
    parent,
  } as CategoryWithParent;
}

/**
 * Get subcategories by parent ID
 */
export async function getSubcategories(parentId: string): Promise<Category[]> {
  const { data, error } = await supabaseServer
    .from("categories")
    .select("*")
    .eq("parent_id", parentId)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching subcategories:", error);
    return [];
  }

  return data || [];
}

/**
 * Get navigation categories (show_in_nav = true)
 */
export async function getNavCategories(): Promise<Category[]> {
  const { data, error } = await supabaseServer
    .from("categories")
    .select("*")
    .eq("show_in_nav", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching nav categories:", error);
    return [];
  }

  return data || [];
}

/**
 * Get featured categories
 */
export async function getFeaturedCategories(): Promise<Category[]> {
  const { data, error } = await supabaseServer
    .from("categories")
    .select("*")
    .eq("is_featured", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching featured categories:", error);
    return [];
  }

  return data || [];
}
