import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Redirect } from "@/types/seo";

const db = supabase as any;

export function useRedirects() {
  return useQuery({
    queryKey: ["redirects"],
    queryFn: async () => {
      const { data, error } = await db
        .from("redirects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Redirect[];
    },
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreateRedirect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (redirectData: Record<string, unknown>) => {
      const { data, error } = await db
        .from("redirects")
        .insert([redirectData])
        .select()
        .single();

      if (error) throw error;
      return data as Redirect;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["redirects"] });
    },
  });
}

export function useUpdateRedirect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data: redirectData }: { id: string; data: Record<string, unknown> }) => {
      const { id: _id, created_at, updated_at, ...updateData } = redirectData;
      const { data, error } = await db
        .from("redirects")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Redirect;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["redirects"] });
    },
  });
}

export function useDeleteRedirect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("redirects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["redirects"] });
    },
  });
}

export function useToggleRedirect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await db
        .from("redirects")
        .update({ is_active })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Redirect;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["redirects"] });
    },
  });
}
