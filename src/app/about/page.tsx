import type { Metadata } from "next";
import { headers } from "next/headers";
import About from "@/pages/About";
import { generatePageMetadata } from "@/lib/metadata";
import { getBaseUrl, getDomainLanguage } from "@/utils/config";
import { getPageSEO } from "@/lib/data/page-seo";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
  const host = (await headersList).get("host") || "agroit.ge";
  const language = getDomainLanguage(host);
  const seo = await getPageSEO("about");

  const title = language === "hy"
    ? (seo?.title_hy || "About Us")
    : (seo?.title_ka || "ჩვენ შესახებ");
  const description = language === "hy"
    ? (seo?.description_hy || "Learn more about AGROIT, the leading supplier of Italian agricultural machinery. Years of quality and reliability.")
    : (seo?.description_ka || "გაიგეთ მეტი AGROIT-ის შესახებ, საქართველოს წამყვანი იტალიური აგროტექნიკის მომწოდებელი. 9 წელი ხარისხისა და სანდოობის.");
  const keywords = language === "hy"
    ? (seo?.keywords_hy || undefined)
    : (seo?.keywords_ka || undefined);

  return generatePageMetadata({
    title,
    description,
    path: "/about",
    image: seo?.og_image || `${getBaseUrl()}/og-about.jpg`,
    type: "website",
    language,
    keywords,
  });
}

export default function Page() {
  return <About />;
}
