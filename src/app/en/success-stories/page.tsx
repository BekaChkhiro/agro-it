import type { Metadata } from "next";
import SuccessStories from "@/pages/SuccessStories";
import { generatePageMetadata } from "@/lib/metadata";
import { getBaseUrl } from "@/utils/config";
import { getPageSEO } from "@/lib/data/page-seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSEO("success-stories");

  return generatePageMetadata({
    title: seo?.title_en || "Success Stories",
    description: seo?.description_en || "Read about real results and experiences from our customers with AGROIT equipment.",
    path: "/en/success-stories",
    image: seo?.og_image || `${getBaseUrl()}/og-home.jpg`,
    type: "website",
    language: "en",
    keywords: seo?.keywords_en || undefined,
  });
}

export default function Page() {
  return <SuccessStories />;
}
