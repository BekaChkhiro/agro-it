"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/data/translations";
import { cn } from "@/lib/utils";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import logoImage from "@/assets/agroit-logo.webp";

interface SubCategory {
  id: string;
  name_en: string;
  name_ka: string;
  name_hy: string | null;
  slug: string | null;
  path_en: string | null;
  path_ka: string | null;
  path_hy: string | null;
  icon: string | null;
}

interface Category {
  id: string;
  name_en: string;
  name_ka: string;
  name_hy: string | null;
  slug: string | null;
  path_en: string | null;
  path_ka: string | null;
  path_hy: string | null;
  subcategories: SubCategory[];
}

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const [hoveredCategoryIndex, setHoveredCategoryIndex] = useState(-1);
  const [mobileProductsExpanded, setMobileProductsExpanded] = useState(false);
  // Initialize with null to prevent hydration mismatch, then set actual value after mount
  const [isScrolled, setIsScrolled] = useState<boolean | null>(null);
  const [expandedMobileCategoryId, setExpandedMobileCategoryId] = useState<string | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuContainerRef = useRef<HTMLDivElement | null>(null);
  const firstMenuLinkRef = useRef<HTMLAnchorElement | null>(null);
  const pathname = usePathname();
  const { language, t } = useLanguage();
  const resolvedLanguage = (language === "ru" || language === "hy") ? "en" : language;

  const closeMobileMenu = () => {
    setMobileProductsExpanded(false);
    setExpandedMobileCategoryId(null);
    setMobileMenuOpen(false);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen((prev) => {
      if (prev) {
        setMobileProductsExpanded(false);
        setExpandedMobileCategoryId(null);
      }
      return !prev;
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    // Set initial value immediately
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Use a stable default during SSR/initial render to prevent flicker
  const scrolled = isScrolled ?? false;

  // Fetch ALL categories for "Our Products" dropdown
  const { data: rawCategories, isLoading: loadingCategories, error: categoriesError } = useQuery({
    queryKey: ["all-categories"],
    queryFn: async () => {
      // Fetch ALL top-level categories (not filtered by show_in_nav)
      // Use select("*") to get all columns and handle slug field dynamically
      const { data: parentCategories, error: parentError } = await supabase
        .from("categories")
        .select("*")
        .is("parent_id", null)
        .order("display_order", { ascending: true });

      if (parentError) {
        console.error("Error fetching parent categories:", parentError);
        throw parentError;
      }

      // Map slug field - prefer English slug so URLs stay Latin-only
      const mappedCategories = (parentCategories || []).map((cat: Record<string, unknown>) => ({
        ...cat,
        // Always prefer the English slug so URLs stay latin-only across languages
        slug: (cat.slug_en as string) || (cat.slug as string) || (cat.slug_ka as string) || null
      }));


      // Fetch all subcategories
      const { data: allSubcategories, error: subError } = await supabase
        .from("categories")
        .select("*")
        .not("parent_id", "is", null)
        .order("display_order", { ascending: true });

      if (subError) {
        console.error("Error fetching subcategories:", subError);
        throw subError;
      }

      const mappedSubcategories = (allSubcategories || []).map((sub: Record<string, unknown>) => ({
        ...sub,
        // Keep subcategory URLs using the English slug as the primary option
        slug: (sub.slug_en as string) || (sub.slug as string) || (sub.slug_ka as string) || null
      }));


      return { parentCategories: mappedCategories, allSubcategories: mappedSubcategories };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Build category tree with memoization
  const categories = useMemo(() => {
    if (!rawCategories) return [];

    const { parentCategories, allSubcategories } = rawCategories;

    const builtCategories = (parentCategories || []).map((parent: Record<string, unknown>) => ({
      id: parent.id as string,
      name_en: parent.name_en as string,
      name_ka: parent.name_ka as string,
      name_hy: (parent.name_hy as string) || null,
      slug: parent.slug as string | null,
      path_en: parent.path_en as string | null,
      path_ka: parent.path_ka as string | null,
      path_hy: (parent.path_hy as string) || null,
      icon: (parent.icon as string) || null,
      subcategories: (allSubcategories || [])
        .filter((sub: Record<string, unknown>) => (sub.parent_id as string) === (parent.id as string))
        .map((sub: Record<string, unknown>) => ({
          id: sub.id as string,
          name_en: sub.name_en as string,
          name_ka: sub.name_ka as string,
          name_hy: (sub.name_hy as string) || null,
          slug: sub.slug as string | null,
          path_en: sub.path_en as string | null,
          path_ka: sub.path_ka as string | null,
          path_hy: (sub.path_hy as string) || null,
          icon: sub.icon as string | null,
        })),
    }));

    return builtCategories;
  }, [rawCategories]);

  const getPath = (pathKa: string | null, pathEn: string | null) => {
    const defaultPath = resolvedLanguage === "en" ? "/en" : "/";
    if (resolvedLanguage === "en") {
      return pathEn || defaultPath;
    }
    return pathKa || defaultPath;
  };

  const getAllProductsPath = () => {
    if (resolvedLanguage === "en") return "/en/products";
    return '/products';
  };

  const getCategoryPath = (slug: string | null) => {
    if (!slug) {
      if (resolvedLanguage === "en") return "/en";
      return '/';
    }

    if (resolvedLanguage === "en") return `/en/${slug}`;
    return `/${slug}`;
  };

  const isActive = (path: string) => {
    // Check if current path matches exactly or starts with this path (for parent categories)
    return pathname === path || (pathname ?? "").startsWith(`${path}/`);
  };

  const navLinkClass = (path: string) =>
    cn(
      "px-4 py-2.5 text-base font-semibold rounded-full transition-smooth whitespace-nowrap inline-flex items-center",
      isActive(path)
        ? "bg-gradient-to-r from-primary/15 to-primary/10 text-primary shadow-sm"
        : "text-foreground/70 hover:text-foreground hover:bg-gradient-to-r hover:from-primary/8 hover:to-primary/5",
    );

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const toggleButton = menuButtonRef.current;
    const body = document.body;
    const html = document.documentElement;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = html.style.overflow;
    const previousTouchAction = body.style.touchAction;

    body.style.overflow = "hidden";
    body.style.touchAction = "none";
    html.style.overflow = "hidden";

    const focusTarget = firstMenuLinkRef.current || mobileMenuContainerRef.current;
    focusTarget?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!mobileMenuContainerRef.current) return;

      if (event.key === "Escape") {
        event.preventDefault();
        setMobileProductsExpanded(false);
        setMobileMenuOpen(false);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableSelectors = [
        "a[href]",
        "button:not([disabled])",
        'input:not([disabled]):not([type="hidden"])',
        "select:not([disabled])",
        "textarea:not([disabled])",
        '[tabindex]:not([tabindex="-1"])'
      ];

      const focusableElements = Array.from(
        mobileMenuContainerRef.current.querySelectorAll<HTMLElement>(focusableSelectors.join(","))
      ).filter((element) => !element.hasAttribute("disabled") && element.tabIndex !== -1);

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (activeElement === firstElement || activeElement === mobileMenuContainerRef.current) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      body.style.overflow = previousBodyOverflow;
      body.style.touchAction = previousTouchAction;
      html.style.overflow = previousHtmlOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      toggleButton?.focus();
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50">
      <nav
        className={cn(
          "border-b transition-smooth relative backdrop-blur-md",
          scrolled
            ? "bg-white/95 shadow-lg border-primary/10"
            : "bg-gradient-to-b from-white/98 to-white/95 shadow-soft border-border/30",
        )}
      >
        {/* Top accent border */}
        <div className={cn(
          "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-light to-primary transition-opacity",
          scrolled ? "opacity-100" : "opacity-0"
        )} />
        <div
          className={cn(
            "container mx-auto flex items-center justify-between gap-4 px-4 py-4",
          )}
        >
          <Link
            href={getPath("/", "/en")}
            className="flex items-center gap-3 rounded-full border border-transparent px-3 py-2 transition-smooth hover:border-primary/20"
            aria-label={language === "en" || language === "hy" ? "Go to homepage" : language === "ru" ? "Перейти на главную" : "მთავარ გვერდზე დაბრუნება"}
          >
            <img src={typeof logoImage === 'string' ? logoImage : logoImage.src} alt="AGROIT" className="h-8 w-auto sm:h-9" />
            <span className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
              AGROIT
            </span>
          </Link>

          <div className="hidden lg:flex flex-1 items-center gap-0.5 justify-center">
            {/* Home */}
            <Link href={getPath("/", "/en")} className={navLinkClass(getPath("/", "/en"))}>
              {t(translations.nav.home.ka, translations.nav.home.en, undefined, translations.nav.home.hy)}
            </Link>

            {/* Our Products - dropdown with first and second level categories */}
            <div
              className="relative"
              onMouseEnter={() => {
                if (!loadingCategories && categories.length > 0) {
                  setProductsDropdownOpen(true);
                }
              }}
              onMouseLeave={() => setProductsDropdownOpen(false)}
              onBlur={(event) => {
                const nextFocusTarget = event.relatedTarget as Node | null;
                if (!event.currentTarget.contains(nextFocusTarget)) {
                  setProductsDropdownOpen(false);
                }
              }}
            >
              <Link
                href={getAllProductsPath()}
                className={cn(
                  navLinkClass(getAllProductsPath()),
                  "gap-1.5",
                  productsDropdownOpen && "bg-gradient-to-r from-primary/15 to-primary/10 text-primary shadow-sm"
                )}
                aria-expanded={productsDropdownOpen}
                aria-controls="products-dropdown"
                onFocus={() => {
                  if (!loadingCategories && categories.length > 0) {
                    setProductsDropdownOpen(true);
                  }
                }}
                onClick={() => setProductsDropdownOpen(false)}
              >
                {t(translations.nav.products.ka, translations.nav.products.en, undefined, translations.nav.products.hy)}
                {!loadingCategories && categories.length > 0 && (
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      productsDropdownOpen ? "rotate-180 text-primary" : "text-foreground/40",
                    )}
                  />
                )}
              </Link>

              {productsDropdownOpen && !loadingCategories && categories.length > 0 && (
                <div id="products-dropdown" className="absolute left-1/2 top-full z-40 w-[420px] max-w-[min(90vw,420px)] -translate-x-1/2 pt-3">
                  <div className="absolute left-1/2 top-3 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-primary/20 bg-white shadow-sm" />
                  <div
                    className="overflow-visible rounded-2xl border border-primary/20 bg-white shadow-xl focus-within:outline-none py-2"
                    onFocus={() => {
                      if (!productsDropdownOpen) {
                        setProductsDropdownOpen(true);
                      }
                    }}
                  >
                    <div className="flex flex-col gap-0.5">
                      {categories.map((category, index) => {
                        const categoryPath = getCategoryPath(category.slug);
                        const isHovered = hoveredCategoryIndex === index;
                        const hasSubcategories = category.subcategories && category.subcategories.length > 0;

                        return (
                          <div
                            key={category.id}
                            className="relative"
                            onMouseEnter={() => setHoveredCategoryIndex(index)}
                            onMouseLeave={(e) => {
                              const relatedTarget = e.relatedTarget as HTMLElement;
                              if (!relatedTarget?.closest('[data-subcategory-dropdown]')) {
                                setHoveredCategoryIndex(-1);
                              }
                            }}
                            onFocus={() => setHoveredCategoryIndex(index)}
                          >
                            <Link
                              href={categoryPath}
                              className={cn(
                                "flex items-center justify-between gap-3 px-4 py-3 text-sm font-semibold transition-all duration-200 rounded-lg mx-1",
                                isHovered
                                  ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-sm"
                                  : "text-foreground/70 hover:bg-gradient-to-r hover:from-muted/40 hover:to-muted/20 hover:text-foreground",
                              )}
                              onClick={() => setProductsDropdownOpen(false)}
                            >
                              <span className="flex items-center gap-2">
                                {category.icon && (
                                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-base">
                                    {category.icon}
                                  </span>
                                )}
                                <span>{language === 'en' ? category.name_en : language === 'hy' ? (category.name_hy || category.name_en) : category.name_ka}</span>
                              </span>
                              {hasSubcategories && (
                                <ChevronDown
                                  className={cn(
                                    "h-4 w-4 transition-transform duration-200",
                                    isHovered ? "rotate-180 text-primary" : "text-muted-foreground/50",
                                  )}
                                />
                              )}
                            </Link>
                            
                            {hasSubcategories && isHovered && (
                              <div 
                                data-subcategory-dropdown
                                className="absolute left-full top-0 -ml-px z-50 w-[280px] max-w-[calc(90vw-420px)] rounded-xl border border-primary/20 bg-white shadow-xl py-2 transition-all duration-200 opacity-100"
                                onMouseEnter={() => setHoveredCategoryIndex(index)}
                                onMouseLeave={() => setHoveredCategoryIndex(-1)}
                              >
                                {category.subcategories.map((sub) => (
                                  <Link
                                    key={sub.id}
                                    href={getCategoryPath(sub.slug)}
                                    className="group/sub flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-foreground/80 transition-all hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary rounded-lg mx-1"
                                    onClick={() => setProductsDropdownOpen(false)}
                                  >
                                    <span className="flex-1">{language === 'en' ? sub.name_en : language === 'hy' ? (sub.name_hy || sub.name_en) : sub.name_ka}</span>
                                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 transition-all group-hover/sub:translate-x-1 group-hover/sub:text-primary" />
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* About Us */}
            <Link href={getPath("/about", "/en/about")} className={navLinkClass(getPath("/about", "/en/about"))}>
              {t(translations.nav.about.ka, translations.nav.about.en, undefined, translations.nav.about.hy)}
            </Link>

            {/* Success Stories */}
            <Link href={getPath("/success-stories", "/en/success-stories")} className={navLinkClass(getPath("/success-stories", "/en/success-stories"))}>
              {t(translations.nav.successStories.ka, translations.nav.successStories.en, undefined, translations.nav.successStories.hy)}
            </Link>

            {/* Contact */}
            <Link href={getPath("/contact", "/en/contact")}>
              <Button 
                className={cn(
                  "ml-3 rounded-full px-6 text-base font-semibold shadow-md hover:shadow-lg",
                  isActive(getPath("/contact", "/en/contact"))
                    ? "bg-gradient-to-r from-primary via-primary to-primary-dark text-white"
                    : "bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary"
                )}
              >
                {t(translations.nav.contact.ka, translations.nav.contact.en, undefined, translations.nav.contact.hy)}
              </Button>
            </Link>

            {/* Language Switcher */}
            <div className="ml-3">
              <LanguageSwitcher />
            </div>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <LanguageSwitcher />
            <button
              className="rounded-full border border-border/70 p-2 text-foreground/70 transition-smooth hover:text-foreground"
              onClick={handleMobileMenuToggle}
              aria-label="Toggle navigation"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              ref={menuButtonRef}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div
            id="mobile-navigation"
            ref={mobileMenuContainerRef}
            className="lg:hidden border-t border-primary/10 bg-gradient-to-b from-white/98 to-muted/30 px-4 py-4 space-y-3 focus:outline-none overflow-y-auto max-h-[calc(100vh-4.5rem)]"
            tabIndex={-1}
          >
            <nav className="space-y-3">
              <Link
                href={getPath("/", "/en")}
                onClick={closeMobileMenu}
                ref={firstMenuLinkRef}
                className="block"
              >
                <div className={navLinkClass(getPath("/", "/en"))}>
                  {t(translations.nav.home.ka, translations.nav.home.en, undefined, translations.nav.home.hy)}
                </div>
              </Link>

              <div className="rounded-3xl border border-border/60 bg-white/80 shadow-soft">
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-3xl px-4 py-3 text-base font-semibold text-foreground transition-smooth",
                    mobileProductsExpanded ? "bg-primary/5" : "hover:bg-primary/5"
                  )}
                  onClick={() =>
                    setMobileProductsExpanded((prev) => {
                      const next = !prev;
                      if (!next) {
                        setExpandedMobileCategoryId(null);
                      }
                      return next;
                    })
                  }
                >
                  <span>{t(translations.nav.products.ka, translations.nav.products.en, undefined, translations.nav.products.hy)}</span>
                  {!loadingCategories && categories.length > 0 && (
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 text-muted-foreground transition-transform",
                        mobileProductsExpanded ? "rotate-180 text-primary" : ""
                      )}
                    />
                  )}
                </button>
                {mobileProductsExpanded && !loadingCategories && categories.length > 0 && (
                  <div className="space-y-3 border-t border-border/60 bg-muted/40 px-4 py-4">
                    <div className="space-y-3">
                      {categories.map((category) => {
                        const categoryPath = getCategoryPath(category.slug);
                        const hasSubcategories = category.subcategories.length > 0;
                        const isExpanded = expandedMobileCategoryId === category.id;
                        return (
                          <div key={category.id} className="space-y-2">
                            <Link
                              href={categoryPath}
                              className="flex items-center justify-between rounded-2xl bg-white/60 px-3 py-2 text-sm font-semibold text-foreground transition-smooth hover:bg-white"
                              onClick={(event) => {
                                if (hasSubcategories && !isExpanded) {
                                  event.preventDefault();
                                  setExpandedMobileCategoryId(category.id);
                                  return;
                                }
                                setExpandedMobileCategoryId(null);
                                closeMobileMenu();
                              }}
                            >
                              <span>{language === "en" ? category.name_en : language === "hy" ? (category.name_hy || category.name_en) : category.name_ka}</span>
                              {hasSubcategories && (
                                <ChevronDown
                                  className={cn(
                                    "h-4 w-4 text-muted-foreground transition-transform",
                                    isExpanded ? "rotate-180 text-primary" : ""
                                  )}
                                />
                              )}
                            </Link>
                            {hasSubcategories && isExpanded && (
                              <div className="space-y-1 rounded-2xl border border-border/40 bg-white/80 px-3 py-2">
                                {category.subcategories.map((sub) => (
                                  <Link
                                    key={sub.id}
                                    href={getCategoryPath(sub.slug)}
                                    className="block rounded-xl px-2 py-1.5 text-sm text-foreground/70 transition-smooth hover:bg-primary/10 hover:text-primary"
                                    onClick={closeMobileMenu}
                                  >
                                    {language === "en" ? sub.name_en : language === "hy" ? (sub.name_hy || sub.name_en) : sub.name_ka}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <Link
                href={getPath("/about", "/en/about")}
                onClick={closeMobileMenu}
                className="block"
              >
                <div className={navLinkClass(getPath("/about", "/en/about"))}>
                  {t(translations.nav.about.ka, translations.nav.about.en, undefined, translations.nav.about.hy)}
                </div>
              </Link>

              <Link
                href={getPath("/success-stories", "/en/success-stories")}
                onClick={closeMobileMenu}
                className="block"
              >
                <div className={navLinkClass(getPath("/success-stories", "/en/success-stories"))}>
                  {t(translations.nav.successStories.ka, translations.nav.successStories.en, undefined, translations.nav.successStories.hy)}
                </div>
              </Link>
            </nav>

            <Link href={getPath("/contact", "/en/contact")} onClick={closeMobileMenu} className="block pt-2">
              <Button className="w-full rounded-full text-base">
                {t(translations.nav.contact.ka, translations.nav.contact.en, undefined, translations.nav.contact.hy)}
              </Button>
            </Link>

          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
