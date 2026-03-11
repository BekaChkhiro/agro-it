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

const BASE_URL_GE = "https://agroit.ge";
const BASE_URL_AM = "https://agroit.am";

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

  // Armenian domain static pages
  const staticPagesHy: MetadataRoute.Sitemap = [
    {
      url: BASE_URL_AM,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL_AM}/products`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL_AM}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL_AM}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Dynamic category pages
  const categoryPagesKa: MetadataRoute.Sitemap = categories
    .filter((cat) => cat.slug_ka || cat.slug_en)
    .map((category) => ({
      url: `${BASE_URL_GE}/${category.slug_ka || category.slug_en}`,
      lastModified: category.updated_at ? new Date(category.updated_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  const categoryPagesEn: MetadataRoute.Sitemap = categories
    .filter((cat) => cat.slug_en)
    .map((category) => ({
      url: `${BASE_URL_GE}/en/${category.slug_en}`,
      lastModified: category.updated_at ? new Date(category.updated_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  // Dynamic product pages
  const productPagesKa: MetadataRoute.Sitemap = products
    .filter((product) => product.slug_en && product.category?.slug_en)
    .map((product) => {
      const categorySlug = product.category?.slug_ka || product.category?.slug_en;
      return {
        url: `${BASE_URL_GE}/${categorySlug}/${product.slug_ka || product.slug_en}`,
        lastModified: product.updated_at ? new Date(product.updated_at) : now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      };
    });

  const productPagesEn: MetadataRoute.Sitemap = products
    .filter((product) => product.slug_en && product.category?.slug_en)
    .map((product) => ({
      url: `${BASE_URL_GE}/en/${product.category!.slug_en}/${product.slug_en}`,
      lastModified: product.updated_at ? new Date(product.updated_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  // Dynamic blog pages
  const blogPagesKa: MetadataRoute.Sitemap = blogs
    .filter((blog) => blog.slug_ka || blog.slug_en)
    .map((blog) => ({
      url: `${BASE_URL_GE}/blog/${blog.slug_ka || blog.slug_en}`,
      lastModified: blog.updated_at ? new Date(blog.updated_at) : now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  const blogPagesEn: MetadataRoute.Sitemap = blogs
    .filter((blog) => blog.slug_en)
    .map((blog) => ({
      url: `${BASE_URL_GE}/en/blog/${blog.slug_en}`,
      lastModified: blog.updated_at ? new Date(blog.updated_at) : now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  // Dynamic success story pages
  const successStoryPagesKa: MetadataRoute.Sitemap = successStories
    .filter((story) => story.slug_ka || story.slug_en || story.title_en)
    .map((story) => {
      const slug = story.slug_ka || story.slug_en || (story.title_en ? generateSlug(story.title_en, false) : null);
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
      const slug = story.slug_en || (story.title_en ? generateSlug(story.title_en, false) : null);
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
    ...staticPagesHy,
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
