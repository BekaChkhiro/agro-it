import type { Metadata } from "next";
import About from "@/pages/About";
import { generatePageMetadata } from "@/lib/metadata";
import { getBaseUrl } from "@/utils/config";

export const metadata: Metadata = generatePageMetadata({
  title: "About Us",
  description: "Learn more about AGROIT, Georgia's leading supplier of Italian agricultural machinery. 9 years of quality and reliability.",
  path: "/en/about",
  image: `${getBaseUrl()}/og-about.jpg`,
  type: "website",
  language: "en",
});

export default function Page() {
  return <About />;
}
