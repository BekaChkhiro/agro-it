import type { Metadata } from "next";
import BlogDetail from "@/pages/BlogDetail";
import { supabaseServer } from "@/integrations/supabase/server";
import { generatePageMetadata } from "@/lib/metadata";

type Props = {
  params: { blogSlug: string };
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const slug = params.blogSlug;
  const language = "en";

  try {
    // Fetch blog data (include slug_hy for cross-domain lookup)
    const { data: blog } = await supabaseServer
      .from("blogs")
      .select("meta_title_en, meta_description_en, title_en, excerpt_en, featured_image_url")
      .or(`slug_en.eq.${slug},slug_hy.eq.${slug}`)
      .single();

    if (!blog) {
      return {
        title: "Blog Post Not Found",
      };
    }

    return generatePageMetadata({
      title: blog.meta_title_en || blog.title_en,
      description: blog.meta_description_en || blog.excerpt_en || blog.title_en,
      path: `/en/blog/${slug}`,
      image: blog.featured_image_url || undefined,
      type: "article",
      language,
    });
  } catch (error) {
    console.warn("Failed to generate metadata for blog:", error);
    return {
      title: "Blog Post",
      description: "AGROIT Blog",
    };
  }
}

export default function Page() {
  return <BlogDetail />;
}
