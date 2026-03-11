/**
 * Server-side data fetching for products
 * Used in Next.js Server Components and generateMetadata functions
 */

import { supabaseServer } from "@/integrations/supabase/server";
import type { Category, CategoryWithParent, ProductWithCategory, ProductQueryResult } from "./types";

/**
 * Map raw product query result to ProductWithCategory
 */
function mapProductWithCategories(product: ProductQueryResult): ProductWithCategory {
  const categories: CategoryWithParent[] =
    product.product_categories
      ?.map((relation) => {
        if (!relation.category) return null;
        // Convert parent array to single object (Supabase returns array for one-to-one)
        const parent = relation.category.parent?.[0] ?? null;
        return { ...relation.category, parent } as CategoryWithParent;
      })
      .filter((category): category is CategoryWithParent => category !== null) ?? [];

  const { product_categories, ...baseProduct } = product;

  return {
    ...baseProduct,
    categories,
    category_ids: categories.map((category) => category.id),
    category: categories[0] ?? null,
  };
}

/**
 * Get all products with their categories
 */
export async function getProducts(): Promise<ProductWithCategory[]> {
  const { data, error } = await supabaseServer
    .from("products")
    .select(`
      *,
      product_categories:product_categories (
        category:categories (*, parent:categories(*))
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return (data as ProductQueryResult[] || []).map(mapProductWithCategories);
}

/**
 * Get product by slug (supports both ka and en slugs)
 */
export async function getProductBySlug(slug: string): Promise<ProductWithCategory | null> {
  const { data, error } = await supabaseServer
    .from("products")
    .select(`
      *,
      product_categories:product_categories (
        category:categories (*, parent:categories(*))
      )
    `)
    .or(`slug_en.eq.${slug},slug_ka.eq.${slug},slug_hy.eq.${slug}`)
    .maybeSingle();

  if (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }

  if (!data) return null;

  return mapProductWithCategories(data as ProductQueryResult);
}

/**
 * Get product by ID
 */
export async function getProductById(id: string): Promise<ProductWithCategory | null> {
  const { data, error } = await supabaseServer
    .from("products")
    .select(`
      *,
      product_categories:product_categories (
        category:categories (*, parent:categories(*))
      )
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching product by ID:", error);
    return null;
  }

  if (!data) return null;

  return mapProductWithCategories(data as ProductQueryResult);
}

/**
 * Get products by category IDs
 */
export async function getProductsByCategory(categoryIds: string[]): Promise<ProductWithCategory[]> {
  if (!categoryIds.length) return [];

  const { data, error } = await supabaseServer
    .from("product_categories")
    .select(`
      product:products (
        *,
        product_categories:product_categories (
          category:categories (*, parent:categories(*))
        )
      )
    `)
    .in("category_id", categoryIds);

  if (error) {
    console.error("Error fetching products by category:", error);
    return [];
  }

  // Deduplicate products (product can be in multiple categories)
  const productMap = new Map<string, ProductWithCategory>();
  (data as ({ product: ProductQueryResult | null } | null)[] | null)?.forEach((entry) => {
    if (!entry?.product) return;
    if (productMap.has(entry.product.id)) return;
    productMap.set(entry.product.id, mapProductWithCategories(entry.product));
  });

  return Array.from(productMap.values()).sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });
}

/**
 * Get related products by IDs
 */
export async function getRelatedProducts(productIds: string[]): Promise<ProductWithCategory[]> {
  if (!productIds.length) return [];

  const { data, error } = await supabaseServer
    .from("products")
    .select(`
      *,
      product_categories:product_categories (
        category:categories (*, parent:categories(*))
      )
    `)
    .in("id", productIds);

  if (error) {
    console.error("Error fetching related products:", error);
    return [];
  }

  return (data as ProductQueryResult[] || []).map(mapProductWithCategories);
}

/**
 * Get featured products
 */
export async function getFeaturedProducts(): Promise<ProductWithCategory[]> {
  const { data, error } = await supabaseServer
    .from("products")
    .select(`
      *,
      product_categories:product_categories (
        category:categories (*, parent:categories(*))
      )
    `)
    .eq("is_featured", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }

  return (data as ProductQueryResult[] || []).map(mapProductWithCategories);
}

/**
 * Get all product slugs for static generation
 */
export async function getAllProductSlugs(): Promise<Array<{
  slug_en: string | null;
  slug_ka: string | null;
  category_slug_en: string | null;
  category_slug_ka: string | null;
}>> {
  const { data, error } = await supabaseServer
    .from("products")
    .select(`
      slug_en,
      slug_ka,
      product_categories:product_categories (
        category:categories (slug_en, slug_ka)
      )
    `);

  if (error) {
    console.error("Error fetching product slugs:", error);
    return [];
  }

  return (data || []).map((product) => {
    const firstCategory = (product.product_categories as { category: { slug_en: string | null; slug_ka: string | null } | null }[])?.[0]?.category;
    return {
      slug_en: product.slug_en,
      slug_ka: product.slug_ka,
      category_slug_en: firstCategory?.slug_en ?? null,
      category_slug_ka: firstCategory?.slug_ka ?? null,
    };
  });
}
