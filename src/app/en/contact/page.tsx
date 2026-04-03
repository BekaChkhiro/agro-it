import type { Metadata } from "next";
import Contact from "@/pages/Contact";
import { generatePageMetadata } from "@/lib/metadata";
import { getBaseUrl } from "@/utils/config";
import { getPageSEO } from "@/lib/data/page-seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSEO("contact");

  return generatePageMetadata({
    title: seo?.title_en || "Contact Us",
    description: seo?.description_en || "Contact us for consultation. AGROIT - your trusted partner in agricultural equipment.",
    path: "/en/contact",
    image: seo?.og_image || `${getBaseUrl()}/og-contact.jpg`,
    type: "website",
    language: "en",
    keywords: seo?.keywords_en || undefined,
  });
}

export default function Page() {
  return <Contact />;
}
