import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SEOSettings } from "@/types/seo";

// Cast to any to bypass generated types until migration is applied and types regenerated
const db = supabase as any;

export function useSEOSettings() {
  return useQuery({
    queryKey: ["seo_settings"],
    queryFn: async () => {
      const { data, error } = await db
        .from("seo_settings")
        .select("*")
        .eq("id", "default")
        .single();

      if (error) throw error;
      return data as SEOSettings;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

export function useUpdateSEOSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<SEOSettings>) => {
      const { id, created_at, updated_at, ...updateData } = settings;
      const { data, error } = await db
        .from("seo_settings")
        .update(updateData)
        .eq("id", "default")
        .select()
        .single();

      if (error) throw error;
      return data as SEOSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo_settings"] });
    },
  });
}
