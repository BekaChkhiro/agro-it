type ResizeMode = "contain" | "cover" | "fill" | "inside" | "outside";

type OptimizeOptions = {
  width?: number;
  height?: number;
  quality?: number;
  resizeMode?: ResizeMode;
  format?: "webp" | "png" | "jpeg" | "jpg";
};

// Set to true if your Supabase project has Image Transformations enabled (Pro plan feature)
const IMAGE_TRANSFORMATIONS_ENABLED = false;

/**
 * Supabase Storage can transform images via the /render/image endpoint.
 * This helper rewrites public storage URLs to their optimized equivalents
 * while keeping existing cache-busting params (e.g. ?t=timestamp).
 *
 * Note: Image Transformations require Supabase Pro plan.
 * If not enabled, this function returns the original URL.
 *
 * Docs: https://supabase.com/docs/guides/storage/CDN#image-transformations
 */
export const getOptimizedImageUrl = (url?: string | null, options: OptimizeOptions = {}) => {
  if (!url) return "";

  // Skip local/public assets (e.g., /placeholder.svg) since Supabase transforms apply only to absolute URLs
  if (!/^https?:\/\//i.test(url)) {
    return url;
  }

  // If image transformations are not enabled, return original URL
  if (!IMAGE_TRANSFORMATIONS_ENABLED) {
    return url;
  }

  try {
    const parsed = new URL(url);

    if (!parsed.pathname.includes("/storage/v1/object/")) {
      return url;
    }

    // Already optimized -> just merge params
    if (!parsed.pathname.includes("/render/image/")) {
      parsed.pathname = parsed.pathname.replace("/storage/v1/object/", "/storage/v1/render/image/");
    }

    const {
      width,
      height,
      quality = 75,
      resizeMode = "contain",
      format,
    } = options;

    if (width) parsed.searchParams.set("width", String(width));
    if (height) parsed.searchParams.set("height", String(height));
    if (quality) parsed.searchParams.set("quality", String(quality));
    if (resizeMode) parsed.searchParams.set("resize", resizeMode);
    if (format) parsed.searchParams.set("format", format);

    return parsed.toString();
  } catch (error) {
    console.warn("Failed to optimize image url", error);
    return url;
  }
};
