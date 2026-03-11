import type { Metadata } from "next";
import { headers } from "next/headers";
import About from "@/pages/About";
import { generatePageMetadata } from "@/lib/metadata";
import { getBaseUrl, getDomainLanguage } from "@/utils/config";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
  const host = (await headersList).get("host") || "agroit.ge";
  const language = getDomainLanguage(host);

  const title = language === "hy"
    ? "About Us"
    : "ჩვენ შესახებ";
  const description = language === "hy"
    ? "Learn more about AGROIT, the leading supplier of Italian agricultural machinery. Years of quality and reliability."
    : "გაიგეთ მეტი AGROIT-ის შესახებ, საქართველოს წამყვანი იტალიური აგროტექნიკის მომწოდებელი. 9 წელი ხარისხისა და სანდოობის.";

  return generatePageMetadata({
    title,
    description,
    path: "/about",
    image: `${getBaseUrl()}/og-about.jpg`,
    type: "website",
    language,
  });
}

export default function Page() {
  return <About />;
}
