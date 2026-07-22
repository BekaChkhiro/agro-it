import { type ReactNode } from "react";
import Script from "next/script";
import SiteLayout from "@/components/SiteLayout";
import { Providers } from "./providers";

type SupportedLang = "ka" | "en" | "ru" | "hy";

interface LocaleLayoutProps {
  children: ReactNode;
  lang: SupportedLang;
}

const LocaleLayout = ({ children, lang }: LocaleLayoutProps) => (
  <html lang={lang} suppressHydrationWarning>
    <head>
      {/* Google tag (gtag.js) */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-LD43CR3PQX"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-LD43CR3PQX');
        `}
      </Script>
    </head>
    <body className="bg-background text-foreground antialiased">
      <Providers initialLang={lang}>
        <SiteLayout>{children}</SiteLayout>
      </Providers>
    </body>
  </html>
);

export default LocaleLayout;
