/**
 * Server-side data fetching layer
 * Centralized exports for all data functions used in Server Components
 */

// Types
export * from "./types";

// Categories
export {
  getCategories,
  getTopLevelCategories,
  getCategoryBySlug,
  getCategoryById,
  getSubcategories,
  getNavCategories,
  getFeaturedCategories,
} from "./categories";

// Products
export {
  getProducts,
  getProductBySlug,
  getProductById,
  getProductsByCategory,
  getRelatedProducts,
  getFeaturedProducts,
  getAllProductSlugs,
} from "./products";

// Blogs
export {
  getBlogs,
  getPublishedBlogs,
  getFeaturedBlogs,
  getBlogBySlug,
  getBlogById,
  getAllBlogSlugs,
  getRecentBlogs,
} from "./blogs";

// Success Stories
export {
  getSuccessStories,
  getPublishedSuccessStories,
  getFeaturedSuccessStories,
  getSuccessStoryBySlug,
  getSuccessStoryById,
  getAllSuccessStorySlugs,
  getRecentSuccessStories,
} from "./success-stories";
