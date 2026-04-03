import type { Metadata } from "next";
import { headers } from "next/headers";
import Blog from "@/pages/Blogs";
import { generatePageMetadata } from "@/lib/metadata";
import { getBaseUrl, getDomainLanguage } from "@/utils/config";
import { getPageSEO } from "@/lib/data/page-seo";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
  const host = (await headersList).get("host") || "agroit.ge";
  const language = getDomainLanguage(host);
  const seo = await getPageSEO("blog");

  const title = language === "hy"
    ? (seo?.title_hy || "Blog")
    : (seo?.title_ka || "ბლოგი");
  const description = language === "hy"
    ? (seo?.description_hy || "News and articles about agricultural equipment. Useful tips for farmers.")
    : (seo?.description_ka || "სიახლეები და სტატიები აგროტექნიკის შესახებ. სასარგებლო რჩევები ფერმერებისთვის.");
  const keywords = language === "hy"
    ? (seo?.keywords_hy || undefined)
    : (seo?.keywords_ka || undefined);

  return generatePageMetadata({
    title,
    description,
    path: "/blog",
    image: seo?.og_image || `${getBaseUrl()}/og-home.jpg`,
    type: "website",
    language,
    keywords,
  });
}

export default function Page() {
  return <Blog />;
}
