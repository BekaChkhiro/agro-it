"use client";

import type { CSSProperties, MouseEvent, TouchEvent } from "react";
import { useRef, useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/data/translations";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import annovi from "@/assets/supplier-logos/annovi.webp";
import berardinucci from "@/assets/supplier-logos/berardinucci.webp";
import cala from "@/assets/supplier-logos/cala.webp";
import facma from "@/assets/supplier-logos/facma.webp";
import famaPruning from "@/assets/supplier-logos/fama-pruning.webp";
import fruitControl from "@/assets/supplier-logos/fruit-control.webp";
import gfCostruzioni from "@/assets/supplier-logos/gf-costruzioni-meccaniche.webp";
import idealLogo from "@/assets/supplier-logos/ideal-logo.webp";
import jagoda from "@/assets/supplier-logos/jagoda.webp";
import clemens from "@/assets/supplier-logos/logo-clemens.webp";
import tecnofruit from "@/assets/supplier-logos/logo-tecnofruit.webp";
import maggio from "@/assets/supplier-logos/maggio.webp";
import ortiflor from "@/assets/supplier-logos/ortiflor.webp";
import salf from "@/assets/supplier-logos/salf.webp";
import sorma from "@/assets/supplier-logos/sorma.webp";
import vivaiFortunato from "@/assets/supplier-logos/vivai-fortunato.webp";
import zanon from "@/assets/supplier-logos/zanon-logo.webp";

const formatName = (fileName: string) =>
  fileName
    .replace(/\.[^/.]+$/, "")
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const supplierLogos = [
  { name: formatName("annovi.webp"), logo: annovi },
  { name: formatName("berardinucci.webp"), logo: berardinucci },
  { name: formatName("cala.webp"), logo: cala },
  { name: formatName("facma.webp"), logo: facma },
  { name: formatName("fama-pruning.webp"), logo: famaPruning },
  { name: formatName("fruit-control.webp"), logo: fruitControl },
  { name: formatName("gf-costruzioni-meccaniche.webp"), logo: gfCostruzioni },
  { name: formatName("ideal-logo.webp"), logo: idealLogo },
  { name: formatName("jagoda.webp"), logo: jagoda },
  { name: formatName("logo-clemens.webp"), logo: clemens },
  { name: formatName("logo-tecnofruit.webp"), logo: tecnofruit },
  { name: formatName("maggio.webp"), logo: maggio },
  { name: formatName("ortiflor.webp"), logo: ortiflor },
  { name: formatName("salf.webp"), logo: salf },
  { name: formatName("sorma.webp"), logo: sorma },
  { name: formatName("vivai-fortunato.webp"), logo: vivaiFortunato },
  { name: formatName("zanon-logo.webp"), logo: zanon },
].sort((a, b) => a.name.localeCompare(b.name));

const PartnerBrands = () => {
  const { t, language } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef({
    startX: 0,
    scrollLeft: 0,
  });

  const setAnimationState = useCallback((state: "running" | "paused") => {
    if (trackRef.current) {
      trackRef.current.style.animationPlayState = state;
    }
  }, []);

  const pauseAnimation = useCallback(() => setAnimationState("paused"), [setAnimationState]);
  const resumeAnimation = useCallback(() => {
    if (!isDragging) {
      setAnimationState("running");
    }
  }, [isDragging, setAnimationState]);

  const duplicatedLogos = [...supplierLogos, ...supplierLogos];
  const scrollDistance = Math.max(supplierLogos.length, 1) * 13;
  const trackStyle = {
    "--scroll-distance": `${scrollDistance}rem`,
  } as CSSProperties;
  const handleMouseDown = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const container = scrollContainerRef.current;
      if (!container) return;
      event.preventDefault();
      setIsDragging(true);
      const rect = container.getBoundingClientRect();
      dragStateRef.current.startX = event.pageX - rect.left;
      dragStateRef.current.scrollLeft = container.scrollLeft;
      pauseAnimation();
    },
    [pauseAnimation]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const container = scrollContainerRef.current;
      if (!isDragging || !container) return;
      event.preventDefault();
      const rect = container.getBoundingClientRect();
      const x = event.pageX - rect.left;
      const walk = (x - dragStateRef.current.startX) * 1.2;
      container.scrollLeft = dragStateRef.current.scrollLeft - walk;
    },
    [isDragging]
  );

  const handleTouchStart = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      const container = scrollContainerRef.current;
      if (!container) return;
      setIsDragging(true);
      const rect = container.getBoundingClientRect();
      dragStateRef.current.startX = event.touches[0].pageX - rect.left;
      dragStateRef.current.scrollLeft = container.scrollLeft;
      pauseAnimation();
    },
    [pauseAnimation]
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      const container = scrollContainerRef.current;
      if (!isDragging || !container) return;
      event.preventDefault();
      const rect = container.getBoundingClientRect();
      const x = event.touches[0].pageX - rect.left;
      const walk = (x - dragStateRef.current.startX) * 1.2;
      container.scrollLeft = dragStateRef.current.scrollLeft - walk;
    },
    [isDragging]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerEnd = () => {
      setIsDragging(false);
      resumeAnimation();
    };

    window.addEventListener("mouseup", handlePointerEnd);
    window.addEventListener("mouseleave", handlePointerEnd);
    window.addEventListener("touchend", handlePointerEnd);
    window.addEventListener("touchcancel", handlePointerEnd);

    return () => {
      window.removeEventListener("mouseup", handlePointerEnd);
      window.removeEventListener("mouseleave", handlePointerEnd);
      window.removeEventListener("touchend", handlePointerEnd);
      window.removeEventListener("touchcancel", handlePointerEnd);
    };
  }, [isDragging, resumeAnimation]);

  const tooltipDetail =
    language === "en"
      ? "Trusted supplier"
      : language === "ru"
      ? "Надежный поставщик"
      : "სანდო მომწოდებელი";

  return (
    <section className="relative overflow-hidden py-16 bg-muted/30">
      <div className="absolute inset-0 -z-10 bg-hero-grid opacity-10" />

      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            {t(translations.common.partnerBrands.ka, translations.common.partnerBrands.en)}
          </span>
          <h2 className="mt-3 text-2xl font-bold text-foreground md:text-3xl">
            {t(translations.common.trustedByLeading.ka, translations.common.trustedByLeading.en)}
          </h2>
        </div>

        <div className="relative select-none">
          <div className="absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-muted/30 to-transparent" />
          <div className="absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-muted/30 to-transparent" />

          <div
            ref={scrollContainerRef}
            className="overflow-hidden"
            onMouseEnter={pauseAnimation}
            onMouseLeave={resumeAnimation}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            <TooltipProvider delayDuration={150}>
              <div
                ref={trackRef}
                className="flex animate-scroll gap-8 cursor-grab active:cursor-grabbing"
                style={trackStyle}
              >
                {duplicatedLogos.map((brand, index) => (
                  <Tooltip key={`${brand.name}-${index}`}>
                    <TooltipTrigger asChild>
                      <div
                        className="group flex h-24 w-44 flex-shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-white px-6 shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-medium"
                        aria-label={`${brand.name} — ${tooltipDetail}`}
                      >
                        <img
                          src={typeof brand.logo === 'string' ? brand.logo : brand.logo.src}
                          alt={brand.name}
                          className="h-auto max-h-16 w-full object-contain opacity-80 transition-smooth group-hover:opacity-100"
                          loading="lazy"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center" className="max-w-xs text-center">
                      <p className="font-semibold text-foreground">{brand.name}</p>
                      <p className="text-xs text-muted-foreground">{tooltipDetail}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-1 * var(--scroll-distance, 120rem)));
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default PartnerBrands;
