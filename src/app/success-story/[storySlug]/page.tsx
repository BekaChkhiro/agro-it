import type { Metadata } from "next";
import { headers } from "next/headers";
import SuccessStoryDetail from "@/pages/SuccessStoryDetail";
import { supabaseServer } from "@/integrations/supabase/server";
import { generatePageMetadata } from "@/lib/metadata";
import { getDomainLanguage } from "@/utils/config";

interface StoryPageParams {
  storySlug: string;
}

type Props = {
  params: StoryPageParams;
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const slug = params.storySlug;
  const headersList = headers();
  const host = (await headersList).get("host") || "agroit.ge";
  const language = getDomainLanguage(host);

  try {
    // Fetch story data with all language fields + slugs for canonical URL
    const { data: story } = await supabaseServer
      .from("success_stories")
      .select("meta_title_ka, meta_title_hy, meta_title_en, meta_description_ka, meta_description_hy, meta_description_en, title_ka, title_hy, title_en, excerpt_ka, excerpt_hy, excerpt_en, featured_image_url, slug_en, slug_ka, slug_hy")
      .or(`slug_ka.eq.${slug},slug_en.eq.${slug},slug_hy.eq.${slug}`)
      .single();

    if (!story) {
      return {
        title: "Success Story Not Found",
        robots: { index: false, follow: false },
      };
    }

    const title = language === "hy"
      ? (story.meta_title_hy || story.title_hy || story.meta_title_en || story.title_en)
      : (story.meta_title_ka || story.title_ka);
    const description = language === "hy"
      ? (story.meta_description_hy || story.excerpt_hy || story.meta_description_en || story.excerpt_en || story.title_hy || story.title_en)
      : (story.meta_description_ka || story.excerpt_ka || story.title_ka);

    // Always use slug_en for canonical path to avoid duplicate content
    const canonicalSlug = story.slug_en || story.slug_ka || slug;

    return generatePageMetadata({
      title: title || "Success Story",
      description: description || "AGROIT Success Story",
      path: `/success-story/${canonicalSlug}`,
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
