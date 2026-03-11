"use client";

import Link from "next/link";
import { Trophy, MapPin, Building2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { SEOHead } from "@/components/SEOHead";
import { usePublishedSuccessStories } from "@/hooks/useSuccessStories";
import { generateSlug } from "@/utils/urlHelpers";
import type { Database } from "@/integrations/supabase/types";
import { SuccessStoriesPageSkeleton } from "@/components/skeletons/PageSkeletons";
import { getLocalizedField } from "@/utils/languageFields";

type SuccessStory = Database["public"]["Tables"]["success_stories"]["Row"];

const SuccessStories = () => {
  const { language, t } = useLanguage();
  const { data: stories = [], isLoading, error } = usePublishedSuccessStories();

  // Filter featured stories
  const featuredStories = stories.filter(story => story.is_featured);
  const regularStories = stories.filter(story => !story.is_featured);

  // SEO metadata
  const seoTitle = t("წარმატების ისტორიები - მომხმარებლების შედეგები", "Success Stories - Customer Results & Testimonials");

  const seoDescription = t("წაიკითხეთ ჩვენი მომხმარებლების რეალური წარმატების ისტორიები საქართველოს მასშტაბით. გაეცანით, როგორ დაეხმარა ჩვენი იტალიური აგროტექნიკა ფერმერებსა და ვენახის მეპატრონეებს მათი ოპერაციების გაუმჯობესებასა და პროდუქტიულობის გაზრდაში.", "Read real success stories from our customers across Georgia. Discover how our Italian agricultural equipment has helped farmers and vineyard owners improve their operations and increase productivity.");

  const currentPath = language === "en"
    ? "/en/success-stories"
    : language === "ru"
    ? "/ru/success-stories"
    : language === "hy"
    ? "/hy/success-stories"
    : "/success-stories";

  const seoMeta = (
    <SEOHead
      title={seoTitle}
      description={seoDescription}
      path={currentPath}
      type="website"
      keywords={t("წარმატების ისტორიები, მომხმარებლების მიმოხილვები, აგროტექნიკის შედეგები, ფერმერული წარმატება, ვენახის აღჭურვილობა, საქართველო", "success stories, customer testimonials, agricultural equipment results, farming success, vineyard equipment, Georgia")}
    />
  );

  const resolveStorySlug = (story: SuccessStory): string | null => {
    const preference = [story.slug_en, story.slug_ru, story.slug_ka];

    const existingSlug = preference.find(
      (candidate): candidate is string => typeof candidate === "string" && candidate.trim().length > 0,
    );

    if (existingSlug) {
      return existingSlug;
    }

    const fallbackTitle =
      language === "en"
        ? story.title_en || story.title_ka || story.title_ru || ""
        : language === "ru"
        ? story.title_en || story.title_ru || story.title_ka || ""
        : language === "hy"
        ? story.title_en || story.title_ka || story.title_ru || ""
        : story.title_ka || story.title_en || story.title_ru || "";

    if (!fallbackTitle) {
      return null;
    }

    const isGeorgian = language !== "en" && language !== "ru" && language !== "hy";
    return generateSlug(fallbackTitle, isGeorgian);
  };

  // Get success story path helper - generates slug from available data if missing
  const getSuccessStoryPath = (story: SuccessStory) => {
    const resolvedSlug = resolveStorySlug(story);
    if (!resolvedSlug) {
      if (language === "en") return "/en/success-stories";
      if (language === "ru") return "/ru/success-stories";
      if (language === "hy") return "/hy/success-stories";
      return "/success-stories";
    }
    if (language === "en") return `/en/success-story/${resolvedSlug}`;
    if (language === "ru") return `/ru/success-story/${resolvedSlug}`;
    if (language === "hy") return `/hy/success-story/${resolvedSlug}`;
    return `/success-story/${resolvedSlug}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        {seoMeta}
        <SuccessStoriesPageSkeleton />
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        {seoMeta}
        <main className="flex min-h-[60vh] items-center justify-center bg-background pb-24">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-foreground">
              {t("ისტორიების ჩატვირთვა შეუძლებელია", "Unable to Load Stories", undefined, "Հնարավոր չէ բեռնել պատմությունները")}
            </h1>
            <p className="mb-6 text-muted-foreground">
              {t("წარმატების ისტორიების ჩატვირთვა ვერ მოხერხდა. გთხოვთ სცადოთ მოგვიანებით.", "We're having trouble loading success stories. Please try again later.", undefined, "Հաջողության պատմությունների բեռնման խնդիր կա: Խնդրում ենք փորձել ավելի ուշ:")}
            </p>
            <Link href={language === "en" ? "/en" : language === "ru" ? "/ru" : language === "hy" ? "/hy" : "/"}>
              <button className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-smooth hover:bg-primary/90">
                {t("მთავარზე დაბრუნება", "Go Home", undefined, "Գլխավոր էջ")}
              </button>
            </Link>
          </div>
        </main>
      </>
    );
  }

  // Empty state
  if (stories.length === 0) {
    return (
      <>
        {seoMeta}
        <main className="bg-background pb-24">
          <section className="relative overflow-hidden pb-24 pt-20 md:pt-28">
            <div className="absolute inset-0 -z-10 bg-background surface-gradient" />
            <div className="absolute right-[-15%] top-[-25%] hidden h-[420px] w-[420px] rounded-full bg-primary/15 blur-3xl lg:block" />

            <div className="container mx-auto px-4">
              <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-10">
                <Link href={language === "en" ? "/en" : language === "ru" ? "/ru" : language === "hy" ? "/hy" : "/"} className="transition-smooth hover:text-foreground">
                  {t("მთავარი", "Home", undefined, "Գլխավոր")}
                </Link>
                <span>/</span>
                <span className="text-foreground">
                  {t("წარმატების ისტორიები", "Success Stories", undefined, "Հաջողության պատմություններ")}
                </span>
              </nav>

              <div className="text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary mb-6">
                  <Trophy className="h-4 w-4" />
                  {t("მომხმარებლების წარმატება", "Customer Success", undefined, "Հաճախորդների հաջողությունը")}
                </div>
                <h1 className="text-4xl font-bold leading-tight text-foreground md:text-5xl mb-6">
                  {t("წარმატების ისტორიები", "Success Stories", undefined, "Հաջողության պատմություններ")}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {t("წარმატების ისტორიები ჯერ არ გამოქვეყნებულა. მალე ისევ შემოხედეთ და წაიკითხეთ ჩვენი მომხმარებლების რეალური შედეგები.", "No success stories have been published yet. Check back soon to read about real results from our customers.")}
                </p>
              </div>
            </div>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      {seoMeta}

      <main className="bg-background pb-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden pb-16 pt-20 md:pt-28">
          <div className="absolute inset-0 -z-10 bg-background surface-gradient" />
          <div className="absolute right-[-15%] top-[-25%] hidden h-[420px] w-[420px] rounded-full bg-primary/15 blur-3xl lg:block" />

          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-10">
              <Link href={language === "en" ? "/en" : language === "ru" ? "/ru" : language === "hy" ? "/hy" : "/"} className="transition-smooth hover:text-foreground">
                {t("მთავარი", "Home", undefined, "Գլխավոր")}
              </Link>
              <span>/</span>
              <span className="text-foreground">
                {t("წარმატების ისტორიები", "Success Stories", undefined, "Հաջողության պատմություններ")}
              </span>
            </nav>

            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary mb-6">
                <Trophy className="h-4 w-4" />
                {t("მომხმარებლების წარმატება", "Customer Success", undefined, "Հաճախորդների հաջողությունը")}
              </div>
              <h1 className="text-4xl font-bold leading-tight text-foreground md:text-5xl mb-6">
                {t("წარმატების ისტორიები", "Success Stories", undefined, "Հաջողության պատմություններ")}
              </h1>
              <p className="text-lg text-muted-foreground">
                {t("წაიკითხეთ ჩვენი მომხმარებლების რეალური წარმატების ისტორიები საქართველოს მასშტაბით. გაეცანით, როგორ შეცვალა ჩვენმა იტალიურმა აგროტექნიკამ მათი ოპერაციები.", "Read real success stories from our customers across Georgia. Discover how our Italian agricultural equipment has transformed their operations.")}
              </p>
            </div>
          </div>
        </section>

        {/* Featured Stories */}
        {featuredStories.length > 0 && (
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-3 mb-10">
                <Trophy className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">
                  {t("გამორჩეული წარმატების ისტორიები", "Featured Success Stories", undefined, "Առանձնացված հաջողության պատմություններ")}
                </h2>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featuredStories.map((story) => {
                  const title = getLocalizedField(story, "title", language);
                  const excerpt = getLocalizedField(story, "excerpt", language);
                  const customerName = getLocalizedField(story, "customer_name", language);
                  const location = getLocalizedField(story, "customer_location", language);

                  return (
                    <Link
                      key={story.id}
                      href={getSuccessStoryPath(story)}
                      className="group"
                    >
                      <Card className="overflow-hidden rounded-[28px] border border-border/60 bg-white shadow-soft transition-smooth hover:shadow-medium hover:border-primary/40 h-full">
                        <div className="relative h-64 overflow-hidden">
                          {story.featured_image_url ? (
                            <img
                              src={story.featured_image_url}
                              alt={title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                              <Trophy className="h-16 w-16 text-primary/40" />
                            </div>
                          )}
                          <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                            {t("გამორჩეული", "Featured", undefined, "Առանձնացված")}
                          </Badge>
                        </div>
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-smooth">
                            {title}
                          </h3>
                          {excerpt && (
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                              {excerpt}
                            </p>
                          )}
                          <div className="space-y-2 text-sm text-muted-foreground">
                            {customerName && (
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">{customerName}</span>
                              </div>
                            )}
                            {story.customer_company && (
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                <span>{story.customer_company}</span>
                              </div>
                            )}
                            {location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{location}</span>
                              </div>
                            )}
                          </div>
                          <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-primary">
                            {t("წაიკითხეთ სრული ისტორია", "Read full story", undefined, "Կարդալ ամբողջ պատմությունը")}
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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

        {/* All Stories */}
        {regularStories.length > 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-foreground mb-10">
                {t("ყველა წარმატების ისტორია", "All Success Stories", undefined, "Բոլոր հաջողության պատմությունները")}
              </h2>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {regularStories.map((story) => {
                  const title = getLocalizedField(story, "title", language);
                  const excerpt = getLocalizedField(story, "excerpt", language);
                  const customerName = getLocalizedField(story, "customer_name", language);
                  const location = getLocalizedField(story, "customer_location", language);

                  return (
                    <Link
                      key={story.id}
                      href={getSuccessStoryPath(story)}
                      className="group"
                    >
                      <Card className="overflow-hidden rounded-[28px] border border-border/60 bg-white shadow-soft transition-smooth hover:shadow-medium hover:border-primary/40 h-full">
                        <div className="relative h-64 overflow-hidden">
                          {story.featured_image_url ? (
                            <img
                              src={story.featured_image_url}
                              alt={title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                              <Trophy className="h-16 w-16 text-primary/40" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-smooth">
                            {title}
                          </h3>
                          {excerpt && (
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                              {excerpt}
                            </p>
                          )}
                          <div className="space-y-2 text-sm text-muted-foreground">
                            {customerName && (
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">{customerName}</span>
                              </div>
                            )}
                            {story.customer_company && (
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                <span>{story.customer_company}</span>
                              </div>
                            )}
                            {location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{location}</span>
                              </div>
                            )}
                          </div>
                          <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-primary">
                            {t("წაიკითხეთ სრული ისტორია", "Read full story", undefined, "Կարդալ ամբողջ պատմությունը")}
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
              {t("მზად ხართ დაწეროთ თქვენი წარმატების ისტორია?", "Ready to write your success story?", undefined, "Պատրաստ՞ եք գրել ձեր հաջողության պատմությունը?")}
            </h2>
            <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto mb-8">
              {t("შეუერთდით საქართველოს მასშტაბით ასობით კმაყოფილ მომხმარებელს, რომლებმაც შეცვალეს თავიანთი ოპერაციები ჩვენი იტალიური აგროტექნიკით.", "Join hundreds of satisfied customers across Georgia who have transformed their operations with our Italian agricultural equipment.")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={language === "en" ? "/en/contact" : language === "ru" ? "/ru/contact" : language === "hy" ? "/hy/contact" : "/contact"}>
                <button className="inline-flex items-center justify-center rounded-full bg-white text-primary px-8 py-3 text-base font-semibold transition-smooth hover:bg-white/90">
                  {t("დაგვიკავშირდით", "Get in touch", undefined, "Կապվեք մեզ")}
                </button>
              </Link>
              <Link href={language === "en" ? "/en/vineyard-equipment" : language === "ru" ? "/ru/vineyard-equipment" : language === "hy" ? "/hy/vineyard-equipment" : "/venaxis-teqnika"}>
                <button className="inline-flex items-center justify-center rounded-full border-2 border-white text-white px-8 py-3 text-base font-semibold transition-smooth hover:bg-white/10">
                  {t("დაათვალიერეთ აღჭურვილობა", "Browse equipment", undefined, "Դիտել սարքավորումները")}
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default SuccessStories;
