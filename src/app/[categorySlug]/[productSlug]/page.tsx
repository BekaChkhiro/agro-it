import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts, getProductsByCategory } from "@/lib/data/products";
import { generatePageMetadata } from "@/lib/metadata";
import { generateProductSchema, generateBreadcrumbSchema, generateOrganizationSchema } from "@/lib/schema";
import { getDomainLanguage } from "@/utils/config";
import type { Language } from "@/lib/data/types";
import ProductContent from "./ProductContent";
import JsonLd from "@/components/JsonLd";

// ISR: Revalidate every hour
export const revalidate = 3600;

interface ProductPageParams {
  categorySlug: string;
  productSlug: string;
}

type Props = {
  params: Promise<ProductPageParams>;
};

// Helper to get localized field on server
function getLocalizedField(
  record: Record<string, unknown>,
  fieldBase: string,
  language: Language
): string {
  if (language === "en") return (record[`${fieldBase}_en`] as string) || "";
  if (language === "hy") return (record[`${fieldBase}_hy`] as string) || (record[`${fieldBase}_en`] as string) || "";
  return (record[`${fieldBase}_ka`] as string) || "";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productSlug, categorySlug } = await params;
  const headersList = await headers();
  const host = headersList.get("host") || "agroit.ge";
  const language = getDomainLanguage(host) as Language;

  try {
    const product = await getProductBySlug(productSlug);

    if (!product) {
      notFound();
    }

    const title = getLocalizedField(product, "meta_title", language) || getLocalizedField(product, "name", language);
    const description = getLocalizedField(product, "meta_description", language) || getLocalizedField(product, "description", language) || `${title} - AGROIT`;
    const keywords = getLocalizedField(product, "keywords", language) || undefined;
    const categoryPath = product.category?.slug_en ? `/${product.category.slug_en}` : "";

    // Generate Schema.org JSON-LD
    const productSchema = generateProductSchema(product, language, categoryPath);
    const breadcrumbItems = [
      { name: language === "en" ? "Home" : "მთავარი", url: language === "en" ? "/en" : "/" },
    ];
    if (product.category) {
      breadcrumbItems.push({
        name: getLocalizedField(product.category, "name", language),
        url: language === "en" ? `/en/${product.category.slug_en}` : `/${product.category.slug_ka || product.category.slug_en}`,
      });
    }
    breadcrumbItems.push({
      name: getLocalizedField(product, "name", language),
      url: `${categoryPath}/${productSlug}`,
    });
    const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems, language);
    const organizationSchema = generateOrganizationSchema(language);

    return generatePageMetadata({
      title: title || "Product",
      description: description || "AGROIT",
      path: `/${categorySlug}/${productSlug}`,
      image: (product as any).og_image_override || product.image_url || undefined,
      type: "product",
      language,
      keywords,
      schemas: [productSchema, breadcrumbSchema, organizationSchema],
    });
  } catch (error) {
    console.warn("Failed to generate metadata for product:", error);
    return {
      title: "Product",
      description: "AGROIT Product",
    };
  }
}

export default async function Page({ params }: Props) {
  const { productSlug, categorySlug } = await params;
  const headersList = await headers();
  const host = headersList.get("host") || "agroit.ge";
  const language = getDomainLanguage(host) as Language;

  // Fetch product data server-side
  const product = await getProductBySlug(productSlug);

  if (!product) {
    notFound();
  }

  // Fetch related products
  let relatedProducts: Awaited<ReturnType<typeof getRelatedProducts>> = [];

  // Check for manually specified related products
  const relatedProductIds = product.related_product_ids && Array.isArray(product.related_product_ids)
    ? (product.related_product_ids as unknown[]).filter((id): id is string => typeof id === "string")
    : [];

  if (relatedProductIds.length > 0) {
    relatedProducts = await getRelatedProducts(relatedProductIds);
  } else if (product.category_ids && product.category_ids.length > 0) {
    // Fallback: fetch from same category
    relatedProducts = await getProductsByCategory(product.category_ids);
  }

  // Generate Schema.org JSON-LD for the page
  const categoryPath = product.category?.slug_en ? `/${product.category.slug_en}` : "";
  const productSchema = generateProductSchema(product, language, categoryPath);
  const breadcrumbItems = [
    { name: language === "en" ? "Home" : "მთავარი", url: language === "en" ? "/en" : "/" },
  ];
  if (product.category) {
    breadcrumbItems.push({
      name: language === "en" ? product.category.name_en : product.category.name_ka,
      url: language === "en" ? `/en/${product.category.slug_en}` : `/${product.category.slug_ka || product.category.slug_en}`,
    });
  }
  breadcrumbItems.push({
    name: language === "en" ? product.name_en : product.name_ka,
    url: `${categoryPath}/${product.slug_en}`,
  });
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems, language);
  const organizationSchema = generateOrganizationSchema(language);

  return (
    <>
      <JsonLd data={[productSchema, breadcrumbSchema, organizationSchema]} />
      <ProductContent
        product={product}
        relatedProducts={relatedProducts}
        language={language}
      />
    </>
  );
}
