import type { Metadata } from "next";
import Index from "@/pages/Index";
import { generatePageMetadata } from "@/lib/metadata";
import { getBaseUrl } from "@/utils/config";
import { getPageSEO } from "@/lib/data/page-seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSEO("home");

  return generatePageMetadata({
    title: seo?.title_en || "AGROIT - Italian Agricultural Equipment in Georgia",
    description: seo?.description_en || "Professional Italian agricultural machinery for vineyards, orchards, and dry fruit processing.",
    path: "/en",
    image: `${getBaseUrl()}/og-home.jpg`,
    type: "website",
    language: "en",
    keywords: seo?.keywords_en || undefined,
  });
}

export default function Page() {
  return <Index />;
}
