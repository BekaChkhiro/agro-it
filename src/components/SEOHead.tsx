import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCanonicalUrl, getAlternateUrl, getFullAlternateUrl } from '@/utils/urlHelpers';
import { getBaseUrl } from '@/utils/config';

interface SEOHeadProps {
  /** Page title (will be appended with site name) */
  title: string;
  /** Page description for meta tags */
  description: string;
  /** Current page path (e.g., "/venaxis-teqnika") */
  path: string;
  /** Open Graph image URL (optional, defaults to site default) */
  image?: string;
  /** Page type for Open Graph (default: "website") */
  type?: 'website' | 'article' | 'product';
  /** Additional keywords for meta tags (optional) */
  keywords?: string;
}

/**
 * SEO Head Component
 * Provides dynamic meta tags for each page including:
 * - Title and description
 * - Canonical URL
 * - Alternate language URLs (hreflang)
 * - Open Graph tags for social sharing
 * - Twitter Card tags
 *
 * @example
 * <SEOHead
 *   title="ვენახის ტექნიკა"
 *   description="იტალიური წარმოების ვენახის აღჭურვილობა"
 *   path="/venaxis-teqnika"
 *   image="https://agroit.ge/images/vineyard.jpg"
 *   type="website"
 * />
 */
export function SEOHead({
  title,
  description,
  path,
  image,
  type = 'website',
  keywords
}: SEOHeadProps) {
  const { language } = useLanguage();

  // Generate domain-aware canonical URL
  const canonicalDomain = language === 'hy' ? 'https://agroit.am' : 'https://agroit.ge';
  const canonicalUrl = `${canonicalDomain}${path}`;

  // Generate alternate URLs (cross-domain for Armenian)
  const alternateKaUrl = getFullAlternateUrl(path, 'ka');
  const alternateEnUrl = getFullAlternateUrl(path, 'en');
  const alternateHyUrl = getFullAlternateUrl(path, 'hy');

  // Default OG image if not provided
  const baseUrl = getBaseUrl();
  const ogImage = image || `${baseUrl}/og-default.jpg`;

  // Full title with site name - optimize for 60 char limit
  const fullTitle = title.length > 50 ? title : `${title} | AGROIT`;
  
  // Truncate description to optimal length (150-160 chars)
  const optimizedDescription = description.length > 160 
    ? description.substring(0, 157) + '...' 
    : description;

  // Site name translations
  const siteName = language === 'en'
    ? 'AGROIT - Italian Agricultural Equipment in Georgia'
    : 'AGROIT - იტალიური აგროტექნიკა საქართველოში';

  return (
    <Helmet>
      {/* Language */}
      <html lang={language} />

      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={optimizedDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content="AGROIT" />

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Alternate Language Versions (hreflang) - Self-referential and bidirectional */}
      <link rel="alternate" hrefLang={language === 'en' ? 'en' : language === 'hy' ? 'hy' : 'ka'} href={canonicalUrl} />
      <link rel="alternate" hrefLang="ka" href={alternateKaUrl} />
      <link rel="alternate" hrefLang="en" href={alternateEnUrl} />
      <link rel="alternate" hrefLang="hy" href={alternateHyUrl} />
      {/* x-default points to Georgian (ka) as the default language */}
      <link rel="alternate" hrefLang="x-default" href={alternateKaUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={optimizedDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={language === 'en' ? 'en_US' : language === 'hy' ? 'hy_AM' : 'ka_GE'} />
      <meta property="og:locale:alternate" content={language === 'en' ? 'ka_GE' : 'en_US'} />
      {language !== 'hy' && <meta property="og:locale:alternate" content="hy_AM" />}
      {language !== 'ka' && language !== 'en' && <meta property="og:locale:alternate" content="ka_GE" />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={optimizedDescription} />
      <meta name="twitter:image" content={ogImage} />

      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </Helmet>
  );
}
