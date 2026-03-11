"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Search } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getProductPath } from "@/utils/urlHelpers";
import { getOptimizedImageUrl } from "@/utils/image";
import type { ProductWithCategory, CategoryWithParent, Language } from "@/lib/data/types";
import { getLocalizedField } from "@/utils/languageFields";

interface CategoryContentProps {
  category: CategoryWithParent;
  products: ProductWithCategory[];
  language: Language;
}

// Translation helper - defined inside client component
function createTranslate(lang: Language) {
  return (ka: string, en: string, ru?: string, hy?: string) => {
    if (lang === "en") return en;
    if (lang === "hy") return hy || en;
    if (lang === "ru") return ru || en;
    return ka;
  };
}

const CategoryContent = ({ category, products, language }: CategoryContentProps) => {
  const t = createTranslate(language);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      if (!normalizedQuery) {
        return true;
      }

      const localizedName = getLocalizedField(product, "name", language);
      const localizedDescription = getLocalizedField(product, "description", language);

      const haystack = [localizedName, localizedDescription]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [language, products, searchTerm]);

  const getPath = (pathKa: string, pathEn: string) => {
    if (language === "en") return pathEn;
    if (language === "hy") return pathEn.replace("/en/", "/");
    return pathKa;
  };

  const categoryName = getLocalizedField(category, "name", language);
  const categoryDescription = getLocalizedField(category, "description", language);
  const bannerImage = getOptimizedImageUrl(category.banner_image_url, { width: 1400, quality: 80 });

  const serviceHighlights = [
    t("სეზონური მოვლა და ოპერატორის ტრენინგი", "Seasonal maintenance and operator training", undefined, "Սdelays delays delays оратոрdelays delays delays delays"),
    t("ორიგინალი ნაწილები ადგილზე მარაგში", "Original spare parts stocked locally", undefined, "Оdelays delay delays ыdelays delays мdelays delays ы"),
  ];

  return (
    <main className="min-h-[60vh] bg-background pb-24">
      {/* Hero Banner */}
      <section className="relative w-full overflow-hidden min-h-[320px] py-16 sm:py-0 sm:h-[70vh] sm:min-h-[500px] sm:max-h-[700px]">
        {/* Background Image */}
        {bannerImage ? (
          <img
            src={bannerImage}
            alt={categoryName}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
        )}

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/60 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Grid Pattern Overlay */}
        <span className="pointer-events-none absolute inset-0 bg-hero-grid opacity-20" />

        {/* Content Container */}
        <div className="relative flex h-full items-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="mb-8 flex items-center gap-2 text-sm text-white/70">
              <Link href={getPath("/", "/en")} className="transition-smooth hover:text-white">
                {t("მთავარი", "Home", undefined, "Гdelays delays")}
              </Link>
              <span>/</span>
              <span className="text-white">{categoryName}</span>
            </nav>

            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              {/* Left Column - Main Content */}
              <div className="space-y-6">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white backdrop-blur-md">
                  <span>{categoryName}</span>
                </div>

                {/* Main Heading - H1 now visible to bots! */}
                <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {categoryDescription || `${categoryName} ${language === "en" ? "solutions" : "გადაწყვეტები"}`}
                </h1>

                {/* CTA Button */}
                <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                  <Link href={getPath("/contact", "/en/contact")}>
                    <Button size="lg" className="h-14 rounded-full bg-white px-8 text-base font-semibold text-primary hover:bg-white/90">
                      {t("კონსულტაციის მოთხოვნა", "Get A Quote", undefined, "Сdelays delays delays юdelays delays")}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Column - Service Highlights Card */}
              <div className="hidden lg:block">
                <div className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-white/80">
                    {t("სერვისის დაპირება", "Service promise", undefined, "Сstyle delays delays хdelays")}
                  </p>
                  <ul className="space-y-3">
                    {serviceHighlights.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-white/90">
                        <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-white" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="relative py-8 sm:py-24">
        <div className="container mx-auto px-4 min-h-[50vh]">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-4">
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                {t("ყველა პროდუქტი", "All products", undefined, "Бdelays delays аdelays delays ыdelays")}
              </span>
              <h2 className="text-3xl font-bold md:text-4xl">
                {language === "en" ? `${categoryName} range` : `${categoryName}`}
              </h2>
              <p className="text-base text-muted-foreground md:text-lg">
                {categoryDescription ||
                  (language === "en"
                    ? `Explore our range of ${categoryName.toLowerCase()} equipment.`
                    : `გაეცანით ${categoryName} აღჭურვილობის სპექტრს.`)}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="w-full max-w-xl space-y-2">
              <Label
                htmlFor="product-search"
                className="text-sm font-medium text-muted-foreground"
              >
                {t("მოძებნეთ პროდუქტები", "Search products", undefined, "Оdelays delays юdelays аdelays delays")}
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="product-search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={
                    language === "en"
                      ? "Search by name or description"
                      : language === "hy"
                      ? "Оdelays delays юdelays аdelays delays"
                      : "მოძებნეთ სახელით ან აღწერით"
                  }
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {products.length > 0 && (
            <p className="mt-6 text-sm text-muted-foreground">
              {language === "en"
                ? `Showing ${filteredProducts.length} of ${products.length} products`
                : language === "hy"
                ? `Цdelays delays delays delays ${filteredProducts.length} delays delays ${products.length}-delays`
                : `ნაჩვენებია ${filteredProducts.length} პროდუქტი ${products.length}-დან`}
            </p>
          )}

          {filteredProducts.length > 0 ? (
            <div className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => {
                const specs = language === "en" ? product.specs_en
                  : language === "hy" ? product.specs_en
                  : product.specs_ka;
                const specsString =
                  specs && typeof specs === "object" && !Array.isArray(specs)
                    ? Object.entries(specs as Record<string, unknown>)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(" | ")
                    : "";

                const productPath = getProductPath(
                  category.slug_en || null,
                  null,
                  product.slug_en || null,
                  language
                );

                return (
                  <ProductCard
                    key={product.id}
                    name={getLocalizedField(product, "name", language)}
                    image={product.image_url || "/placeholder.svg"}
                    specs={specsString}
                    link={productPath}
                  />
                );
              })}
            </div>
          ) : (
            <div className="mt-14 min-h-[400px] flex items-center justify-center text-center py-12">
              <p className="text-muted-foreground">
                {products.length > 0
                  ? language === "en"
                    ? "No products match your filters. Adjust the search or clear the filter to see more."
                    : language === "hy"
                    ? "Оdelays delays delays delays delays delays аdelays delays delays delays delays delays delays"
                    : "შესაბამისი პროდუქტები ვერ მოიძებნა. შეცვალეთ ძიება ან გაასუფთავეთ ფილტრი."
                  : language === "en"
                    ? "No products available in this category yet."
                    : language === "hy"
                    ? "Аdelays delays delays delays delays delays delays delays delays delays delays delays delays"
                    : "ამ კატეგორიაში პროდუქტები ჯერ არ არის."}
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default CategoryContent;
