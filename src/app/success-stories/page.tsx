import type { Metadata } from "next";
import { headers } from "next/headers";
import SuccessStories from "@/pages/SuccessStories";
import { generatePageMetadata } from "@/lib/metadata";
import { getBaseUrl, getDomainLanguage } from "@/utils/config";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
  const host = (await headersList).get("host") || "agroit.ge";
  const language = getDomainLanguage(host);

  const title = language === "hy"
    ? "Success Stories"
    : "წარმატების ისტორიები";
  const description = language === "hy"
    ? "Read about real results and experiences from our customers with AGROIT equipment."
    : "გაეცანით ჩვენი მომხმარებლების რეალურ შედეგებს და გამოცდილებას AGROIT-ის ტექნიკით.";

  return generatePageMetadata({
    title,
    description,
    path: "/success-stories",
    image: `${getBaseUrl()}/og-home.jpg`,
    type: "website",
    language,
  });
}

export default function Page() {
  return <SuccessStories />;
}
