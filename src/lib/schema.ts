/**
 * Schema.org JSON-LD generators for SEO
 * Generates structured data for Google Rich Results
 */

import type { Language, ProductWithCategory, Blog, SuccessStory, Category, BreadcrumbItem } from "./data/types";
import { getBaseUrl, getBaseUrlForLanguage, SITE_NAME } from "@/utils/config";

/**
 * Generate Organization schema
 * Used on all pages for brand recognition
 */
export function generateOrganizationSchema(language: Language = "ka") {
  const baseUrl = getBaseUrlForLanguage(language);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AGROIT",
    alternateName: language === "ka"
      ? "აგროით - იტალიური აგროტექნიკა"
      : language === "hy"
      ? "AGROIT"
      : "AGROIT - Italian Agricultural Equipment",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: language === "ka"
      ? "პროფესიული იტალიური აგროტექნიკა ვენახებისთვის, ბაღებისთვის და კაკლოვანი კულტურების გადამუშავებისთვის"
      : language === "hy"
      ? "AGROIT"
      : "Professional Italian agricultural machinery for vineyards, orchards, and dry fruit processing",
    address: {
      "@type": "PostalAddress",
      streetAddress: language === "ka" ? "თბილისი" : "Tbilisi",
      addressLocality: language === "ka" ? "თბილისი" : "Tbilisi",
      addressCountry: language === "hy" ? "AM" : "GE",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+995-XXX-XXX-XXX",
      contactType: "customer service",
      availableLanguage: ["Georgian", "English", "Armenian"],
    },
    sameAs: [
      "https://www.facebook.com/agroit.ge",
      "https://www.instagram.com/agroit.ge",
    ],
  };
}

/**
 * Generate Product schema (Basic version — no price fields)
 * Used on product detail pages. We don't display prices, so we omit
 * offers/aggregateRating/review to avoid "Invalid items" in Rich Results.
 */
export function generateProductSchema(
  product: ProductWithCategory,
  language: Language = "ka",
  _categoryPath: string = ""
) {
  const name = language === "en"
    ? product.name_en
    : language === "hy"
    ? (product.name_hy || product.name_en)
    : product.name_ka;
  const description = language === "en"
    ? product.description_en
    : language === "hy"
    ? (product.description_hy || product.description_en)
    : product.description_ka;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: description || undefined,
    image: product.image_url || undefined,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: "AGROIT",
    },
  };
}

/**
 * Generate BreadcrumbList schema
 * Used on category and product pages
 */
export function generateBreadcrumbSchema(
  items: BreadcrumbItem[],
  language: Language = "ka"
) {
  const baseUrl = getBaseUrlForLanguage(language);

  // Filter out items with empty/missing names (Google Search Console requires name)
  const validItems = items.filter((item) => item.name && item.name.trim().length > 0);

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: validItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name.trim(),
      item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
    })),
  };
}

/**
 * Generate Article schema for blog posts
 */
export function generateArticleSchema(
  blog: Blog,
  language: Language = "ka"
) {
  const baseUrl = getBaseUrlForLanguage(language);
  const title = language === "en"
    ? blog.title_en
    : language === "hy"
    ? (blog.title_hy || blog.title_en)
    : blog.title_ka;
  const description = language === "en"
    ? blog.excerpt_en
    : language === "hy"
    ? (blog.excerpt_hy || blog.excerpt_en)
    : blog.excerpt_ka;
  const slug = language === "en"
    ? blog.slug_en
    : language === "hy"
    ? (blog.slug_hy || blog.slug_en)
    : blog.slug_ka;
  const content = language === "en"
    ? blog.content_en
    : language === "hy"
    ? (blog.content_hy || blog.content_en)
    : blog.content_ka;

  const articleUrl = `${baseUrl}${language === "en" ? "/en" : ""}/blog/${slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: description || undefined,
    image: blog.featured_image_url || undefined,
    url: articleUrl,
    datePublished: blog.publish_date || undefined,
    dateModified: blog.updated_at || blog.publish_date || undefined,
    author: blog.author
      ? {
          "@type": "Person",
          name: blog.author,
        }
      : {
          "@type": "Organization",
          name: "AGROIT",
        },
    publisher: {
      "@type": "Organization",
      name: "AGROIT",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
      },
    },
    articleBody: content ? content.substring(0, 500) : undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
  };
}

/**
 * Generate LocalBusiness schema
 * Used on contact and about pages
 */
export function generateLocalBusinessSchema(language: Language = "ka") {
  const baseUrl = getBaseUrlForLanguage(language);

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${baseUrl}/#organization`,
    name: "AGROIT",
    description: language === "ka"
      ? "იტალიური აგროტექნიკის ოფიციალური დისტრიბუტორი საქართველოში"
      : language === "hy"
      ? "AGROIT"
      : "Official distributor of Italian agricultural equipment in Georgia",
    url: baseUrl,
    telephone: "+995-XXX-XXX-XXX",
    address: {
      "@type": "PostalAddress",
      streetAddress: language === "ka" ? "თბილისი" : "Tbilisi",
      addressLocality: language === "ka" ? "თბილისი" : "Tbilisi",
      addressCountry: language === "hy" ? "AM" : "GE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 41.7151,
      longitude: 44.8271,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    priceRange: "$$",
  };
}

/**
 * Generate WebSite schema with SearchAction
 * Used on home page
 */
export function generateWebSiteSchema(language: Language = "ka") {
  const baseUrl = getBaseUrlForLanguage(language);

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME[language],
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}${language === "en" ? "/en" : ""}/products?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generate ItemList schema for category pages
 * Lists products within a category
 */
export function generateProductListSchema(
  products: ProductWithCategory[],
  category: Category,
  language: Language = "ka"
) {
  const baseUrl = getBaseUrlForLanguage(language);
  const categoryName = language === "en"
    ? category.name_en
    : language === "hy"
    ? (category.name_hy || category.name_en)
    : category.name_ka;
  const categorySlug = language === "en"
    ? category.slug_en
    : language === "hy"
    ? (category.slug_hy || category.slug_en)
    : category.slug_ka;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: categoryName,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 10).map((product, index) => {
      const productName = language === "en"
        ? product.name_en
        : language === "hy"
        ? (product.name_hy || product.name_en)
        : product.name_ka;
      const productSlug = language === "en"
        ? product.slug_en
        : language === "hy"
        ? (product.slug_hy || product.slug_en)
        : product.slug_ka;

      return {
        "@type": "ListItem",
        position: index + 1,
        name: productName,
        url: `${baseUrl}${language === "en" ? "/en" : ""}/${categorySlug}/${productSlug}`,
      };
    }),
  };
}

/**
 * Generate FAQ schema
 * Used on product pages with specs
 */
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  if (!faqs.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Serialize schemas to JSON-LD script tag content
 * Returns a string that can be embedded in metadata.other
 */
export function serializeSchemas(schemas: (object | null)[]): string {
  const validSchemas = schemas.filter(Boolean);
  if (!validSchemas.length) return "";

  if (validSchemas.length === 1) {
    return JSON.stringify(validSchemas[0]);
  }

  return JSON.stringify(validSchemas);
}
