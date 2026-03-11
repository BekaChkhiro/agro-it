/**
 * Storage Migration Verification Script
 * Verifies that all images from storage-files.json exist in the new Supabase storage
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
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_KEY);

// Load storage files data
const storageData = JSON.parse(readFileSync(join(__dirname, '../storage-files.json'), 'utf-8'));

/**
 * Check if file exists in new storage
 */
async function checkFileExists(bucketName, path) {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(path.substring(0, path.lastIndexOf('/')), {
        search: path.substring(path.lastIndexOf('/') + 1)
      });

    if (error) throw error;
    return data && data.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Main verification function
 */
async function verifyMigration() {
  console.log('🔍 Starting storage verification...\n');
  console.log(`📍 Checking storage at: ${NEW_SUPABASE_URL}\n`);

  const results = {
    found: [],
    missing: [],
    errors: []
  };

  let totalFiles = 0;
  for (const bucketData of Object.values(storageData.buckets)) {
    totalFiles += bucketData.files.length;
  }

  let fileCount = 0;

  for (const [bucketName, bucketData] of Object.entries(storageData.buckets)) {
    console.log(`\n📦 Verifying bucket: ${bucketName}`);
    console.log(`   Files to check: ${bucketData.files.length}\n`);

    for (const file of bucketData.files) {
      fileCount++;
      const progress = `[${fileCount}/${totalFiles}]`;
      
      try {
        process.stdout.write(`   ${progress} ${file.name}...`);
        
        const exists = await checkFileExists(bucketName, file.path);
        
        if (exists) {
          process.stdout.write(' ✅\n');
          results.found.push({
            bucket: bucketName,
            path: file.path,
            name: file.name
          });
        } else {
          process.stdout.write(' ❌ NOT FOUND\n');
          results.missing.push({
            bucket: bucketName,
            path: file.path,
            name: file.name,
            originalUrl: file.url
          });
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (error) {
        process.stdout.write(` ⚠️  ERROR: ${error.message}\n`);
        results.errors.push({
          bucket: bucketName,
          path: file.path,
          name: file.name,
          error: error.message
        });
      }
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Verification Summary');
  console.log('='.repeat(60));
  console.log(`✅ Found: ${results.found.length} files`);
  console.log(`❌ Missing: ${results.missing.length} files`);
  console.log(`⚠️  Errors: ${results.errors.length} files`);
  
  const successRate = ((results.found.length / totalFiles) * 100).toFixed(2);
  console.log(`📈 Success Rate: ${successRate}%`);

  // Save detailed results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultsFile = join(__dirname, `../verification-results-${timestamp}.json`);
  writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  console.log(`\n📝 Detailed results saved to: ${resultsFile}`);

  if (results.missing.length > 0) {
    console.log('\n⚠️  Some files are missing from new storage:');
    results.missing.slice(0, 10).forEach(file => {
      console.log(`   - ${file.bucket}/${file.path}`);
    });
    if (results.missing.length > 10) {
      console.log(`   ... and ${results.missing.length - 10} more (see results file)`);
    }
    console.log('\n💡 Run the migration script again to upload missing files:');
    console.log('   pnpm migrate-storage');
  } else if (results.errors.length > 0) {
    console.log('\n⚠️  Some files encountered errors during verification.');
    console.log('   Check the results file for details.');
  } else {
    console.log('\n🎉 All files verified successfully!');
    console.log('   Your storage migration is complete.');
  }

  // Generate new storage URLs file
  if (results.found.length > 0) {
    console.log('\n📝 Generating updated storage URLs...');
    const updatedStorageData = JSON.parse(JSON.stringify(storageData));
    
    for (const [bucketName, bucketData] of Object.entries(updatedStorageData.buckets)) {
      bucketData.files = bucketData.files.map(file => ({
        ...file,
        url: `${NEW_SUPABASE_URL}/storage/v1/object/public/${bucketName}/${file.path}`,
        lastModified: new Date().toISOString()
      }));
    }
    
    const newStorageFile = join(__dirname, '../storage-files-new.json');
    writeFileSync(newStorageFile, JSON.stringify(updatedStorageData, null, 2));
    console.log(`   ✅ Updated URLs saved to: storage-files-new.json`);
  }
}

// Run verification
verifyMigration().catch(error => {
  console.error('\n💥 Verification failed with error:', error);
  process.exit(1);
});

