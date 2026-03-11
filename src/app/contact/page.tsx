import type { Metadata } from "next";
import { headers } from "next/headers";
import Contact from "@/pages/Contact";
import { generatePageMetadata } from "@/lib/metadata";
import { getBaseUrl, getDomainLanguage } from "@/utils/config";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
  const host = (await headersList).get("host") || "agroit.ge";
  const language = getDomainLanguage(host);

  const title = language === "hy"
    ? "Contact Us"
    : "კონტაქტი";
  const description = language === "hy"
    ? "Contact us for consultation. AGROIT - your trusted partner in agricultural equipment."
    : "დაგვიკავშირდით კონსულტაციისთვის. AGROIT - თქვენი სანდო პარტნიორი აგროტექნიკაში.";

  return generatePageMetadata({
    title,
    description,
    path: "/contact",
    image: `${getBaseUrl()}/og-contact.jpg`,
    type: "website",
    language,
  });
}

export default function Page() {
  return <Contact />;
}
