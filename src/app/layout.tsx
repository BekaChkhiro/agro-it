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
  const headersList = headers();
  const host = (await headersList).get("host") || "agroit.ge";
  const domainLang = getDomainLanguage(host);

  return <LocaleLayout lang={domainLang}>{children}</LocaleLayout>;
};

export default RootLayout;
