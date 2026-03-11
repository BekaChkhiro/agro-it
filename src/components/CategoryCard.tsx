import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

interface CategoryCardProps {
  title: string;
  description: string;
  image: string;
  link: string;
  icon?: string;
  label?: string;
}

const CategoryCard = ({ title, description, image, link, icon, label }: CategoryCardProps) => {
  const { language, t } = useLanguage();
  const defaultLabel = t("იტალიური არჩევანი", "Italian lineup");

  return (
    <Card className="group relative overflow-hidden rounded-[32px] border border-border/60 bg-white shadow-soft transition-smooth hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-strong">
      <span className="pointer-events-none absolute inset-0 bg-soft-gradient opacity-0 transition-smooth group-hover:opacity-100" />

      <CardContent className="relative flex h-full flex-col gap-6 p-6">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-muted/60">
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="relative z-10 h-48 w-full object-cover transition-smooth group-hover:scale-105"
          />
          <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-foreground/60">
            {label ?? defaultLabel}
          </div>
          {icon && (
            <div className="absolute right-5 top-5 rounded-2xl bg-white/85 p-3 text-4xl text-primary shadow-soft">
              {icon}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div>
            <h3 className="text-xl font-semibold text-foreground transition-smooth group-hover:text-primary">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
              {description}
            </p>
          </div>

          <Link href={link} className="mt-auto inline-flex items-center justify-between rounded-full border border-primary/30 bg-primary/5 px-5 py-3 text-sm font-semibold text-primary transition-smooth hover:border-primary/60 hover:bg-primary/10">
            <span>{t("იხილეთ არჩევანი", "Explore range")}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;
