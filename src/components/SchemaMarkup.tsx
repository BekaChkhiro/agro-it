/**
 * Schema Markup Component
 * Provides JSON-LD structured data for SEO
 * Supports Organization, Breadcrumb, Product, Article, and FAQPage schemas
 */

import type { Language } from '@/contexts/LanguageContext/context';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCanonicalUrl } from '@/utils/urlHelpers';
import { getBaseUrl } from '@/utils/config';

/** Map language code to BCP 47 language tag for schema.org inLanguage */
const IN_LANGUAGE_MAP: Record<Language, string> = {
  ka: 'ka-GE',
  en: 'en-US',
  ru: 'ru-RU',
  hy: 'hy-AM',
};

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SchemaMarkupProps {
  /** Breadcrumb items for navigation schema */
  breadcrumbs?: BreadcrumbItem[];
  /** Product data for Product schema */
  product?: {
    name: string;
    description: string;
    image?: string;
    price?: string;
    availability?: string;
    sku?: string;
    brand?: string;
    url?: string;
  };
  /** Organization data for Organization schema */
  organization?: {
    name: string;
    url: string;
    logo?: string;
    contactPoint?: {
      telephone: string;
      contactType: string;
      areaServed: string;
    };
  };
  /** Article data for Article schema */
  article?: {
    headline: string;
    image?: string;
    datePublished?: string;
    dateModified?: string;
    author?: {
      name: string;
      url?: string;
    };
  };
  /** FAQ data for FAQPage schema */
  faq?: Array<{
    question: string;
    answer: string;
  }>;
}

/**
 * Schema Markup Component
 * Generates JSON-LD structured data for search engines
 */
export function SchemaMarkup({
  breadcrumbs,
  product,
  organization,
  article,
  faq,
}: SchemaMarkupProps) {
  const { language } = useLanguage();
  const schemas: object[] = [];

  // Organization Schema (default)
  if (organization || !product) {
    const baseUrl = getBaseUrl();
    const orgSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: organization?.name || 'AGROIT',
      url: organization?.url || baseUrl,
      logo: organization?.logo || `${baseUrl}/agroit-logo.webp`,
      sameAs: [
        // Add social media profiles when available
      ],
      contactPoint: organization?.contactPoint || {
        '@type': 'ContactPoint',
        telephone: 'English: +39 334 332 2743; Georgian: +995 568 84 60 24',
        contactType: 'Customer Service',
        areaServed: 'GE',
        availableLanguage: ['ka', 'en', 'hy'],
      },
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'GE',
        addressLocality: 'Tbilisi',
      },
    };
    schemas.push(orgSchema);
  }

  // Breadcrumb Schema
  if (breadcrumbs && breadcrumbs.length > 0) {
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: getCanonicalUrl(crumb.url),
      })),
    };
    schemas.push(breadcrumbSchema);
  }

  // Product Schema
  if (product) {
    const productSchema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      brand: {
        '@type': 'Brand',
        name: product.brand || 'AGROIT',
      },
      manufacturer: {
        '@type': 'Organization',
        name: 'AGROIT',
      },
      inLanguage: IN_LANGUAGE_MAP[language],
    };

    if (product.image) {
      productSchema.image = product.image;
    }

    if (product.sku) {
      productSchema.sku = product.sku;
    }

    if (product.price) {
      productSchema.offers = {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: 'GEL',
        availability: product.availability || 'https://schema.org/InStock',
        ...(product.url && { url: product.url }),
      };
    }

    schemas.push(productSchema);
  }

  // Article Schema
  if (article) {
    const articleSchema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.headline,
      inLanguage: IN_LANGUAGE_MAP[language],
      publisher: {
        '@type': 'Organization',
        name: 'AGROIT',
        logo: {
          '@type': 'ImageObject',
          url: `${getBaseUrl()}/agroit-logo.webp`,
        },
      },
    };

    if (article.image) {
      articleSchema.image = article.image;
    }

    if (article.datePublished) {
      articleSchema.datePublished = article.datePublished;
    }

    if (article.dateModified) {
      articleSchema.dateModified = article.dateModified;
    }

    if (article.author) {
      articleSchema.author = {
        '@type': 'Person',
        name: article.author.name,
        ...(article.author.url && { url: article.author.url }),
      };
    }

    schemas.push(articleSchema);
  }

  // FAQPage Schema
  if (faq && faq.length > 0) {
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    };
    schemas.push(faqSchema);
  }

  if (schemas.length === 0) {
    return null;
  }

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }}
        />
      ))}
    </>
  );
}
