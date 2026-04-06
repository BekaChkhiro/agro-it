/**
 * URL Helper Utilities for SEO-friendly URL generation
 * Handles Georgian transliteration, slug generation, and path building
 */

/**
 * Georgian to Latin transliteration map
 * Based on national standard for URL-safe transliteration
 */
const TRANSLITERATION_MAP: Record<string, string> = {
  'ა': 'a', 'ბ': 'b', 'გ': 'g', 'დ': 'd', 'ე': 'e', 'ვ': 'v', 'ზ': 'z',
  'თ': 'th', 'ი': 'i', 'კ': 'k', 'ლ': 'l', 'მ': 'm', 'ნ': 'n', 'ო': 'o',
  'პ': 'p', 'ჟ': 'zh', 'რ': 'r', 'ს': 's', 'ტ': 't', 'უ': 'u', 'ფ': 'ph',
  'ქ': 'k', 'ღ': 'gh', 'ყ': 'q', 'შ': 'sh', 'ჩ': 'ch', 'ც': 'ts', 'ძ': 'dz',
  'წ': 'ts', 'ჭ': 'ch', 'ხ': 'kh', 'ჯ': 'j', 'ჰ': 'h'
};

/**
 * Transliterate Georgian text to Latin characters
 * Preserves brand names and English text unchanged
 *
 * @param text - Georgian text to transliterate
 * @returns Transliterated text in Latin characters
 *
 * @example
 * transliterate("ვენახი") // "venakhi"
 * transliterate("FACMA") // "FACMA" (unchanged)
 */
export function transliterate(text: string): string {
  return text
    .split('')
    .map(char => TRANSLITERATION_MAP[char] || char)
    .join('');
}

/**
 * Generate SEO-friendly slug from text
 * Rules:
 * - All lowercase
 * - Latin letters only (Georgian transliterated)
 * - Hyphens between words
 * - Max 3-5 words
 * - No special characters
 *
 * @param text - Text to convert to slug
 * @param isGeorgian - Whether text is in Georgian (requires transliteration)
 * @returns SEO-friendly slug
 *
 * @example
 * generateSlug("ვენახის ტექნიკა", true) // "venakhis-teqnika"
 * generateSlug("Vineyard Equipment", false) // "vineyard-equipment"
 * generateSlug("FACMA C380S Harvester", false) // "facma-c380s-harvester"
 */
export function generateSlug(text: string, isGeorgian = false): string {
  let slug = isGeorgian ? transliterate(text) : text;

  slug = slug
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  // Limit to 5 words (4 hyphens max) for SEO
  const parts = slug.split('-');
  if (parts.length > 5) {
    slug = parts.slice(0, 5).join('-');
  }

  return slug;
}

/**
 * Build category URL path
 *
 * @param slugKa - Georgian category slug
 * @param slugEn - English category slug
 * @param language - Current language
 * @returns Full category path
 *
 * @example
 * getCategoryPath("venaxis-teqnika", "vineyard-equipment", "ka") // "/venaxis-teqnika"
 * getCategoryPath("venaxis-teqnika", "vineyard-equipment", "en") // "/en/vineyard-equipment"
 */
export function getCategoryPath(slug: string | null, language: 'ka' | 'en' | 'ru' | 'hy'): string {
  if (!slug) {
    if (language === 'en') return '/en';
    return '/';
  }

  if (language === 'en') return `/en/${slug}`;
  return `/${slug}`;  // ka, hy, ru all use root
}

/**
 * Build product URL path with category hierarchy
 * Supports both 2-segment (/category/product) and 3-segment (/category/subcategory/product) URLs
 *
 * @param categorySlugKa - Georgian parent category slug
 * @param categorySlugEn - English parent category slug
 * @param subcategorySlugKa - Georgian subcategory slug (optional)
 * @param subcategorySlugEn - English subcategory slug (optional)
 * @param productSlugKa - Georgian product slug
 * @param productSlugEn - English product slug
 * @param language - Current language
 * @returns Full product path
 *
 * @example
 * // With subcategory:
 * getProductPath("venaxis-teqnika", "vineyard-equipment", "mulchers", "mulchers", "tfb-mulcher", "tfb-mulcher", "ka")
 * // Returns: "/venaxis-teqnika/mulchers/tfb-mulcher"
 *
 * // Without subcategory:
 * getProductPath("venaxis-teqnika", "vineyard-equipment", null, null, "c380s-harvester", "c380s-harvester", "en")
 * // Returns: "/en/vineyard-equipment/c380s-harvester"
 */
export function getProductPath(
  categorySlug: string | null,
  subcategorySlug: string | null,
  productSlug: string | null,
  language: 'ka' | 'en' | 'ru' | 'hy'
): string {
  const prefix = language === 'en' ? '/en' : '';

  // Fallback if missing required slugs
  if (!categorySlug || !productSlug) {
    return prefix || '/';
  }

  // With subcategory: /category/subcategory/product
  if (subcategorySlug) {
    return `${prefix}/${categorySlug}/${subcategorySlug}/${productSlug}`;
  }

  // Without subcategory: /category/product
  return `${prefix}/${categorySlug}/${productSlug}`;
}

/**
 * Generate canonical URL for page
 * Used for SEO to indicate the preferred URL for a page
 *
 * @param path - Relative path (e.g., "/venaxis-teqnika")
 * @returns Full canonical URL
 *
 * @example
 * getCanonicalUrl("/venaxis-teqnika") // "https://agroit.ge/venaxis-teqnika"
 */
export function getCanonicalUrl(path: string): string {
  // Import here to avoid circular dependency
  const baseUrl = 
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VITE_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.VITE_BASE_URL ||
    'https://www.agroit.ge';
  return `${baseUrl}${path}`;
}

/**
 * Get alternate language URL for hreflang tag
 * Converts between Georgian, English, and Russian URL versions
 *
 * @param currentPath - Current page path
 * @param targetLang - Target language
 * @returns Alternate URL for target language
 *
 * @example
 * getAlternateUrl("/venaxis-teqnika", "en") // "/en/venaxis-teqnika"
 * getAlternateUrl("/en/vineyard-equipment", "ka") // "/vineyard-equipment"
 */
export function getAlternateUrl(currentPath: string, targetLang: 'ka' | 'en' | 'hy'): string {
  // Remove any existing language prefix to get the base path
  const basePath = currentPath.replace(/^\/en/, '') || '/';

  if (targetLang === 'en') {
    // Add /en prefix to base path
    return basePath === '/' ? '/en' : `/en${basePath}`;
  }
  // Both ka and hy use root paths (on their respective domains)
  return basePath;
}

/**
 * Get full cross-domain alternate URL including domain
 * Used for hreflang tags across agroit.ge and agroit.am
 *
 * @param path - Current page path
 * @param targetLang - Target language
 * @returns Full URL with domain for target language
 *
 * @example
 * getFullAlternateUrl("/venaxis-teqnika", "ka") // "https://agroit.ge/venaxis-teqnika"
 * getFullAlternateUrl("/venaxis-teqnika", "hy") // "https://agroit.am/venaxis-teqnika"
 * getFullAlternateUrl("/venaxis-teqnika", "en") // "https://agroit.ge/en/venaxis-teqnika"
 */
export function getFullAlternateUrl(path: string, targetLang: 'ka' | 'en' | 'hy'): string {
  const basePath = path.replace(/^\/en/, '') || '/';

  switch (targetLang) {
    case 'ka':
      return `https://www.agroit.ge${basePath}`;
    case 'hy':
      return `https://www.agroit.am${basePath}`;
    case 'en':
      return `https://www.agroit.ge${basePath === '/' ? '/en' : `/en${basePath}`}`;
  }
}

/**
 * Build blog URL path
 *
 * @param slug - Blog slug
 * @param language - Current language
 * @returns Full blog path
 *
 * @example
 * getBlogPath("choosing-vineyard-equipment", "ka") // "/blog/choosing-vineyard-equipment"
 * getBlogPath("choosing-vineyard-equipment", "en") // "/en/blog/choosing-vineyard-equipment"
 */
export function getBlogPath(slug: string | null, language: 'ka' | 'en' | 'ru' | 'hy'): string {
  if (!slug) {
    if (language === 'en') return '/en/blogs';
    return '/blogs';
  }

  if (language === 'en') return `/en/blog/${slug}`;
  return `/blog/${slug}`;
}

/**
 * Check if a string is a valid UUID
 * Used to detect legacy UUID-based product URLs
 *
 * @param str - String to check
 * @returns True if string is a valid UUID
 *
 * @example
 * isUUID("48bbcd4a-9b88-44a3-96b3-20fdadbcfcf2") // true
 * isUUID("tfb-mulcher") // false
 */
export function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Validate slug format
 * Checks if slug follows SEO best practices
 *
 * @param slug - Slug to validate
 * @returns Object with validation result and error message
 *
 * @example
 * validateSlug("vineyard-equipment") // { valid: true }
 * validateSlug("Vineyard Equipment") // { valid: false, error: "Must be lowercase" }
 */
export function validateSlug(slug: string): { valid: boolean; error?: string } {
  if (!slug || slug.trim().length === 0) {
    return { valid: false, error: 'Slug is required' };
  }

  if (slug !== slug.toLowerCase()) {
    return { valid: false, error: 'Must be lowercase' };
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { valid: false, error: 'Only lowercase letters, numbers, and hyphens allowed' };
  }

  if (slug.startsWith('-') || slug.endsWith('-')) {
    return { valid: false, error: 'Cannot start or end with hyphen' };
  }

  if (slug.includes('--')) {
    return { valid: false, error: 'Cannot contain consecutive hyphens' };
  }

  const wordCount = slug.split('-').length;
  if (wordCount > 5) {
    return { valid: false, error: 'Maximum 5 words allowed' };
  }

  return { valid: true };
}
