import type { Metadata } from "next";
import { headers } from "next/headers";
import Contact from "@/pages/Contact";
import { generatePageMetadata } from "@/lib/metadata";
import { getBaseUrl, getDomainLanguage } from "@/utils/config";
import { getPageSEO } from "@/lib/data/page-seo";
import { generateLocalBusinessSchema, generateBreadcrumbSchema, generateOrganizationSchema } from "@/lib/schema";
import JsonLd from "@/components/JsonLd";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
  const host = (await headersList).get("host") || "agroit.ge";
  const language = getDomainLanguage(host);
  const seo = await getPageSEO("contact");

  const title = language === "hy"
    ? (seo?.title_hy || "Contact Us")
    : (seo?.title_ka || "კონტაქტი");
  const description = language === "hy"
    ? (seo?.description_hy || "Contact us for consultation. AGROIT - your trusted partner in agricultural equipment.")
    : (seo?.description_ka || "დაგვიკავშირდით კონსულტაციისთვის. AGROIT - თქვენი სანდო პარტნიორი აგროტექნიკაში.");
  const keywords = language === "hy"
    ? (seo?.keywords_hy || undefined)
    : (seo?.keywords_ka || undefined);

  return generatePageMetadata({
    title,
    description,
    path: "/contact",
    image: seo?.og_image || `${getBaseUrl()}/og-contact.jpg`,
    type: "website",
    language,
    keywords,
  });
}

export default async function Page() {
  const headersList = await headers();
  const host = headersList.get("host") || "agroit.ge";
  const language = getDomainLanguage(host);

  const localBusinessSchema = generateLocalBusinessSchema(language);
  const organizationSchema = generateOrganizationSchema(language);
  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: language === "hy" ? "Home" : "მთავარი", url: "/" },
      { name: language === "hy" ? "Contact" : "კონტაქტი", url: "/contact" },
    ],
    language
  );

  return (
    <>
      <JsonLd data={[localBusinessSchema, organizationSchema, breadcrumbSchema]} />
      <Contact />
    </>
  );
}
