"use client";

import Link from "next/link";
import BlogCard from "@/components/BlogCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { SEOHead } from "@/components/SEOHead";
import { usePublishedBlogs } from "@/hooks/useBlogs";
import { getBlogPath } from "@/utils/urlHelpers";
import { getLocalizedField } from "@/utils/languageFields";
import { BlogsPageSkeleton } from "@/components/skeletons/PageSkeletons";
import type { Blog } from "@/lib/data/types";

interface BlogsProps {
  initialBlogs?: Blog[];
}

const Blogs = ({ initialBlogs }: BlogsProps = {}) => {
  const { language, t } = useLanguage();
  const { data: blogs = initialBlogs || [], isLoading: queryLoading, error } = usePublishedBlogs();
  // If we have server-fetched data, skip the loading state on first render
  const isLoading = initialBlogs ? false : queryLoading;

  // Sort blogs: featured first, then by publish date
  const sortedBlogs = [...blogs].sort((a, b) => {
    // Featured blogs come first
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;

    // Then sort by publish date (newest first)
    const dateA = a.publish_date ? new Date(a.publish_date).getTime() : 0;
    const dateB = b.publish_date ? new Date(b.publish_date).getTime() : 0;
    return dateB - dateA;
  });

  // SEO metadata
  const seoTitle = t("ბლოგი - სასოფლო-სამეურნეო ტექნიკა", "Blog - Agricultural Equipment Tips & News", undefined, "Բլոգ - Գյուղատնտեսական սարքավորումների խորհուրդներ");
  const seoDescription = language === "en"
    ? "Discover expert tips, industry news, and insights about agricultural equipment, vineyard management, and farming technology in Georgia."
    : "გაეცანით ექსპერტთა რჩევებს, ინდუსტრიის სიახლეებს და სასოფლო-სამეურნეო ტექნიკის, ვენახის მართვისა და სოფლის მეურნეობის ტექნოლოგიების შესახებ.";
  const seoPath = language === "en" ? "/en/blogs" : language === "ru" ? "/ru/blogs" : language === "hy" ? "/hy/blogs" : "/blogs";

  const seoMeta = (
    <SEOHead
      title={seoTitle}
      description={seoDescription}
      path={seoPath}
      type="website"
      keywords={language === "en"
        ? "agricultural equipment blog, vineyard tips, farming technology, Georgia agriculture"
        : "სასოფლო-სამეურნეო ტექნიკის ბლოგი, ვენახის რჩევები, სოფლის მეურნეობის ტექნოლოგია"}
    />
  );

  if (isLoading) {
    return (
      <>
        {seoMeta}
        <BlogsPageSkeleton />
      </>
    );
  }

  if (error) {
    return (
      <>
        {seoMeta}
        <main className="flex min-h-[60vh] items-center justify-center bg-background pb-24">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-foreground">
              {t("ბლოგების ჩატვირთვის შეცდომა", "Error Loading Blogs", undefined, "Բլոգների բեռնման սխալ")}
            </h1>
            <p className="mb-6 text-muted-foreground">
              {language === "en"
                ? "We encountered an error while loading the blogs. Please try again later."
                : "ბლოგების ჩატვირთვისას მოხდა შეცდომა. გთხოვთ სცადოთ მოგვიანებით."}
            </p>
            <Link
              href={language === "en" ? "/en" : language === "ru" ? "/ru" : language === "hy" ? "/hy" : "/"}
              className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-smooth hover:bg-primary/90"
            >
              {t("მთავარზე დაბრუნება", "Go Home", undefined, "Գլխավոր էջ")}
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      {seoMeta}
      <main className="bg-background pb-24">
        <section className="relative overflow-hidden pb-10 pt-12 md:pt-14">
          <div className="absolute inset-0 -z-10 bg-background surface-gradient" />
          <div className="absolute right-[-15%] top-[-25%] hidden h-[420px] w-[420px] rounded-full bg-primary/15 blur-3xl lg:block" />

          <div className="container mx-auto px-4">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
              <Link href={language === "en" ? "/en" : language === "ru" ? "/ru" : language === "hy" ? "/hy" : "/"} className="transition-smooth hover:text-foreground">
                {t("მთავარი", "Home", undefined, "Գլխավոր")}
              </Link>
              <span>/</span>
              <span className="text-foreground">
                {t("ბლოგი", "Blog", undefined, "Բլոգ")}
              </span>
            </nav>

            {/* Page Header */}
            <div className="mt-10">
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                {t("სიახლეები და რჩევები", "Insights & Updates", undefined, "Վերլուծություններ և նորություններ")}
              </span>
              <h1 className="mt-4 text-4xl font-bold leading-tight text-foreground md:text-5xl">
                {t("ბლოგი", "Blog", undefined, "Բլոգ")}
              </h1>
              <p className="mt-4 text-base text-muted-foreground md:text-lg max-w-3xl">
                {language === "en"
                  ? "Discover expert tips, industry news, and insights about agricultural equipment, vineyard management, and farming technology."
                  : "გაეცანით ექსპერტთა რჩევებს, ინდუსტრიის სიახლეებს და სასოფლო-სამეურნეო ტექნიკის, ვენახის მართვისა და სოფლის მეურნეობის ტექნოლოგიების შესახებ."}
              </p>
            </div>

            {/* Blog Grid */}
            {sortedBlogs.length > 0 ? (
              <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {sortedBlogs.map((blog) => (
                  <BlogCard
                    key={blog.id}
                    title={getLocalizedField(blog, "title", language)}
                    excerpt={getLocalizedField(blog, "excerpt", language)}
                    image={blog.featured_image_url || ""}
                    author={blog.author}
                    publishDate={blog.publish_date}
                    link={getBlogPath(getLocalizedField(blog, "slug", language) || null, language)}
                    featured={blog.is_featured || false}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-12 text-center py-20">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                  <svg
                    className="h-12 w-12 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h2 className="mt-6 text-2xl font-semibold text-foreground">
                  {t("ჯერ არ არის ბლოგ პოსტები", "No blog posts yet", undefined, "Բլոգի գրառումներ դեռ չկան")}
                </h2>
                <p className="mt-2 text-muted-foreground">
                  {language === "en"
                    ? "Check back soon for expert tips and industry news."
                    : "მალე გამოვაქვეყნებთ ექსპერტთა რჩევებს და ინდუსტრიის სიახლეებს."}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
};

export default Blogs;
