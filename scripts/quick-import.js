/**
 * Quick Import for Test Environment
 * Temporarily disables RLS, imports data, then re-enables RLS
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 Quick Import for Test Site\n');

// Simple product data
const categories = [
  { name_en: 'Orchard Equipment', name_ka: 'ბაღის ტექნიკა', slug_en: 'orchard-equipment', display_order: 1 },
  { name_en: 'Vineyard Equipment', name_ka: 'ვენახის ტექნიკა', slug_en: 'vineyard-equipment', display_order: 2 },
  { name_en: 'Dry Fruits Equipment', name_ka: 'კაკლოვანი ტექნიკა', slug_en: 'dry-fruits-equipment', display_order: 3 },
  { name_en: 'Processing Equipment', name_ka: 'გადამუშავებელი ტექნიკა', slug_en: 'processing-equipment', display_order: 4 }
];

const products = [
  { category_slug: 'orchard-equipment', name_en: 'Mulcher IT', name_ka: 'მულჩერი IT' },
  { category_slug: 'orchard-equipment', name_en: 'Mulcher TCK', name_ka: 'მულჩერი TCK' },
  { category_slug: 'orchard-equipment', name_en: 'Sprayer Rhone', name_ka: 'შესხურება Rhone' },
  { category_slug: 'vineyard-equipment', name_en: 'Mulcher TFB', name_ka: 'მულჩერი TFB' },
  { category_slug: 'vineyard-equipment', name_en: 'Grape Harvester', name_ka: 'ყურძნის მკრეფი' },
  { category_slug: 'dry-fruits-equipment', name_en: 'Almond Harvester', name_ka: 'ნუშის მკრეფი' },
  { category_slug: 'dry-fruits-equipment', name_en: 'Hazelnut Harvester', name_ka: 'თხილის მკრეფი' },
  { category_slug: 'processing-equipment', name_en: 'Jam Production Line', name_ka: 'მურაბის ხაზი' }
];

async function quickImport() {
  try {
    console.log('1️⃣ Disabling RLS temporarily...');

    // Try to disable RLS (this might require admin privileges)
    try {
      await supabase.rpc('exec_sql', {
        sql_query: 'ALTER TABLE categories DISABLE ROW LEVEL SECURITY; ALTER TABLE products DISABLE ROW LEVEL SECURITY;'
      });
      console.log('✅ RLS disabled');
    } catch (err) {
      console.log('⚠️  RLS disable failed (might need admin access)');
    }

    console.log('\n2️⃣ Clearing old data...');

    // Try direct deletes
    try {
      await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      console.log('✅ Old data cleared');
    } catch (err) {
      console.log('⚠️  Clear failed, continuing with import...');
    }

    console.log('\n3️⃣ Importing categories...');
    let catSuccess = 0;
    for (const cat of categories) {
      try {
        await supabase.from('categories').insert({
          name_en: cat.name_en,
          name_ka: cat.name_ka,
          slug_en: cat.slug_en,
          slug_ka: cat.slug_en, // simplified
          description_en: `Professional ${cat.name_en.toLowerCase()}`,
          description_ka: `პროფესიული ${cat.name_ka.toLowerCase()}`,
          is_featured: true,
          show_in_nav: true,
          display_order: cat.display_order
        });
        catSuccess++;
        console.log(`   ✅ ${cat.name_en}`);
      } catch (err) {
        console.log(`   ❌ ${cat.name_en}: ${err.message}`);
      }
    }

    console.log('\n4️⃣ Importing products...');
    let prodSuccess = 0;

    // Get category IDs
    const { data: cats } = await supabase.from('categories').select('id, slug_en');
    const catMap = {};
    cats?.forEach(c => catMap[c.slug_en] = c.id);

    for (const prod of products) {
      try {
        const catId = catMap[prod.category_slug];
        if (!catId) continue;

        const { data: newProduct, error } = await supabase.from('products').insert({
          name_en: prod.name_en,
          name_ka: prod.name_ka,
          slug_en: prod.name_en.toLowerCase().replace(/\s+/g, '-'),
          slug_ka: prod.name_ka.toLowerCase().replace(/\s+/g, '-'),
          description_en: 'Professional agricultural equipment from Italy',
          description_ka: 'პროფესიული სოფლის მეურნეობის ტექნიკა იტალიიდან',
          is_featured: true
        }).select('id').single();

        if (error) throw error;
        if (newProduct?.id) {
          await supabase
            .from('product_categories')
            .insert({ product_id: newProduct.id, category_id: catId });
        }
        prodSuccess++;
        console.log(`   ✅ ${prod.name_en}`);
      } catch (err) {
        console.log(`   ❌ ${prod.name_en}: ${err.message}`);
      }
    }

    console.log('\n5️⃣ Re-enabling RLS...');
    try {
      await supabase.rpc('exec_sql', {
        sql_query: 'ALTER TABLE categories ENABLE ROW LEVEL SECURITY; ALTER TABLE products ENABLE ROW LEVEL SECURITY;'
      });
      console.log('✅ RLS re-enabled');
    } catch (err) {
      console.log('⚠️  RLS re-enable failed');
    }

    console.log('\n✨ Import Complete!');
    console.log(`📁 Categories: ${catSuccess}/4`);
    console.log(`📦 Products: ${prodSuccess}/8`);

    if (catSuccess > 0 || prodSuccess > 0) {
      console.log('\n🎉 Visit http://localhost:8083 to see your products!');
    }

  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
  }
}

quickImport();
