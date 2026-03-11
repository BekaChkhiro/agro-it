import type { Language } from "@/contexts/LanguageContext/context";

interface LocalizedRecord {
  [key: string]: string | null | undefined | unknown;
}

/**
 * Get the correct language field from a database record.
 * Fallback chain: hy -> en, ru -> en, ka -> ka, en -> en
 */
export function getLocalizedField(
  record: LocalizedRecord,
  fieldBase: string,
  language: Language
): string {
  if (language === "en") return (record[`${fieldBase}_en`] as string) || "";
  if (language === "hy") return (record[`${fieldBase}_hy`] as string) || (record[`${fieldBase}_en`] as string) || "";
  if (language === "ru") return (record[`${fieldBase}_ru`] as string) || (record[`${fieldBase}_en`] as string) || "";
  return (record[`${fieldBase}_ka`] as string) || "";
}
