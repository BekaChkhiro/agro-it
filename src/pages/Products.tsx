"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEOHead } from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/data/translations";
import { useProductsWithCategory } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { getProductPath } from "@/utils/urlHelpers";
import { getOptimizedImageUrl } from "@/utils/image";
import { ProductsPageSkeleton } from "@/components/skeletons/PageSkeletons";
import { getLocalizedField } from "@/utils/languageFields";

const Products = () => {
  const { language, t } = useLanguage();
  const {
    data: products = [],
    isLoading,
    error,
  } = useProductsWithCategory();
  const { data: categoriesData = [], isLoading: categoriesLoading } = useCategories();
  const [searchTerm, setSearchTerm] = useState("");

  const pageTitle = t(
    translations.productsPage.title.ka,
    translations.productsPage.title.en,
    translations.productsPage.title.ru,
    translations.productsPage.title.hy
  );

  const pageSubtitle = t(
    translations.productsPage.subtitle.ka,
    translations.productsPage.subtitle.en,
    translations.productsPage.subtitle.ru,
    translations.productsPage.subtitle.hy
  );

  const seoPath = language === "en" ? "/en/products" : language === "ru" ? "/ru/products" : language === "hy" ? "/hy/products" : "/products";
  const seoTitle = `${pageTitle} | ${language === "en" ? "Agroit Product Portfolio" : "Agroit"}`;
  const seoDescription = pageSubtitle;
  const contactPath = language === "en" ? "/en/contact" : language === "ru" ? "/ru/contact" : language === "hy" ? "/hy/contact" : "/contact";

  const resolveSlug = (entity: Record<string, unknown> | null | undefined) => {
    if (!entity) return null;
    return (
      (entity.slug_en as string | null | undefined) ||
      (entity.slug as string | null | undefined) ||
      (entity.slug_ka as string | null | undefined) ||
      null
    );
  };

  type CategoryRecord = (typeof categoriesData)[number] & {
    slug?: string | null;
    slug_en?: string | null;
    slug_ka?: string | null;
  };

  const featuredCategories = useMemo(() => {
    return categoriesData
      .filter((cat) => {
        const category = cat as CategoryRecord;
        return category?.is_featured === true;
      })
      .sort((a, b) => {
        const recordA = a as CategoryRecord;
        const recordB = b as CategoryRecord;
        const orderA = recordA.display_order ?? 999;
        const orderB = recordB.display_order ?? 999;
        if (orderA !== orderB) return orderA - orderB;
        return (
          new Date(recordB.created_at || 0).getTime() - new Date(recordA.created_at || 0).getTime()
        );
      })
      .slice(0, 4)
      .map((cat) => {
        const category = cat as CategoryRecord;

        const title = getLocalizedField(category, "name", language);

        const description = getLocalizedField(category, "description", language);

        const resolvedSlug = category.slug_en || category.slug || category.slug_ka || null;

        const link =
          language === "en"
            ? `/en/${resolvedSlug}`
            : language === "ru"
            ? `/ru/${resolvedSlug}`
            : language === "hy"
            ? `/hy/${resolvedSlug}`
            : `/${resolvedSlug}`;

        let imageUrl = category.banner_image_url || "";
        if (category.banner_image_url && category.updated_at) {
          const timestamp = new Date(category.updated_at).getTime();
          const separator = category.banner_image_url.includes("?") ? "&" : "?";
          imageUrl = `${category.banner_image_url}${separator}t=${timestamp}`;
        }
        if (!imageUrl) {
          imageUrl = "/placeholder.svg";
        }

        const optimizedImage = getOptimizedImageUrl(imageUrl, { width: 720, quality: 75 });

        return {
          key: category.id,
          title: title || (language === "en" ? "Category" : "კატეგორია"),
          description,
          image: optimizedImage || imageUrl,
          link,
        };
      });
  }, [categoriesData, language]);

  const normalizedProducts = useMemo(() => {
    return products
      .map((product) => {
        const specsSource =
          language === "en"
            ? product.specs_en
            : language === "ru"
            ? product.specs_en // No RU specs yet, fall back to EN
            : language === "hy"
            ? product.specs_en // No HY specs yet, fall back to EN
            : product.specs_ka;

        const specsString =
          specsSource && typeof specsSource === "object" && !Array.isArray(specsSource)
            ? Object.entries(specsSource as Record<string, unknown>)
                .slice(0, 2)
                .map(([key, value]) => `${key}: ${value}`)
                .join(" | ")
            : "";

        const parentSlug = resolveSlug(product.category?.parent as Record<string, unknown> | null | undefined);
        const categorySlug = resolveSlug(product.category as Record<string, unknown> | null | undefined);
        const childSlug = parentSlug ? categorySlug : null;
        const productRecord = product as Record<string, unknown>;
        const productSlug = (productRecord.slug as string | null) || (productRecord.slug_en as string | null) || null;
        const primarySlug = parentSlug || categorySlug;
        const link =
          productSlug && primarySlug
            ? getProductPath(primarySlug, childSlug, productSlug, language)
            : "#";

        return {
          id: product.id,
          name: getLocalizedField(product, "name", language),
          image: product.image_url || "/placeholder.svg",
          specs: specsString,
          link,
        };
      })
      .filter((item) => item.name?.trim().length > 0);
  }, [language, products]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) {
      return normalizedProducts;
    }
    const query = searchTerm.toLowerCase();
    return normalizedProducts.filter((product) => {
      const haystack = `${product.name} ${product.specs}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [normalizedProducts, searchTerm]);

  const seoMeta = (
    <SEOHead title={seoTitle} description={seoDescription} path={seoPath} type="website" />
  );

  if (isLoading) {
    return (
      <>
        {seoMeta}
        <ProductsPageSkeleton />
      </>
    );
  }

  if (error) {
    return (
      <>
        {seoMeta}
        <main className="flex min-h-[60vh] items-center justify-center bg-background px-4 pb-24">
          <Card className="max-w-lg border border-destructive/40 bg-destructive/5 text-destructive shadow-soft">
            <CardContent className="space-y-3 p-6 text-center">
              <h1 className="text-2xl font-semibold">
                {language === "en" ? "We couldn't load the products" : language === "hy" ? "Հնարավոր չէր ապրանքները բեռնել" : "პროდუქტების ჩატვირთვა ვერ მოხერხდა"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {language === "en"
                  ? "Please refresh the page or contact support if the issue persists."
                  : language === "hy"
                  ? "Խնդրում ենք թարմացնել էջը կամ կապվել աջակցության ծառայության:"
                  : "გთხოვთ განაახლოთ გვერდი ან დაგვიკავშირდეთ დახმარებისთვის."}
              </p>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      {seoMeta}
      <main className="bg-background pb-24">
        <section className="relative overflow-hidden pb-16 pt-20 md:pt-24">
          <div className="absolute inset-0 -z-10 bg-background surface-gradient" />
          <div className="absolute right-[-15%] top-[-25%] hidden h-[420px] w-[420px] rounded-full bg-primary/10 blur-3xl lg:block" />

          <div className="container mx-auto px-4">
            <div className="max-w-3xl space-y-6 text-center md:text-left">
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                {t(translations.nav.products.ka, translations.nav.products.en, undefined, translations.nav.products.hy)}
              </span>
              <h1 className="text-4xl font-bold leading-tight text-foreground md:text-5xl">
                {pageTitle}
              </h1>
              <p className="text-base text-muted-foreground md:text-lg">
                {pageSubtitle}
              </p>
            </div>
          </div>
        </section>

        <section className="hidden pb-20 lg:block">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
              {categoriesLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`category-skeleton-${index}`}
                    className="overflow-hidden rounded-[32px] border border-border/60 bg-white shadow-soft"
                  >
                    <div className="h-48 animate-pulse bg-muted" />
                    <div className="space-y-4 p-6">
                      <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
                      <div className="h-4 w-full animate-pulse rounded bg-muted" />
                      <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
                      <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                ))
              ) : featuredCategories.length > 0 ? (
                featuredCategories.map((category) => (
                  <Link
                    key={category.key}
                    href={category.link}
                    className="group relative overflow-hidden rounded-[32px] border border-border/60 bg-white shadow-soft transition-smooth hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-strong"
                  >
                    <div className="relative h-48 overflow-hidden rounded-t-[28px]">
                      <img
                        src={category.image}
                        alt={category.title}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-smooth group-hover:scale-105"
                      />
                    </div>

                    <div className="flex h-full flex-col gap-5 p-6">
                      <h3 className="text-2xl font-semibold text-foreground">{category.title}</h3>
                      <p className="flex-1 text-sm text-muted-foreground line-clamp-3">
                        {category.description || "\u00A0"}
                      </p>
                      <div className="mt-auto flex items-center text-sm font-semibold text-primary transition-smooth group-hover:gap-2">
                        {t("იხილეთ პროდუქცია", "Explore products", undefined, "Դիտել ապրանքները")}
                        <ArrowRight className="ml-2 h-4 w-4 transition-smooth group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-muted-foreground">
                  {t("კატეგორიები არ არის ხელმისაწვდომი", "No categories available", undefined, "Կատեգորիաներ հասանելի չեն")}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="pb-20 lg:hidden">
          <div className="container mx-auto px-4">
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="w-full max-w-md space-y-2">
                <Label htmlFor="products-search" className="text-sm font-medium text-muted-foreground">
                  {language === "en"
                    ? "Search products"
                    : language === "ru"
                    ? "Поиск продуктов"
                    : language === "hy"
                    ? "Օրոնել ապրանքներ"
                    : "პროდუქტების ძიება"}
                </Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="products-search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder={
                      language === "en"
                        ? "Filter by name or specs"
                        : language === "ru"
                        ? "Фильтр по названию или характеристикам"
                        : language === "hy"
                        ? "Ֆիլտրել անունով կամ բնութագրերով"
                        : "ფილტრი სახელით ან მახასიათებლებით"
                    }
                    className="pl-10"
                  />
                </div>
              </div>
              {normalizedProducts.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {language === "en"
                    ? `Showing ${filteredProducts.length} of ${normalizedProducts.length} products`
                    : language === "ru"
                    ? `Показано ${filteredProducts.length} из ${normalizedProducts.length} продуктов`
                    : language === "hy"
                    ? `Ցուցադրվում է ${filteredProducts.length} ապրանք ${normalizedProducts.length}-ից`
                    : `ნაჩვენებია ${filteredProducts.length} პროდუქტი ${normalizedProducts.length}-იდან`}
                </p>
              )}
            </div>

            {normalizedProducts.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    name={product.name}
                    image={product.image}
                    specs={product.specs}
                    link={product.link}
                  />
                ))}
              </div>
            ) : (
              <Card className="rounded-[28px] border border-border/60 bg-white/95 shadow-soft">
                <CardContent className="p-8 text-center space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    {t(
                      translations.productsPage.emptyTitle.ka,
                      translations.productsPage.emptyTitle.en,
                      translations.productsPage.emptyTitle.ru,
                      translations.productsPage.emptyTitle.hy
                    )}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t(
                      translations.productsPage.emptySubtitle.ka,
                      translations.productsPage.emptySubtitle.en,
                      translations.productsPage.emptySubtitle.ru,
                      translations.productsPage.emptySubtitle.hy
                    )}
                  </p>
                  <div className="flex justify-center">
                    <Link href={contactPath}>
                      <Button className="rounded-full">
                        {t("დაგვიკავშირდით", "Contact our team", undefined, "Կապվեք մեր թիմին")}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>
    </>
  );
};

export default Products;
