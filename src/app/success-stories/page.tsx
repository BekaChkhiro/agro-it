import type { Metadata } from "next";
import { headers } from "next/headers";
import SuccessStories from "@/pages/SuccessStories";
import { generatePageMetadata } from "@/lib/metadata";
import { getBaseUrl, getDomainLanguage } from "@/utils/config";
import { getPageSEO } from "@/lib/data/page-seo";
import { getPublishedSuccessStories } from "@/lib/data/success-stories";

export const revalidate = 1800;

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
  const host = (await headersList).get("host") || "agroit.ge";
  const language = getDomainLanguage(host);
  const seo = await getPageSEO("success-stories");

  const title = language === "hy"
    ? (seo?.title_hy || "Success Stories")
    : (seo?.title_ka || "წარმატების ისტორიები");
  const description = language === "hy"
    ? (seo?.description_hy || "Read about real results and experiences from our customers with AGROIT equipment.")
    : (seo?.description_ka || "გაეცანით ჩვენი მომხმარებლების რეალურ შედეგებს და გამოცდილებას AGROIT-ის ტექნიკით.");
  const keywords = language === "hy"
    ? (seo?.keywords_hy || undefined)
    : (seo?.keywords_ka || undefined);

  return generatePageMetadata({
    title,
    description,
    path: "/success-stories",
    image: seo?.og_image || `${getBaseUrl()}/og-home.jpg`,
    type: "website",
    language,
    keywords,
  });
}

export default async function Page() {
  const stories = await getPublishedSuccessStories();
  return <SuccessStories initialStories={stories} />;
}
