import type { Metadata } from "next";
import Products from "@/pages/Products";
import { generatePageMetadata } from "@/lib/metadata";
import { getBaseUrl } from "@/utils/config";
import { getPageSEO } from "@/lib/data/page-seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSEO("products");

  return generatePageMetadata({
    title: seo?.title_en || "Products",
    description: seo?.description_en || "Browse our full catalog of agricultural equipment.",
    path: "/en/products",
    image: seo?.og_image || `${getBaseUrl()}/og-home.jpg`,
    type: "website",
    language: "en",
    keywords: seo?.keywords_en || undefined,
  });
}

export default function Page() {
  return <Products />;
}
