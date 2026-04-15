"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BlogCard from "@/components/BlogCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { useBlogBySlug, usePublishedBlogs } from "@/hooks/useBlogs";
import { getBlogPath } from "@/utils/urlHelpers";
import { getLocalizedField } from "@/utils/languageFields";
import DOMPurify from "dompurify";
import { BlogDetailSkeleton } from "@/components/skeletons/PageSkeletons";

const BlogDetail = () => {
  const params = useParams();
  const blogSlug = params?.blogSlug as string;
  const { language, t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(0);

  // Fetch blog by slug
  const {
    data: blog,
    isLoading,
    error,
  } = useBlogBySlug(blogSlug);

  // Fetch recent blogs for "Related Posts" section
  const { data: recentBlogs = [] } = usePublishedBlogs();

  // Filter out current blog and limit to 3 recent posts
  const relatedBlogs = recentBlogs
    .filter((b) => b.id !== blog?.id)
    .sort((a, b) => {
      // Featured first, then by date
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      const dateA = a.publish_date ? new Date(a.publish_date).getTime() : 0;
      const dateB = b.publish_date ? new Date(b.publish_date).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 3);

  // Gallery images from blog data (clean %0A from URLs)
  const cleanUrl = (url: string) => url.replace(/%0[aA]/g, '');
  const galleryImages = blog?.gallery_image_urls && Array.isArray(blog.gallery_image_urls)
    ? blog.gallery_image_urls.filter((url): url is string => typeof url === "string").map(cleanUrl)
    : blog?.featured_image_url
    ? [cleanUrl(blog.featured_image_url)]
    : [];

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (language === "en") return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    if (language === "hy") return date.toLocaleDateString("hy-AM", { year: "numeric", month: "long", day: "numeric" });
    if (language === "ru") return date.toLocaleDateString("ru-RU", { year: "numeric", month: "long", day: "numeric" });
    return date.toLocaleDateString("ka-GE", { year: "numeric", month: "long", day: "numeric" });
  };

  // Sanitize HTML content to prevent XSS attacks
  const sanitizedContent = useMemo(() => {
    if (!blog) return "";

    let rawContent = getLocalizedField(blog, "content", language) || "";

    // If content is plain text (no HTML tags), convert to HTML
    if (rawContent && !/<[a-z][\s\S]*>/i.test(rawContent)) {
      rawContent = rawContent
        .split(/\n{2,}/)
        .filter((block) => block.trim())
        .map((block) => {
          const trimmed = block.trim();
          // Detect numbered list items (e.g. "1. Title")
          if (/^\d+\.\s/.test(trimmed)) {
            return `<h3>${trimmed}</h3>`;
          }
          // Convert single newlines within a block to <br>
          return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;
        })
        .join('\n');
    }

    // Configure DOMPurify to allow safe HTML tags and attributes
    const cleanContent = DOMPurify.sanitize(rawContent, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'hr',
        'strong', 'em', 'u', 'b', 'i', 's', 'mark',
        'ul', 'ol', 'li',
        'a', 'img',
        'blockquote', 'pre', 'code',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span'
      ],
      ALLOWED_ATTR: [
        'href', 'title',
        'src', 'alt', 'width', 'height'
      ],
      ALLOWED_URI_REGEXP: /^https?:\/\//i,
      KEEP_CONTENT: true,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      SAFE_FOR_TEMPLATES: true,
    });

    return cleanContent;
  }, [blog, language]);

  // Loading state
  if (isLoading) {
    return <BlogDetailSkeleton />;
  }

  // Error state (404)
  if (error || !blog) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-background pb-24">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-foreground">
            {t("ბლოგ პოსტი არ მოიძებნა", "Blog Post Not Found")}
          </h1>
          <p className="mb-6 text-muted-foreground">
            {language === "en"
              ? "The blog post you're looking for doesn't exist or has been removed."
              : "ბლოგ პოსტი რომლის ძებნაც გსურთ არ არსებობს ან წაშლილია."}
          </p>
          <Link href={language === "en" ? "/en/blogs" : language === "ru" ? "/ru/blogs" : language === "hy" ? "/hy/blogs" : "/blogs"}>
            <Button>
              {t("ბლოგზე დაბრუნება", "Back to Blog")}
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <SchemaMarkup
        article={{
          headline: blog.title_ka,
          image: blog.featured_image_url || undefined,
          datePublished: blog.publish_date || blog.created_at || undefined,
          dateModified: blog.updated_at || undefined,
          author: {
            name: "AGROIT",
          },
        }}
      />

      <main className="bg-background pb-24">
        <article className="relative overflow-hidden pb-10 pt-12 md:pt-14">
          <div className="absolute inset-0 -z-10 bg-background surface-gradient" />
          <div className="absolute right-[-15%] top-[-25%] hidden h-[420px] w-[420px] rounded-full bg-primary/15 blur-3xl lg:block" />

          <div className="container mx-auto px-4">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
              <Link href={language === "en" ? "/en" : language === "ru" ? "/ru" : language === "hy" ? "/hy" : "/"} className="transition-smooth hover:text-foreground">
                {t("მთავარი", "Home")}
              </Link>
              <span>/</span>
              <Link href={language === "en" ? "/en/blogs" : language === "ru" ? "/ru/blogs" : language === "hy" ? "/hy/blogs" : "/blogs"} className="transition-smooth hover:text-foreground">
                {t("ბლოგი", "Blog")}
              </Link>
              <span>/</span>
              <span className="text-foreground line-clamp-1">
                {getLocalizedField(blog, "title", language)}
              </span>
            </nav>

            <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_0.8fr]">
              {/* Main Content */}
              <div>
                <div className="overflow-hidden rounded-[32px] border border-border/60 bg-white/90 p-4 shadow-soft">
                  {galleryImages.length > 0 ? (
                    <img
                      src={galleryImages[selectedImage]}
                      alt={blog ? (getLocalizedField(blog, "title", language)) : ""}
                      className="h-[420px] w-full rounded-[24px] object-cover"
                    />
                  ) : (
                    <div className="h-[420px] w-full rounded-[24px] bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">
                        {t("სურათი არ არის", "No image available")}
                      </span>
                    </div>
                  )}
                </div>
                {galleryImages.length > 1 && (
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    {galleryImages.map((image, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedImage(index)}
                        className={`overflow-hidden rounded-2xl border border-border/60 bg-white/80 p-2 shadow-soft transition-smooth ${
                          selectedImage === index ? "ring-2 ring-primary" : ""
                        }`}
                        aria-label={`View image ${index + 1}`}
                      >
                        <img
                          src={image}
                          alt={`${blog ? (getLocalizedField(blog, "title", language)) : ""} ${index + 1}`}
                          className="h-24 w-full rounded-xl object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                    {t("ბლოგ პოსტი", "Blog Post")}
                  </span>
                  <h1 className="mt-4 text-4xl font-bold leading-tight text-foreground md:text-5xl">
                    {getLocalizedField(blog, "title", language)}
                  </h1>

                  {/* Meta info */}
                  <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {blog.author && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" aria-hidden="true" />
                        <span>{blog.author}</span>
                      </div>
                    )}
                    {blog.publish_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" aria-hidden="true" />
                        <time dateTime={blog.publish_date}>{formatDate(blog.publish_date)}</time>
                      </div>
                    )}
                  </div>

                  {/* Excerpt */}
                  {(blog.excerpt_en || blog.excerpt_ka) && (
                    <p className="mt-4 text-base text-muted-foreground md:text-lg">
                      {getLocalizedField(blog, "excerpt", language)}
                    </p>
                  )}
                </div>

                <Card className="rounded-[28px] border border-border/60 bg-white/95 shadow-soft">
                  <CardContent className="space-y-3 p-6">
                    <h2 className="text-lg font-semibold text-foreground">
                      {t("პოსტის შესახებ", "About this post")}
                    </h2>
                    <div className="text-sm text-muted-foreground space-y-2">
                      {blog.view_count !== null && blog.view_count > 0 && (
                        <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-muted/40 px-4 py-3">
                          <span>{t("ნახვები", "Views")}</span>
                          <span className="font-semibold text-foreground">{blog.view_count}</span>
                        </div>
                      )}
                      {blog.publish_date && (
                        <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-muted/40 px-4 py-3">
                          <span>{t("გამოქვეყნდა", "Published")}</span>
                          <time dateTime={blog.publish_date} className="font-semibold text-foreground">
                            {formatDate(blog.publish_date)}
                          </time>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-col gap-4">
                  <Link href={language === "en" ? "/en/contact" : language === "ru" ? "/ru/contact" : language === "hy" ? "/hy/contact" : "/contact"} className="w-full">
                    <Button size="lg" className="h-12 w-full rounded-full px-8 text-base">
                      {t("დაგვიკავშირდით", "Get in touch")}
                    </Button>
                  </Link>
                  <Link href={language === "en" ? "/en/blogs" : language === "ru" ? "/ru/blogs" : language === "hy" ? "/hy/blogs" : "/blogs"} className="w-full">
                    <Button size="lg" variant="outline" className="h-12 w-full rounded-full px-8 text-base">
                      {t("ყველა პოსტის ნახვა", "View all posts")}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Blog Content */}
            <div className="mt-10">
              <Card className="rounded-[28px] border border-border/60 bg-white/95 shadow-soft">
                <CardContent className="p-8 md:p-12">
                  <div className="prose prose-lg max-w-none text-foreground prose-headings:text-foreground prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3 prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4 prose-ul:text-muted-foreground prose-ol:text-muted-foreground prose-li:mb-2 prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
                    {/* Render sanitized HTML content to prevent XSS attacks */}
                    <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </article>

        {/* Related Posts Section */}
        {relatedBlogs.length > 0 && (
          <section className="py-24 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                    {t("კიდევ წაიკითხეთ", "More to read")}
                  </span>
                  <h2 className="text-3xl font-semibold text-foreground md:text-4xl">
                    {t("მსგავსი პოსტები", "Related posts")}
                  </h2>
                </div>
                <Link
                  href={language === "en" ? "/en/blogs" : language === "ru" ? "/ru/blogs" : language === "hy" ? "/hy/blogs" : "/blogs"}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-smooth hover:gap-3"
                >
                  {t("ყველა პოსტის ნახვა", "View all posts")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {relatedBlogs.map((relatedBlog) => (
                  <BlogCard
                    key={relatedBlog.id}
                    title={getLocalizedField(relatedBlog, "title", language)}
                    excerpt={getLocalizedField(relatedBlog, "excerpt", language)}
                    image={relatedBlog.featured_image_url || ""}
                    author={relatedBlog.author}
                    publishDate={relatedBlog.publish_date}
                    link={getBlogPath(relatedBlog.slug || null, language)}
                    featured={relatedBlog.is_featured || false}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
};

export default BlogDetail;
