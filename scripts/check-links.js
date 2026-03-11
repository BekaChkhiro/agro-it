#!/usr/bin/env node

/**
 * Link Checker Script for AGROIT
 * 
 * Validates all external links in product brochures and media
 * Detects broken links (404, 500, etc.) and connection errors
 * 
 * Usage: node scripts/check-links.js
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://qkocoxnnrecilxuzmkpf.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrb2NveG5ucmVjaWx4dXpta3BmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyODIyMzEsImV4cCI6MjA3NTg1ODIzMX0.lI8EWaWoUoIkg9rHiicJqzY1Uer5MqozTY3bEvV_uBI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Check if a URL is accessible
 */
async function checkUrl(url) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'AGROIT-Link-Checker/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    return {
      url,
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    };
  } catch (error) {
    return {
      url,
      status: 0,
      ok: false,
      error: error.message
    };
  }
}

/**
 * Extract all URLs from database
 */
async function extractUrls() {
  const urls = new Set();
  
  // Check product brochures
  const { data: products } = await supabase
    .from('products')
    .select('name_en, brochure_url, video_url, image_url, gallery_image_urls')
    .not('brochure_url', 'is', null);
  
  if (products) {
    products.forEach(product => {
      if (product.brochure_url) urls.add({ url: product.brochure_url, source: `Product: ${product.name_en}`, type: 'brochure' });
      if (product.video_url) urls.add({ url: product.video_url, source: `Product: ${product.name_en}`, type: 'video' });
      if (product.image_url && product.image_url.startsWith('http')) {
        urls.add({ url: product.image_url, source: `Product: ${product.name_en}`, type: 'image' });
      }
      if (product.gallery_image_urls && Array.isArray(product.gallery_image_urls)) {
        product.gallery_image_urls.forEach(imgUrl => {
          if (imgUrl && imgUrl.startsWith('http')) {
            urls.add({ url: imgUrl, source: `Product: ${product.name_en}`, type: 'gallery' });
          }
        });
      }
    });
  }
  
  // Check blog external links (if blogs table has external_links field)
  const { data: blogs } = await supabase
    .from('blogs')
    .select('title_en, thumbnail_url')
    .not('thumbnail_url', 'is', null);
  
  if (blogs) {
    blogs.forEach(blog => {
      if (blog.thumbnail_url && blog.thumbnail_url.startsWith('http')) {
        urls.add({ url: blog.thumbnail_url, source: `Blog: ${blog.title_en}`, type: 'image' });
      }
    });
  }
  
  return Array.from(urls);
}

/**
 * Main link checking function
 */
async function checkLinks() {
  console.log('🔍 Starting link validation...\n');
  
  const urlsToCheck = await extractUrls();
  console.log(`📊 Found ${urlsToCheck.length} URLs to validate\n`);
  
  const results = {
    working: [],
    broken: [],
    warnings: []
  };
  
  for (const item of urlsToCheck) {
    const result = await checkUrl(item.url);
    
    if (result.ok) {
      results.working.push({ ...item, status: result.status });
      console.log(`✅ ${item.url.substring(0, 60)}... (${result.status})`);
    } else if (result.status >= 400 && result.status < 500) {
      results.broken.push({ ...item, ...result });
      console.error(`❌ ${item.url} (${result.status} ${result.statusText})`);
      console.error(`   Source: ${item.source}`);
    } else if (result.status >= 500 || result.status === 0) {
      results.warnings.push({ ...item, ...result });
      console.warn(`⚠️  ${item.url} (${result.error || result.statusText})`);
      console.warn(`   Source: ${item.source}`);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n📈 Summary:');
  console.log(`✅ Working links: ${results.working.length}`);
  console.log(`⚠️  Warnings (timeouts/5xx): ${results.warnings.length}`);
  console.log(`❌ Broken links (4xx): ${results.broken.length}`);
  
  if (results.broken.length > 0) {
    console.error('\n❌ BROKEN LINKS DETECTED:');
    results.broken.forEach(item => {
      console.error(`  - ${item.url}`);
      console.error(`    Source: ${item.source}`);
      console.error(`    Status: ${item.status} ${item.statusText}\n`);
    });
    process.exit(1);
  }
  
  if (results.warnings.length > 0) {
    console.warn('\n⚠️  WARNINGS (may need review):');
    results.warnings.forEach(item => {
      console.warn(`  - ${item.url}`);
      console.warn(`    Source: ${item.source}`);
      console.warn(`    Error: ${item.error || item.statusText}\n`);
    });
  }
  
  console.log('\n✅ Link validation complete!');
}

checkLinks().catch(error => {
  console.error('❌ Error during link checking:', error);
  process.exit(1);
});






