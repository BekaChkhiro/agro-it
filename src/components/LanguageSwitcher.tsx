import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/contexts/LanguageContext/context";
import { Button } from "@/components/ui/button";
import { Globe, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface LangOption {
  code: Language;
  label: string;
}

const LANGUAGES: LangOption[] = [
  { code: "ka", label: "GE" },
  { code: "en", label: "EN" },
  { code: "hy", label: "HY" },
];

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLabel = LANGUAGES.find((l) => l.code === language)?.label || "GE";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen((prev) => !prev)}
        className="group relative h-9 gap-1.5 rounded-full border border-border/60 bg-white/80 px-3 text-sm font-medium transition-smooth hover:border-primary/40 hover:bg-primary/5"
      >
        <Globe className="h-4 w-4 text-muted-foreground transition-smooth group-hover:text-primary" />
        <span className="text-foreground/80 transition-smooth group-hover:text-primary">
          {currentLabel}
        </span>
        <ChevronDown className={`h-3 w-3 text-muted-foreground transition-smooth ${open ? "rotate-180" : ""}`} />
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[100px] overflow-hidden rounded-lg border border-border/60 bg-white shadow-lg">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setOpen(false);
              }}
              className={`flex w-full items-center px-4 py-2 text-sm transition-colors hover:bg-primary/5 ${
                language === lang.code
                  ? "bg-primary/10 font-semibold text-primary"
                  : "text-foreground/80"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
