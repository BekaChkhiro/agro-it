"use client";

import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/data/translations";
import logoImage from "@/assets/agroit-logo.webp";

const Footer = () => {
  const { language, t } = useLanguage();

  const getPath = (pathKa: string, pathEn: string) => {
    if (language === 'en' || language === 'hy') return pathEn;
    return pathKa;
  };

  return (
    <footer className="relative mt-24">
      <div className="w-full px-4">
        <div className="relative overflow-hidden rounded-[48px] border border-border/40 bg-primary-gradient text-white shadow-strong">
          <span className="pointer-events-none absolute inset-0 bg-hero-grid opacity-20" />
          <div className="pointer-events-none absolute -top-32 right-12 h-64 w-64 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-32 left-[-80px] h-72 w-72 rounded-full border border-white/5" />

          <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-12 px-8 py-14 md:grid-cols-2 lg:grid-cols-5 lg:px-12">
            <div>
              <div className="inline-flex rounded-2xl border border-white/20 bg-white/95 p-3 shadow-soft">
                <img src={typeof logoImage === 'string' ? logoImage : logoImage.src} alt="AGROIT" className="h-12 w-auto" />
              </div>
              <p className="mt-6 text-sm leading-relaxed text-white/80">
                {t(translations.footer.aboutText.ka, translations.footer.aboutText.en, undefined, translations.footer.aboutText.hy)}
              </p>
              <div className="mt-6 flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/60">
                <span>{t('იტალიური ხარისხი', 'Italian quality', undefined, '\u053b\u057f\u0561\u056c\u0561\u056f\u0561\u0576 \u0578\u0580\u0561\u056f')}</span>
                <span>{t('ადგილობრივი ექსპერტიზა', 'Local expertise', undefined, '\u054f\u0565\u0572\u0561\u056f\u0561\u0576 \u0583\u0578\u0580\u0571')}</span>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white">
                {t(translations.footer.quickLinks.ka, translations.footer.quickLinks.en, undefined, translations.footer.quickLinks.hy)}
              </h4>
              <ul className="mt-4 space-y-3 text-white/80">
                <li>
                  <Link
                    href={getPath("/venaxis-teqnika", "/en/vineyard-equipment")}
                    className="inline-flex items-center gap-2 transition-smooth hover:text-white"
                  >
                    <span className="h-px w-6 bg-white/40" />
                    {t(translations.categories.vineyard.ka, translations.categories.vineyard.en, undefined, translations.categories.vineyard.hy)}
                  </Link>
                </li>
                <li>
                  <Link
                    href={getPath("/xexilis-teqnika", "/en/orchard-equipment")}
                    className="inline-flex items-center gap-2 transition-smooth hover:text-white"
                  >
                    <span className="h-px w-6 bg-white/40" />
                    {t(translations.categories.orchard.ka, translations.categories.orchard.en, undefined, translations.categories.orchard.hy)}
                  </Link>
                </li>
                <li>
                  <Link
                    href={getPath("/kaklovani-teqnika", "/en/dry-fruits-equipment")}
                    className="inline-flex items-center gap-2 transition-smooth hover:text-white"
                  >
                    <span className="h-px w-6 bg-white/40" />
                    {t(translations.categories.dryFruits.ka, translations.categories.dryFruits.en, undefined, translations.categories.dryFruits.hy)}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white">
                {t(translations.nav.blog.ka, translations.nav.blog.en, undefined, translations.nav.blog.hy)}
              </h4>
              <ul className="mt-4 space-y-3 text-white/80">
                <li>
                  <Link
                    href={getPath("/blog", "/en/blog")}
                    className="inline-flex items-center gap-2 transition-smooth hover:text-white"
                  >
                    <span className="h-px w-6 bg-white/40" />
                    {t(translations.nav.blog.ka, translations.nav.blog.en, undefined, translations.nav.blog.hy)}
                  </Link>
                </li>
                <li>
                  <Link
                    href={getPath("/success-stories", "/en/success-stories")}
                    className="inline-flex items-center gap-2 transition-smooth hover:text-white"
                  >
                    <span className="h-px w-6 bg-white/40" />
                    {t(translations.nav.successStories.ka, translations.nav.successStories.en, undefined, translations.nav.successStories.hy)}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white">
                {t(translations.nav.about.ka, translations.nav.about.en, undefined, translations.nav.about.hy)}
              </h4>
              <ul className="mt-4 space-y-3 text-white/80">
                <li>
                  <Link
                    href={getPath("/about", "/en/about")}
                    className="inline-flex items-center gap-2 transition-smooth hover:text-white"
                  >
                    <span className="h-px w-6 bg-white/40" />
                    {t(translations.nav.about.ka, translations.nav.about.en, undefined, translations.nav.about.hy)}
                  </Link>
                </li>
                <li>
                  <Link
                    href={getPath("/contact", "/en/contact")}
                    className="inline-flex items-center gap-2 transition-smooth hover:text-white"
                  >
                    <span className="h-px w-6 bg-white/40" />
                    {t(translations.nav.contact.ka, translations.nav.contact.en, undefined, translations.nav.contact.hy)}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h4 className="text-lg font-semibold text-white">
                {t(translations.nav.contact.ka, translations.nav.contact.en, undefined, translations.nav.contact.hy)}
              </h4>
              <ul className="mt-4 space-y-4 text-white/80">
                <li className="flex w-full items-center gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white">
                    <Phone className="h-5 w-5 flex-shrink-0" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-col gap-1 text-sm font-semibold">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-white/90">{t('ინგლისურენოვანი მხარდაჭერა', 'English support', undefined, '\u0531\u0576\u0563\u056c\u0565\u0580\u0565\u0576 \u0561\u057b\u0561\u056f\u0581\u0578\u0582\u0569\u0575\u0578\u0582\u0576')}</span>
                        <span className="text-white/60">-</span>
                        <a
                          href="tel:+393343322743"
                          className="whitespace-nowrap text-white hover:text-white/80 transition-colors"
                        >
                          +39 334 332 2743
                        </a>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-white/90">{t('ქართულენოვანი მხარდაჭერა', 'Georgian support', undefined, '\u054e\u0580\u0561\u0581\u0561\u056f\u0561\u0576 \u0561\u057b\u0561\u056f\u0581\u0578\u0582\u0569\u0575\u0578\u0582\u0576')}</span>
                        <span className="text-white/60">-</span>
                        <a
                          href="tel:+995568846024"
                          className="whitespace-nowrap text-white hover:text-white/80 transition-colors"
                        >
                          +995 568 84 60 24
                        </a>
                      </div>
                    </div>
                    <div className="text-xs text-white/70">
                      {t('ორშ-შაბ: 9:00-18:00', 'Mon-Sat: 9:00-18:00', undefined, '\u0535\u0580\u056f-\u0547\u0561\u0562: 9:00-18:00')}
                    </div>
                  </div>
                </li>
                <li className="flex w-full items-center gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white">
                    <Mail className="h-5 w-5 flex-shrink-0" />
                  </div>
                  <div className="text-sm font-semibold">mario.marzano@agroit.ge</div>
                </li>
                <li className="flex w-full items-center gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white">
                    <MapPin className="h-5 w-5 flex-shrink-0" />
                  </div>
                  <div className="text-sm font-semibold">
                    {t('თბილისი, საქართველო', 'Tbilisi, Georgia', undefined, '\u0539\u0562\u056b\u056c\u056b\u057d\u056b, \u054e\u0580\u0561\u057d\u057f\u0561\u0576')}
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="relative border-t border-white/20 px-8 py-6 text-center text-sm text-white/70">
            <p>
              &copy; 2025 AGROIT. {t(translations.footer.allRightsReserved.ka, translations.footer.allRightsReserved.en, undefined, translations.footer.allRightsReserved.hy)}
            </p>
            <p className="mt-1 text-[8px] text-white/20">
              {t('საიტი შექმნილია', 'site built by', undefined, '\u056f\u0561\u0575\u0584\u0568 \u057d\u057f\u0565\u0572\u056e\u0565\u056c \u0567')}{' '}
              <a
                href="https://digitalalchemy.ge/"
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="text-white/20 hover:text-white/30 transition-colors"
              >
                Digital Alchemy - ციფრული ალქიმია
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
