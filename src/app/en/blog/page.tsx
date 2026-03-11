import type { Metadata } from "next";
import Blog from "@/pages/Blogs";
import { generatePageMetadata } from "@/lib/metadata";
import { getBaseUrl } from "@/utils/config";

export const metadata: Metadata = generatePageMetadata({
  title: "Blog",
  description: "News and articles about agricultural equipment. Useful tips for farmers.",
  path: "/en/blog",
  image: `${getBaseUrl()}/og-home.jpg`,
  type: "website",
  language: "en",
});

export default function Page() {
  return <Blog />;
}
