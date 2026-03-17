/**
 * Dynamic sitemap generation for Next.js
 * Generates sitemap.xml with all products, categories, blogs, and success stories
 */

import { MetadataRoute } from "next";
import { getCategories } from "@/lib/data/categories";
import { getProducts } from "@/lib/data/products";
import { getPublishedBlogs } from "@/lib/data/blogs";
import { getPublishedSuccessStories } from "@/lib/data/success-stories";
import { generateSlug } from "@/utils/urlHelpers";

const BASE_URL_GE = "https://www.agroit.ge";

// Helper to normalize slugs (lowercase, replace spaces with hyphens)
function normalizeSlug(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all data in parallel
  const [categories, products, blogs, successStories] = await Promise.all([
    getCategories(),
    getProducts(),
    getPublishedBlogs(),
    getPublishedSuccessStories(),
  ]);

  const now = new Date();

  // Static pages (Georgian)
  const staticPagesKa: MetadataRoute.Sitemap = [
    {
      url: BASE_URL_GE,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL_GE}/products`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL_GE}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL_GE}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL_GE}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL_GE}/success-stories`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Static pages (English)
  const staticPagesEn: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL_GE}/en`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL_GE}/en/products`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL_GE}/en/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL_GE}/en/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL_GE}/en/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL_GE}/en/success-stories`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Note: Armenian domain (agroit.am) has its own sitemap

  // Dynamic category pages (normalized to lowercase)
  const categoryPagesKa: MetadataRoute.Sitemap = categories
    .filter((cat) => cat.slug_ka || cat.slug_en)
    .map((category) => {
      const slug = normalizeSlug(category.slug_ka) || normalizeSlug(category.slug_en);
      if (!slug) return null;
      return {
        url: `${BASE_URL_GE}/${slug}`,
        lastModified: category.updated_at ? new Date(category.updated_at) : now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const categoryPagesEn: MetadataRoute.Sitemap = categories
    .filter((cat) => cat.slug_en)
    .map((category) => {
      const slug = normalizeSlug(category.slug_en);
      if (!slug) return null;
      return {
        url: `${BASE_URL_GE}/en/${slug}`,
        lastModified: category.updated_at ? new Date(category.updated_at) : now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  // Dynamic product pages (normalized to lowercase)
  const productPagesKa: MetadataRoute.Sitemap = products
    .filter((product) => product.slug_en && product.category?.slug_en)
    .map((product) => {
      const categorySlug = normalizeSlug(product.category?.slug_ka) || normalizeSlug(product.category?.slug_en);
      const productSlug = normalizeSlug(product.slug_ka) || normalizeSlug(product.slug_en);
      if (!categorySlug || !productSlug) return null;
      return {
        url: `${BASE_URL_GE}/${categorySlug}/${productSlug}`,
        lastModified: product.updated_at ? new Date(product.updated_at) : now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const productPagesEn: MetadataRoute.Sitemap = products
    .filter((product) => product.slug_en && product.category?.slug_en)
    .map((product) => {
      const categorySlug = normalizeSlug(product.category!.slug_en);
      const productSlug = normalizeSlug(product.slug_en);
      if (!categorySlug || !productSlug) return null;
      return {
        url: `${BASE_URL_GE}/en/${categorySlug}/${productSlug}`,
        lastModified: product.updated_at ? new Date(product.updated_at) : now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  // Dynamic blog pages (normalized to lowercase)
  const blogPagesKa: MetadataRoute.Sitemap = blogs
    .filter((blog) => blog.slug_ka || blog.slug_en)
    .map((blog) => {
      const slug = normalizeSlug(blog.slug_ka) || normalizeSlug(blog.slug_en);
      if (!slug) return null;
      return {
        url: `${BASE_URL_GE}/blog/${slug}`,
        lastModified: blog.updated_at ? new Date(blog.updated_at) : now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const blogPagesEn: MetadataRoute.Sitemap = blogs
    .filter((blog) => blog.slug_en)
    .map((blog) => {
      const slug = normalizeSlug(blog.slug_en);
      if (!slug) return null;
      return {
        url: `${BASE_URL_GE}/en/blog/${slug}`,
        lastModified: blog.updated_at ? new Date(blog.updated_at) : now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  // Dynamic success story pages (normalized to lowercase)
  const successStoryPagesKa: MetadataRoute.Sitemap = successStories
    .filter((story) => story.slug_ka || story.slug_en || story.title_en)
    .map((story) => {
      const slug = normalizeSlug(story.slug_ka) || normalizeSlug(story.slug_en) || (story.title_en ? normalizeSlug(generateSlug(story.title_en, false)) : null);
      if (!slug) return null;
      return {
        url: `${BASE_URL_GE}/success-story/${slug}`,
        lastModified: story.updated_at ? new Date(story.updated_at) : now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const successStoryPagesEn: MetadataRoute.Sitemap = successStories
    .filter((story) => story.slug_en || story.title_en)
    .map((story) => {
      const slug = normalizeSlug(story.slug_en) || (story.title_en ? normalizeSlug(generateSlug(story.title_en, false)) : null);
      if (!slug) return null;
      return {
        url: `${BASE_URL_GE}/en/success-story/${slug}`,
        lastModified: story.updated_at ? new Date(story.updated_at) : now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return [
    ...staticPagesKa,
    ...staticPagesEn,
    ...categoryPagesKa,
    ...categoryPagesEn,
    ...productPagesKa,
    ...productPagesEn,
    ...blogPagesKa,
    ...blogPagesEn,
    ...successStoryPagesKa,
    ...successStoryPagesEn,
  ];
}
