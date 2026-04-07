import type { Metadata } from "next";
import { headers } from "next/headers";
import Products from "@/pages/Products";
import { generatePageMetadata } from "@/lib/metadata";
import { getBaseUrl, getDomainLanguage } from "@/utils/config";
import { getPageSEO } from "@/lib/data/page-seo";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
  const host = (await headersList).get("host") || "agroit.ge";
  const language = getDomainLanguage(host);
  const seo = await getPageSEO("products");

  const title = language === "hy"
    ? (seo?.title_hy || "Products")
    : (seo?.title_ka || "პროდუქცია");
  const description = language === "hy"
    ? (seo?.description_hy || "Browse our full catalog of agricultural equipment.")
    : (seo?.description_ka || "გაეცანით ჩვენი აგროტექნიკის სრულ კატალოგს.");
  const keywords = language === "hy"
    ? (seo?.keywords_hy || undefined)
    : (seo?.keywords_ka || undefined);

  return generatePageMetadata({
    title,
    description,
    path: "/products",
    image: seo?.og_image || `${getBaseUrl()}/og-home.jpg`,
    type: "website",
    language,
    keywords,
  });
}

export default function Page() {
  return <Products />;
}
