import type { Metadata } from "next";
import { headers } from "next/headers";
import Index from "@/pages/Index";
import { generatePageMetadata } from "@/lib/metadata";
import { getBaseUrl, getDomainLanguage } from "@/utils/config";
import { getPageSEO } from "@/lib/data/page-seo";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
  const host = (await headersList).get("host") || "agroit.ge";
  const language = getDomainLanguage(host);
  const seo = await getPageSEO("home");

  const title = language === "hy"
    ? (seo?.title_hy || "AGROIT")
    : (seo?.title_ka || "AGROIT - იტალიური აგროტექნიკა საქართველოში");
  const description = language === "hy"
    ? (seo?.description_hy || "AGROIT - Italian agricultural equipment.")
    : (seo?.description_ka || "პროფესიული იტალიური აგროტექნიკა ვენახებისთვის, ბაღებისთვის და კაკლოვანი კულტურების გადამუშავებისთვის.");
  const keywords = language === "hy"
    ? (seo?.keywords_hy || undefined)
    : (seo?.keywords_ka || undefined);

  return generatePageMetadata({
    title,
    description,
    path: "/",
    image: `${getBaseUrl()}/og-home.jpg`,
    type: "website",
    language,
    keywords,
  });
}

export default function Page() {
  return <Index />;
}
