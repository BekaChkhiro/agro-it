import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import BlogDetail from "@/pages/BlogDetail";
import { getBlogBySlug } from "@/lib/data/blogs";
import { generatePageMetadata } from "@/lib/metadata";
import { getDomainLanguage } from "@/utils/config";
import { generateArticleSchema, generateBreadcrumbSchema, generateOrganizationSchema } from "@/lib/schema";
import JsonLd from "@/components/JsonLd";

interface BlogPageParams {
  blogSlug: string;
}

type Props = {
  params: Promise<BlogPageParams>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { blogSlug } = await params;
  const headersList = headers();
  const host = (await headersList).get("host") || "agroit.ge";
  const language = getDomainLanguage(host);

  try {
    const blog = await getBlogBySlug(blogSlug);

    if (!blog) {
      return {
        title: "Blog Post Not Found",
        robots: { index: false, follow: false },
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
      path: `/blog/${blog.slug_en || blog.slug_ka || blogSlug}`,
      image: blog.featured_image_url || undefined,
      type: "article",
      language,
    });
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    console.warn("Failed to generate metadata for blog:", error);
    return {
      title: "Blog Post",
      description: "AGROIT Blog",
    };
  }
}

export default async function Page({ params }: Props) {
  const { blogSlug } = await params;
  const headersList = await headers();
  const host = headersList.get("host") || "agroit.ge";
  const language = getDomainLanguage(host);

  const blog = await getBlogBySlug(blogSlug);

  if (!blog) {
    notFound();
  }

  // Generate Schema.org JSON-LD
  const articleSchema = generateArticleSchema(blog, language);
  const blogTitle = language === "hy" ? (blog.title_hy || blog.title_en) : blog.title_ka;
  const breadcrumbItems = [
    { name: language === "hy" ? "Home" : "მთავარი", url: "/" },
    { name: language === "hy" ? "Blog" : "ბლოგი", url: "/blog" },
    { name: blogTitle, url: `/blog/${blog.slug_en || blog.slug_ka}` },
  ];
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems, language);
  const organizationSchema = generateOrganizationSchema(language);

  return (
    <>
      <JsonLd data={[articleSchema, breadcrumbSchema, organizationSchema]} />
      <BlogDetail initialBlog={blog} />
    </>
  );
}
