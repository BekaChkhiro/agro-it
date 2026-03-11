"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Trophy, ArrowRight, Quote, CheckCircle2, TrendingUp, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { useSuccessStoryBySlug, usePublishedSuccessStories } from "@/hooks/useSuccessStories";
import { useProductsByIds } from "@/hooks/useProducts";
import { getProductPath, generateSlug } from "@/utils/urlHelpers";
import type { Database } from "@/integrations/supabase/types";
import { getBaseUrl } from "@/utils/config";
import { SuccessStoryDetailSkeleton } from "@/components/skeletons/PageSkeletons";
import { getLocalizedField } from "@/utils/languageFields";

type SuccessStory = Database["public"]["Tables"]["success_stories"]["Row"];

// SuccessStoryDetail organizes the detailed layout for a single success story view.
const SuccessStoryDetail = () => {
  const params = useParams();
  const storySlug = params?.storySlug as string;
  const { language, t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(0);

  // Fetch success story by slug
  const {
    data: story,
    isLoading,
    error,
  } = useSuccessStoryBySlug(storySlug);

  // SEO metadata
  const successStoryLabel = t("წარმატების ისტორია", "Success Story", "История успеха");
  
  const resolveLocalizedSlug = (successStory: SuccessStory | null | undefined) => {
    if (!successStory) {
      return null;
    }

    const preference = [successStory.slug_en, successStory.slug_ru, successStory.slug_ka];

    const existingSlug = preference.find(
      (candidate): candidate is string => typeof candidate === "string" && candidate.trim().length > 0,
    );

    if (existingSlug) {
      return existingSlug;
    }

    const fallbackTitle =
      language === "en"
        ? successStory.title_en || successStory.title_ka || successStory.title_ru || ""
        : language === "ru"
        ? successStory.title_en || successStory.title_ru || successStory.title_ka || ""
        : language === "hy"
        ? successStory.title_en || successStory.title_ka || successStory.title_ru || ""
        : successStory.title_ka || successStory.title_en || successStory.title_ru || "";

    if (!fallbackTitle) {
      return null;
    }

    const isGeorgian = language !== "en" && language !== "ru" && language !== "hy";
    return generateSlug(fallbackTitle, isGeorgian);
  };

  // Parse product IDs from story data - must be before conditional returns
  const productIds = story?.product_ids && Array.isArray(story.product_ids)
    ? (story.product_ids as unknown[]).filter((id): id is string => typeof id === "string")
    : [];

  // Fetch related products - must be called before conditional returns
  const { data: relatedProducts = [] } = useProductsByIds(productIds);

  // Fetch other recent stories - must be called before conditional returns
  const { data: allStories = [] } = usePublishedSuccessStories();
  
  // Process data after all hooks are called
  const recentStories = allStories
    .filter(s => s.id !== story?.id)
    .slice(0, 3);

  // Gallery images from story data
  const galleryImages = story?.gallery_image_urls && Array.isArray(story.gallery_image_urls)
    ? story.gallery_image_urls.filter((url): url is string => typeof url === "string")
    : story?.featured_image_url
    ? [story.featured_image_url]
    : [];

  // Parse results achieved from JSON
  const resultsAchieved = story?.results_achieved && typeof story.results_achieved === 'object' && !Array.isArray(story.results_achieved)
    ? Object.entries(story.results_achieved as Record<string, string | number>)
    : [];

  // Get current story data with Russian fallback to English
  const title = story ? getLocalizedField(story, "title", language) : "";
  const storyContent = story ? getLocalizedField(story, "content", language) : "";
  const customerName = story ? getLocalizedField(story, "customer_name", language) : "";
  const location = story ? getLocalizedField(story, "customer_location", language) : "";
  const testimonial = story ? getLocalizedField(story, "customer_testimonial", language) : "";
  const excerpt = story ? getLocalizedField(story, "excerpt", language) : "";
  const hasExcerpt = typeof excerpt === "string" && excerpt.trim().length > 0;
  const hasCustomerName = typeof customerName === "string" && customerName.trim().length > 0;
  const hasLocation = typeof location === "string" && location.trim().length > 0;

  const resolvedStorySlug = resolveLocalizedSlug(story);
  const storyPath = resolvedStorySlug
    ? language === "en"
      ? `/en/success-story/${resolvedStorySlug}`
      : language === "ru"
      ? `/ru/success-story/${resolvedStorySlug}`
      : language === "hy"
      ? `/hy/success-story/${resolvedStorySlug}`
      : `/success-story/${resolvedStorySlug}`
    : language === "en"
    ? "/en/success-stories"
    : language === "ru"
    ? "/ru/success-stories"
    : language === "hy"
    ? "/hy/success-stories"
    : "/success-stories";

  // Get success story path helper
  const getSuccessStoryPath = (successStory: SuccessStory | null | undefined) => {
    const localizedSlug = resolveLocalizedSlug(successStory);
    if (!localizedSlug) {
      if (language === "en") return "/en/success-stories";
      if (language === "ru") return "/ru/success-stories";
      if (language === "hy") return "/hy/success-stories";
      return "/success-stories";
    }
    if (language === "en") return `/en/success-story/${localizedSlug}`;
    if (language === "ru") return `/ru/success-story/${localizedSlug}`;
    if (language === "hy") return `/hy/success-story/${localizedSlug}`;
    return `/success-story/${localizedSlug}`;
  };

  // Loading state
  if (isLoading) {
    return <SuccessStoryDetailSkeleton />;
  }

  // Error state / 404
  if (error || !story) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-background pb-24">
        <div className="text-center">
          <Trophy className="mx-auto mb-4 h-16 w-16 text-muted-foreground/40" />
          <h1 className="mb-4 text-2xl font-bold text-foreground">
            {t("ისტორია ვერ მოიძებნა", "Story Not Found", "История не найдена")}
          </h1>
          <p className="mb-6 text-muted-foreground">
            {t("წარმატების ისტორია, რომელსაც ეძებთ, არ არსებობს ან ამოღებულია.", "The success story you're looking for doesn't exist or has been removed.", "История успеха, которую вы ищете, не существует или была удалена.")}
          </p>
          <Link href={language === "en" ? "/en/success-stories" : language === "ru" ? "/ru/success-stories" : language === "hy" ? "/hy/success-stories" : "/success-stories"}>
            <Button>
              {t("იხილეთ ყველა ისტორია", "View All Stories", "Все истории")}
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <SchemaMarkup
        article={{
          headline: title,
          image: galleryImages[0] || undefined,
          datePublished: story.publish_date || story.created_at || undefined,
          dateModified: story.updated_at || undefined,
          author: {
            name: "AGROIT",
          },
        }}
      />
      <main className="bg-background pb-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden pb-10 pt-12 md:pt-14">
          <div className="absolute inset-0 -z-10 bg-background surface-gradient" />
          <div className="absolute right-[-15%] top-[-25%] hidden h-[420px] w-[420px] rounded-full bg-primary/15 blur-3xl lg:block" />

          <div className="container mx-auto px-4">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href={language === "en" ? "/en" : language === "ru" ? "/ru" : language === "hy" ? "/hy" : "/"} className="transition-smooth hover:text-foreground">
                {t("მთავარი", "Home", "Главная")}
              </Link>
              <span>/</span>
              <Link
                href={language === "en" ? "/en/success-stories" : language === "ru" ? "/ru/success-stories" : language === "hy" ? "/hy/success-stories" : "/success-stories"}
                className="transition-smooth hover:text-foreground"
              >
                {t("წარმატების ისტორიები", "Success Stories")}
              </Link>
              <span>/</span>
              <span className="text-foreground line-clamp-1">{title}</span>
            </nav>

            {/* Hero Content Card */}
            <div className="mt-10 rounded-[40px] border border-border/60 bg-white/80 p-6 shadow-soft">
              <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr] items-start">
                {/* Gallery */}
                <div>
                  <div className="overflow-hidden rounded-[32px] border border-border/60 bg-white/90 p-4 shadow-soft">
                    {galleryImages.length > 0 ? (
                      <img
                        src={galleryImages[selectedImage]}
                        alt={title}
                        className="h-[420px] w-full rounded-[24px] object-cover"
                      />
                    ) : (
                      <div className="h-[420px] w-full rounded-[24px] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <Trophy className="h-24 w-24 text-primary/40" />
                      </div>
                    )}
                  </div>
                  {galleryImages.length > 1 && (
                    <div className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-4">
                      {galleryImages.map((image, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSelectedImage(index)}
                          className={`overflow-hidden rounded-2xl border border-border/60 bg-white/80 p-2 shadow-soft transition-smooth ${
                            selectedImage === index ? "ring-2 ring-primary" : ""
                          }`}
                        >
                          <img src={image} alt={`${title} ${index + 1}`} className="h-20 w-full rounded-xl object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Story Overview */}
                <div className="flex flex-col gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-4">
                      <Trophy className="h-3 w-3" />
                      {successStoryLabel}
                    </div>
                    <h1 className="text-4xl font-bold leading-tight text-foreground md:text-5xl">
                      {title}
                    </h1>
                    {hasExcerpt && (
                      <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                        {excerpt}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {hasCustomerName && (
                      <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-soft">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Quote className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              {t("კლიენტი", "Client", "Клиент")}
                            </div>
                            <div className="mt-1 text-base font-semibold text-foreground">{customerName}</div>
                          </div>
                        </div>
                      </div>
                    )}
                    {hasLocation && (
                      <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-soft">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <MapPin className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              {t("ლოკაცია", "Location", "Локация")}
                            </div>
                            <div className="mt-1 text-base font-semibold text-foreground">{location}</div>
                          </div>
                        </div>
                      </div>
                    )}
                    {resultsAchieved.length > 0 && (
                      <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-soft">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <TrendingUp className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              {t("შედეგები", "Outcomes", "Результаты")}
                            </div>
                            <div className="mt-1 text-base font-semibold text-foreground">{resultsAchieved.length}</div>
                          </div>
                        </div>
                      </div>
                    )}
                    {relatedProducts.length > 0 && (
                      <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-soft">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <ArrowRight className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              {t("გამოყენებული პროდუქტები", "Products used", "Использованные продукты")}
                            </div>
                            <div className="mt-1 text-base font-semibold text-foreground">{relatedProducts.length}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row">
                    <Link href={language === "en" ? "/en/contact" : language === "ru" ? "/ru/contact" : language === "hy" ? "/hy/contact" : "/contact"} className="flex-1">
                      <Button size="lg" className="h-12 w-full rounded-full px-8 text-base">
                        {t("მიიღეთ მსგავსი შედეგები", "Get similar results", "Получите похожий результат")}
                      </Button>
                    </Link>
                    <Link href={language === "en" ? "/en/vineyard-equipment" : language === "ru" ? "/ru/vineyard-equipment" : language === "hy" ? "/hy/vineyard-equipment" : "/venaxis-teqnika"} className="flex-1">
                      <Button size="lg" variant="outline" className="h-12 w-full rounded-full px-8 text-base">
                        {t("ნახეთ ტექნიკა", "View equipment", "Посмотреть оборудование")}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Story Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start">
              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-line text-base leading-relaxed text-foreground">
                  {storyContent}
                </div>
              </div>
              <div className="space-y-6">
                {testimonial && (
                  <Card className="rounded-[32px] border border-border/60 bg-white shadow-soft relative overflow-hidden">
                    <div className="absolute top-6 left-6 text-primary/10">
                      <Quote className="h-16 w-16" />
                    </div>
                    <CardContent className="relative p-6 space-y-6">
                      <p className="text-lg font-medium text-foreground leading-relaxed">
                        &ldquo;{testimonial}&rdquo;
                      </p>
                      {hasCustomerName && (
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-lg font-bold text-primary">
                              {customerName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">{customerName}</div>
                            {story.customer_company && (
                              <div className="text-sm text-muted-foreground">{story.customer_company}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Results Achieved */}
        {resultsAchieved.length > 0 && (
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4 max-w-5xl">
              <div className="flex items-center gap-3 mb-8">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold text-foreground">
                  {t("მიღწეული შედეგები", "Results Achieved", "Достигнутые результаты")}
                </h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {resultsAchieved.map(([key, value], index) => (
                  <Card key={index} className="rounded-[28px] border border-border/60 bg-white shadow-soft">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                          <CheckCircle2 className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-muted-foreground mb-1">{key}</div>
                          <div className="text-2xl font-bold text-foreground">{value}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-3 mb-10">
                <h2 className="text-3xl font-bold text-foreground">
                  {t("გამოყენებული პროდუქტები", "Products Used")}
                </h2>
              </div>

              <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {relatedProducts.slice(0, 3).map((product) => {
                  const specsSource = language === "en" ? product.specs_en
                    : language === "hy" ? (product.specs_en)
                    : language === "ru" ? (product.specs_en)
                    : product.specs_ka;
                  const specsString = specsSource && typeof specsSource === 'object'
                    ? Object.entries(specsSource as Record<string, string | number>).slice(0, 1).map(([key, value]) => `${key}: ${value}`).join(', ')
                    : '';

                  return (
                    <ProductCard
                      key={product.id}
                      name={getLocalizedField(product, "name", language)}
                      image={product.image_url || "/placeholder.svg"}
                      specs={specsString}
                      link={getProductPath(
                        product.category?.parent?.slug || product.category?.slug || null,
                        product.category?.parent ? (product.category?.slug || null) : null,
                        product.slug || null,
                        language
                      )}
                    />
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Other Recent Stories */}
        {recentStories.length > 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-10">
                <div className="space-y-2">
                  <h2 className="text-3xl font-semibold text-foreground md:text-4xl">
                    {t("მეტი წარმატების ისტორია", "More Success Stories")}
                  </h2>
                </div>
                <Link
                  href={language === "en" ? "/en/success-stories" : language === "ru" ? "/ru/success-stories" : language === "hy" ? "/hy/success-stories" : "/success-stories"}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-smooth hover:gap-3"
                  >
                  {t("ნახეთ ყველა ისტორია", "View all stories")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {recentStories.map((recentStory) => {
                  const recentTitle = getLocalizedField(recentStory, "title", language);
                  const recentExcerpt = getLocalizedField(recentStory, "excerpt", language);
                  const recentCustomerName = getLocalizedField(recentStory, "customer_name", language);
                  const recentLocation = getLocalizedField(recentStory, "customer_location", language);

                  return (
                    <Link
                      key={recentStory.id}
                      href={getSuccessStoryPath(recentStory)}
                      className="group"
                    >
                      <Card className="overflow-hidden rounded-[28px] border border-border/60 bg-white shadow-soft transition-smooth hover:shadow-medium hover:border-primary/40 h-full">
                        <div className="relative h-48 overflow-hidden">
                          {recentStory.featured_image_url ? (
                            <img
                              src={recentStory.featured_image_url}
                              alt={recentTitle}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                              <Trophy className="h-12 w-12 text-primary/40" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-6">
                          <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-smooth">
                            {recentTitle}
                          </h3>
                          {recentExcerpt && (
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {recentExcerpt}
                            </p>
                          )}
                          <div className="space-y-1 text-xs text-muted-foreground">
                            {recentCustomerName && (
                              <div className="font-semibold text-foreground">{recentCustomerName}</div>
                            )}
                            {recentLocation && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{recentLocation}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="relative overflow-hidden bg-primary py-20">
          <div className="absolute inset-0 -z-10 bg-hero-grid opacity-20" />
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-primary-foreground md:text-4xl mb-6">
              {t("მზად ხართ მიაღწიოთ მსგავს შედეგებს?", "Ready to achieve similar results?", "Готовы достичь похожих результатов?")}
            </h2>
            <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto mb-8">
              {t("დაგვიკავშირდით ჩვენს გუნდთან, რათა გაიგოთ, როგორ შეუძლია ჩვენს იტალიურ აგროტექნიკას შეცვალოს თქვენი ოპერაციები.", "Get in touch with our team to learn how our Italian agricultural equipment can transform your operations.", "Свяжитесь с нашей командой, чтобы узнать, как наше итальянское сельскохозяйственное оборудование может изменить ваши операции.")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={language === "en" ? "/en/contact" : language === "ru" ? "/ru/contact" : language === "hy" ? "/hy/contact" : "/contact"}>
                <button className="inline-flex items-center justify-center rounded-full bg-white text-primary px-8 py-3 text-base font-semibold transition-smooth hover:bg-white/90">
                  {t("დაგვიკავშირდით", "Contact us")}
                </button>
              </Link>
              <Link href={language === "en" ? "/en/success-stories" : language === "ru" ? "/ru/success-stories" : language === "hy" ? "/hy/success-stories" : "/success-stories"}>
                <button className="inline-flex items-center justify-center rounded-full border-2 border-white text-white px-8 py-3 text-base font-semibold transition-smooth hover:bg-white/10">
                  {t("ნახეთ მეტი", "More stories")}
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default SuccessStoryDetail;
