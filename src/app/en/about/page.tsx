import type { Metadata } from "next";
import About from "@/pages/About";
import { generatePageMetadata } from "@/lib/metadata";
import { getBaseUrl } from "@/utils/config";
import { getPageSEO } from "@/lib/data/page-seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSEO("about");

  return generatePageMetadata({
    title: seo?.title_en || "About Us",
    description: seo?.description_en || "Learn more about AGROIT, Georgia's leading supplier of Italian agricultural machinery. 9 years of quality and reliability.",
    path: "/en/about",
    image: seo?.og_image || `${getBaseUrl()}/og-about.jpg`,
    type: "website",
    language: "en",
    keywords: seo?.keywords_en || undefined,
  });
}

export default function Page() {
  return <About />;
}
