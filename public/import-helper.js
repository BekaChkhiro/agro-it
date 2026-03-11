/**
 * Browser Console Import Helper
 * Run this in browser console when on http://localhost:8083
 */

// Import data
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

// Import function
async function browserImport() {
  console.log('🚀 Starting browser import...');

  // This assumes you have access to the Supabase client in your app
  // You might need to adjust based on how your app is set up

  try {
    // Try to import categories
    console.log('📁 Importing categories...');
    for (const cat of categories) {
      try {
        const result = await window.supabase?.from('categories').insert({
          name_en: cat.name_en,
          name_ka: cat.name_ka,
          slug_en: cat.slug_en,
          slug_ka: cat.slug_en,
          description_en: `Professional ${cat.name_en.toLowerCase()}`,
          description_ka: `პროფესიული ${cat.name_ka.toLowerCase()}`,
          is_featured: true,
          show_in_nav: true,
          display_order: cat.display_order
        });
        console.log(`✅ ${cat.name_en}`);
      } catch (err) {
        console.log(`❌ ${cat.name_en}:`, err.message);
      }
    }

    console.log('📦 Products would be imported next...');
    console.log('✨ Check your website to see if categories appeared!');

  } catch (error) {
    console.error('❌ Import failed:', error);
  }
}

// Make it available globally
window.browserImport = browserImport;

console.log('🎯 Browser import helper loaded!');
console.log('Run: browserImport() to start importing');
console.log('Note: This assumes your app exposes window.supabase');
