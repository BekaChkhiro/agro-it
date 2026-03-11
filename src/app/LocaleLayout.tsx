import { type ReactNode } from "react";
import SiteLayout from "@/components/SiteLayout";
import { Providers } from "./providers";

type SupportedLang = "ka" | "en" | "ru" | "hy";

interface LocaleLayoutProps {
  children: ReactNode;
  lang: SupportedLang;
}

const LocaleLayout = ({ children, lang }: LocaleLayoutProps) => (
  <html lang={lang} suppressHydrationWarning>
    <body className="bg-background text-foreground antialiased">
      <Providers initialLang={lang}>
        <SiteLayout>{children}</SiteLayout>
      </Providers>
    </body>
  </html>
);

export default LocaleLayout;
