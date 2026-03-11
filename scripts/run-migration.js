/**
 * Run SQL Migration Script
 * 
 * This script executes the SQL migration file using existing env variables
 * Run with: node scripts/run-migration.js
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Get Supabase credentials from env (support both naming conventions)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase credentials not found!');
  console.error('   Please ensure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env file');
  console.error('   Or run the SQL directly in Supabase Dashboard → SQL Editor');
  process.exit(1);
}

console.log('🔗 Connecting to Supabase...');
console.log(`   URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseKey);

// Read SQL migration file
const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250116000001_complete_brochure_import.sql');

if (!fs.existsSync(migrationPath)) {
  console.error(`❌ Migration file not found: ${migrationPath}`);
  process.exit(1);
}

const sqlContent = fs.readFileSync(migrationPath, 'utf-8');

console.log('📄 Migration file loaded');
console.log(`   File: ${path.basename(migrationPath)}`);
console.log(`   Size: ${(sqlContent.length / 1024).toFixed(2)} KB`);

async function runMigration() {
  console.log('\n🚀 Starting migration...\n');

  try {
    // Split SQL into individual statements
    // Remove comments and split by semicolon
    const statements = sqlContent
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n')
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.match(/^(BEGIN|COMMIT)$/i));

    console.log(`📊 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let errorCount = 0;

    // Execute DELETE statements first
    console.log('🗑️  Step 1: Clearing existing data...');
    const deleteStatements = statements.filter(stmt => stmt.toUpperCase().startsWith('DELETE'));
    
    for (const stmt of deleteStatements) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: stmt });
        if (error) {
          // Try direct approach if RPC doesn't work
          const tableName = stmt.match(/DELETE FROM (\w+)/i)?.[1];
          if (tableName) {
            const { error: deleteError } = await supabase
              .from(tableName)
              .delete()
              .neq('id', '00000000-0000-0000-0000-000000000000');
            
            if (deleteError) throw deleteError;
          }
        }
        console.log(`   ✅ Cleared ${stmt.match(/DELETE FROM (\w+)/i)?.[1]}`);
        successCount++;
      } catch (err) {
        console.error(`   ❌ Error: ${err.message}`);
        errorCount++;
      }
    }

    // Execute INSERT statements for categories
    console.log('\n📁 Step 2: Inserting categories...');
    const categoryInserts = statements.filter(stmt => 
      stmt.toUpperCase().includes('INSERT INTO CATEGORIES')
    );

    for (const stmt of categoryInserts) {
      try {
        // Parse INSERT statement to extract values
        const match = stmt.match(/VALUES\s*\((.*?)\)/is);
        if (match) {
          const values = match[1].split(',').map(v => {
            v = v.trim();
            // Remove quotes and parse
            if (v === 'true') return true;
            if (v === 'false') return false;
            if (v === 'NULL' || v === 'null') return null;
            if (v.match(/^now\(\)/i)) return new Date().toISOString();
            if (v.match(/^\d+$/)) return parseInt(v);
            // Remove surrounding quotes
            return v.replace(/^'|'$/g, '');
          });

          const [name_en, name_ka, slug_en, slug_ka, description_en, description_ka, is_featured, show_in_nav, display_order] = values;

          const { error } = await supabase
            .from('categories')
            .insert({
              name_en,
              name_ka,
              slug_en,
              slug_ka,
              description_en,
              description_ka,
              is_featured,
              show_in_nav,
              display_order,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (error) throw error;
          console.log(`   ✅ Added category: ${name_en}`);
          successCount++;
        }
      } catch (err) {
        console.error(`   ❌ Error adding category: ${err.message}`);
        errorCount++;
      }
    }

    // Get category IDs for products
    const { data: categories } = await supabase
      .from('categories')
      .select('id, slug_en');

    const categoryMap = {};
    categories?.forEach(cat => {
      categoryMap[cat.slug_en] = cat.id;
    });

    // Execute INSERT statements for products
    console.log('\n📦 Step 3: Inserting products...');
    const productInserts = statements.filter(stmt => 
      stmt.toUpperCase().includes('INSERT INTO PRODUCTS')
    );

    const syncProductCategories = async (productId, categoryId) => {
      await supabase.from('product_categories').delete().eq('product_id', productId);
      if (!categoryId) return;

      const { error } = await supabase
        .from('product_categories')
        .insert({ product_id: productId, category_id: categoryId });

      if (error) throw error;
    };

    let productCount = 0;
    for (const stmt of productInserts) {
      try {
        // Extract category slug and product values
        const categoryMatch = stmt.match(/WHERE slug_en = '([^']+)'/);
        const categorySlug = categoryMatch?.[1];
        const categoryId = categoryMap[categorySlug];

        if (!categoryId) {
          console.error(`   ⚠️  Category not found: ${categorySlug}`);
          continue;
        }

        // Extract product name from the VALUES
        const nameMatch = stmt.match(/'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',/);
        if (nameMatch) {
          const [, name_en, name_ka, slug_en, slug_ka] = nameMatch;
          
          // Extract description
          const descMatch = stmt.match(/'([^']+)',\s*'([^']+)',\s*(true|false)/);
          const description_en = descMatch?.[1] || 'Professional agricultural equipment from Italy';
          const description_ka = descMatch?.[2] || 'პროფესიული სოფლის მეურნეობის ტექნიკა იტალიიდან';
          const is_featured = descMatch?.[3] === 'true';

          const { data: insertedProduct, error } = await supabase
            .from('products')
            .insert({
              name_en,
              name_ka,
              slug_en,
              slug_ka,
              description_en,
              description_ka,
              is_featured,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select('id')
            .single();

          if (error) throw error;
          if (insertedProduct?.id) {
            await syncProductCategories(insertedProduct.id, categoryId);
          }
          productCount++;
          if (productCount % 5 === 0) {
            process.stdout.write(`   📦 ${productCount} products added...\r`);
          }
        }
        successCount++;
      } catch (err) {
        console.error(`\n   ❌ Error adding product: ${err.message}`);
        errorCount++;
      }
    }

    console.log(`\n   ✅ Added ${productCount} products total`);

    // Verify results
    console.log('\n📊 Step 4: Verifying migration...');
    
    const { data: categoryCount } = await supabase
      .from('categories')
      .select('id', { count: 'exact', head: true });
    
    const { data: productCountResult } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true });

    const { data: breakdown } = await supabase
      .from('categories')
      .select(`
        name_en,
        product_categories:product_categories(count)
      `);

    console.log('\n✨ Migration Complete!\n');
    console.log('📊 Final Results:');
    console.log(`   ✅ Successful operations: ${successCount}`);
    if (errorCount > 0) {
      console.log(`   ❌ Failed operations: ${errorCount}`);
    }
    console.log(`   📁 Total categories: ${categoryCount?.length || 0}`);
    console.log(`   📦 Total products: ${productCountResult?.length || 0}`);
    
    console.log('\n📋 Products per category:');
    breakdown?.forEach(cat => {
      const count = cat.product_categories?.length || 0;
      console.log(`   ${cat.name_en.padEnd(25)} → ${count} products`);
    });

    console.log('\n🌐 Next steps:');
    console.log('   1. Visit http://localhost:8083 to see the new products');
    console.log('   2. Add product images to Supabase Storage');
    console.log('   3. Update image_url fields for products');
    console.log('   4. Add detailed specs and video URLs\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the migration
runMigration();
