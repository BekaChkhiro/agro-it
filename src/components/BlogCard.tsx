import Link from "next/link";
import { ArrowRight, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

interface BlogCardProps {
  title: string;
  excerpt: string;
  image: string;
  author: string | null;
  publishDate: string | null;
  link: string;
  featured?: boolean;
}

const BlogCard = ({ title, excerpt, image, author, publishDate, link, featured = false }: BlogCardProps) => {
  const { language, t } = useLanguage();

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const locale = language === "en" ? "en-US" : language === "hy" ? "hy-AM" : "ka-GE";
    return date.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <Card className={`group relative overflow-hidden rounded-3xl border border-border/60 bg-white/95 shadow-soft transition-smooth hover:-translate-y-1.5 hover:shadow-strong ${featured ? "ring-2 ring-primary/20" : ""}`}>
      <span className="pointer-events-none absolute inset-0 bg-soft-gradient opacity-0 transition-smooth group-hover:opacity-100" />
      <CardContent className="relative flex h-full flex-col gap-6 p-6">
        <div className="relative overflow-hidden rounded-2xl border border-border/60">
          <span className="pointer-events-none absolute inset-0 bg-hero-grid opacity-40" />
          {image ? (
            <img
              src={image}
              alt={title}
              loading="lazy"
              className="relative z-10 h-48 w-full object-cover transition-smooth group-hover:scale-105"
            />
          ) : (
            <div className="relative z-10 h-48 w-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">
                {t("სურათი არ არის", "No image")}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div>
            <h3 className="text-xl font-semibold text-foreground transition-smooth group-hover:text-primary line-clamp-2">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">{excerpt}</p>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {author && (
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                <span>{author}</span>
              </div>
            )}
            {publishDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(publishDate)}</span>
              </div>
            )}
          </div>

          <Link href={link} className="mt-auto">
            <Button variant="outline" className="w-full rounded-full">
              <span>{t("წაიკითხეთ მეტი", "Read more")}</span>
              <ArrowRight className="h-4 w-4 transition-smooth group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogCard;
