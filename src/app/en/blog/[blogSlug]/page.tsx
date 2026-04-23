import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogDetail from "@/pages/BlogDetail";
import { getBlogBySlug } from "@/lib/data/blogs";
import { generatePageMetadata } from "@/lib/metadata";
import { generateArticleSchema, generateBreadcrumbSchema, generateOrganizationSchema } from "@/lib/schema";
import JsonLd from "@/components/JsonLd";

type Props = {
  params: Promise<{ blogSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { blogSlug } = await params;

  try {
    const blog = await getBlogBySlug(blogSlug);

    if (!blog) {
      return {
        title: "Blog Post Not Found",
        robots: { index: false, follow: false },
      };
    }

    // Always use slug_en for canonical path to avoid duplicate content
    const canonicalSlug = blog.slug_en || blog.slug_ka || blogSlug;

    return generatePageMetadata({
      title: blog.meta_title_en || blog.title_en,
      description: blog.meta_description_en || blog.excerpt_en || blog.title_en,
      path: `/en/blog/${canonicalSlug}`,
      image: blog.featured_image_url || undefined,
      type: "article",
      language: "en",
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
  const blog = await getBlogBySlug(blogSlug);

  if (!blog) {
    notFound();
  }

  const articleSchema = generateArticleSchema(blog, "en");
  // Always use slug_en for canonical breadcrumb URL
  const canonicalSlug = blog.slug_en || blog.slug_ka || blogSlug;
  const breadcrumbItems = [
    { name: "Home", url: "/en" },
    { name: "Blog", url: "/en/blog" },
    { name: blog.title_en, url: `/en/blog/${canonicalSlug}` },
  ];
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems, "en");
  const organizationSchema = generateOrganizationSchema("en");

  return (
    <>
      <JsonLd data={[articleSchema, breadcrumbSchema, organizationSchema]} />
      <BlogDetail initialBlog={blog} />
    </>
  );
}
