import type { Metadata } from "next";
import Blog from "@/pages/Blogs";
import { generatePageMetadata } from "@/lib/metadata";
import { getBaseUrl } from "@/utils/config";
import { getPageSEO } from "@/lib/data/page-seo";
import { getPublishedBlogs } from "@/lib/data/blogs";

export const revalidate = 1800;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSEO("blog");

  return generatePageMetadata({
    title: seo?.title_en || "Blog",
    description: seo?.description_en || "News and articles about agricultural equipment. Useful tips for farmers.",
    path: "/en/blog",
    image: seo?.og_image || `${getBaseUrl()}/og-home.jpg`,
    type: "website",
    language: "en",
    keywords: seo?.keywords_en || undefined,
  });
}

export default async function Page() {
  const blogs = await getPublishedBlogs();
  return <Blog initialBlogs={blogs} />;
}
