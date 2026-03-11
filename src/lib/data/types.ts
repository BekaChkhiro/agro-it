/**
 * Shared types for server-side data fetching
 * These types extend Supabase types with computed fields for SSR
 */

import type { Database } from "@/integrations/supabase/types";

// Base types from Supabase
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Blog = Database["public"]["Tables"]["blogs"]["Row"];
export type SuccessStory = Database["public"]["Tables"]["success_stories"]["Row"];

// Category with parent relationship
export type CategoryWithParent = Category & {
  parent?: Category | null;
};

// Product with category relationships
export type ProductWithCategory = Product & {
  category: CategoryWithParent | null;
  categories: CategoryWithParent[];
  category_ids: string[];
};

// Product query result from Supabase (intermediate type for mapping)
export type ProductQueryResult = Product & {
  product_categories?: Array<{
    category: (Category & { parent?: Category[] }) | null;
  }>;
};

// Language type (matches LanguageContext)
export type Language = "ka" | "en" | "hy" | "ru";

// Breadcrumb item for schema generation
export interface BreadcrumbItem {
  name: string;
  url: string;
}
