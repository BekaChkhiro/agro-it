import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type ContactSubmission = Database["public"]["Tables"]["contact_submissions"]["Row"];
type ContactSubmissionInsert = TablesInsert<"contact_submissions">;
type ContactSubmissionUpdate = TablesUpdate<"contact_submissions">;

// Hook for fetching all contact submissions (admin only)
export const useContactSubmissions = () => {
  return useQuery({
    queryKey: ["contact-submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ContactSubmission[];
    },
  });
};

// Hook for creating contact submission (public form)
export const useCreateContactSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submission: ContactSubmissionInsert) => {
      const { data, error } = await supabase
        .from("contact_submissions")
        .insert(submission)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-submissions"] });
    },
  });
};

// Hook for updating contact submission (admin only)
export const useUpdateContactSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, submissionData }: { id: string; submissionData: ContactSubmissionUpdate }) => {
      const { data, error } = await supabase
        .from("contact_submissions")
        .update(submissionData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-submissions"] });
    },
  });
};

// Hook for deleting contact submission (admin only)
export const useDeleteContactSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("contact_submissions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-submissions"] });
    },
  });
};
