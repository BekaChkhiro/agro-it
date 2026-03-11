"use client";

import dynamic from "next/dynamic";
import { ReactNode, Suspense, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import ScrollToTop from "@/components/ScrollToTop";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { RouteTransitionProvider } from "@/contexts/RouteTransitionContext";
import type { Language } from "@/contexts/LanguageContext/context";

const CookieConsent = dynamic(() => import("@/components/CookieConsent").then((mod) => mod.CookieConsent), {
  ssr: false,
});

interface ProvidersProps {
  children: ReactNode;
  initialLang?: Language;
}

export const Providers = ({ children, initialLang }: ProvidersProps) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Suspense fallback={null}>
          <LanguageProvider initialLang={initialLang}>
            <RouteTransitionProvider>
              <ScrollToTop />
              <Suspense fallback={null}>
                <CookieConsent />
              </Suspense>
              {children}
            </RouteTransitionProvider>
          </LanguageProvider>
          </Suspense>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};
