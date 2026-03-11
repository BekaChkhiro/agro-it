import type { Metadata } from "next";
import { headers } from "next/headers";
import BlogDetail from "@/pages/BlogDetail";
import { supabaseServer } from "@/integrations/supabase/server";
import { generatePageMetadata } from "@/lib/metadata";
import { getDomainLanguage } from "@/utils/config";

interface BlogPageParams {
  blogSlug: string;
}

type Props = {
  params: BlogPageParams;
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const slug = params.blogSlug;
  const headersList = headers();
  const host = (await headersList).get("host") || "agroit.ge";
  const language = getDomainLanguage(host);

  try {
    // Fetch blog data with all language fields
    const { data: blog } = await supabaseServer
      .from("blogs")
      .select("meta_title_ka, meta_title_hy, meta_title_en, meta_description_ka, meta_description_hy, meta_description_en, title_ka, title_hy, title_en, excerpt_ka, excerpt_hy, excerpt_en, featured_image_url")
      .or(`slug_ka.eq.${slug},slug_en.eq.${slug},slug_hy.eq.${slug}`)
      .single();

    if (!blog) {
      return {
        title: "Blog Post Not Found",
      };
    }

    const title = language === "hy"
      ? (blog.meta_title_hy || blog.title_hy || blog.meta_title_en || blog.title_en)
      : (blog.meta_title_ka || blog.title_ka);
    const description = language === "hy"
      ? (blog.meta_description_hy || blog.excerpt_hy || blog.meta_description_en || blog.excerpt_en || blog.title_hy || blog.title_en)
      : (blog.meta_description_ka || blog.excerpt_ka || blog.title_ka);

    return generatePageMetadata({
      title: title || "Blog Post",
      description: description || "AGROIT Blog",
      path: `/blog/${slug}`,
      image: blog.featured_image_url || undefined,
      type: "article",
      language,
    });
  } catch (error) {
    // Gracefully handle missing environment variables during build
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
