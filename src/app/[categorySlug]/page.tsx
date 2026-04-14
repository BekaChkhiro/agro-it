import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getSubcategories } from "@/lib/data/categories";
import { getProductsByCategory } from "@/lib/data/products";
import { generatePageMetadata } from "@/lib/metadata";
import { generateBreadcrumbSchema, generateOrganizationSchema, generateProductListSchema } from "@/lib/schema";
import { getDomainLanguage } from "@/utils/config";
import type { Language } from "@/lib/data/types";
import CategoryContent from "./CategoryContent";
import JsonLd from "@/components/JsonLd";

// ISR: Revalidate every 30 minutes
export const revalidate = 1800;

interface CategoryPageParams {
  categorySlug: string;
}

type Props = {
  params: Promise<CategoryPageParams>;
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
  const { categorySlug } = await params;
  const headersList = await headers();
  const host = headersList.get("host") || "agroit.ge";
  const language = getDomainLanguage(host) as Language;

  try {
    const category = await getCategoryBySlug(categorySlug);

    if (!category) {
      notFound();
    }

    const title = getLocalizedField(category, "meta_title", language) || getLocalizedField(category, "name", language);
    const description = getLocalizedField(category, "meta_description", language) || getLocalizedField(category, "description", language) || `${title} - AGROIT`;
    const keywords = getLocalizedField(category, "keywords", language) || undefined;

    // Generate Schema.org JSON-LD
    const breadcrumbItems = [
      { name: language === "en" ? "Home" : "მთავარი", url: language === "en" ? "/en" : "/" },
      { name: getLocalizedField(category, "name", language), url: `/${categorySlug}` },
    ];
    const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems, language);
    const organizationSchema = generateOrganizationSchema(language);

    return generatePageMetadata({
      title: title || "Category",
      description: description || "AGROIT",
      path: `/${categorySlug}`,
      image: (category as any).og_image_override || category.banner_image_url || undefined,
      type: "website",
      language,
      keywords,
      schemas: [breadcrumbSchema, organizationSchema],
    });
  } catch (error) {
    console.warn("Failed to generate metadata for category:", error);
    return {
      title: "Category",
      description: "AGROIT Category",
    };
  }
}

export default async function Page({ params }: Props) {
  const { categorySlug } = await params;
  const headersList = await headers();
  const host = headersList.get("host") || "agroit.ge";
  const language = getDomainLanguage(host) as Language;

  // Fetch category data server-side
  const category = await getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  // Get subcategories
  const subcategories = await getSubcategories(category.id);
  const subcategoryIds = subcategories.map((sub) => sub.id);

  // Fetch products for this category and its subcategories
  const categoryIds = [category.id, ...subcategoryIds];
  const products = await getProductsByCategory(categoryIds);

  // Generate Schema.org JSON-LD
  const categoryName = language === "en" ? category.name_en : category.name_ka;
  const breadcrumbItems = [
    { name: language === "en" ? "Home" : "მთავარი", url: language === "en" ? "/en" : "/" },
    { name: categoryName, url: `/${categorySlug}` },
  ];
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems, language);
  const organizationSchema = generateOrganizationSchema(language);
  const productListSchema = generateProductListSchema(products, category, language);

  return (
    <>
      <JsonLd data={[breadcrumbSchema, organizationSchema, productListSchema]} />
      <CategoryContent
        category={category}
        products={products}
        language={language}
      />
    </>
  );
}
