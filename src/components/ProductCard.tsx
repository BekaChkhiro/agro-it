import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { getOptimizedImageUrl } from "@/utils/image";

interface ProductCardProps {
  name: string;
  image: string;
  specs: string;
  link: string;
}

const ProductCard = ({ name, image, specs, link }: ProductCardProps) => {
  const { language, t } = useLanguage();
  const router = useRouter();
  const optimizedImage = useMemo(
    () => getOptimizedImageUrl(image, { width: 720, quality: 75 }),
    [image]
  );

  const handleNavigateToProduct = () => {
    if (link) {
      router.push(link);
    }
  };

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleNavigateToProduct();
    }
  };

  const handleImageClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    handleNavigateToProduct();
  };

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    handleNavigateToProduct();
  };

  return (
    <Card
      className="group relative cursor-pointer overflow-hidden rounded-3xl border border-border/60 bg-white/95 shadow-soft transition-smooth hover:-translate-y-1.5 hover:shadow-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      role="link"
      tabIndex={0}
      onClick={handleNavigateToProduct}
      onKeyDown={handleCardKeyDown}
    >
      <span className="pointer-events-none absolute inset-0 bg-soft-gradient opacity-0 transition-smooth group-hover:opacity-100" />
      <CardContent className="relative flex h-full flex-col gap-6 p-6">
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-muted/20">
          <span className="pointer-events-none absolute inset-0 bg-hero-grid opacity-40" />
          <button
            type="button"
            onClick={handleImageClick}
            className="relative z-10 flex h-48 w-full items-center justify-center bg-white/60 transition-smooth group-hover:scale-[1.02] focus:outline-none"
          >
            <img
              src={optimizedImage || image}
              alt={name}
              loading="lazy"
              className="max-h-full max-w-full object-contain"
            />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div>
            <h3 className="text-xl font-semibold text-foreground transition-smooth group-hover:text-primary">
              {name}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{specs}</p>
          </div>

          <div className="mt-auto">
            <Button variant="outline" className="w-full rounded-full" onClick={handleButtonClick}>
              <span>{t("დეტალურად", "View product", undefined, "\u0534\u056b\u057f\u0565\u056c \u0561\u057a\u0580\u0561\u0576\u0584\u0568")}</span>
              <ArrowRight className="h-4 w-4 transition-smooth group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
