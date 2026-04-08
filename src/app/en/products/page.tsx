import type { Metadata } from "next";
import Products from "@/pages/Products";
import { generatePageMetadata } from "@/lib/metadata";
import { getBaseUrl } from "@/utils/config";
import { getPageSEO } from "@/lib/data/page-seo";
import { getProducts } from "@/lib/data/products";
import { getCategories } from "@/lib/data/categories";

export const revalidate = 1800;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSEO("products");

  return generatePageMetadata({
    title: seo?.title_en || "Products",
    description: seo?.description_en || "Browse our full catalog of agricultural equipment.",
    path: "/en/products",
    image: seo?.og_image || `${getBaseUrl()}/og-home.jpg`,
    type: "website",
    language: "en",
    keywords: seo?.keywords_en || undefined,
  });
}

export default async function Page() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);
  return <Products initialProducts={products} initialCategories={categories} />;
}
