/**
 * Storage Migration Script
 * Downloads images from old Supabase storage and uploads to new Supabase storage
 * Preserves the original folder structure
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { writeFileSync } from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const NEW_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const NEW_SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                          process.env.VITE_SUPABASE_ANON_KEY;

if (!NEW_SUPABASE_URL || !NEW_SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_KEY);

// Load storage files data
const storageData = JSON.parse(readFileSync(join(__dirname, '../storage-files.json'), 'utf-8'));

/**
 * Download image from URL
 */
async function downloadImage(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    throw new Error(`Download failed: ${error.message}`);
  }
}

/**
 * Upload image to new Supabase storage
 */
async function uploadImage(bucketName, path, buffer, contentType) {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(path, buffer, {
        contentType: contentType,
        upsert: true, // Overwrite if exists
        cacheControl: '3600',
      });

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
}

/**
 * Main migration function
 */
async function migrateStorage() {
  console.log('🚀 Starting storage migration...\n');
  console.log(`📍 New Supabase URL: ${NEW_SUPABASE_URL}\n`);

  const results = {
    success: [],
    failed: [],
    skipped: []
  };

  for (const [bucketName, bucketData] of Object.entries(storageData.buckets)) {
    console.log(`\n📦 Processing bucket: ${bucketName}`);
    console.log(`   Total files: ${bucketData.files.length}`);
    console.log(`   Total size: ${(bucketData.totalSize / 1024 / 1024).toFixed(2)} MB\n`);

    // Check if bucket exists, create if not
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error(`❌ Error listing buckets: ${listError.message}`);
      continue;
    }

    const bucketExists = buckets.some(b => b.name === bucketName);
    
    if (!bucketExists) {
      console.log(`   Creating bucket: ${bucketName}...`);
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 52428800, // 50MB
      });
      
      if (createError) {
        console.error(`   ❌ Failed to create bucket: ${createError.message}`);
        continue;
      }
      console.log(`   ✅ Bucket created successfully`);
    }

    let fileCount = 0;
    for (const file of bucketData.files) {
      fileCount++;
      const progress = `[${fileCount}/${bucketData.files.length}]`;
      
      try {
        process.stdout.write(`   ${progress} ${file.name}...`);
        
        // Download from old URL
        const buffer = await downloadImage(file.url);
        
        // Upload to new storage
        await uploadImage(bucketName, file.path, buffer, file.contentType);
        
        process.stdout.write(' ✅\n');
        results.success.push({
          bucket: bucketName,
          path: file.path,
          size: file.size
        });
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        process.stdout.write(` ❌ ${error.message}\n`);
        results.failed.push({
          bucket: bucketName,
          path: file.path,
          url: file.url,
          error: error.message
        });
      }
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Migration Summary');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${results.success.length} files`);
  console.log(`❌ Failed: ${results.failed.length} files`);
  console.log(`⏭️  Skipped: ${results.skipped.length} files`);
  
  const totalSize = results.success.reduce((sum, item) => sum + item.size, 0);
  console.log(`📦 Total uploaded: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

  // Save detailed results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultsFile = join(__dirname, `../migration-results-${timestamp}.json`);
  writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  console.log(`\n📝 Detailed results saved to: ${resultsFile}`);

  if (results.failed.length > 0) {
    console.log('\n⚠️  Some files failed to migrate. Check the results file for details.');
  } else {
    console.log('\n🎉 All files migrated successfully!');
  }
}

// Run migration
migrateStorage().catch(error => {
  console.error('\n💥 Migration failed with error:', error);
  process.exit(1);
});

