import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type ProductCategory = Database["public"]["Tables"]["product_categories"]["Row"];

export function useProductCategories(productId: string | undefined) {
  return useQuery({
    queryKey: ["product-categories", productId],
    queryFn: async () => {
      if (!productId) throw new Error("Product ID is required");

      const { data, error } = await supabase
        .from("product_categories")
        .select("category_id")
        .eq("product_id", productId);

      if (error) throw error;
      return data.map(pc => pc.category_id);
    },
    enabled: !!productId,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useUpdateProductCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      categoryIds,
    }: {
      productId: string;
      categoryIds: string[];
    }) => {
      // Delete existing relationships
      const { error: deleteError } = await supabase
        .from("product_categories")
        .delete()
        .eq("product_id", productId);

      if (deleteError) throw deleteError;

      // Insert new relationships
      if (categoryIds.length > 0) {
        const { error: insertError } = await supabase
          .from("product_categories")
          .insert(
            categoryIds.map(categoryId => ({
              product_id: productId,
              category_id: categoryId,
            }))
          );

        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-categories"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
