import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"] & { slug?: string | null };
type Category = Database["public"]["Tables"]["categories"]["Row"] & { slug?: string | null };

// Supabase returns parent as an array even though it's a one-to-one relationship
type CategoryWithParentArray = Category & { parent?: Category[] };
type CategoryWithParent = Category & { parent?: Category | null };

type ProductCategoryRelation = {
  category: CategoryWithParentArray | null;
};

type ProductWithCategory = Product & {
  category: CategoryWithParent | null;
  categories: CategoryWithParent[];
  category_ids: string[];
};

type ProductQueryResult = Product & {
  product_categories?: ProductCategoryRelation[];
};

const mapProductWithCategories = (product: ProductQueryResult): ProductWithCategory => {
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
};

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_categories:product_categories (
            category:categories (*, parent:categories(*))
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as ProductQueryResult[]).map(mapProductWithCategories);
    },
    staleTime: 3 * 60 * 1000, // 3 minutes (products change more often than categories)
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useProductsWithCategory() {
  return useQuery({
    queryKey: ["products", "with-category"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_categories:product_categories (
            category:categories (*, parent:categories(*))
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as ProductQueryResult[]).map(mapProductWithCategories);
    },
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useProductsByCategory(categoryIds: string[]) {
  return useQuery({
    queryKey: ["products", "by-category", categoryIds],
    queryFn: async () => {
      if (!categoryIds.length) return [];

      const { data, error } = await supabase
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

      if (error) throw error;

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
    },
    enabled: categoryIds.length > 0,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) throw new Error("Product ID is required");

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Product;
    },
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useProductBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["product", "by-slug", slug],
    queryFn: async () => {
      if (!slug) throw new Error("Product slug is required");

      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_categories:product_categories (
            category:categories (*, parent:categories(*))
          )
        `)
        .eq("slug_en", slug)
        .single();

      if (error) throw error;
      return mapProductWithCategories(data as ProductQueryResult);
    },
    enabled: !!slug,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData: Database["public"]["Tables"]["products"]["Insert"]) => {
      const { data, error } = await supabase
        .from("products")
        .insert([productData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      productData,
    }: {
      id: string;
      productData: Database["public"]["Tables"]["products"]["Update"];
    }) => {
      const { data, error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// Hook to fetch related products by their IDs
export function useProductsByIds(productIds: string[]) {
  return useQuery({
    queryKey: ["products", "by-ids", productIds],
    queryFn: async () => {
      if (!productIds.length) return [];

      const { data, error} = await supabase
        .from("products")
        .select(`
          *,
          product_categories:product_categories (
            category:categories (*, parent:categories(*))
          )
        `)
        .in("id", productIds);

      if (error) throw error;
      return (data as ProductQueryResult[]).map(mapProductWithCategories);
    },
    enabled: productIds.length > 0,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
