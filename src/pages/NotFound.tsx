"use client";

/**
 * 404 Not Found Page
 * SEO-friendly 404 page with proper status codes, hreflang tags, and navigation
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { SEOHead } from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { getBaseUrl } from "@/utils/config";

const NotFound = () => {
  const pathname = usePathname();
  const { language, t } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", pathname);
  }, [pathname]);

  const notFoundTitle = language === "en" 
    ? "Page Not Found - AGROIT" 
    : language === "ru"
    ? "Страница не найдена - AGROIT"
    : language === "hy"
    ? "Page Not Found - AGROIT"
    : "გვერდი არ მოიძებნა - AGROIT";

  const notFoundDescription = language === "en"
    ? "The page you're looking for doesn't exist. Return to our homepage to explore Italian agricultural equipment in Georgia."
    : language === "ru"
    ? "Страница, которую вы ищете, не существует. Вернитесь на главную страницу, чтобы изучить итальянское сельскохозяйственное оборудование в Грузии."
    : language === "hy"
    ? "The page you're looking for doesn't exist. Return to our homepage to explore Italian agricultural equipment in Georgia."
    : "გვერდი რომელსაც ეძებთ არ არსებობს. დაბრუნდით მთავარ გვერდზე, რათა გაეცნოთ იტალიურ აგროტექნიკას საქართველოში.";

  const homePath = language === "en" ? "/en" : language === "ru" ? "/ru" : language === "hy" ? "/hy" : "/";

  // Generate alternate URLs for hreflang tags on 404 page
  // These should point to the homepage in each language
  const baseUrl = getBaseUrl();
  const alternateKaUrl = baseUrl;
  const alternateEnUrl = `${baseUrl}/en`;
  const alternateHyUrl = `${baseUrl}/hy`;

  return (
    <>
      <SEOHead
        title={notFoundTitle}
        description={notFoundDescription}
        path={pathname || "/"}
      />
      {/* Additional hreflang tags for 404 page - point to homepage in each language */}
      <Helmet>
        <link rel="alternate" hrefLang="ka" href={alternateKaUrl} />
        <link rel="alternate" hrefLang="en" href={alternateEnUrl} />
        <link rel="alternate" hrefLang="hy" href={alternateHyUrl} />
        <link rel="alternate" hrefLang="x-default" href={alternateKaUrl} />
        {/* Robots meta tag for 404 pages - noindex but follow links and hreflang */}
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <main className="flex min-h-[60vh] items-center justify-center bg-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="mx-auto max-w-md space-y-6">
            <div className="space-y-2">
              <h1 className="text-8xl font-bold text-primary">404</h1>
              <h2 className="text-3xl font-semibold text-foreground">
                {language === "en" 
                  ? "Page Not Found" 
                  : language === "ru"
                  ? "Страница не найдена"
                  : language === "hy"
                  ? "Page Not Found"
                  : "გვერდი არ მოიძებნა"}
              </h2>
              <p className="text-lg text-muted-foreground">
                {notFoundDescription}
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href={homePath}>
                <Button size="lg" className="w-full sm:w-auto">
                  <Home className="mr-2 h-4 w-4" />
                  {language === "en" 
                    ? "Go to Homepage" 
                    : language === "ru"
                    ? "На главную"
                    : language === "hy"
                    ? "Go to Homepage"
                    : "მთავარ გვერდზე"}
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => window.history.back()}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {language === "en" 
                  ? "Go Back" 
                  : language === "ru"
                  ? "Назад"
                  : language === "hy"
                  ? "Go Back"
                  : "უკან"}
              </Button>
            </div>

            <div className="pt-8 text-sm text-muted-foreground">
              <p>
                {language === "en"
                  ? "Looking for our products? Try:"
                  : language === "ru"
                  ? "Ищете нашу продукцию? Попробуйте:"
                  : language === "hy"
                  ? "Looking for our products? Try:"
                  : "პროდუქციას ეძებთ? სცადეთ:"}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-4">
                <Link 
                  href={language === "en" ? "/en/products" : language === "ru" ? "/ru/products" : language === "hy" ? "/hy/products" : "/products"}
                  className="text-primary hover:underline"
                >
                  {language === "en" ? "Products" : language === "ru" ? "Продукция" : language === "hy" ? "Products" : "პროდუქცია"}
                </Link>
                <Link 
                  href={language === "en" ? "/en/contact" : language === "ru" ? "/ru/contact" : language === "hy" ? "/hy/contact" : "/contact"}
                  className="text-primary hover:underline"
                >
                  {language === "en" ? "Contact" : language === "ru" ? "Контакты" : language === "hy" ? "Contact" : "კონტაქტი"}
                </Link>
                <Link 
                  href={language === "en" ? "/en/about" : language === "ru" ? "/ru/about" : language === "hy" ? "/hy/about" : "/about"}
                  className="text-primary hover:underline"
                >
                  {language === "en" ? "About" : language === "ru" ? "О нас" : language === "hy" ? "About" : "ჩვენ შესახებ"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default NotFound;
