import type { Metadata } from "next";
import { headers } from "next/headers";
import Blog from "@/pages/Blogs";
import { generatePageMetadata } from "@/lib/metadata";
import { getBaseUrl, getDomainLanguage } from "@/utils/config";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
  const host = (await headersList).get("host") || "agroit.ge";
  const language = getDomainLanguage(host);

  const title = language === "hy"
    ? "Blog"
    : "ბლოგი";
  const description = language === "hy"
    ? "News and articles about agricultural equipment. Useful tips for farmers."
    : "სიახლეები და სტატიები აგროტექნიკის შესახებ. სასარგებლო რჩევები ფერმერებისთვის.";

  return generatePageMetadata({
    title,
    description,
    path: "/blog",
    image: `${getBaseUrl()}/og-home.jpg`,
    type: "website",
    language,
  });
}

export default function Page() {
  return <Blog />;
}
