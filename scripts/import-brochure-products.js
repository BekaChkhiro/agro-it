/**
 * Import Brochure Products Script
 * 
 * This script clears existing products and categories, then imports
 * all products from the brochure into the database.
 * 
 * Run with: node scripts/import-brochure-products.js
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase connection
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

// Read brochure text file
const brochurePath = path.join(__dirname, '..', 'brochure.docx.txt');
const brochureContent = fs.readFileSync(brochurePath, 'utf-8');

// Product categories and their line ranges in brochure
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

async function clearDatabase() {
  console.log('🗑️  Clearing existing data...');
  
  // Delete in correct order due to foreign keys
  await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  console.log('✅ Database cleared');
}

async function importCategories() {
  console.log('📁 Importing categories...');
  
  const { data, error } = await supabase
    .from('categories')
    .insert(categories)
    .select();
  
  if (error) {
    console.error('❌ Error importing categories:', error);
    throw error;
  }
  
  console.log(`✅ Imported ${data.length} categories`);
  return data;
}

async function importProducts(categoriesMap) {
  console.log('📦 Importing products...');
  
  const products = [];
  let productCount = 0;
  
  // ORCHARD PRODUCTS
  const orchardId = categoriesMap['orchard-equipment'];
  
  products.push({
    category_ids: [orchardId],
    name_en: 'Mulcher with IT Hydraulic Disk',
    name_ka: 'მულჩერი IT ჰიდრავლიკური დისკით',
    slug_en: 'mulcher-it-hydraulic-disk',
    slug_ka: 'mulcheri-it-hidravlikuri-diski',
    description_en: 'Professional orchard mulcher with hydraulic disk for cutting grass between trees. Features lateral mechanical movement and hydraulic sensor to recognize trees.',
    description_ka: 'პროფესიული ბაღის მულჩერი ჰიდრავლიკური დისკით ხეებს შორის ბალახის საჭრელად. აქვს გვერდითი მექანიკური მოძრაობა და ჰიდრავლიკური სენსორი ხეების ამოსაცნობად.',
    specs_en: { 'Available sizes': '1.3 to 2.0 meters', 'Cutting capacity': 'Up to 5cm', 'Movement': 'Lateral mechanical', 'Sensor': 'Hydraulic tree recognition' },
    specs_ka: { 'ხელმისაწვდომი ზომები': '1.3-დან 2.0 მეტრამდე', 'ჭრის სიმძლავრე': '5სმ-მდე', 'მოძრაობა': 'გვერდითი მექანიკური', 'სენსორი': 'ჰიდრავლიკური ხეების ამოცნობა' },
    video_url: 'https://youtu.be/iRYc1L109M0',
    is_featured: true,
    display_order: 1
  });
  
  products.push({
    category_ids: [orchardId],
    name_en: 'Mulcher TCK for Prunings',
    name_ka: 'მულჩერი TCK ჩეთილებისთვის',
    slug_en: 'mulcher-tck-prunings',
    slug_ka: 'mulcheri-tck-chetilebi',
    description_en: 'Heavy-duty mulcher with pick-up roll system for efficient pruning processing. Features helical cutting system and calibrated discharge grill.',
    description_ka: 'მძიმე დატვირთვის მულჩერი შეგროვების როლით ჩეთილების ეფექტური დამუშავებისთვის. აქვს სპირალური ჭრის სისტემა და კალიბრირებული გამოსავალი გრილი.',
    specs_en: { 'Available sizes': '1.0 to 2.1 meters', 'Cutting capacity': 'Up to 6cm', 'Pick-up': 'Roll system', 'Rotor': 'Helical cutting' },
    specs_ka: { 'ხელმისაწვდომი ზომები': '1.0-დან 2.1 მეტრამდე', 'ჭრის სიმძლავრე': '6სმ-მდე', 'შეგროვება': 'როლიკის სისტემა', 'როტორი': 'სპირალური ჭრა' },
    video_url: 'https://www.youtube.com/shorts/_oLQRqtkYSo?feature=share',
    is_featured: true,
    display_order: 2
  });
  
  // Add more products here...
  
  // Insert in batches
  const batchSize = 50;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const insertPayload = batch.map(({ category_ids, ...productData }) => productData);
    const { data, error } = await supabase
      .from('products')
      .insert(insertPayload)
      .select();
    
    if (error) {
      console.error('❌ Error importing products batch:', error);
      throw error;
    }

    const categoryRelations = [];
    data.forEach((product, index) => {
      const assignedCategories = batch[index].category_ids || [];
      assignedCategories.forEach((categoryId) => {
        categoryRelations.push({ product_id: product.id, category_id: categoryId });
      });
    });

    if (categoryRelations.length) {
      const { error: relationError } = await supabase
        .from('product_categories')
        .insert(categoryRelations);

      if (relationError) {
        console.error('❌ Error linking product categories:', relationError);
        throw relationError;
      }
    }

    productCount += data.length;
    console.log(`✅ Imported batch ${Math.floor(i / batchSize) + 1}: ${data.length} products`);
  }
  
  console.log(`✅ Total products imported: ${productCount}`);
  return productCount;
}

async function main() {
  console.log('🚀 Starting brochure products import...\n');
  
  try {
    // Step 1: Clear database
    await clearDatabase();
    
    // Step 2: Import categories
    const importedCategories = await importCategories();
    
    // Create category slug -> ID mapping
    const categoriesMap = {};
    importedCategories.forEach(cat => {
      categoriesMap[cat.slug_en] = cat.id;
    });
    
    // Step 3: Import products
    await importProducts(categoriesMap);
    
    console.log('\n✨ Import completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Categories: ${importedCategories.length}`);
    console.log(`   - Products: Ready for manual verification`);
    console.log('\n💡 Next steps:');
    console.log('   1. Visit http://localhost:8083 to see the imported data');
    console.log('   2. Upload product images to Supabase Storage');
    console.log('   3. Update image_url fields for each product');
    
  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  }
}

main();
