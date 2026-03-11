#!/usr/bin/env -S deno run --allow-net --allow-env

/**
 * Backfill WebP Converter
 * 
 * Converts all existing non-WebP images in specified storage buckets to WebP format.
 * This is useful for converting images that were uploaded before the webhook was set up.
 * 
 * Usage:
 *   deno run --allow-net --allow-env tools/backfill-webp.ts [options]
 * 
 * Environment variables required:
 *   - SUPABASE_URL: Your Supabase project URL
 *   - SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key
 * 
 * Optional CLI flags:
 *   --buckets=bucket1,bucket2   # Buckets to process (default: assets,products,categories,blogs,success-stories)
 *   --quality=85                # WebP quality (0-100, default 85)
 *   --delete-originals          # Remove the source file after successful conversion
 *   --help                      # Show usage information
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { ImagePool } from 'https://esm.sh/@squoosh/lib@0.5.3';

const DEFAULT_BUCKETS = ['assets', 'products', 'categories', 'blogs', 'success-stories'];

interface CliConfig {
  deleteOriginals: boolean;
  quality: number;
  buckets: string[];
}

function parseCliArgs(args: string[]): CliConfig {
  const config: CliConfig = {
    deleteOriginals: false,
    quality: 85,
    buckets: [...DEFAULT_BUCKETS],
  };

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      console.log(`WebP backfill usage:
  deno run --allow-net --allow-env tools/backfill-webp.ts [options]

Options:
  --buckets=assets,products     Comma-separated list of buckets to process
  --quality=85                  WebP quality (0-100)
  --delete-originals            Remove the source file after successful conversion
  --help                        Show this help message\n`);
      Deno.exit(0);
    }

    if (arg.startsWith('--buckets=')) {
      const value = arg.split('=').slice(1).join('=');
      config.buckets = value
        .split(',')
        .map((bucket) => bucket.trim())
        .filter(Boolean);
      continue;
    }

    if (arg.startsWith('--quality=')) {
      const value = Number(arg.split('=').pop());
      if (!Number.isNaN(value) && value >= 0 && value <= 100) {
        config.quality = value;
      } else {
        console.warn(`⚠️  Ignoring invalid quality value "${arg}" (expected 0-100)`);
      }
      continue;
    }

    if (arg === '--delete-originals') {
      config.deleteOriginals = true;
      continue;
    }

    console.warn(`⚠️  Unknown option "${arg}" (use --help for usage)`);
  }

  return config;
}

const CLI_CONFIG = parseCliArgs(Deno.args);
const DELETE_ORIGINAL_FILES = CLI_CONFIG.deleteOriginals;
const WEBP_QUALITY = CLI_CONFIG.quality;
const BUCKETS = CLI_CONFIG.buckets;

interface ConversionStats {
  total: number;
  converted: number;
  skipped: number;
  errors: number;
  errorDetails: Array<{ file: string; error: string }>;
}

async function convertToWebP(imageBuffer: ArrayBuffer): Promise<Uint8Array> {
  const imagePool = new ImagePool(1); // Use 1 thread

  try {
    const image = imagePool.ingestImage(imageBuffer);
    await image.decoded;

    await image.encode({
      webp: {
        quality: WEBP_QUALITY,
      },
    });

    const encodedImage = await image.encodedWith.webp;

    if (!encodedImage) {
      throw new Error('WebP encoding failed');
    }

    return encodedImage.binary;
  } finally {
    await imagePool.close();
  }
}

async function processFile(
  supabase: any,
  bucketId: string,
  file: StorageEntry,
  stats: ConversionStats
): Promise<void> {
  const filePath = file.path;
  let mimeType = file.metadata?.mimetype || '';
  const normalizedPath = filePath.toLowerCase();
  const extension = normalizedPath.split('.').pop() ?? '';

  if (!mimeType) {
    const extensionMimeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      bmp: 'image/bmp',
      tif: 'image/tiff',
      tiff: 'image/tiff',
      webp: 'image/webp',
      avif: 'image/avif',
      heic: 'image/heic',
      heif: 'image/heif',
    };
    mimeType = extensionMimeMap[extension] ?? '';
  }

  console.log(`\nProcessing: ${bucketId}/${filePath}`);
  stats.total++;

  // Skip if not an image
  if (!mimeType.startsWith('image/')) {
    console.log('  ↳ Skipped: Not an image');
    stats.skipped++;
    return;
  }

  // Skip if already WebP
  if (mimeType === 'image/webp' || filePath.toLowerCase().endsWith('.webp')) {
    console.log('  ↳ Skipped: Already WebP');
    stats.skipped++;
    return;
  }

  try {
    // Download the original file
    console.log('  ↳ Downloading...');
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucketId)
      .download(filePath);

    if (downloadError || !fileData) {
      throw new Error(`Download failed: ${downloadError?.message}`);
    }

    // Convert to WebP
    console.log('  ↳ Converting to WebP...');
    const imageBuffer = await fileData.arrayBuffer();
    const webpBuffer = await convertToWebP(imageBuffer);

    // Generate WebP filename
    const webpPath = filePath.replace(/\.[^.]+$/, '.webp');

    // Upload WebP version
    console.log(`  ↳ Uploading to: ${webpPath}`);
    const webpBlob = new Blob([webpBuffer], { type: 'image/webp' });

    const { error: uploadError } = await supabase.storage
      .from(bucketId)
      .upload(webpPath, webpBlob, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    console.log('  ✓ Converted successfully');

    // Optionally delete original file
    if (DELETE_ORIGINAL_FILES && webpPath !== filePath) {
      try {
        const { error: deleteError } = await supabase.storage
          .from(bucketId)
          .remove([filePath]);

        if (deleteError) {
          console.warn(`  ⚠ Failed to delete original: ${deleteError.message}`);
        } else {
          console.log('  ✓ Original file deleted');
        }
      } catch (deleteErr) {
        console.warn(`  ⚠ Deletion error: ${deleteErr}`);
      }
    }

    stats.converted++;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`  ✗ Error: ${errorMessage}`);
    stats.errors++;
    stats.errorDetails.push({
      file: `${bucketId}/${filePath}`,
      error: errorMessage,
    });
  }
}

async function processBucket(
  supabase: any,
  bucketId: string,
  stats: ConversionStats,
  prefix = '',
  depth = 0
): Promise<void> {
  if (depth === 0) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Processing bucket: ${bucketId}`);
    console.log('='.repeat(60));
  } else {
    console.log(`\n-- ${bucketId}/${prefix} --`);
  }

  try {
    const entries = await listAllEntries(supabase, bucketId, prefix);

    if (entries.length === 0) {
      console.log('No files found in this bucket/prefix');
      return;
    }

    console.log(`Found ${entries.length} entries`);

    for (const entry of entries) {
      if (entry.isFolder) {
        await processBucket(supabase, bucketId, stats, entry.path, depth + 1);
      } else {
        await processFile(supabase, bucketId, entry, stats);
      }
    }
  } catch (error) {
    console.error(`Error processing bucket ${bucketId}:`, error);
  }
}

interface StorageMetadata {
  mimetype?: string;
  size?: number;
  [key: string]: unknown;
}

interface StorageEntry {
  name: string;
  path: string;
  metadata: StorageMetadata | null;
  isFolder: boolean;
}

async function listAllEntries(
  supabase: any,
  bucketId: string,
  prefix = ''
): Promise<StorageEntry[]> {
  const LIMIT = 1000;
  const entries: StorageEntry[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase.storage.from(bucketId).list(prefix, {
      limit: LIMIT,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      break;
    }

    for (const item of data) {
      const itemPath = prefix ? `${prefix}/${item.name}` : item.name;
      const size = (item.metadata as StorageMetadata | null)?.size;
      const isFolder = typeof size !== 'number';

      entries.push({
        name: item.name,
        path: itemPath,
        metadata: (item.metadata as StorageMetadata | null) ?? null,
        isFolder,
      });
    }

    hasMore = data.length === LIMIT;
    offset += LIMIT;
  }

  return entries;
}

async function main() {
  console.log('\n🚀 WebP Backfill Converter\n');

  // Get environment variables
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   - SUPABASE_URL');
    console.error('   - SUPABASE_SERVICE_ROLE_KEY');
    Deno.exit(1);
  }

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('Configuration:');
  console.log(`  Buckets: ${BUCKETS.join(', ')}`);
  console.log(`  WebP Quality: ${WEBP_QUALITY}`);
  console.log(`  Delete Originals: ${DELETE_ORIGINAL_FILES ? 'Yes' : 'No'}`);

  // Initialize stats
  const stats: ConversionStats = {
    total: 0,
    converted: 0,
    skipped: 0,
    errors: 0,
    errorDetails: [],
  };

  // Process each bucket
  for (const bucketId of BUCKETS) {
    await processBucket(supabase, bucketId, stats);
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 CONVERSION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total files processed: ${stats.total}`);
  console.log(`Successfully converted: ${stats.converted}`);
  console.log(`Skipped: ${stats.skipped}`);
  console.log(`Errors: ${stats.errors}`);

  if (stats.errorDetails.length > 0) {
    console.log('\n❌ Error Details:');
    stats.errorDetails.forEach(({ file, error }) => {
      console.log(`  • ${file}`);
      console.log(`    ${error}`);
    });
  }

  console.log('\n✨ Done!\n');
}

// Run the script
if (import.meta.main) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    Deno.exit(1);
  });
}
