import type { Metadata } from "next";
import SuccessStoryDetail from "@/pages/SuccessStoryDetail";
import { supabaseServer } from "@/integrations/supabase/server";
import { generatePageMetadata } from "@/lib/metadata";

type Props = {
  params: { storySlug: string };
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const slug = params.storySlug;
  const language = "en";

  try {
    // Fetch story data (include slug_hy for cross-domain lookup)
    const { data: story } = await supabaseServer
      .from("success_stories")
      .select("meta_title_en, meta_description_en, title_en, excerpt_en, featured_image_url, slug_en, slug_ka, slug_hy")
      .or(`slug_en.eq.${slug},slug_hy.eq.${slug},slug_ka.eq.${slug}`)
      .single();

    if (!story) {
      return {
        title: "Success Story Not Found",
        robots: { index: false, follow: false },
      };
    }

    // Always use slug_en for canonical path to avoid duplicate content
    const canonicalSlug = story.slug_en || slug;

    return generatePageMetadata({
      title: story.meta_title_en || story.title_en,
      description: story.meta_description_en || story.excerpt_en || story.title_en,
      path: `/en/success-story/${canonicalSlug}`,
      image: story.featured_image_url || undefined,
      type: "article",
      language,
    });
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    console.warn("Failed to generate metadata for success story:", error);
    return {
      title: "Success Story",
      description: "AGROIT Success Story",
    };
  }
}

export default function Page() {
  return <SuccessStoryDetail />;
}
