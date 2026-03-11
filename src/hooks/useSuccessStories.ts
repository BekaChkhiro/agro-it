import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { generateSlug } from "@/utils/urlHelpers";

type SuccessStory = Database["public"]["Tables"]["success_stories"]["Row"];

export function useSuccessStories() {
  return useQuery({
    queryKey: ["success_stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("success_stories")
        .select("*")
        .order("publish_date", { ascending: false });

      if (error) throw error;
      return data as SuccessStory[];
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function usePublishedSuccessStories() {
  return useQuery({
    queryKey: ["success_stories", "published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("success_stories")
        .select("*")
        .eq("is_published", true)
        .order("publish_date", { ascending: false });

      if (error) throw error;
      return data as SuccessStory[];
    },
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useFeaturedSuccessStories(limit: number = 3) {
  return useQuery({
    queryKey: ["success_stories", "featured", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("success_stories")
        .select("*")
        .eq("is_published", true)
        .eq("is_featured", true)
        .order("publish_date", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as SuccessStory[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes for featured content
    gcTime: 15 * 60 * 1000,
  });
}

export function useSuccessStory(id: string | undefined) {
  return useQuery({
    queryKey: ["success_story", id],
    queryFn: async () => {
      if (!id) throw new Error("Success story ID is required");

      const { data, error } = await supabase
        .from("success_stories")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as SuccessStory;
    },
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useSuccessStoryBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["success_story", "by-slug", slug],
    queryFn: async () => {
      if (!slug) throw new Error("Success story slug is required");

      // First, try to find by exact slug match across supported language columns
      let { data, error } = await supabase
        .from("success_stories")
        .select("*")
        .or(
          `slug_en.eq.${slug},slug_ka.eq.${slug},slug_ru.eq.${slug}`,
        )
        .eq("is_published", true)
        .maybeSingle();

      // If not found by slug, try finding by matching generated slug from titles
      if (!data && (error || !data)) {
        const { data: allStories } = await supabase
          .from("success_stories")
          .select("*")
          .eq("is_published", true);

        if (allStories) {
          const matchedStory = allStories.find((story) => {
            const slugFromEn = story.title_en ? generateSlug(story.title_en, false) : null;
            const slugFromKa = story.title_ka ? generateSlug(story.title_ka, true) : null;
            const slugFromRu = story.title_ru ? generateSlug(story.title_ru, false) : null;
            return slugFromEn === slug || slugFromKa === slug || slugFromRu === slug;
          });

          if (matchedStory) {
            return matchedStory as SuccessStory;
          }
        }
      }

      if (error) throw error;
      if (!data) throw new Error("Success story not found");
      return data as SuccessStory;
    },
    enabled: !!slug,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreateSuccessStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storyData: Database["public"]["Tables"]["success_stories"]["Insert"]) => {
      const { data, error } = await supabase
        .from("success_stories")
        .insert([storyData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["success_stories"] });
    },
  });
}

export function useUpdateSuccessStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      storyData,
    }: {
      id: string;
      storyData: Database["public"]["Tables"]["success_stories"]["Update"];
    }) => {
      const { data, error} = await supabase
        .from("success_stories")
        .update(storyData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["success_stories"] });
    },
  });
}

export function useDeleteSuccessStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("success_stories").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["success_stories"] });
    },
  });
}
