"use client";

import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getDomainLanguage } from "@/utils/config";
import { Language, LanguageContext } from "./context";

const LANG_STORAGE_KEY = "agroit-lang-pref";

interface LanguageProviderProps {
  children: ReactNode;
  initialLang?: Language;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children, initialLang }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Track user's explicit language override (for hy on agroit.ge before custom domain)
  const [langOverride, setLangOverride] = useState<Language | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(LANG_STORAGE_KEY);
      if (stored === "hy" || stored === "ka") return stored as Language;
    }
    return null;
  });

  const language: Language = useMemo(() => {
    if (pathname?.startsWith("/en")) return "en";
    if (pathname?.startsWith("/ru")) return "ru";

    // If user explicitly chose a language via switcher, respect it
    if (langOverride) return langOverride;

    // Use initialLang from server (domain-aware) to avoid hydration mismatch
    if (initialLang && initialLang !== "en" && initialLang !== "ru") return initialLang;

    // Client-side fallback: detect from domain
    if (typeof window !== "undefined") {
      return getDomainLanguage(window.location.hostname);
    }

    return "ka";
  }, [pathname, initialLang, langOverride]);

  const t = (ka: string, en: string, ru?: string, hy?: string) => {
    if (language === "en") return en;
    if (language === "ru") return ru || en;
    if (language === "hy") return hy || en;
    return ka;
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    const preservedSearch = searchParams?.toString();
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const search = preservedSearch ? `?${preservedSearch}` : "";
    const suffix = `${search}${hash}`;
    const withSuffix = (path: string) => `${path}${suffix}`;
    const currentPath = pathname || "/";

    if (lang === "en") {
      // Navigate to /en/ prefix
      setLangOverride(null);
      localStorage.removeItem(LANG_STORAGE_KEY);
      const basePath = currentPath.replace(/^\/(en|ru)/, "") || "/";
      const normalized = basePath === "/" ? "" : basePath;
      router.push(withSuffix(`/en${normalized}`));
    } else {
      // For ka or hy: use root path, store preference
      setLangOverride(lang);
      localStorage.setItem(LANG_STORAGE_KEY, lang);
      if (currentPath.startsWith("/en")) {
        const stripped = currentPath.replace(/^\/(en|ru)/, "") || "/";
        router.push(withSuffix(stripped));
      }
      // If already on root path, no navigation needed — just re-render with new language
    }
  }, [pathname, searchParams, router]);

  const toggleLanguage = useCallback(() => {
    // Cycle: current → next in sequence ka → en → hy → ka
    const cycle: Language[] = ["ka", "en", "hy"];
    const currentIndex = cycle.indexOf(language);
    const nextLang = cycle[(currentIndex + 1) % cycle.length];
    setLanguage(nextLang);
  }, [language, setLanguage]);

  return (
    <LanguageContext.Provider value={{ language, t, toggleLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
