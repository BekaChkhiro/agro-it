/**
 * Site configuration utilities
 * Centralized configuration with environment variable support
 */

/**
 * Get base URL from environment variable or fallback to production URL
 * Supports both NEXT_PUBLIC_ and VITE_ prefixes for compatibility
 */
export function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VITE_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.VITE_BASE_URL ||
    "https://www.agroit.ge" // Production fallback
  );
}

/**
 * Domain language types
 */
export type DomainLanguage = "ka" | "hy";

/**
 * Mapping of hostnames to their native language
 */
export const DOMAIN_LANGUAGE_MAP: Record<string, DomainLanguage> = {
  "agroit.ge": "ka",
  "www.agroit.ge": "ka",
  "agroit.am": "hy",
  "www.agroit.am": "hy",
};

/**
 * Get the native language for a given hostname
 */
export function getDomainLanguage(hostname: string): DomainLanguage {
  return DOMAIN_LANGUAGE_MAP[hostname] || "ka";
}

/**
 * Get the base URL for a specific language/domain
 */
export function getBaseUrlForLanguage(lang: "ka" | "en" | "hy" | "ru"): string {
  if (lang === "hy") return process.env.NEXT_PUBLIC_SITE_URL_AM || "https://www.agroit.am";
  // "ru" and "en" use the same base URL as "ka"
  return getBaseUrl();
}

/**
 * Site name translations
 */
export const SITE_NAME = {
  ka: "AGROIT - იტალიური აგროტექნიკა საქართველოში",
  en: "AGROIT - Italian Agricultural Equipment in Georgia",
  ru: "AGROIT - Итальянское сельскохозяйственное оборудование в Грузии",
  hy: "AGROIT",
} as const;
