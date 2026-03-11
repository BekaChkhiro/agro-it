"use client";

import { createContext } from "react";

export type Language = "ka" | "en" | "ru" | "hy";

export interface LanguageContextType {
  language: Language;
  t: (ka: string, en: string, ru?: string, hy?: string) => string;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
