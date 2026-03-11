"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PartnerBrands from "@/components/PartnerBrands";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/data/translations";
import { ArrowRight, CheckCircle2, Wrench, Users } from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { useCategories } from "@/hooks/useCategories";
import { useMemo, useCallback } from "react";
import heroVineyard from "@/assets/hero-vineyard.webp";
import heroVineyardMobile from "@/assets/hero-vineyard-mobile.webp";
import orchardLandscape from "@/assets/orchard-landscape.webp";
import orchardLandscapeMobile from "@/assets/orchard-landscape-mobile.webp";
import logoImage from "@/assets/agroit-logo.webp";
import { getOptimizedImageUrl } from "@/utils/image";
import { getBaseUrl } from "@/utils/config";
import { getLocalizedField } from "@/utils/languageFields";

const Index = () => {
  const { language, t } = useLanguage();
  const { data: allCategories = [], isLoading: categoriesLoading } = useCategories();

  type CategoryRecord = (typeof allCategories)[number] & {
    slug?: string | null;
    slug_en?: string | null;
    slug_ka?: string | null;
  };

  const getPath = useCallback((pathKa: string, pathEn: string, pathRu?: string, pathHy?: string) => {
    if (language === "en") return pathEn;
    if (language === "ru") return pathRu || pathEn;
    if (language === "hy") return pathHy || pathEn;
    return pathKa;
  }, [language]);

    const heroSubtitle = t(
    "\u10DE\u10E0\u10DD\u10E4\u10D4\u10E1\u10E3\u10DA\u10D8 \u10E2\u10D4\u10E5\u10DC\u10D8\u10D9\u10D0 \u10D5\u10D4\u10DC\u10D0\u10EE\u10D4\u10D1\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1, \u10D1\u10D0\u10E6\u10D4\u10D1\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1 \u10D3\u10D0 \u10D9\u10D0\u10D9\u10DA\u10DD\u10D5\u10D0\u10DC\u10D8 \u10D9\u10E3\u10DA\u10E2\u10E3\u10E0\u10D4\u10D1\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1",
    "Professional italian equipment for vineyards, orchards and nuts cultivation",
    "\u041F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E\u0435 \u043E\u0431\u043E\u0440\u0443\u0434\u043E\u0432\u0430\u043D\u0438\u0435 \u0434\u043B\u044F \u0432\u0438\u043D\u043E\u0433\u0440\u0430\u0434\u043D\u0438\u043A\u043E\u0432, \u0441\u0430\u0434\u043E\u0432 \u0438 \u0432\u044B\u0440\u0430\u0449\u0438\u0432\u0430\u043D\u0438\u044F \u043E\u0440\u0435\u0445\u043E\u0432",
    translations.home.heroSubtitle.hy
  );

  const productsDescription = t(
    translations.home.ourProductsDesc.ka,
    translations.home.ourProductsDesc.en,
    translations.home.ourProductsDesc.ru,
    translations.home.ourProductsDesc.hy
  );

  // Get featured categories from database only - no hardcoded data
  // Only show categories explicitly marked as featured (is_featured === true)
  const categories = useMemo(() => {
    return allCategories
      .filter((cat) => {
        const category = cat as CategoryRecord;
        // Only show categories that are explicitly true (not null, undefined, or false)
        return category.is_featured === true;
      })
      .sort((a, b) => {
        // Sort by display_order, then by created_at
        const orderA = (a as CategoryRecord).display_order ?? 999;
        const orderB = (b as CategoryRecord).display_order ?? 999;
        if (orderA !== orderB) return orderA - orderB;
        return (
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
      })
      .map((cat) => {
        const category = cat as CategoryRecord;

        // Get translated title and description based on current language
        const title = getLocalizedField(category, "name", language);

        const description = getLocalizedField(category, "description", language);

        // Determine slug for routing (always prefer English slug to avoid Georgian URLs)
        const resolvedSlug = category.slug_en || category.slug || category.slug_ka || null;

        const link =
          language === "en"
            ? `/en/${resolvedSlug}`
            : language === "ru"
            ? `/ru/${resolvedSlug}`
            : language === "hy"
            ? `/hy/${resolvedSlug}`
            : `/${resolvedSlug}`;

        // Get image URL with cache-busting
        let imageUrl = category.banner_image_url || "";
        if (category.banner_image_url && category.updated_at) {
          const timestamp = new Date(category.updated_at).getTime();
          const separator = category.banner_image_url.includes("?") ? "&" : "?";
          imageUrl = `${category.banner_image_url}${separator}t=${timestamp}`;
        }

        // Fallback to placeholder if no banner_image_url
        if (!imageUrl) {
          imageUrl = "/placeholder.svg";
        }

        const optimizedImage = getOptimizedImageUrl(imageUrl, { width: 720, quality: 75 });

        return {
          key: category.id,
          title: title || "Category",
          description: description,
          image: optimizedImage || imageUrl,
          link,
        };
      });
  }, [allCategories, language]);

  const heroHighlights = [
    {
      value: "500+",
      label: t("\u10D8\u10DC\u10E1\u10E2\u10D0\u10DA\u10D0\u10EA\u10D8\u10D0 \u10E1\u10D0\u10E5\u10D0\u10E0\u10D7\u10D5\u10D4\u10DA\u10DD\u10E1 \u10DB\u10D0\u10E1\u10E8\u10E2\u10D0\u10D1\u10D8\u10D7", "Installations across Georgia", "\u0423\u0441\u0442\u0430\u043D\u043E\u0432\u043E\u043A \u043F\u043E \u0432\u0441\u0435\u0439 \u0413\u0440\u0443\u0437\u0438\u0438", "\u054F\u0565\u0572\u0561\u0564\u0580\u0578\u0582\u0574\u0576\u0565\u0580 \u0561\u0574\u0562\u0578\u0572\u057b \u054e\u0580\u0561\u057d\u057f\u0561\u0576\u0578\u0582\u0574"),
    },
    {
      label: t("\u10E1\u10D0\u10D7\u10D0\u10D3\u10D0\u10E0\u10D8\u10D2\u10DD \u10DC\u10D0\u10EC\u10D8\u10DA\u10D4\u10D1\u10D8 \u10E1\u10D0\u10E5\u10D0\u10E0\u10D7\u10D5\u10D4\u10DA\u10DD\u10E8\u10D8", "Spare parts available in stock in Georgia", "\u0417\u0430\u043F\u0447\u0430\u0441\u0442\u0438 \u0432 \u043D\u0430\u043B\u0438\u0447\u0438\u0438 \u0432 \u0413\u0440\u0443\u0437\u0438\u0438", "\u054a\u0561\u0570\u0565\u057d\u057f\u0561\u0574\u0561\u057d\u0565\u0580 \u0561\u057c\u056f\u0561 \u054e\u0580\u0561\u057d\u057f\u0561\u0576\u0578\u0582\u0574"),
      icon: Wrench,
    },
    {
      label: t("\u10D9\u10D5\u10D0\u10DA\u10D8\u10E4\u10D8\u10EA\u10D8\u10E3\u10E0\u10D8 \u10E2\u10D4\u10E5\u10DC\u10D8\u10D9\u10DD\u10E1\u10D4\u10D1\u10D8 \u10E1\u10EC\u10E0\u10D0\u10E4\u10D8 \u10DB\u10DD\u10DB\u10E1\u10D0\u10EE\u10E3\u10E0\u10D4\u10D1\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1", "Qualified technicians for prompt service", "\u041A\u0432\u0430\u043B\u0438\u0444\u0438\u0446\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0435 \u0442\u0435\u0445\u043D\u0438\u043A\u0438 \u0434\u043B\u044F \u0431\u044B\u0441\u0442\u0440\u043E\u0433\u043E \u043E\u0431\u0441\u043B\u0443\u0436\u0438\u0432\u0430\u043D\u0438\u044F", "\u0548\u0580\u0561\u056f\u0561\u057e\u0578\u0580\u057e\u0561\u056e \u057f\u0565\u056d\u0576\u056b\u056f\u0578\u057d\u0576\u0565\u0580 \u0561\u0580\u0561\u0563 \u057d\u057a\u0561\u057d\u0561\u0580\u056f\u0574\u0561\u0576 \u0570\u0561\u0574\u0561\u0580"),
      icon: Users,
    },
  ];

  const differentiators = [
    {
      title: t("\u10D8\u10E2\u10D0\u10DA\u10D8\u10E3\u10E0\u10D8 \u10EE\u10D0\u10E0\u10D8\u10E1\u10EE\u10D8", "Italian quality", undefined, "\u053B\u057F\u0561\u056C\u0561\u056F\u0561\u0576 \u0578\u0580\u0561\u056F"),
      desc: t(
        "\u10DE\u10E0\u10D4\u10DB\u10D8\u10E3\u10DB \u10D0\u10E6\u10ED\u10E3\u10E0\u10D5\u10D8\u10DA\u10DD\u10D1\u10D0 \u10EC\u10D0\u10DB\u10E7\u10D5\u10D0\u10DC\u10D8 \u10D8\u10E2\u10D0\u10DA\u10D8\u10D4\u10DA\u10D8 \u10DB\u10EC\u10D0\u10E0\u10DB\u10DD\u10D4\u10D1\u10DA\u10D4\u10D1\u10D8\u10E1\u10D2\u10D0\u10DC \u10D3\u10D0 \u10D3\u10D0\u10D3\u10D0\u10E1\u10E2\u10E3\u10E0\u10D4\u10D1\u10E3\u10DA\u10D8 \u10E1\u10D0\u10D8\u10DB\u10D4\u10D3\u10DD\u10DD\u10D1\u10D0.",
        "Premium equipment from leading Italian manufacturers with proven reliability.",
        undefined,
        "\u054a\u0580\u0565\u0574\u056b\u0578\u0582\u0574 \u057d\u0561\u0580\u0584\u0561\u057e\u0578\u0580\u0578\u0582\u0574\u0576\u0565\u0580 \u0561\u057c\u0561\u057b\u0561\u057f\u0561\u0580 \u056b\u057f\u0561\u056c\u0561\u056f\u0561\u0576 \u0561\u0580\u057f\u0561\u0564\u0580\u0578\u0572\u0576\u0565\u0580\u056b\u0581\u055d \u0561\u057a\u0561\u0581\u0578\u0582\u0581\u057e\u0561\u056e \u0570\u0578\u0582\u057d\u0561\u056c\u056b\u0578\u0582\u0569\u0575\u0561\u0574\u0562:"
      ),
    },
    {
      title: t("\u10D0\u10D3\u10D2\u10D8\u10DA\u10DD\u10D1\u10E0\u10D8\u10D5\u10D8 \u10DB\u10EE\u10D0\u10E0\u10D3\u10D0\u10ED\u10D4\u10E0\u10D0", "Local support", undefined, "\u054F\u0565\u0572\u0561\u056F\u0561\u0576 \u0561\u057B\u0561\u056F\u0581\u0578\u0582\u0569\u0575\u0578\u0582\u0576"),
      desc: t(
        "\u10E1\u10D4\u10E0\u10E2\u10D8\u10E4\u10D8\u10EA\u10D8\u10E0\u10D4\u10D1\u10E3\u10DA\u10D8 \u10D8\u10DC\u10DF\u10D8\u10DC\u10E0\u10D4\u10D1\u10D8 \u10E1\u10D0\u10E5\u10D0\u10E0\u10D7\u10D5\u10D4\u10DA\u10DD\u10E8\u10D8, \u10D0\u10D3\u10D2\u10D8\u10DA\u10D6\u10D4 \u10E1\u10D4\u10E0\u10D5\u10D8\u10E1\u10D8 \u10E1\u10D0\u10D0\u10D7\u10D4\u10D1\u10E8\u10D8.",
        "Certified engineers available across Georgia for on-site service in hours.",
        undefined,
        "\u054D\u0565\u0580\u057F\u056B\u0586\u056B\u056F\u0561\u0581\u057E\u0561\u056E \u056B\u0576\u056A\u0565\u0576\u0565\u0580\u0576\u0565\u0580 \u054E\u0580\u0561\u057D\u057F\u0561\u0576\u0578\u0582\u0574\u055D \u057F\u0565\u0572\u0578\u0582\u0574 \u057D\u057A\u0561\u057D\u0561\u0580\u056F\u0578\u0582\u0574 \u056A\u0561\u0574\u0565\u0580\u056B \u0568\u0576\u0569\u0561\u0581\u0584\u0578\u0582\u0574:"
      ),
    },
    {
      title: t("\u10DB\u10DD\u10E0\u10D2\u10D4\u10D1\u10E3\u10DA\u10D8 \u10D3\u10D0\u10E4\u10D8\u10DC\u10D0\u10DC\u10E1\u10D4\u10D1\u10D0", "Tailored financing", undefined, "\u0540\u0561\u0580\u0574\u0561\u0580\u0565\u0581\u057E\u0561\u056E \u0586\u056B\u0576\u0561\u0576\u057D\u0561\u057E\u0578\u0580\u0578\u0582\u0574"),
      desc: t(
        "\u10DB\u10DD\u10E5\u10DC\u10D8\u10DA\u10D8 \u10D2\u10D0\u10D3\u10D0\u10EE\u10D3\u10D8\u10E1 \u10DE\u10D8\u10E0\u10DD\u10D1\u10D4\u10D1\u10D8, \u10DB\u10DD\u10E0\u10D2\u10D4\u10D1\u10E3\u10DA\u10D8 \u10E1\u10D4\u10D6\u10DD\u10DC\u10E3\u10E0\u10DD\u10D1\u10D0\u10D6\u10D4 \u10D3\u10D0 \u10E4\u10E3\u10DA\u10D0\u10D3\u10D8 \u10DC\u10D0\u10D9\u10D0\u10D3\u10D4\u10D1\u10D6\u10D4.",
        "Flexible payment terms aligned with harvest seasonality and cashflow.",
        undefined,
        "\u0543\u0561\u056F\u0578\u0582\u0576 \u057E\u0573\u0561\u0580\u0574\u0561\u0576 \u057A\u0561\u0575\u0574\u0561\u0576\u0576\u0565\u0580\u055D \u0570\u0561\u0574\u0561\u057A\u0561\u057F\u0561\u057D\u056D\u0561\u0576\u057E\u0561\u056E \u0562\u0565\u0580\u0584\u056B \u057D\u0565\u0566\u0578\u0576\u0561\u0575\u0576\u0578\u0582\u0569\u0575\u0561\u0576\u0568 \u0587 \u0564\u0580\u0561\u0574\u0561\u056F\u0561\u0576 \u0570\u0578\u057D\u0584\u0565\u0580\u056B\u0576:"
      ),
    },
    {
      title: t("\u10E1\u10E0\u10E3\u10DA\u10D8 \u10D2\u10D0\u10D3\u10D0\u10EC\u10E7\u10D5\u10D4\u10E2\u10D0", "Turnkey delivery", undefined, "\u0531\u0574\u0562\u0578\u0572\u057B\u0561\u056F\u0561\u0576 \u0561\u057C\u0561\u0584\u0578\u0582\u0574"),
      desc: t(
        "\u10DA\u10DD\u10D2\u10D8\u10E1\u10E2\u10D8\u10D9\u10D8\u10D3\u10D0\u10DC \u10E2\u10E0\u10D4\u10DC\u10D8\u10DC\u10D2\u10D0\u10DB\u10D3\u10D4 \u10E7\u10D5\u10D4\u10DA\u10D0\u10E4\u10D4\u10E0\u10E1 \u10E9\u10D5\u10D4\u10DC \u10D5\u10DB\u10D0\u10E0\u10D7\u10D0\u10D5\u10D7, \u10E0\u10D0\u10D7\u10D0 \u10D2\u10E3\u10DC\u10D3\u10D8 \u10DE\u10D8\u10E0\u10D5\u10D4\u10DA\u10D8\u10D5\u10D4 \u10D3\u10E6\u10D8\u10D3\u10D0\u10DC \u10D8\u10DB\u10E3\u10E8\u10D0\u10DD\u10E1.",
        "From logistics to training, we handle the launch so your team can operate from day one.",
        undefined,
        "\u053C\u0578\u0563\u056B\u057D\u057F\u056B\u056F\u0561\u0575\u056B\u0581 \u0574\u056B\u0576\u0579\u0587 \u057E\u0565\u0580\u0561\u057A\u0561\u057F\u0580\u0561\u057D\u057F\u0574\u0561\u0576\u055D \u0574\u0565\u0576\u0584 \u056F\u0561\u057C\u0561\u057E\u0561\u0580\u0578\u0582\u0574 \u0565\u0576\u0584 \u0563\u0578\u0580\u056E\u0561\u0580\u056F\u0578\u0582\u0574\u0568, \u0578\u0580\u057A\u0565\u057D\u0566\u056B \u0571\u0565\u0580 \u0569\u056B\u0574\u0568 \u0561\u057C\u0561\u057B\u056B\u0576 \u0585\u0580\u056B\u0581 \u0561\u0577\u056D\u0561\u057F\u056B:"
      ),
    },
  ];

  const processSteps = [
    {
      step: "01",
      title: t("\u10D0\u10D3\u10D2\u10D8\u10DA\u10D6\u10D4 \u10D3\u10D8\u10D0\u10D2\u10DC\u10DD\u10E1\u10E2\u10D8\u10D9\u10D0", "On-site diagnostics", undefined, "\u054F\u0565\u0572\u0578\u0582\u0574 \u0561\u056D\u057F\u0578\u0580\u0578\u0577\u0578\u0582\u0574"),
      description: t(
        "\u10E1\u10D0\u10DC\u10D0\u10DB \u10E2\u10D4\u10E5\u10DC\u10D8\u10D9\u10D0\u10E1 \u10E8\u10D4\u10D5\u10D0\u10E0\u10E9\u10D4\u10D5\u10D7, \u10D0\u10D3\u10D2\u10D8\u10DA\u10D6\u10D4 \u10D5\u10D0\u10E4\u10D0\u10E1\u10D4\u10D1\u10D7 \u10E0\u10D4\u10DA\u10D8\u10D4\u10E4\u10E1, \u10D9\u10E3\u10DA\u10E2\u10E3\u10E0\u10D0\u10E1 \u10D3\u10D0 \u10D2\u10D0\u10DC\u10D5\u10D8\u10D7\u10D0\u10E0\u10D4\u10D1\u10D8\u10E1 \u10DB\u10D8\u10D6\u10DC\u10D4\u10D1\u10E1.",
        "We study your terrain, crop profile, and growth targets before recommending machinery.",
        undefined,
        "\u0546\u0561\u056D\u0584\u0561\u0576 \u057D\u0561\u0580\u0584\u0561\u057E\u0578\u0580\u0578\u0582\u0574\u0576\u0565\u0580 \u0561\u057C\u0561\u057B\u0561\u0580\u056F\u0565\u056C\u0578\u0582\u0581\u055D \u057F\u0565\u0572\u0578\u0582\u0574 \u0578\u0582\u057D\u0578\u0582\u0574\u0576\u0561\u057D\u056B\u0580\u0578\u0582\u0574 \u0565\u0576\u0584 \u0571\u0565\u0580 \u057F\u0561\u0580\u0561\u056E\u0584\u0568, \u0574\u0577\u0561\u056F\u0561\u0562\u0578\u0582\u0575\u057D\u056B \u057A\u0580\u0578\u0586\u056B\u056C\u0568 \u0587 \u0561\u0573\u0574\u0561\u0576 \u0576\u057A\u0561\u057F\u0561\u056F\u0576\u0565\u0580\u0568:"
      ),
    },
    {
      step: "02",
      title: t("\u10D8\u10DC\u10D3\u10D8\u10D5\u10D8\u10D3\u10E3\u10D0\u10DA\u10E3\u10E0\u10D8 \u10D9\u10DD\u10DC\u10E4\u10D8\u10D2\u10E3\u10E0\u10D0\u10EA\u10D8\u10D0", "Tailored configuration", undefined, "\u0540\u0561\u0580\u0574\u0561\u0580\u0565\u0581\u057E\u0561\u056E \u056F\u0561\u0566\u0574\u0561\u056F\u0565\u0580\u057A\u0578\u0582\u0574"),
      description: t(
        "\u10D7\u10D8\u10D7\u10DD\u10D4\u10E3\u10DA\u10D8 \u10D4\u10E0\u10D7\u10D4\u10E3\u10DA\u10D8 \u10D9\u10DD\u10DB\u10DE\u10DA\u10D4\u10E5\u10E2\u10D3\u10D4\u10D1\u10D0 \u10D0\u10E5\u10E1\u10D4\u10E1\u10E3\u10D0\u10E0\u10D4\u10D1\u10D8\u10D7, PTO \u10DE\u10D0\u10E0\u10D0\u10DB\u10D4\u10E2\u10E0\u10D4\u10D1\u10D8\u10D7 \u10D3\u10D0 \u10D9\u10D0\u10DA\u10D8\u10D1\u10E0\u10D0\u10EA\u10D8\u10D4\u10D1\u10D8\u10D7 \u10D7\u10E5\u10D5\u10D4\u10DC\u10D8 \u10DC\u10D0\u10D9\u10D5\u10D4\u10D7\u10D4\u10D1\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1.",
        "Each unit is configured with accessories, PTO settings, and calibrations suited to your fields.",
        undefined,
        "\u0545\u0578\u0582\u0580\u0561\u0584\u0561\u0576\u0579\u0575\u0578\u0582\u0580 \u0574\u056B\u0561\u057E\u0578\u0580 \u056F\u0561\u0566\u0574\u0561\u056F\u0565\u0580\u057A\u057E\u0578\u0582\u0574 \u0567 \u057A\u0561\u0580\u0561\u0563\u0561\u0576\u0565\u0580\u0578\u057E, PTO \u056F\u0561\u0580\u0563\u0561\u057E\u0578\u0580\u0578\u0582\u0574\u0576\u0565\u0580\u0578\u057E \u0587 \u0579\u0561\u0583\u0561\u056F\u0561\u056C\u0578\u0582\u0574\u0576\u0565\u0580\u0578\u057E\u055D \u0570\u0561\u0580\u0574\u0561\u0580\u0565\u0581\u057E\u0561\u056E \u0571\u0565\u0580 \u0564\u0561\u0577\u057F\u0565\u0580\u056B\u0576:"
      ),
    },
    {
      step: "03",
      title: t("\u10D2\u10E0\u10EB\u10D4\u10DA\u10D5\u10D0\u10D3\u10D8\u10D0\u10DC\u10D8 \u10DE\u10D0\u10E0\u10E2\u10DC\u10D8\u10DD\u10E0\u10DD\u10D1\u10D0", "Lifetime partnership", undefined, "\u0540\u0561\u057E\u0565\u0580\u056A\u0565\u0576\u0561\u056F\u0561\u0576 \u0563\u0578\u0580\u056E\u0568\u0576\u056F\u0565\u0580\u0578\u0582\u0569\u0575\u0578\u0582\u0576"),
      description: t(
        "\u10E9\u10D5\u10D4\u10DC\u10D7\u10D0\u10DC \u10D2\u10D0\u10E5\u10D5\u10D7 \u10DB\u10E3\u10D3\u10DB\u10D8\u10D5\u10D8 \u10DB\u10EE\u10D0\u10E0\u10D3\u10D0\u10ED\u10D4\u10E0\u10D0: \u10DE\u10E0\u10DD\u10E4\u10D8\u10DA\u10D0\u10E5\u10E2\u10D8\u10D9\u10E3\u10E0\u10D8 \u10DB\u10DD\u10DB\u10E1\u10D0\u10EE\u10E3\u10E0\u10D4\u10D1\u10D0, \u10DD\u10E0\u10D8\u10D2\u10D8\u10DC\u10D0\u10DA\u10D8 \u10DC\u10D0\u10EC\u10D8\u10DA\u10D4\u10D1\u10D8 \u10D3\u10D0 \u10E1\u10D4\u10D6\u10DD\u10DC\u10E3\u10E0\u10D8 \u10D2\u10D0\u10DC\u10D0\u10EE\u10DA\u10D4\u10D1\u10D4\u10D1\u10D8.",
        "We stay on call with preventive maintenance, genuine parts, and seasonal upgrades.",
        undefined,
        "\u0544\u0565\u0576\u0584 \u0574\u056B\u0577\u057F \u056F\u0561\u057A\u056B \u0574\u0565\u057B \u0565\u0576\u0584\u055D \u056F\u0561\u0576\u056D\u0561\u0580\u0563\u0565\u056C\u0561\u056F\u0561\u0576 \u057D\u057A\u0561\u057D\u0561\u0580\u056F\u0578\u0582\u0574, \u0585\u0580\u056B\u0563\u056B\u0576\u0561\u056C \u057A\u0561\u0570\u0565\u057D\u057F\u0561\u0574\u0561\u057D\u0565\u0580 \u0587 \u057D\u0565\u0566\u0578\u0576\u0561\u0575\u056B\u0576 \u0569\u0561\u0580\u0574\u0561\u0581\u0578\u0582\u0574\u0576\u0565\u0580:"
      ),
    },
  ];

  // SEO metadata
  const homePath = language === "en" ? "/en" : language === "ru" ? "/ru" : language === "hy" ? "/hy" : "/";
  const seoTitle = t(
    "AGROIT - \u10D8\u10E2\u10D0\u10DA\u10D8\u10E3\u10E0\u10D8 \u10D0\u10D2\u10E0\u10DD\u10E2\u10D4\u10E5\u10DC\u10D8\u10D9\u10D0 \u10E1\u10D0\u10E5\u10D0\u10E0\u10D7\u10D5\u10D4\u10DA\u10DD\u10E8\u10D8",
    "AGROIT - Italian Agricultural Equipment in Georgia",
    undefined,
    "AGROIT - \u053B\u057F\u0561\u056C\u0561\u056F\u0561\u0576 \u0563\u0575\u0578\u0582\u0572\u0561\u057F\u0576\u057F\u0565\u057D\u0561\u056F\u0561\u0576 \u057D\u0561\u0580\u0584\u0561\u057E\u0578\u0580\u0578\u0582\u0574\u0576\u0565\u0580"
  );
  const seoDescription = t(
    "\u10DE\u10E0\u10DD\u10E4\u10D4\u10E1\u10E3\u10DA\u10D8 \u10D8\u10E2\u10D0\u10DA\u10D8\u10E3\u10E0\u10D8 \u10D0\u10D2\u10E0\u10DD\u10E2\u10D4\u10E5\u10DC\u10D8\u10D9\u10D0 \u10D5\u10D4\u10DC\u10D0\u10EE\u10D4\u10D1\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1, \u10D1\u10D0\u10E6\u10D4\u10D1\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1 \u10D3\u10D0 \u10D9\u10D0\u10D9\u10DA\u10DD\u10D5\u10D0\u10DC\u10D8 \u10D9\u10E3\u10DA\u10E2\u10E3\u10E0\u10D4\u10D1\u10D8\u10E1 \u10D2\u10D0\u10D3\u10D0\u10DB\u10E3\u10E8\u10D0\u10D5\u10D4\u10D1\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1.",
    "Professional Italian agricultural machinery for vineyards, orchards, and dry fruit processing. Free delivery across Georgia, one-year warranty, and expert support.",
    undefined,
    "\u054B\u0580\u0578\u0586\u0565\u057D\u056B\u0578\u0576\u0561\u056C \u056B\u057F\u0561\u056C\u0561\u056F\u0561\u0576 \u0563\u0575\u0578\u0582\u0572\u0561\u057F\u0576\u057F\u0565\u057D\u0561\u056F\u0561\u0576 \u057D\u0561\u0580\u0584\u0561\u057E\u0578\u0580\u0578\u0582\u0574\u0576\u0565\u0580 \u0561\u0575\u0563\u0565\u0563\u0578\u0580\u056E\u0576\u0565\u0580\u056B, \u057A\u057F\u0572\u0561\u057F\u0578\u0582\u0576\u0565\u0580\u056B \u0587 \u0579\u056B\u0580 \u057A\u057F\u0572\u056B \u0574\u0577\u0561\u056F\u0574\u0561\u0576 \u0570\u0561\u0574\u0561\u0580:"
  );

  return (
    <>
      <SchemaMarkup
        organization={{
          name: "AGROIT",
          url: getBaseUrl(),
        }}
      />
      <main className="bg-background pb-24">
        {/* Full Width Hero Banner */}
        <section className="relative min-h-[600px] w-full overflow-hidden pt-24 pb-12 sm:pt-32 sm:pb-16 lg:min-h-[calc(100vh-80px)] lg:max-h-[900px] lg:pt-12">
          {/* Background Image */}
          <picture className="absolute inset-0">
            <source
              srcSet={`${typeof heroVineyardMobile === 'string' ? heroVineyardMobile : heroVineyardMobile.src} 900w, ${typeof heroVineyard === 'string' ? heroVineyard : heroVineyard.src} 1600w`}
              media="(max-width: 1024px)"
            />
            <img
              src={typeof heroVineyard === 'string' ? heroVineyard : heroVineyard.src}
              srcSet={`${typeof heroVineyardMobile === 'string' ? heroVineyardMobile : heroVineyardMobile.src} 900w, ${typeof heroVineyard === 'string' ? heroVineyard : heroVineyard.src} 1600w`}
              sizes="(max-width: 1024px) 100vw, 1600px"
              alt={t(
                "\u10D8\u10E2\u10D0\u10DA\u10D8\u10E3\u10E0\u10D8 \u10E2\u10D4\u10E5\u10DC\u10D8\u10D9\u10D0 \u10E5\u10D0\u10E0\u10D7\u10E3\u10DA \u10D5\u10D4\u10DC\u10D0\u10EE\u10E8\u10D8",
                "AGROIT equipment operating in a Georgian vineyard",
                "\u041E\u0431\u043E\u0440\u0443\u0434\u043E\u0432\u0430\u043D\u0438\u0435 AGROIT \u0432 \u0433\u0440\u0443\u0437\u0438\u043D\u0441\u043A\u043E\u043C \u0432\u0438\u043D\u043E\u0433\u0440\u0430\u0434\u043D\u0438\u043A\u0435",
                "AGROIT \u057D\u0561\u0580\u0584\u0561\u057E\u0578\u0580\u0578\u0582\u0574\u0576\u0565\u0580\u0568 \u057E\u0580\u0561\u0581\u0561\u056F\u0561\u0576 \u0561\u0575\u0563\u0578\u0582\u0574"
              )}
              className="h-full w-full object-cover"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              width={1600}
              height={1068}
            />
          </picture>

          {/* Gradient Overlays for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Grid Pattern Overlay */}
          <span className="pointer-events-none absolute inset-0 bg-hero-grid opacity-20" />

          {/* Content Container */}
          <div className="relative flex h-full items-center">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                {/* Left Column - Main Content */}
                <div className="space-y-8 pb-16 sm:pb-20 lg:pb-0">
                  {/* Logo */}
                  <div className="inline-flex items-center justify-center rounded-2xl border-2 border-white/30 bg-white/10 p-4 sm:p-6 shadow-soft w-[200px] sm:w-[280px] lg:w-[320px] xl:w-[380px] backdrop-blur-md">
                    <img
                      src={typeof logoImage === 'string' ? logoImage : logoImage.src}
                      alt="AGROIT Logo"
                      className="w-full h-auto"
                      style={{ display: 'block' }}
                      loading="eager"
                      fetchPriority="high"
                    />
                  </div>

                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white backdrop-blur-md">
                    <span>{t("\u10D8\u10E2\u10D0\u10DA\u10D8\u10E3\u10E0\u10D8 \u10D8\u10DC\u10DF\u10D8\u10DC\u10D4\u10E0\u10D8\u10D0", "Italian engineering", undefined, "\u053B\u057F\u0561\u056C\u0561\u056F\u0561\u0576 \u056B\u0576\u056A\u0565\u0576\u0565\u0580\u056B\u0561")}</span>
                    <span className="hidden text-white/70 sm:inline">&bull;</span>
                    <span className="hidden text-white/70 sm:inline">
                      {t("\u10E5\u10D0\u10E0\u10D7\u10E3\u10DA\u10D8 \u10D2\u10D0\u10DB\u10DD\u10EA\u10D3\u10D8\u10DA\u10D4\u10D1\u10D0", "Georgian expertise", undefined, "\u054E\u0580\u0561\u0581\u0561\u056F\u0561\u0576 \u0583\u0578\u0580\u0571")}
                    </span>
                  </div>

                  {/* Main Heading */}
                  <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
                    {t(translations.home.heroTitle.ka, translations.home.heroTitle.en, undefined, translations.home.heroTitle.hy)}
                  </h1>

                  {/* Subtitle */}
                  <p className="max-w-2xl text-lg leading-relaxed text-white/90 sm:text-xl">
                    {heroSubtitle}
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex flex-col gap-4 sm:flex-row">
                  <Link href={getPath("/products", "/en/products", "/ru/products", "/hy/products")}>
                    <Button size="lg" className="group h-14 rounded-full bg-white px-8 text-base font-semibold text-primary hover:bg-white/90">
                      {t(translations.home.viewProducts.ka, translations.home.viewProducts.en, undefined, translations.home.viewProducts.hy)}
                      <ArrowRight className="ml-2 h-5 w-5 transition-smooth group-hover:translate-x-1" />
                    </Button>
                  </Link>
                    <Link href={getPath("/contact", "/en/contact", "/ru/contact", "/hy/contact")}>
                      <Button
                        size="lg"
                        variant="outline"
                        className="h-14 rounded-full border-2 border-white/40 bg-white/10 px-8 text-base font-semibold text-white backdrop-blur-md hover:bg-white/20"
                      >
                        {t(translations.home.contactUs.ka, translations.home.contactUs.en, undefined, translations.home.contactUs.hy)}
                      </Button>
                    </Link>
                  </div>
                </div>

                 {/* Right Column - Stats Cards */}
                <div className="hidden gap-4 lg:flex lg:flex-col">
                  {heroHighlights.map((highlight, idx) => (
                    <div
                      key={idx}
                      className={`rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-md ${highlight.value ? "transition-smooth hover:bg-white/15 hover:border-white/30" : ""}`}
                    >
                      {highlight.value ? (
                        <>
                          <div className="text-4xl font-bold text-white">{highlight.value}</div>
                          <p className="mt-2 text-sm text-white/80">{highlight.label}</p>
                        </>
                      ) : (
                        <>
                          {highlight.icon && (
                            <highlight.icon className="mb-3 h-6 w-6 text-white/70" />
                          )}
                          <p className="text-sm font-semibold text-white">{highlight.label}</p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Stats - Below content */}
          <div className="mt-10 lg:hidden">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 gap-3">
                {heroHighlights.map((highlight, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md"
                  >
                    {highlight.value ? (
                      <div className="text-2xl font-bold text-white">{highlight.value}</div>
                    ) : (
                      highlight.icon && <highlight.icon className="h-5 w-5 text-white/80" />
                    )}
                    <p className="mt-1 text-xs text-white/80">{highlight.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl space-y-4">
                <h2 className="text-3xl font-bold md:text-4xl">
                  {t(
                    translations.home.ourProducts.ka,
                    translations.home.ourProducts.en,
                    translations.home.ourProducts.ru,
                    translations.home.ourProducts.hy
                  )}
                </h2>
                {productsDescription.trim() && (
                  <p className="text-base text-muted-foreground md:text-lg">
                    {productsDescription}
                  </p>
                )}
              </div>
              <Link
                href={getPath("/contact", "/en/contact", "/ru/contact", "/hy/contact")}
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-6 py-3 text-sm font-semibold text-primary transition-smooth hover:border-primary/50 hover:bg-primary/10"
              >
                {t(
                  translations.home.askQuotation.ka,
                  translations.home.askQuotation.en,
                  translations.home.askQuotation.ru,
                  translations.home.askQuotation.hy
                )}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {categoriesLoading ? (
                // Loading skeletons
                Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-[32px] border border-border/60 bg-white shadow-soft"
                  >
                    <div className="h-60 animate-pulse bg-muted" />
                    <div className="space-y-4 p-6">
                      <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
                      <div className="h-4 w-full animate-pulse rounded bg-muted" />
                      <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
                      <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                ))
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <Link
                    key={category.key}
                    href={category.link}
                    className="group relative overflow-hidden rounded-[32px] border border-border/60 bg-white shadow-soft transition-smooth hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-strong"
                  >
                    <div className="relative h-60 overflow-hidden rounded-t-[28px]">
                      <img
                        src={category.image}
                        alt={category.title}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-smooth group-hover:scale-105"
                      />
                    </div>

                    <div className="space-y-5 p-6">
                      <h3 className="text-2xl font-semibold text-foreground">{category.title}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                      <div className="flex items-center text-sm font-semibold text-primary transition-smooth group-hover:gap-2">
                        {t("\u10D8\u10EE\u10D8\u10DA\u10D4\u10D7 \u10DE\u10E0\u10DD\u10D3\u10E3\u10E5\u10EA\u10D8\u10D0", "Explore products", undefined, "\u0534\u056B\u057F\u0565\u056C \u0561\u057A\u0580\u0561\u0576\u0584\u0576\u0565\u0580\u0568")}
                        <ArrowRight className="ml-2 h-4 w-4 transition-smooth group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-muted-foreground">
                  {t("\u10D9\u10D0\u10E2\u10D4\u10D2\u10DD\u10E0\u10D8\u10D4\u10D1\u10D8 \u10D0\u10E0 \u10D0\u10E0\u10D8\u10E1 \u10EE\u10D4\u10DA\u10DB\u10D8\u10E1\u10D0\u10EC\u10D5\u10D3\u10DD\u10DB\u10D8", "No categories available", undefined, "\u053F\u0561\u057F\u0565\u0563\u0578\u0580\u056B\u0561\u0576\u0565\u0580 \u0570\u0561\u057D\u0561\u0576\u0565\u056C\u056B \u0579\u0565\u0576")}
                </div>
              )}
            </div>
          </div>
        </section>

        <PartnerBrands />

        <section className="relative overflow-hidden bg-muted/50 py-24">
          <div className="absolute inset-0 -z-10 bg-hero-grid opacity-20" />
          <div className="container mx-auto grid gap-12 px-4 lg:grid-cols-2">
            <div className="space-y-6">
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                {t("\u10DE\u10D0\u10E0\u10E2\u10DC\u10D8\u10DD\u10E0\u10DD\u10D1\u10D0", "Partnership", undefined, "\u0533\u0578\u0580\u056E\u0568\u0576\u056F\u0565\u0580\u0578\u0582\u0569\u0575\u0578\u0582\u0576")}
              </span>
              <h2 className="text-3xl font-bold md:text-4xl">
                {t("\u10D7\u10E5\u10D5\u10D4\u10DC\u10D8 \u10E1\u10D0\u10DC\u10D3\u10DD \u10DE\u10D0\u10E0\u10E2\u10DC\u10D8\u10DD\u10E0\u10D8", "Your trusted partner", "\u0412\u0430\u0448 \u043D\u0430\u0434\u0435\u0436\u043D\u044B\u0439 \u043F\u0430\u0440\u0442\u043D\u0451\u0440", "\u0541\u0565\u0580 \u057E\u057D\u057F\u0561\u0570\u0565\u056C\u056B \u0563\u0578\u0580\u056E\u0568\u0576\u056F\u0565\u0580\u0568")}
              </h2>

              <div className="space-y-4">
                {differentiators.map((item) => (
                  <div
                    key={item.title}
                    className="group flex items-start gap-4 rounded-3xl border border-border/60 bg-white p-5 shadow-soft transition-smooth hover:border-primary/40 hover:shadow-medium"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <CheckCircle2 className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href={getPath("/success-stories", "/en/success-stories", "/ru/success-stories", "/hy/success-stories")}
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-6 py-3 text-sm font-semibold text-primary transition-smooth hover:border-primary/50 hover:bg-primary/10"
              >
                {t("\u10D8\u10EE\u10D8\u10DA\u10D4\u10D7 \u10EC\u10D0\u10E0\u10DB\u10D0\u10E2\u10D4\u10D1\u10E3\u10DA\u10D8 \u10E8\u10D4\u10DB\u10D7\u10EE\u10D5\u10D4\u10D5\u10D4\u10D1\u10D8", "Explore success stories", undefined, "\u0534\u056B\u057F\u0565\u056C \u0570\u0561\u057B\u0578\u0572\u0578\u0582\u0569\u0575\u0561\u0576 \u057A\u0561\u057F\u0574\u0578\u0582\u0569\u0575\u0578\u0582\u0576\u0576\u0565\u0580\u0568")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="relative flex flex-col gap-6">
              <div className="relative overflow-hidden rounded-[28px] border border-border/60 bg-white/80 shadow-soft">
                <picture>
                  <source
                    srcSet={`${typeof orchardLandscapeMobile === 'string' ? orchardLandscapeMobile : orchardLandscapeMobile.src} 900w, ${typeof orchardLandscape === 'string' ? orchardLandscape : orchardLandscape.src} 1536w`}
                    media="(max-width: 1024px)"
                  />
                  <img
                    src={typeof orchardLandscape === 'string' ? orchardLandscape : orchardLandscape.src}
                    srcSet={`${typeof orchardLandscapeMobile === 'string' ? orchardLandscapeMobile : orchardLandscapeMobile.src} 900w, ${typeof orchardLandscape === 'string' ? orchardLandscape : orchardLandscape.src} 1536w`}
                    sizes="(max-width: 1024px) 100vw, 768px"
                    alt={t(
                      "\u10E0\u10D4\u10D0\u10DA\u10E3\u10E0\u10D8 \u10E2\u10D4\u10E5\u10DC\u10D8\u10D9\u10D0 \u10E5\u10D0\u10E0\u10D7\u10E3\u10DA \u10D1\u10D0\u10E6\u10E8\u10D8",
                      "Real orchard machinery in Georgia",
                      "\u0420\u0435\u0430\u043B\u044C\u043D\u0430\u044F \u0442\u0435\u0445\u043D\u0438\u043A\u0430 \u0432 \u0441\u0430\u0434\u0443 \u0413\u0440\u0443\u0437\u0438\u0438",
                      "\u053B\u0580\u0561\u056F\u0561\u0576 \u057A\u057F\u0572\u0561\u057F\u0578\u0582\u0576\u0565\u0580\u056B \u057D\u0561\u0580\u0584\u0561\u057E\u0578\u0580\u0578\u0582\u0574\u0576\u0565\u0580 \u054E\u0580\u0561\u057D\u057F\u0561\u0576\u0578\u0582\u0574"
                    )}
                    loading="lazy"
                    fetchPriority="low"
                    decoding="async"
                    className="h-72 w-full object-cover"
                    width={1536}
                    height={1024}
                  />
                </picture>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-[24px] border border-border/60 bg-white/90 p-6 shadow-soft">
                  <p className="text-sm font-semibold text-foreground">
                    {t("\u10E1\u10D4\u10E0\u10E2\u10D8\u10E4\u10D8\u10EA\u10D8\u10E0\u10D4\u10D1\u10E3\u10DA\u10D8 \u10E2\u10D4\u10E5\u10DC\u10D8\u10D9\u10DD\u10E1\u10D4\u10D1\u10D8", "Certified technicians", undefined, "\u054D\u0565\u0580\u057F\u056B\u0586\u056B\u056F\u0561\u0581\u057E\u0561\u056E \u057F\u0565\u056D\u0576\u056B\u056F\u0578\u057D\u0576\u0565\u0580")}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t(
                      "\u10D7\u10D8\u10D7\u10DD\u10D4\u10E3\u10DA\u10D8 \u10D8\u10DC\u10E1\u10E2\u10D0\u10DA\u10D0\u10EA\u10D8\u10D0\u10E1 \u10DB\u10EE\u10D0\u10E0\u10E1 \u10E3\u10ED\u10D4\u10E0\u10E1 \u10D8\u10E2\u10D0\u10DA\u10D8\u10D0\u10E8\u10D8 \u10D2\u10D0\u10D3\u10D0\u10DB\u10D6\u10D0\u10D3\u10D4\u10D1\u10E3\u10DA\u10D8 \u10D2\u10E3\u10DC\u10D3\u10D8.",
                      "Factory-trained teams in Italy support every installation.",
                      undefined,
                      "\u053B\u057F\u0561\u056C\u056B\u0561\u0575\u0578\u0582\u0574 \u0563\u0578\u0580\u056E\u0561\u0580\u0561\u0576\u0561\u0575\u056B\u0576 \u057E\u0565\u0580\u0561\u057A\u0561\u057F\u0580\u0561\u057D\u057F\u057E\u0561\u056E \u0569\u056B\u0574\u0565\u0580\u0568 \u0561\u057B\u0561\u056F\u0581\u0578\u0582\u0574 \u0565\u0576 \u0575\u0578\u0582\u0580\u0561\u0584\u0561\u0576\u0579\u0575\u0578\u0582\u0580 \u057F\u0565\u0572\u0561\u0564\u0580\u0578\u0582\u0574:"
                    )}
                  </p>
                </div>
                <div className="rounded-[24px] border border-border/60 bg-white/90 p-6 shadow-soft">
                  <p className="text-sm font-semibold text-foreground">
                    {t("\u10D2\u10D0\u10E0\u10D0\u10DC\u10E2\u10D8\u10E3\u10DA\u10D8 \u10E3\u10D6\u10E0\u10E3\u10DC\u10D5\u10D4\u10DA\u10E7\u10DD\u10E4\u10D0", "Warranty coverage", undefined, "\u0535\u0580\u0561\u0577\u056D\u056B\u0584\u0561\u0575\u056B\u0576 \u056E\u0561\u056E\u056F\u0578\u0582\u0574")}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t(
                      "12 \u10D7\u10D5\u10D8\u10D0\u10DC\u10D8 \u10D2\u10D0\u10E0\u10D0\u10DC\u10E2\u10D8\u10D0 \u10D3\u10D0 \u10DE\u10E0\u10DD\u10E4\u10D8\u10DA\u10D0\u10E5\u10E2\u10D8\u10D9\u10E3\u10E0\u10D8 \u10DB\u10DD\u10DB\u10E1\u10D0\u10EE\u10E3\u10E0\u10D4\u10D1\u10D8\u10E1 \u10D2\u10E0\u10D0\u10E4\u10D8\u10D9\u10D8.",
                      "12-month warranty paired with preventive maintenance schedule.",
                      undefined,
                      "12 \u0561\u0574\u057D\u057E\u0561 \u0565\u0580\u0561\u0577\u056D\u056B\u0584\u055D \u0566\u0578\u0582\u0563\u0561\u056F\u0581\u057E\u0561\u056E \u056F\u0561\u0576\u056D\u0561\u0580\u0563\u0565\u056C\u0561\u056F\u0561\u0576 \u057D\u057A\u0561\u057D\u0561\u0580\u056F\u0574\u0561\u0576 \u0563\u0580\u0561\u0586\u056B\u056F\u0578\u057E:"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* <section className="relative py-24">
          <div className="container mx-auto px-4">
            <div className="rounded-[36px] border border-border/60 bg-white/90 p-8 shadow-soft backdrop-blur-sm lg:p-12">
              <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                    {language === "en" ? "Our approach" : "ჩვენი მიდგომა"}
                  </span>
                  <h2 className="mt-4 text-3xl font-bold md:text-4xl">
                    {language === "en"
                      ? "From audit to aftercare, we stay beside your team"
                      : "აუდიტიდან შემდგომ მომსახურებამდე — მუდამ თქვენს გვერდით ვართ"}
                  </h2>
                  <p className="mt-4 text-base text-muted-foreground md:text-lg">
                    {language === "en"
                      ? "Every engagement starts with understanding your terrain and ends with measurable productivity gains."
                      : "ყველა პროექტი იწყება თქვენი მიწის სპეციფიკის გააზრებით და სრულდება გაზომილი შედეგებით."}
                  </p>

                  <div className="mt-10 space-y-6">
                    {processSteps.map((step) => (
                      <div key={step.step} className="flex gap-6">
                        <span className="text-4xl font-semibold text-primary">{step.step}</span>
                        <div>
                          <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                          <p className="mt-2 text-sm text-muted-foreground md:text-base">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-8 rounded-[32px] border border-border/60 bg-muted/40 p-6 shadow-soft">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {language === "en" ? "Ready for the next season?" : "მომდევნო სეზონისთვის მზად ხართ?"}
                    </h3>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {language === "en"
                        ? "Book a 30-minute diagnostic call and receive a tailored equipment roadmap."
                        : "დაჯავშნეთ 30 წუთიანი დიაგნოსტიკა და მიიღეთ თქვენზე მორგებული ტექნიკის გეგმა."}
                    </p>
                  </div>
                  <ul className="space-y-3 text-sm text-foreground/80">
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      {language === "en" ? "ROI projection with each proposal" : "ROI პროგნოზი თითოეულ შეთავაზებაში"}
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      {language === "en" ? "Financing aligned with harvest cycles" : "დაფინანსება მოსავლის ციკლზე მორგებით"}
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      {language === "en" ? "Training for operators in Georgian" : "ტრენინგი ოპერატორებისთვის ქართულ ენაზე"}
                    </li>
                  </ul>
                  <Link href={getPath("/contact", "/en/contact")}>
                    <Button className="w-full rounded-full">
                      {language === "en" ? "Book a diagnostic call" : "დაჯავშნეთ დიაგნოსტიკა"}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section> */}

        <section className="relative pb-24 pt-12">
          <div className="container mx-auto px-4">
            <Card className="relative overflow-hidden rounded-[36px] border border-border/60 bg-gradient-to-br from-primary-dark via-primary to-primary-light px-8 py-12 text-primary-foreground shadow-strong sm:px-12">
              <span className="pointer-events-none absolute inset-0 bg-hero-grid opacity-20" />
              <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-primary-foreground/70">
                  {t("\u10DB\u10DD\u10D3\u10D8\u10D7 \u10D5\u10D8\u10E1\u10D0\u10E3\u10D1\u10E0\u10DD\u10D7", "Let's talk", undefined, "\u0535\u056F\u0565\u0584 \u056D\u0578\u057D\u0565\u0576\u0584")}
                </span>
                <h2 className="mt-4 text-3xl font-bold md:text-4xl">
                  {t(translations.home.ctaTitle.ka, translations.home.ctaTitle.en, undefined, translations.home.ctaTitle.hy)}
                </h2>
                <div className="mt-8 flex w-full flex-col gap-4 sm:flex-row sm:justify-center">
                  <Link href={getPath("/about", "/en/about", "/ru/about", "/hy/about")} className="sm:w-auto">
                    <Button
                      size="lg"
                      className="h-12 w-full rounded-full px-8 text-base font-semibold"
                    >
                      {t("\u10D2\u10D0\u10D8\u10EA\u10D0\u10DC\u10D8\u10D7 AGROIT-\u10E1 \u10D5\u10E0\u10EA\u10DA\u10D0\u10D3", "Learn more about AGROIT", undefined, "\u053B\u0574\u0561\u0576\u0561\u056C \u0561\u057E\u0565\u056C\u056B\u0576 AGROIT-\u056B \u0574\u0561\u057D\u056B\u0576")}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href={getPath("/contact", "/en/contact", "/ru/contact", "/hy/contact")} className="sm:w-auto">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="h-12 w-full rounded-full px-8 text-base text-primary"
                    >
                      {t(translations.home.contactUs.ka, translations.home.contactUs.en, undefined, translations.home.contactUs.hy)}
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>
    </>
  );
};

export default Index;
