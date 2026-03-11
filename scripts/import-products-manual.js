/**
 * Manual Product Import for Lovable/Claude Environment
 *
 * This script imports products using the existing React app setup
 * instead of direct SQL access.
 *
 * Run with: node scripts/import-products-manual.js
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

// Supabase connection
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found!');
  console.error('Please check your environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔗 Connected to Supabase');

// Product data (manually curated from brochure)
const categories = [
  {
    name_en: 'Orchard Equipment',
    name_ka: 'ბაღის ტექნიკა',
    slug_en: 'orchard-equipment',
    slug_ka: 'baghis-teqnika',
    description_en: 'Complete range of equipment for orchard maintenance - from mulchers to harvesting platforms',
    description_ka: 'ბაღის მოვლისთვის აღჭურვილობის სრული სპექტრი - მულჩერებიდან მოსავლის აღების პლატფორმებამდე',
    is_featured: true,
    show_in_nav: true,
    display_order: 1
  },
  {
    name_en: 'Vineyard Equipment',
    name_ka: 'ვენახის ტექნიკა',
    slug_en: 'vineyard-equipment',
    slug_ka: 'venaxis-teqnika',
    description_en: 'Professional vineyard equipment for pruning, mulching, spraying and grape harvesting',
    description_ka: 'პროფესიული ვენახის აღჭურვილობა ჩეთვლისთვის, მულჩირებისთვის, შესხურებისთვის და ყურძნის მოსავლისთვის',
    is_featured: true,
    show_in_nav: true,
    display_order: 2
  },
  {
    name_en: 'Dry Fruits Equipment',
    name_ka: 'კაკლოვანი კულტურების ტექნიკა',
    slug_en: 'dry-fruits-equipment',
    slug_ka: 'kaklovani-teqnika',
    description_en: 'Complete solutions for almonds, hazelnuts and walnuts cultivation and processing',
    description_ka: 'სრული გადაწყვეტები ნუშის, თხილისა და კაკლის მოსავლისა და გადამუშავებისთვის',
    is_featured: true,
    show_in_nav: true,
    display_order: 3
  },
  {
    name_en: 'Processing Equipment',
    name_ka: 'გადამამუშავებელი ტექნიკა',
    slug_en: 'processing-equipment',
    slug_ka: 'gadamamushavebeli-teqnika',
    description_en: 'Turn-key processing solutions for fruits, vegetables, dairy and beverages',
    description_ka: 'სრული გადამამუშავებელი ხაზები ხილის, ბოსტნეულის, რძის პროდუქტებისა და სასმელებისთვის',
    is_featured: true,
    show_in_nav: true,
    display_order: 4
  }
];

const products = [
  // Orchard Equipment (9 products)
  { category_slug: 'orchard-equipment', name_en: 'Mulcher with IT Hydraulic Disk', name_ka: 'მულჩერი IT ჰიდრავლიკური დისკით', slug_en: 'mulcher-it-hydraulic-disk', slug_ka: 'mulcheri-it-hidravlikuri-diski', video_url: 'https://youtu.be/iRYc1L109M0', is_featured: true },
  { category_slug: 'orchard-equipment', name_en: 'Mulcher TCK for Prunings', name_ka: 'მულჩერი TCK ჩეთილებისთვის', slug_en: 'mulcher-tck-prunings', slug_ka: 'mulcheri-tck-chetilebi', video_url: 'https://www.youtube.com/shorts/_oLQRqtkYSo', is_featured: true },
  { category_slug: 'orchard-equipment', name_en: 'Forestry Mulcher with Hammer Roller', name_ka: 'სატყეო მულჩერი ჩაქუჩის როლით', slug_en: 'forestry-mulcher-hammer', slug_ka: 'satyeo-mulcheri-chaquchi', is_featured: false },
  { category_slug: 'orchard-equipment', name_en: 'Sprayer Rhone Top', name_ka: 'შესხურება Rhone Top', slug_en: 'sprayer-rhone-top', slug_ka: 'sheskhureba-rhone-top', is_featured: false },
  { category_slug: 'orchard-equipment', name_en: 'Annovi Manure Spreader', name_ka: 'Annovi სასუქის გამფანტველი', slug_en: 'annovi-manure-spreader', slug_ka: 'annovi-sasuqis-gamfantveli', is_featured: false },
  { category_slug: 'orchard-equipment', name_en: 'Fama Pruning CKD', name_ka: 'Fama ჩეთვლა CKD', slug_en: 'fama-pruning-ckd', slug_ka: 'fama-chetvla-ckd', is_featured: false },
  { category_slug: 'orchard-equipment', name_en: 'Fama Pruning PRD', name_ka: 'Fama ჩეთვლა PRD', slug_en: 'fama-pruning-prd', slug_ka: 'fama-chetvla-prd', is_featured: false },
  { category_slug: 'orchard-equipment', name_en: 'Harvesting Platforms', name_ka: 'მოსავლის აღების პლატფორმები', slug_en: 'harvesting-platforms', slug_ka: 'mosavlis-aghebis-platformebi', is_featured: false },
  { category_slug: 'orchard-equipment', name_en: 'Cold Storages', name_ka: 'მაცივრები', slug_en: 'cold-storages', slug_ka: 'matsivrebi', is_featured: false },

  // Vineyard Equipment (6 products)
  { category_slug: 'vineyard-equipment', name_en: 'Mulcher TFB Medium Duty', name_ka: 'მულჩერი TFB საშუალო დატვირთვის', slug_en: 'mulcher-tfb-medium-duty', slug_ka: 'mulcheri-tfb-sashualo-datvirtvis', is_featured: true },
  { category_slug: 'vineyard-equipment', name_en: 'Grape Harvesters', name_ka: 'ყურძნის მკრეფი', slug_en: 'grape-harvesters', slug_ka: 'qurdznis-mkrepi', is_featured: true },
  { category_slug: 'vineyard-equipment', name_en: 'Bilateral Pruning Machine', name_ka: 'ორმხრივი ჩეთვლის მანქანა', slug_en: 'bilateral-pruning-machine', slug_ka: 'ormkhrivi-chetvlis-mankana', is_featured: false },
  { category_slug: 'vineyard-equipment', name_en: 'L-shaped Pruning Machine', name_ka: 'L ფორმის ჩეთვლის მანქანა', slug_en: 'l-shaped-pruning-machine', slug_ka: 'l-formis-chetvlis-mankana', is_featured: false },
  { category_slug: 'vineyard-equipment', name_en: 'U-shaped Pruning Machine', name_ka: 'U ფორმის ჩეთვლის მანქანა', slug_en: 'u-shaped-pruning-machine', slug_ka: 'u-formis-chetvlis-mankana', is_featured: false },
  { category_slug: 'vineyard-equipment', name_en: 'Sprayers for Vineyards', name_ka: 'შესხურება ვენახებისთვის', slug_en: 'sprayers-vineyards', slug_ka: 'sheskhureba-venakhebis-tvis', is_featured: false },

  // Dry Fruits Equipment (8 products)
  { category_slug: 'dry-fruits-equipment', name_en: 'Self-propelled Harvester', name_ka: 'თვითმავალი მკრეფი', slug_en: 'self-propelled-harvester', slug_ka: 'tvitmavali-mkrepi', is_featured: true },
  { category_slug: 'dry-fruits-equipment', name_en: 'Trailed Harvesters', name_ka: 'მისაბმელი მკრეფები', slug_en: 'trailed-harvesters', slug_ka: 'misabmeli-mkrepebi', is_featured: true },
  { category_slug: 'dry-fruits-equipment', name_en: 'Handshakers', name_ka: 'ხელის შემანერწყვებელი', slug_en: 'handshakers', slug_ka: 'khelis-shemanerchvebeli', is_featured: false },
  { category_slug: 'dry-fruits-equipment', name_en: 'Trailed Shaker Petska', name_ka: 'მისაბმელი შემანერწყვებელი Petska', slug_en: 'trailed-shaker-petska', slug_ka: 'misabmeli-shemanerchvebeli-petska', is_featured: false },
  { category_slug: 'dry-fruits-equipment', name_en: 'Self-propelled Shaker Red Devil', name_ka: 'თვითმავალი Red Devil', slug_en: 'self-propelled-shaker-red-devil', slug_ka: 'tvitmavali-red-devil', is_featured: false },
  { category_slug: 'dry-fruits-equipment', name_en: 'Hulling Machines', name_ka: 'გაკრის მანქანები', slug_en: 'hulling-machines', slug_ka: 'gakris-mankanebi', is_featured: false },
  { category_slug: 'dry-fruits-equipment', name_en: 'Cracking Machines', name_ka: 'გახეთქვის მანქანები', slug_en: 'cracking-machines', slug_ka: 'gahetqvis-mankanebi', is_featured: false },
  { category_slug: 'dry-fruits-equipment', name_en: 'Roasting Machine', name_ka: 'მოხარშვის მანქანა', slug_en: 'roasting-machine', slug_ka: 'mokharshvis-mankana', is_featured: false },

  // Processing Equipment (3 products)
  { category_slug: 'processing-equipment', name_en: 'Jam Processing Line', name_ka: 'მურაბის წარმოების ხაზი', slug_en: 'jam-processing-line', slug_ka: 'murabis-tsarmoebis-khazi', is_featured: true },
  { category_slug: 'processing-equipment', name_en: 'Tomato Processing Equipment', name_ka: 'პომიდვრის გადამუშავების ხაზი', slug_en: 'tomato-processing-equipment', slug_ka: 'pomidvris-gadamushavebis-khazi', is_featured: false },
  { category_slug: 'processing-equipment', name_en: 'Milk and Yogurt Line', name_ka: 'რძისა და იოგურტის ხაზი', slug_en: 'milk-yogurt-line', slug_ka: 'rdzis-da-iogurtis-khazi', is_featured: false }
];

async function importData() {
  console.log('🚀 Starting product import...\n');

  try {
    // Check if we can connect
    const { data: testConnection, error: connectionError } = await supabase
      .from('categories')
      .select('count', { count: 'exact', head: true });

    if (connectionError) {
      console.error('❌ Connection failed:', connectionError.message);
      console.log('💡 This might be due to RLS policies. Try running in Supabase Dashboard instead.');
      process.exit(1);
    }

    console.log('✅ Connection successful');

    // Try to import categories first
    console.log('\n📁 Importing categories...');
    for (const category of categories) {
      try {
        const { error } = await supabase
          .from('categories')
          .upsert({
            ...category,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'slug_en' });

        if (error) {
          console.log(`⚠️  Category "${category.name_en}" might need admin access`);
          console.log(`   Error: ${error.message}`);
        } else {
          console.log(`✅ ${category.name_en}`);
        }
      } catch (err) {
        console.log(`❌ ${category.name_en}: ${err.message}`);
      }
    }

    // Get category IDs for products
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id, slug_en');

    const categoryMap = {};
    categoryData?.forEach(cat => {
      categoryMap[cat.slug_en] = cat.id;
    });

    console.log('\n📦 Importing products...');
    let successCount = 0;
    let errorCount = 0;

    const syncProductCategories = async (productId, categoryId) => {
      await supabase.from('product_categories').delete().eq('product_id', productId);
      if (!categoryId) return;

      const { error } = await supabase
        .from('product_categories')
        .insert({ product_id: productId, category_id: categoryId });

      if (error) throw error;
    };

    for (const product of products) {
      try {
        const categoryId = categoryMap[product.category_slug];

        if (!categoryId) {
          console.log(`⚠️  Skipping ${product.name_en} - category not found`);
          errorCount++;
          continue;
        }

        const { data: upsertedProduct, error } = await supabase
          .from('products')
          .upsert({
            name_en: product.name_en,
            name_ka: product.name_ka,
            slug_en: product.slug_en,
            slug_ka: product.slug_ka,
            description_en: 'Professional agricultural equipment from Italy',
            description_ka: 'პროფესიული სოფლის მეურნეობის ტექნიკა იტალიიდან',
            is_featured: product.is_featured,
            video_url: product.video_url || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'slug_en' })
          .select('id')
          .single();

        if (error) {
          console.log(`❌ ${product.name_en}: ${error.message}`);
          errorCount++;
        } else {
          if (upsertedProduct?.id) {
            await syncProductCategories(upsertedProduct.id, categoryId);
          }
          console.log(`✅ ${product.name_en}`);
          successCount++;
        }
      } catch (err) {
        console.log(`❌ ${product.name_en}: ${err.message}`);
        errorCount++;
      }
    }

    // Summary
    console.log('\n✨ Import Summary:');
    console.log(`   ✅ Successful: ${successCount} products`);
    if (errorCount > 0) {
      console.log(`   ❌ Failed: ${errorCount} products`);
      console.log('\n💡 Tip: Some products may require admin access due to RLS policies');
    }

    // Check final counts
    const { data: finalCategories } = await supabase
      .from('categories')
      .select('count', { count: 'exact', head: true });

    const { data: finalProducts } = await supabase
      .from('products')
      .select('count', { count: 'exact', head: true });

    console.log(`\n📊 Database Status:`);
    console.log(`   Categories: ${finalCategories?.length || 0}`);
    console.log(`   Products: ${finalProducts?.length || 0}`);

    if (successCount > 0) {
      console.log('\n🌐 Next: Visit http://localhost:8083 to see your products!');
    }

  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    console.log('\n💡 Alternative: Use the SQL file in Supabase Dashboard');
  }
}

// Run the import
importData();
