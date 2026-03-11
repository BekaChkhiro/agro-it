import type { Metadata } from "next";
import Contact from "@/pages/Contact";
import { generatePageMetadata } from "@/lib/metadata";
import { getBaseUrl } from "@/utils/config";

export const metadata: Metadata = generatePageMetadata({
  title: "Contact Us",
  description: "Contact us for consultation. AGROIT - your trusted partner in agricultural equipment.",
  path: "/en/contact",
  image: `${getBaseUrl()}/og-contact.jpg`,
  type: "website",
  language: "en",
});

export default function Page() {
  return <Contact />;
}
