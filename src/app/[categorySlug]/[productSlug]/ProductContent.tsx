"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProductCard from "@/components/ProductCard";
import { getCategoryPath, getProductPath, getCanonicalUrl } from "@/utils/urlHelpers";
import type { Json } from "@/integrations/supabase/types";
import QuoteRequestDialog from "@/components/QuoteRequestDialog";
import DOMPurify from "dompurify";
import type { ProductWithCategory, Language } from "@/lib/data/types";
import { getLocalizedField } from "@/utils/languageFields";

interface ProductContentProps {
  product: ProductWithCategory;
  relatedProducts: ProductWithCategory[];
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

const ProductContent = ({ product, relatedProducts, language }: ProductContentProps) => {
  const t = createTranslate(language);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quoteOpen, setQuoteOpen] = useState(false);

  // Gallery images from product data only
  const galleryImages = useMemo(() => {
    const images = new Set<string>();
    if (product?.image_url && typeof product.image_url === "string") {
      images.add(product.image_url);
    }
    if (product?.gallery_image_urls && Array.isArray(product.gallery_image_urls)) {
      product.gallery_image_urls.forEach((url) => {
        if (typeof url === "string" && url.trim().length > 0) {
          images.add(url);
        }
      });
    }
    return Array.from(images);
  }, [product?.gallery_image_urls, product?.image_url]);

  const showGalleryControls = galleryImages.length > 1;
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const resetTouchRefs = () => {
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const handleNextImage = () => {
    if (!showGalleryControls) return;
    setSelectedImage((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrevImage = () => {
    if (!showGalleryControls) return;
    setSelectedImage((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!showGalleryControls) return;
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!showGalleryControls || touchStartXRef.current === null) return;
    touchEndXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = () => {
    if (
      !showGalleryControls ||
      touchStartXRef.current === null ||
      touchEndXRef.current === null
    ) {
      resetTouchRefs();
      return;
    }

    const deltaX = touchStartXRef.current - touchEndXRef.current;
    const swipeThreshold = 40;

    if (Math.abs(deltaX) > swipeThreshold) {
      if (deltaX > 0) {
        handleNextImage();
      } else {
        handlePrevImage();
      }
    }

    resetTouchRefs();
  };

  // Parse specs from JSON
  const parseSpecs = (specsData: Json | null): Record<string, string | number> => {
    if (!specsData) return {};
    if (Array.isArray(specsData) && specsData.length > 0 && typeof specsData[0] === 'object') {
      return specsData[0] as Record<string, string | number>;
    }
    if (typeof specsData === 'object' && specsData !== null && !Array.isArray(specsData)) {
      return specsData as Record<string, string | number>;
    }
    return {};
  };

  const specsForLanguage = (() => {
    if (language === "en") return product?.specs_en || null;
    if (language === "hy") return product?.specs_en || null;
    return product?.specs_ka || null;
  })();

  const specs = {
    current: parseSpecs(specsForLanguage),
  };

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string | null): string | null => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const youtubeVideoId = getYouTubeVideoId(product?.video_url || null);
  const videoUrl = product?.video_url || null;
  const isYouTube = !!youtubeVideoId;
  const isFacebook = videoUrl ? /facebook\.com|fb\.watch/i.test(videoUrl) : false;
  const hasVideoUrl = !!videoUrl && videoUrl.trim().length > 0;

  // Convert specs to display format
  const allSpecs = Object.entries(specs.current || {})
    .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== "")
    .map(([key, value]) => ({
      label: key,
      value: String(value),
    }));

  const hasAnySpecs = allSpecs.length > 0;
  const productWithAdditionalInfo = product as { additional_info_en?: string; additional_info_ka?: string } | undefined;
  const additionalInfo = language === "en" ? productWithAdditionalInfo?.additional_info_en : language === "hy" ? (productWithAdditionalInfo?.additional_info_en) : productWithAdditionalInfo?.additional_info_ka;
  const hasAdditionalInfo = typeof additionalInfo === "string" && additionalInfo.trim() !== "";

  const videoDescriptionEn = product?.video_description_en;
  const videoDescriptionKa = product?.video_description_ka;
  const videoDescriptionPreferred =
    language === "en" || language === "hy"
      ? (typeof videoDescriptionEn === "string" && videoDescriptionEn.trim() ? videoDescriptionEn : videoDescriptionKa)
      : (typeof videoDescriptionKa === "string" && videoDescriptionKa.trim() ? videoDescriptionKa : videoDescriptionEn);
  const videoDescription = typeof videoDescriptionPreferred === "string" ? videoDescriptionPreferred : "";
  const hasVideoDescription = videoDescription.trim().length > 0;

  const fallbackDescriptionPreferred =
    language === "en" || language === "hy"
      ? (typeof product?.description_en === "string" && product.description_en.trim()
          ? product.description_en
          : product?.description_ka)
      : (typeof product?.description_ka === "string" && product.description_ka.trim()
          ? product.description_ka
          : product?.description_en);
  const fallbackDescription = typeof fallbackDescriptionPreferred === "string" ? fallbackDescriptionPreferred : "";
  const hasFallbackDescription = fallbackDescription.trim().length > 0;

  const performanceHighlights = hasVideoDescription
    ? [
        {
          title: t("ვიდეოს შეჯამება", "Video summary", undefined, "Տdelays delays ամdelays delays"),
          description: videoDescription,
        },
      ]
    : hasFallbackDescription
    ? [
        {
          title: t("ძირითადი მახასიათებლები", "Key Features", undefined, "Հdelays delays մնdelays delays delays"),
          description: fallbackDescription,
        },
      ]
    : [];
  const performanceHeading = hasVideoDescription
    ? language === "en"
      ? "Video overview"
      : "ვიდეოს მიმოხილვა"
    : null;

  // Product path
  const productPath = useMemo(() => {
    const category = product.category;
    const parent = category?.parent;
    const baseSlug = parent?.slug_en || category?.slug_en || null;
    const childSlug = parent ? category?.slug_en || null : null;
    const productSlug = product.slug_en || null;

    return getProductPath(baseSlug, childSlug, productSlug, language);
  }, [language, product]);

  const categoryName = product?.category
    ? (product.category.parent
        ? getLocalizedField(product.category.parent, "name", language)
        : getLocalizedField(product.category, "name", language))
    : null;

  const productName = getLocalizedField(product, "name", language);
  const productDescription = getLocalizedField(product, "description", language);

  const displayRelatedProducts = useMemo(
    () => relatedProducts.filter((item) => item.id !== product?.id).slice(0, 3),
    [product?.id, relatedProducts]
  );

  const shouldShowRelatedSection = displayRelatedProducts.length > 0;

  return (
    <>
      <main className="bg-background pb-24">
        <section className="relative overflow-hidden pb-10 pt-12 md:pt-14">
          <div className="absolute inset-0 -z-10 bg-background surface-gradient" />
          <div className="absolute right-[-15%] top-[-25%] hidden h-[420px] w-[420px] rounded-full bg-primary/15 blur-3xl lg:block" />

          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href={language === "en" ? "/en" : language === "hy" ? "/" : "/"} className="transition-smooth hover:text-foreground">
                {t("მთავარი", "Home", undefined, "Գdelays delays delays")}
              </Link>
              {product?.category && (
                <>
                  <span>/</span>
                  <Link
                    href={getCategoryPath((product.category as { slug_en?: string }).slug_en || null, language)}
                    className="transition-smooth hover:text-foreground"
                  >
                    {getLocalizedField(product.category, "name", language)}
                  </Link>
                  <span>/</span>
                  <span className="text-foreground">
                    {productName}
                  </span>
                </>
              )}
            </nav>

            <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <div className="relative overflow-hidden rounded-[32px] border border-border/60 bg-white/90 p-4 shadow-soft">
                  {galleryImages.length > 0 ? (
                    <div
                      className="flex h-[420px] w-full items-center justify-center rounded-[24px] bg-muted/30"
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      <img
                        src={galleryImages[selectedImage]}
                        alt={productName}
                        className="max-h-full max-w-full object-contain"
                        loading={selectedImage === 0 ? "eager" : "lazy"}
                        fetchPriority={selectedImage === 0 ? "high" : "low"}
                      />
                    </div>
                  ) : (
                    <div className="h-[420px] w-full rounded-[24px] bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">
                        {t("სურათი არ არის", "No image available", undefined, "Պatas delays հdelays ս delays delays չէ")}
                      </span>
                    </div>
                  )}
                  {showGalleryControls && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrevImage}
                        className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-muted-foreground shadow-soft transition-smooth hover:text-foreground"
                        aria-label={t("წინა სურათი", "Previous image", undefined, "Նdelays delays պatas delays ը")}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextImage}
                        className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-muted-foreground shadow-soft transition-smooth hover:text-foreground"
                        aria-label={t("შემდეგი სურათი", "Next image", undefined, "Հdelays delaysdelays պatas delays delays")}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-background/80 px-3 py-1 text-xs font-semibold text-muted-foreground shadow-soft">
                          {selectedImage + 1} / {galleryImages.length}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                {galleryImages.length > 1 && (
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {galleryImages.map((image, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedImage(index)}
                        className={`overflow-hidden rounded-2xl border border-border/60 bg-white/80 p-2 shadow-soft transition-smooth ${
                          selectedImage === index ? "ring-2 ring-primary" : ""
                        }`}
                      >
                        <div className="flex h-24 w-full items-center justify-center rounded-xl bg-muted/20">
                          <img
                            src={image}
                            alt={`${productName} - Gallery image ${index + 1}`}
                            className="max-h-full max-w-full object-contain"
                            loading="lazy"
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                    {t("პროდუქტის დეტალები", "Product Details", undefined, " Delays delays ь մdelays ոdelays delays մdelays delays delays delays")}
                  </span>
                  {/* H1 - Now server-rendered and visible to bots! */}
                  <h1 className="mt-4 text-4xl font-bold leading-tight text-foreground md:text-5xl">
                    {productName}
                  </h1>
                  {productDescription && (
                    <div
                      className="mt-4 text-base text-muted-foreground md:text-lg prose prose-sm max-w-none prose-p:text-muted-foreground prose-p:mb-4 prose-ul:text-muted-foreground prose-ul:mb-4 prose-ol:text-muted-foreground prose-ol:mb-4 prose-li:mb-1 prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(productDescription) }}
                    />
                  )}
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button
                    type="button"
                    size="lg"
                    className="h-12 w-full rounded-full px-8 text-base"
                    onClick={() => setQuoteOpen(true)}
                  >
                    {t("მიიღეთ შეთავაზება", "Request pricing", undefined, "Սstyle delays delays delays delays delays")}
                  </Button>
                  <Link href={language === "en" ? "/en/contact" : language === "hy" ? "/contact" : "/contact"} className="sm:w-auto">
                    <Button size="lg" variant="outline" className="h-12 w-full rounded-full px-8 text-base">
                      {t("დაუკავშირდით ინჟინერს", "Talk to an engineer", undefined, "Խstyle delays delays delays ь ի delays ых delays delays delays ь delays delays")}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {hasAnySpecs && (
          <section className="py-10">
            <div className="container mx-auto px-4">
              <Card className="rounded-[28px] border border-border/60 bg-white/95 shadow-soft">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold text-foreground">
                    {t("კონფიგურაცია", "Configuration", undefined, "Կdelays delays delays delays delays մdelays delays ուdelays")}
                  </h2>
                  <ul className="mt-6 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                    {allSpecs.map((spec) => (
                      <li
                        key={spec.label}
                        className="flex flex-col gap-1 rounded-2xl border border-border/50 bg-muted/40 px-4 py-3 text-sm"
                      >
                        <span className="font-medium text-foreground/80 sm:text-base">{spec.label}</span>
                        <span className="font-semibold text-foreground sm:text-base">{spec.value}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {hasAdditionalInfo && (
          <section className="py-10">
            <div className="container mx-auto px-4">
              <Card className="rounded-[28px] border border-border/60 bg-white/95 shadow-soft">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold text-foreground mb-6">
                    {t("დამატებითი ინფორმაცია", "Additional Information", undefined, "Լraс delays delays delays delays delays delays")}
                  </h2>
                  <div
                    className="prose prose-sm max-w-none text-muted-foreground prose-p:text-muted-foreground prose-p:mb-4 prose-ul:text-muted-foreground prose-ul:mb-4 prose-ol:text-muted-foreground prose-ol:mb-4 prose-li:mb-1 prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(additionalInfo!) }}
                  />
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        <section className="relative overflow-hidden bg-muted/50 py-24">
          <div className="absolute inset-0 -z-10 bg-hero-grid opacity-20" />
          <div className="container mx-auto grid gap-10 px-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                {t("წარმადობა", "Performance", undefined, "Ա delays delays ыdelays оdelays уdelays delays юdelays delays")}
              </span>
              {performanceHeading && (
                <h2 className="text-3xl font-bold text-foreground md:text-4xl">
                  {performanceHeading}
                </h2>
              )}
              {performanceHighlights.length > 0 && (
                <div className="space-y-4">
                  {performanceHighlights.map((item) => (
                    <div
                      key={item.title}
                      className="group flex items-start gap-4 rounded-3xl border border-border/60 bg-white p-5 shadow-soft transition-smooth hover:border-primary/40 hover:shadow-medium"
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <CheckCircle2 className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                        <div
                          className="mt-1 text-sm text-muted-foreground prose prose-sm max-w-none prose-p:text-muted-foreground prose-p:mb-2 prose-ul:text-muted-foreground prose-ul:mb-2 prose-ol:text-muted-foreground prose-ol:mb-2 prose-li:mb-1 prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
                          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.description) }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[32px] border border-border/60 bg-white/90 p-8 shadow-soft">
              {hasVideoUrl ? (
                <div className="space-y-4">
                  <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
                    {isYouTube && youtubeVideoId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                        title={t("პროდუქტის დემონსტრაციის ვიდეო", "Product demonstration video", undefined, "Ապatas delays delays ыdelays ոdelays delays delays delays delays delays delays")}
                        className="h-full w-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ display: 'block' }}
                      />
                    ) : isFacebook ? (
                      <iframe
                        src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(videoUrl)}&show_text=false&height=315`}
                        title={t("პროდუქტის დემონსტრაციის ვიდეო", "Product demonstration video", undefined, " Delays delays ыdelays delays оdelays delays delays delays")}
                        className="h-full w-full border-0"
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                        allowFullScreen
                        style={{ display: 'block' }}
                      />
                    ) : (
                      <iframe
                        src={videoUrl}
                        title={t("პროდუქტის დემონსტრაციის ვიდეო", "Product demonstration video", undefined, "Апата delays")}
                        className="h-full w-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                        style={{ display: 'block' }}
                      />
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-foreground">
                      {t("ნახეთ პროდუქტი მუშაობისას", "Watch the product in action", undefined, "Дidis delays тdelays ыделен delays аdelay ыdelays delays delays")}
                    </h3>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary shadow-soft">
                    <span className="text-2xl font-semibold">▶</span>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-foreground">
                    {t("ნახეთ პროდუქტი მუშაობისას", "Watch the product in action", undefined, "Delays delaysы delays delays")}
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {language === "en"
                      ? "Product demonstration video will be available shortly."
                      : "პროდუქტის დემონსტრაციის ვიდეო მალე იქნება."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {shouldShowRelatedSection && (
          <section className="py-24">
            <div className="container mx-auto px-4">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                    {t("მსგავსი მოდელები", "Related models", undefined, "Հdelays delays delays delays")}
                  </span>
                  <h2 className="text-3xl font-semibold text-foreground md:text-4xl">
                    {language === "en" ? "Explore related products" : "გაეცანით მსგავს პროდუქტებს"}
                  </h2>
                </div>
              </div>

              <div className="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {displayRelatedProducts.map((item) => {
                  const specs = item.specs_en && typeof item.specs_en === "object"
                    ? Object.entries(item.specs_en as Record<string, string | number>).slice(0, 1).map(([key, value]) => `${key}: ${value}`).join(", ")
                    : "";

                  const specsKa = item.specs_ka && typeof item.specs_ka === "object"
                    ? Object.entries(item.specs_ka as Record<string, string | number>).slice(0, 1).map(([key, value]) => `${key}: ${value}`).join(", ")
                    : "";

                  return (
                    <ProductCard
                      key={item.id}
                      name={getLocalizedField(item, "name", language)}
                      image={item.image_url || "/placeholder.svg"}
                      specs={language === "en" || language === "hy" ? specs : specsKa}
                      link={getProductPath(
                        item.category?.parent?.slug_en || item.category?.slug_en || null,
                        item.category?.parent ? item.category?.slug_en || null : null,
                        item.slug_en || null,
                        language
                      )}
                    />
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-4 backdrop-blur-sm lg:hidden">
        <Button className="w-full rounded-full" type="button" onClick={() => setQuoteOpen(true)}>
          {t("მიიღეთ შეთავაზება", "Request pricing", undefined, "Сты delays delays")}
        </Button>
      </div>

      <QuoteRequestDialog
        open={quoteOpen}
        onOpenChange={setQuoteOpen}
        productName={productName}
        productSlug={product.slug_en || ""}
        categoryName={categoryName}
        productPath={productPath}
      />
    </>
  );
};

export default ProductContent;
