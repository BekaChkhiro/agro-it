import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Blog = Database["public"]["Tables"]["blogs"]["Row"] & { slug?: string | null };

export function useBlogs() {
  return useQuery({
    queryKey: ["blogs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .order("publish_date", { ascending: false });

      if (error) throw error;
      return data as Blog[];
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function usePublishedBlogs() {
  return useQuery({
    queryKey: ["blogs", "published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("is_published", true)
        .order("publish_date", { ascending: false });

      if (error) throw error;
      return data as Blog[];
    },
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useFeaturedBlogs(limit: number = 3) {
  return useQuery({
    queryKey: ["blogs", "featured", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("is_published", true)
        .eq("is_featured", true)
        .order("publish_date", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Blog[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes for featured content
    gcTime: 15 * 60 * 1000,
  });
}

export function useBlog(id: string | undefined) {
  return useQuery({
    queryKey: ["blog", id],
    queryFn: async () => {
      if (!id) throw new Error("Blog ID is required");

      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Blog;
    },
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useBlogBySlug(slug: string | undefined) {
  return useQuery<Blog>({
    queryKey: ["blog", "by-slug", slug],
    queryFn: async () => {
      if (!slug) throw new Error("Blog slug is required");

      // @ts-ignore - Avoid TypeScript deep type instantiation issue
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .or(`slug_en.eq.${slug},slug_ka.eq.${slug},slug_hy.eq.${slug},slug_ru.eq.${slug}`)
        .eq("is_published", true)
        .single();

      if (error) throw error;
      return data as Blog;
    },
    enabled: !!slug,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blogData: Database["public"]["Tables"]["blogs"]["Insert"]) => {
      const { data, error } = await supabase
        .from("blogs")
        .insert([blogData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });
}

export function useUpdateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      blogData,
    }: {
      id: string;
      blogData: Database["public"]["Tables"]["blogs"]["Update"];
    }) => {
      const { data, error } = await supabase
        .from("blogs")
        .update(blogData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });
}

export function useDeleteBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blogs").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });
}
