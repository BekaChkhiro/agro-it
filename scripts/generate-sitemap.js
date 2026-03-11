#!/usr/bin/env node

/**
 * Sitemap Generator for AGROIT
 *
 * Generates a dynamic sitemap.xml from Supabase data including:
 * - Static pages (home, about, contact, blog, success-stories)
 * - Category pages (both Georgian and English)
 * - Product pages (both Georgian and English)
 *
 * Usage: node scripts/generate-sitemap.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://qkocoxnnrecilxuzmkpf.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrb2NveG5ucmVjaWx4dXpta3BmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyODIyMzEsImV4cCI6MjA3NTg1ODIzMX0.lI8EWaWoUoIkg9rHiicJqzY1Uer5MqozTY3bEvV_uBI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Base URL for the sitemap
// Supports environment variables for different environments
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.VITE_SITE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.VITE_BASE_URL ||
  'https://www.agroit.ge'; // Production fallback

/**
 * Generate sitemap XML
 */
function generateSitemapXML(urls) {
  const urlEntries = urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq || 'weekly'}</changefreq>
    <priority>${url.priority || '0.5'}</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${BASE_URL}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="ka" href="${BASE_URL}" />
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}/en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}" />
  </url>
  <url>
    <loc>${BASE_URL}/en</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="ka" href="${BASE_URL}" />
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}/en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}" />
  </url>
  <url>
    <loc>${BASE_URL}/products</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="ka" href="${BASE_URL}/products" />
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}/en/products" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/products" />
  </url>
  <url>
    <loc>${BASE_URL}/en/products</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="ka" href="${BASE_URL}/products" />
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}/en/products" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/products" />
  </url>${urlEntries}
</urlset>`;
}

/**
 * Fetch all categories from Supabase
 */
async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('slug_ka, slug_en, updated_at')
    .not('slug_en', 'is', null);

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch all products from Supabase
 */
async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      slug_ka,
      slug_en,
      updated_at,
      product_categories:product_categories(
        category:categories(
          slug_ka,
          slug_en,
          parent:categories(
            slug_ka,
            slug_en
          )
        )
      )
    `)
    .not('slug_en', 'is', null);

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return (data || []).map(product => {
    const categories = Array.isArray(product.product_categories)
      ? product.product_categories
          .map(relation => relation.category)
          .filter(category => Boolean(category))
      : [];

    return {
      ...product,
      category: categories.length ? categories[0] : null,
    };
  });
}

/**
 * Generate category URLs
 */
function generateCategoryUrls(categories) {
  const urls = [];

  categories.forEach(category => {
    const slug = category.slug_en || category.slug_ka;
    if (!slug) {
      return;
    }

    // Base (Georgian language content) URL
    urls.push({
      loc: `${BASE_URL}/${slug}`,
      lastmod: category.updated_at || new Date().toISOString(),
      changefreq: 'weekly',
      priority: '0.8'
    });

    // English language URL
    if (category.slug_en) {
      urls.push({
        loc: `${BASE_URL}/en/${category.slug_en}`,
        lastmod: category.updated_at || new Date().toISOString(),
        changefreq: 'weekly',
        priority: '0.8'
      });
    }
  });

  return urls;
}

/**
 * Generate product URLs
 */
function generateProductUrls(products) {
  const urls = [];

  products.forEach(product => {
    const productSlug = product.slug_en || product.slug_ka;
    const categorySlug = product.category?.slug_en || product.category?.slug_ka;
    const subcategorySlug = product.category?.parent?.slug_en || product.category?.parent?.slug_ka;

    if (!productSlug || !categorySlug) {
      return;
    }

    let basePath = `/${categorySlug}/${productSlug}`;
    if (subcategorySlug) {
      basePath = `/${categorySlug}/${subcategorySlug}/${productSlug}`;
    }

    urls.push({
      loc: `${BASE_URL}${basePath}`,
      lastmod: product.updated_at || new Date().toISOString(),
      changefreq: 'monthly',
      priority: '0.6'
    });

    let englishPath = `/en/${categorySlug}/${productSlug}`;
    if (subcategorySlug) {
      englishPath = `/en/${categorySlug}/${subcategorySlug}/${productSlug}`;
    }

    urls.push({
      loc: `${BASE_URL}${englishPath}`,
      lastmod: product.updated_at || new Date().toISOString(),
      changefreq: 'monthly',
      priority: '0.6'
    });
  });

  return urls;
}

/**
 * Generate static page URLs
 */
function generateStaticUrls() {
  const staticPages = [
    // Georgian pages
    { path: '/about', priority: '0.7' },
    { path: '/success-stories', priority: '0.6' },
    { path: '/blog', priority: '0.6' },
    { path: '/contact', priority: '0.8' },

    // English pages
    { path: '/en/about', priority: '0.7' },
    { path: '/en/success-stories', priority: '0.6' },
    { path: '/en/blog', priority: '0.6' },
    { path: '/en/contact', priority: '0.8' },
  ];

  return staticPages.map(page => ({
    loc: `${BASE_URL}${page.path}`,
    lastmod: new Date().toISOString(),
    changefreq: 'weekly',
    priority: page.priority
  }));
}

/**
 * Main function
 */
async function generateSitemap() {
  try {
    console.log('🚀 Starting sitemap generation...');

    // Fetch data from Supabase
    console.log('📊 Fetching categories and products from Supabase...');
    const [categories, products] = await Promise.all([
      fetchCategories(),
      fetchProducts()
    ]);

    console.log(`📂 Found ${categories.length} categories and ${products.length} products`);

    // Generate URLs
    const staticUrls = generateStaticUrls();
    const categoryUrls = generateCategoryUrls(categories);
    const productUrls = generateProductUrls(products);

    const allUrls = [...staticUrls, ...categoryUrls, ...productUrls];

    console.log(`📝 Generated ${allUrls.length} URLs for sitemap`);

    // Generate XML
    const sitemapXML = generateSitemapXML(allUrls);

    // Write to file
    const outputPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
    fs.writeFileSync(outputPath, sitemapXML, 'utf8');

    console.log(`✅ Sitemap generated successfully at: ${outputPath}`);
    console.log(`📊 Total URLs: ${allUrls.length}`);

    // Update robots.txt with sitemap directive
    updateRobotsTxt();

  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

/**
 * Update robots.txt with sitemap directive
 */
function updateRobotsTxt() {
  try {
    const robotsPath = path.join(__dirname, '..', 'public', 'robots.txt');
    let robotsContent = fs.readFileSync(robotsPath, 'utf8');

    // Remove existing sitemap directive if present
    robotsContent = robotsContent.replace(/\n*Sitemap:.*\n*/g, '\n');

    // Add sitemap directive at the end
    robotsContent += `\nSitemap: ${BASE_URL}/sitemap.xml\n`;

    fs.writeFileSync(robotsPath, robotsContent, 'utf8');
    console.log('✅ Updated robots.txt with sitemap directive');

  } catch (error) {
    console.error('❌ Error updating robots.txt:', error);
  }
}

// Run the script
generateSitemap();
