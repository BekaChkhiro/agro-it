/**
 * Server-side metadata generation utilities for Next.js SEO
 * Provides functions to generate proper metadata for all page types
 */

import type { Metadata } from "next";
import { getCanonicalUrl, getAlternateUrl } from "@/utils/urlHelpers";
import { getBaseUrl, SITE_NAME } from "@/utils/config";
import { serializeSchemas } from "./schema";

/**
 * Supported languages type
 */
type SupportedLanguage = "ka" | "en" | "hy" | "ru";

/**
 * Get site name based on language
 */
function getSiteName(language: SupportedLanguage): string {
  // Russian falls back to English site name
  if (language === "ru") return SITE_NAME["en"];
  return SITE_NAME[language];
}

/**
 * Truncate description to optimal SEO length (150-160 chars)
 */
function truncateDescription(description: string, maxLength = 160): string {
  if (description.length <= maxLength) return description;
  return description.substring(0, maxLength - 3) + "...";
}

/**
 * Generate full title with site name
 */
function generateTitle(title: string, language: SupportedLanguage): string {
  // If title is already long, don't append site name
  if (title.length > 50) return title;
  return `${title} | AGROIT`;
}

/**
 * Generate metadata for a page with language support
 */
export function generatePageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  language = "ka",
  keywords,
  schemas,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article" | "product";
  language?: SupportedLanguage;
  keywords?: string;
  schemas?: (object | null)[];
}): Metadata {
  // Map "ru" to "en" for locale purposes (Russian uses English content)
  const resolvedLanguage: "ka" | "en" | "hy" = language === "ru" ? "en" : language;
  const fullTitle = generateTitle(title, resolvedLanguage);
  const optimizedDescription = truncateDescription(description);

  // Domain-aware canonical URL
  const canonicalDomain = resolvedLanguage === "hy" ? "https://agroit.am" : "https://agroit.ge";
  const canonicalUrl = `${canonicalDomain}${path}`;

  const baseUrl = getBaseUrl();
  const ogImage = image || `${baseUrl}/og-default.jpg`;

  // Generate alternate URLs
  const alternateKaUrl = getCanonicalUrl(getAlternateUrl(path, "ka"));
  const alternateEnUrl = getCanonicalUrl(getAlternateUrl(path, "en"));

  // Determine locale codes
  const localeMap: Record<"ka" | "en" | "hy" | "ru", string> = {
    ka: "ka_GE",
    en: "en_US",
    hy: "hy_AM",
    ru: "ru_RU",
  };

  // Use the original language for locale if it's "ru", otherwise use resolved
  const currentLocale = language === "ru" ? localeMap.ru : localeMap[resolvedLanguage];

  return {
    title: fullTitle,
    description: optimizedDescription,
    keywords: keywords,
    authors: [{ name: "AGROIT" }],
    verification: {
      google: "BjtK5MQIj7K6hsU6sr6E632R9IC5j5Z2sY60HF6tBMY",
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "32x32" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
      other: [
        { rel: "android-chrome", url: "/android-chrome-192x192.png", sizes: "192x192" },
        { rel: "android-chrome", url: "/android-chrome-512x512.png", sizes: "512x512" },
      ],
    },
    manifest: "/manifest.json",
    alternates: {
      canonical: canonicalUrl,
      languages: {
        ka: getCanonicalUrl(getAlternateUrl(path, "ka")),
        en: getCanonicalUrl(getAlternateUrl(path, "en")),
        hy: `https://agroit.am${getAlternateUrl(path, "ka")}`,
        "x-default": getCanonicalUrl(getAlternateUrl(path, "ka")),
      },
    },
    openGraph: {
      type: type === "article" ? "article" : type === "product" ? "website" : "website",
      url: canonicalUrl,
      title: fullTitle,
      description: optimizedDescription,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: getSiteName(resolvedLanguage),
      locale: currentLocale,
      alternateLocale: Object.values(localeMap).filter((loc) => loc !== currentLocale),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: optimizedDescription,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    // Embed Schema.org JSON-LD in other metadata
    ...(schemas && schemas.length > 0
      ? {
          other: {
            "script:ld+json": serializeSchemas(schemas),
          },
        }
      : {}),
  };
}

/**
 * Generate home page metadata
 */
export function generateHomeMetadata(language: SupportedLanguage = "ka"): Metadata {
  // Map "ru" to "en" for metadata purposes
  const resolvedLanguage: "ka" | "en" | "hy" = language === "ru" ? "en" : language;

  let path: string;
  let title: string;
  let description: string;
  let keywords: string;

  if (resolvedLanguage === "hy") {
    path = "/";
    title = "AGROIT";
    description = "AGROIT";
    keywords = "agricultural equipment, vineyard machinery, orchard equipment, Armenia, Italian machinery";
  } else if (resolvedLanguage === "en") {
    path = "/en";
    title = "AGROIT - Italian Agricultural Equipment in Georgia";
    description =
      "Professional Italian agricultural machinery for vineyards, orchards, and dry fruit processing. Free delivery across Georgia, one-year warranty, and expert support.";
    keywords = "agricultural equipment, vineyard machinery, orchard equipment, Georgia, Italian machinery";
  } else {
    path = "/";
    title = "AGROIT - იტალიური აგროტექნიკა საქართველოში";
    description =
      "პროფესიული იტალიური აგროტექნიკა ვენახებისთვის, ბაღებისთვის და კაკლოვანი კულტურების გადამუშავებისთვის. უფასო მიწოდება საქართველოში, ერთწლიანი გარანტია და ექსპერტული მხარდაჭერა.";
    keywords = "აგროტექნიკა, ვენახის ტექნიკა, ბაღის აღჭურვილობა, საქართველო, იტალიური ტექნიკა";
  }

  const baseUrl = getBaseUrl();
  return generatePageMetadata({
    title,
    description,
    path,
    image: `${baseUrl}/og-home.jpg`,
    type: "website",
    language: resolvedLanguage,
    keywords,
  });
}
