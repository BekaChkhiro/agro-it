import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { generateHomeMetadata } from "@/lib/metadata";
import { getDomainLanguage } from "@/utils/config";
import LocaleLayout from "./LocaleLayout";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
  const host = (await headersList).get("host") || "agroit.ge";
  const domainLang = getDomainLanguage(host);
  return generateHomeMetadata(domainLang === "hy" ? "hy" : "ka");
}

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const headersList = await headers();
  const host = headersList.get("host") || "agroit.ge";
  const pathname = headersList.get("x-pathname") || "";
  const domainLang = getDomainLanguage(host);

  // English content lives under the /en path prefix on the .ge domain.
  // Derive <html lang> from the path so English pages render lang="en"
  // instead of inheriting the domain language ("ka"). This keeps the
  // HTML lang attribute in sync with the hreflang alternates.
  const isEnglishPath = pathname === "/en" || pathname.startsWith("/en/");
  const lang = isEnglishPath ? "en" : domainLang;

  return <LocaleLayout lang={lang}>{children}</LocaleLayout>;
};

export default RootLayout;
