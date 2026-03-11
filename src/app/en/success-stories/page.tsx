import type { Metadata } from "next";
import SuccessStories from "@/pages/SuccessStories";
import { generatePageMetadata } from "@/lib/metadata";
import { getBaseUrl } from "@/utils/config";

export const metadata: Metadata = generatePageMetadata({
  title: "Success Stories",
  description: "Read about real results and experiences from our customers with AGROIT equipment.",
  path: "/en/success-stories",
  image: `${getBaseUrl()}/og-home.jpg`,
  type: "website",
  language: "en",
});

export default function Page() {
  return <SuccessStories />;
}
