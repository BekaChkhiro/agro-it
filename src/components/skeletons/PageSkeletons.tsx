/**
 * Skeleton loading components for public-facing pages.
 * These mimic the actual layout of each page while data is loading.
 */
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

// ─────────────────────────────────────────────────────────────────────────────
// ProductCardSkeleton – matches ProductCard layout
// ─────────────────────────────────────────────────────────────────────────────
export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-3xl border border-border/60 bg-white/95 shadow-soft">
      <CardContent className="flex h-full flex-col gap-6 p-6">
        {/* Image placeholder */}
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted/20">
          <Skeleton className="h-48 w-full" />
        </div>
        {/* Text content */}
        <div className="flex flex-1 flex-col gap-4">
          <div>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-1 h-4 w-5/6" />
          </div>
          {/* Button placeholder */}
          <div className="mt-auto">
            <Skeleton className="h-10 w-full rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BlogCardSkeleton – matches BlogCard layout
// ─────────────────────────────────────────────────────────────────────────────
export function BlogCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-3xl border border-border/60 bg-white/95 shadow-soft">
      <CardContent className="flex h-full flex-col gap-6 p-6">
        {/* Image placeholder */}
        <div className="overflow-hidden rounded-2xl border border-border/60">
          <Skeleton className="h-48 w-full" />
        </div>
        {/* Text content */}
        <div className="flex flex-1 flex-col gap-4">
          <div>
            <Skeleton className="h-6 w-4/5" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-1 h-4 w-full" />
            <Skeleton className="mt-1 h-4 w-3/4" />
          </div>
          {/* Meta info placeholder */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          {/* Button placeholder */}
          <div className="mt-auto">
            <Skeleton className="h-10 w-full rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CategoryCardSkeleton – matches featured category cards in Products page
// ─────────────────────────────────────────────────────────────────────────────
export function CategoryCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[32px] border border-border/60 bg-white shadow-soft">
      <Skeleton className="h-48" />
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProductsPageSkeleton – full Products page loading state
// ─────────────────────────────────────────────────────────────────────────────
export function ProductsPageSkeleton() {
  return (
    <main className="bg-background pb-24">
      {/* Hero section */}
      <section className="relative overflow-hidden pb-16 pt-20 md:pt-24">
        <div className="absolute inset-0 -z-10 bg-background surface-gradient" />
        <div className="container mx-auto px-4">
          <div className="max-w-3xl space-y-6 text-center md:text-left">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full max-w-xl" />
            <Skeleton className="h-6 w-full max-w-lg" />
          </div>
        </div>
      </section>

      {/* Category cards (desktop) */}
      <section className="hidden pb-20 lg:block">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Products grid (mobile) */}
      <section className="pb-20 lg:hidden">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="w-full max-w-md space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BlogsPageSkeleton – full Blogs page loading state
// ─────────────────────────────────────────────────────────────────────────────
export function BlogsPageSkeleton() {
  return (
    <main className="bg-background pb-24">
      <section className="relative overflow-hidden pb-10 pt-12 md:pt-14">
        <div className="absolute inset-0 -z-10 bg-background surface-gradient" />
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-12" />
            <span className="text-muted-foreground">/</span>
            <Skeleton className="h-4 w-10" />
          </div>

          {/* Page header */}
          <div className="mt-10">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-4 h-12 w-48" />
            <Skeleton className="mt-4 h-6 w-full max-w-2xl" />
          </div>

          {/* Blog grid */}
          <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProductDetailSkeleton – full ProductDetail page loading state
// ─────────────────────────────────────────────────────────────────────────────
export function ProductDetailSkeleton() {
  return (
    <main className="bg-background pb-24">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 pt-8">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <span className="text-muted-foreground">/</span>
          <Skeleton className="h-4 w-20" />
          <span className="text-muted-foreground">/</span>
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Product detail section */}
      <section className="container mx-auto px-4 pt-10">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Gallery */}
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-3xl" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-20 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Product info */}
          <div className="space-y-6">
            <div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-10 w-3/4" />
            </div>
            <Skeleton className="h-24 w-full" />
            
            {/* Specs */}
            <div className="space-y-3">
              <Skeleton className="h-6 w-32" />
              <div className="grid gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                ))}
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex gap-4 pt-4">
              <Skeleton className="h-12 flex-1 rounded-full" />
              <Skeleton className="h-12 flex-1 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Related products */}
      <section className="container mx-auto px-4 pt-20">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CategoryPageSkeleton – full CategoryPage loading state
// ─────────────────────────────────────────────────────────────────────────────
export function CategoryPageSkeleton() {
  return (
    <main className="bg-background pb-24">
      {/* Hero banner */}
      <section className="relative overflow-hidden pb-16 pt-20 md:pt-24">
        <div className="absolute inset-0 -z-10 bg-background surface-gradient" />
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8">
            <Skeleton className="h-4 w-12" />
            <span className="text-muted-foreground">/</span>
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="max-w-3xl space-y-6">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-12 w-full max-w-md" />
            <Skeleton className="h-6 w-full max-w-lg" />
          </div>
        </div>
      </section>

      {/* Search and filters */}
      <section className="container mx-auto px-4 pb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full max-w-md space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <Skeleton className="h-4 w-40" />
        </div>
      </section>

      {/* Products grid */}
      <section className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SuccessStoriesPageSkeleton – full SuccessStories page loading state
// ─────────────────────────────────────────────────────────────────────────────
export function SuccessStoriesPageSkeleton() {
  return (
    <main className="bg-background pb-24">
      <section className="relative overflow-hidden pb-10 pt-12 md:pt-14">
        <div className="absolute inset-0 -z-10 bg-background surface-gradient" />
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-12" />
            <span className="text-muted-foreground">/</span>
            <Skeleton className="h-4 w-28" />
          </div>

          {/* Page header */}
          <div className="mt-10">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-4 h-12 w-64" />
            <Skeleton className="mt-4 h-6 w-full max-w-2xl" />
          </div>

          {/* Stories grid */}
          <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden rounded-3xl border border-border/60 bg-white/95 shadow-soft">
                <CardContent className="flex h-full flex-col gap-6 p-6">
                  <Skeleton className="h-48 w-full rounded-2xl" />
                  <div className="flex flex-1 flex-col gap-4">
                    <Skeleton className="h-6 w-4/5" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="mt-auto h-4 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BlogDetailSkeleton – full BlogDetail page loading state
// ─────────────────────────────────────────────────────────────────────────────
export function BlogDetailSkeleton() {
  return (
    <main className="bg-background pb-24">
      <article className="container mx-auto px-4 pt-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <Skeleton className="h-4 w-12" />
          <span className="text-muted-foreground">/</span>
          <Skeleton className="h-4 w-10" />
          <span className="text-muted-foreground">/</span>
          <Skeleton className="h-4 w-40" />
        </div>

        {/* Hero image */}
        <Skeleton className="aspect-video w-full rounded-3xl mb-8" />

        {/* Title and meta */}
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-10 w-3/4 mb-6" />
          
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-28" />
          </div>

          {/* Content */}
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
            <Skeleton className="h-5 w-4/5" />
            <div className="py-4" />
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        </div>
      </article>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SuccessStoryDetailSkeleton – full SuccessStoryDetail page loading state
// ─────────────────────────────────────────────────────────────────────────────
export function SuccessStoryDetailSkeleton() {
  return (
    <main className="bg-background pb-24">
      <article className="container mx-auto px-4 pt-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <Skeleton className="h-4 w-12" />
          <span className="text-muted-foreground">/</span>
          <Skeleton className="h-4 w-28" />
          <span className="text-muted-foreground">/</span>
          <Skeleton className="h-4 w-36" />
        </div>

        {/* Hero image */}
        <Skeleton className="aspect-video w-full rounded-3xl mb-8" />

        {/* Title and meta */}
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-10 w-2/3 mb-6" />

          {/* Content */}
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
            <Skeleton className="h-5 w-3/4" />
          </div>
        </div>
      </article>
    </main>
  );
}

