import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { PageSEO } from "@/types/seo";

const db = supabase as any;

export function usePageSEOList() {
  return useQuery({
    queryKey: ["page_seo"],
    queryFn: async () => {
      const { data, error } = await db
        .from("page_seo")
        .select("*")
        .order("page_slug");

      if (error) throw error;
      return data as PageSEO[];
    },
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function usePageSEO(slug: string | undefined) {
  return useQuery({
    queryKey: ["page_seo", slug],
    queryFn: async () => {
      if (!slug) throw new Error("Slug is required");
      const { data, error } = await db
        .from("page_seo")
        .select("*")
        .eq("page_slug", slug)
        .single();

      if (error) throw error;
      return data as PageSEO;
    },
    enabled: !!slug,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreatePageSEO() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pageData: Record<string, unknown>) => {
      const { data, error } = await db
        .from("page_seo")
        .insert([pageData])
        .select()
        .single();

      if (error) throw error;
      return data as PageSEO;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page_seo"] });
    },
  });
}

export function useUpdatePageSEO() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data: pageData }: { id: string; data: Record<string, unknown> }) => {
      const { id: _id, created_at, updated_at, ...updateData } = pageData;
      const { data, error } = await db
        .from("page_seo")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as PageSEO;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page_seo"] });
    },
  });
}

export function useDeletePageSEO() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("page_seo").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page_seo"] });
    },
  });
}
