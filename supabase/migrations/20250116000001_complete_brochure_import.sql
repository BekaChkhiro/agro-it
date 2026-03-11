-- Migration: Import Complete Brochure Products
-- Generated from brochure.docx.txt
-- Date: 2025-01-16
--
-- ⚠️  IMPORTANT: Run this in Supabase Dashboard → SQL Editor
-- ⚠️  Requires admin privileges (bypasses RLS)

-- Clear existing data
DELETE FROM products;
DELETE FROM categories;

-- Insert Categories

INSERT INTO categories (name_en, name_ka, slug_en, slug_ka, description_en, description_ka, is_featured, show_in_nav, display_order, created_at, updated_at)
VALUES (
  'Orchard Equipment',
  'ბაღის ტექნიკა',
  'orchard-equipment',
  'baghis-teqnika',
  'Complete range of equipment for orchard maintenance',
  'ბაღის მოვლისთვის აღჭურვილობის სრული სპექტრი',
  true,
  true,
  1,
  now(),
  now()
);

INSERT INTO categories (name_en, name_ka, slug_en, slug_ka, description_en, description_ka, is_featured, show_in_nav, display_order, created_at, updated_at)
VALUES (
  'Vineyard Equipment',
  'ვენახის ტექნიკა',
  'vineyard-equipment',
  'venaxis-teqnika',
  'Professional vineyard equipment for all operations',
  'პროფესიული ვენახის აღჭურვილობა ყველა ოპერაციისთვის',
  true,
  true,
  2,
  now(),
  now()
);

INSERT INTO categories (name_en, name_ka, slug_en, slug_ka, description_en, description_ka, is_featured, show_in_nav, display_order, created_at, updated_at)
VALUES (
  'Dry Fruits Equipment',
  'კაკლოვანი კულტურების ტექნიკა',
  'dry-fruits-equipment',
  'kaklovani-teqnika',
  'Complete solutions for nuts cultivation and processing',
  'სრული გადაწყვეტები კაკლის მოსავლისა და გადამუშავებისთვის',
  true,
  true,
  3,
  now(),
  now()
);

INSERT INTO categories (name_en, name_ka, slug_en, slug_ka, description_en, description_ka, is_featured, show_in_nav, display_order, created_at, updated_at)
VALUES (
  'Processing Equipment',
  'გადამამუშავებელი ტექნიკა',
  'processing-equipment',
  'gadamamushavebeli-teqnika',
  'Turn-key processing solutions',
  'სრული გადამამუშავებელი ხაზები',
  true,
  true,
  4,
  now(),
  now()
);

-- Insert Products

INSERT INTO products (category_id, name_en, name_ka, slug_en, slug_ka, description_en, description_ka, is_featured, created_at, updated_at)
SELECT
  id,
  'Mulcher with IT Hydraulic Disk',
  'მულჩერი IT ჰიდრავლიკური დისკით',
  'mulcher-with-it-hydraulic-disk',
  'მულჩერი IT ჰიდრავლიკური დისკით',
  'Professional agricultural equipment from Italy',
  'პროფესიული სოფლის მეურნეობის ტექნიკა იტალიიდან',
  true,
  now(),
  now()
FROM categories WHERE slug_en = 'orchard-equipment';

INSERT INTO products (category_id, name_en, name_ka, slug_en, slug_ka, description_en, description_ka, is_featured, created_at, updated_at)
SELECT
  id,
  'Mulcher TCK for Prunings',
  'მულჩერი TCK ჩეთილებისთვის',
  'mulcher-tck-for-prunings',
  'მულჩერი TCK ჩეთილებისთვის',
  'Professional agricultural equipment from Italy',
  'პროფესიული სოფლის მეურნეობის ტექნიკა იტალიიდან',
  true,
  now(),
  now()
FROM categories WHERE slug_en = 'orchard-equipment';

INSERT INTO products (category_id, name_en, name_ka, slug_en, slug_ka, description_en, description_ka, is_featured, created_at, updated_at)
SELECT 
  id,
  'Forestry Mulcher with Hammer Roller',
  'სატყეო მულჩერი ჩაქუჩის როლით',
  'forestry-mulcher-with-hammer-roller',
  'სატყეო მულჩერი ჩაქუჩის როლით',
  'Professional agricultural equipment from Italy',
  'პროფესიული სოფლის მეურნეობის ტექნიკა იტალიიდან',
  true,
  now(),
  now()
FROM categories WHERE slug_en = 'orchard-equipment';

INSERT INTO products (category_id, name_en, name_ka, slug_en, slug_ka, description_en, description_ka, is_featured, created_at, updated_at)
SELECT 
  id,
  'Sprayer Rhone Top',
  'შესხურება Rhone Top',
  'sprayer-rhone-top',
  'შესხურება Rhone Top',
  'Professional agricultural equipment from Italy',
  'პროფესიული სოფლის მეურნეობის ტექნიკა იტალიიდან',
  false,
  now(),
  now()
FROM categories WHERE slug_en = 'orchard-equipment';

INSERT INTO products (category_id, name_en, name_ka, slug_en, slug_ka, description_en, description_ka, is_featured, created_at, updated_at)
SELECT 
  id,
  'Annovi Manure Spreader',
  'Annovi სასუქის გამფანტველი',
  'annovi-manure-spreader',
  'Annovi სასუქის გამფანტველი',
  'Professional agricultural equipment from Italy',
  'პროფესიული სოფლის მეურნეობის ტექნიკა იტალიიდან',
  false,
  now(),
  now()
FROM categories WHERE slug_en = 'orchard-equipment';

INSERT INTO products (category_id, name_en, name_ka, slug_en, slug_ka, description_en, description_ka, is_featured, created_at, updated_at)
SELECT 
  id,
  'Fama Pruning CKD',
  'Fama ჩეთვლა CKD',
  'fama-pruning-ckd',
  'Fama ჩეთვლა CKD',
  'Professional agricultural equipment from Italy',
  'პროფესიული სოფლის მეურნეობის ტექნიკა იტალიიდან',
  false,
  now(),
  now()
FROM categories WHERE slug_en = 'orchard-equipment';

INSERT INTO products (category_id, name_en, name_ka, slug_en, slug_ka, description_en, description_ka, is_featured, created_at, updated_at)
SELECT 
  id,
  'Fama Pruning PRD',
  'Fama ჩეთვლა PRD',
  'fama-pruning-prd',
  'Fama ჩეთვლა PRD',
  'Professional agricultural equipment from Italy',
  'პროფესიული სოფლის მეურნეობის ტექნიკა იტალიიდან',
  false,
  now(),
  now()
FROM categories WHERE slug_en = 'orchard-equipment';

INSERT INTO products (category_id, name_en, name_ka, slug_en, slug_ka, description_en, description_ka, is_featured, created_at, updated_at)
SELECT 
  id,
  'Harvesting Platforms',
  'მოსავლის აღების პლატფორმები',
  'harvesting-platforms',
  'მოსავლის აღების პლატფორმები',
  'Professional agricultural equipment from Italy',
  'პროფესიული სოფლის მეურნეობის ტექნიკა იტალიიდან',
  false,
  now(),
  now()
FROM categories WHERE slug_en = 'orchard-equipment';

INSERT INTO products (category_id, name_en, name_ka, slug_en, slug_ka, description_en, description_ka, is_featured, created_at, updated_at)
SELECT 
  id,
  'Cold Storages',
  'მაცივრები',
  'cold-storages',
  'მაცივრები',
  'Professional agricultural equipment from Italy',
  'პროფესიული სოფლის მეურნეობის ტექნიკა იტალიიდან',
  false,
  now(),
  now()
FROM categories WHERE slug_en = 'orchard-equipment';

INSERT INTO products (category_id, name_en, name_ka, slug_en, slug_ka, description_en, description_ka, is_featured, created_at, updated_at)
SELECT 
  id,
  'Mulcher TFB Medium Duty',
  'მულჩერი TFB საშუალო დატვირთვის',
  'mulcher-tfb-medium-duty',
  'მულჩერი TFB საშუალო დატვირთვის',
  'Professional agricultural equipment from Italy',
  'პროფესიული სოფლის მეურნეობის ტექნიკა იტალიიდან',
  true,
  now(),
  now()
FROM categories WHERE slug_en = 'vineyard-equipment';

INSERT INTO products (category_id, name_en, name_ka, slug_en, slug_ka, description_en, description_ka, is_featured, created_at, updated_at)
SELECT 
  id,
  'Grape Harvesters',
  'ყურძნის მკრეფი',
  'grape-harvesters',
  'ყურძნის მკრეფი',
  'Professional agricultural equipment from Italy',
  'პროფესიული სოფლის მეურნეობის ტექნიკა იტალიიდან',
  true,
  now(),
  now()
FROM categories WHERE slug_en = 'vineyard-equipment';

INSERT INTO products (category_id, name_en, name_ka, slug_en, slug_ka, description_en, description_ka, is_featured, created_at, updated_at)
SELECT 
  id,
  'Bilateral Pruning Machine',
  'ორმხრივი ჩეთვლის მანქანა',
  'bilateral-pruning-machine',
  'ორმხრივი ჩეთვლის მანქანა',
  'Professional agricultural equipment from Italy',
  'პროფესიული სოფლის მეურნეობის ტექნიკა იტალიიდან',
  true,
  now(),
  now()
FROM categories WHERE slug_en = 'vineyard-equipment';

INSERT INTO products (category_id, name_en, name_ka, slug_en, slug_ka, description_en, description_ka, is_featured, created_at, updated_at)
SELECT 
  id,
  'L-shaped Pruning Machine',
  'L ფორმის ჩეთვლის მანქანა',
  'l-shaped-pruning-machine',
  'L ფორმის ჩეთვლის მანქანა',
  'Professional agricultural equipment from Italy',
  'პროფესიული სოფლის მეურნეობის ტექნიკა იტალიიდან',
  false,
  now(),
  now()
FROM categories WHERE slug_en = 'vineyard-equipment';

INSERT INTO products (category_id, name_en, name_ka, slug_en, slug_ka, description_en, description_ka, is_featured, created_at, updated_at)
SELECT 
  id,
  'U-shaped Pruning Machine',
  'U ფორმის ჩეთვლის მანქანა',
  'u-shaped-pruning-machine',
  'U ფორმის ჩეთვლის მანქანა',
  'Professional agricultural equipment from Italy',
  'პროფესიული სოფლის მეურნეობის ტექნიკა იტალიიდან',
  false,
  now(),
  now()
FROM categories WHERE slug_en = 'vineyard-equipment';

INSERT INTO products (category_id, name_en, name_ka, slug_en, slug_ka, description_en, description_ka, is_featured, created_at, updated_at)
SELECT 
  id,
  'Sprayers for Vineyards',
  'შესხურება ვენახებისთვის',
  'sprayers-for-vineyards',
  'შესხურება ვენახებისთვის',
  'Professional agricultural equipment from Italy',
  'პროფესიული სოფლის მეურნეობის ტექნიკა იტალიიდან',
  false,
  now(),
  now()
FROM categories WHERE slug_en = 'vineyard-equipment';

INSERT INTO products (category_id, name_en, name_ka, slug_en, slug_ka, description_en, description_ka, is_featured, created_at, updated_at)
SELECT 
  id,
  'Self-propelled Harvester',
  'თვითმავალი მკრეფი',
  'self-propelled-harvester',
  'თვითმავალი მკრეფი',
  'Professional agricultural equipment from Italy',
  'პროფესიული სოფლის მეურნეობის ტექნიკა იტალიიდან',
  true,
  now(),
  now()
FROM categories WHERE slug_en = 'dry-fruits-equipment';

INSERT INTO products (category_id, name_en, name_ka, slug_en, slug_ka, description_en, description_ka, is_featured, created_at, updated_at)
SELECT 
  id,
  'Trailed Harvesters',
  'მისაბმელი მკრეფები',
  'trailed-harvesters',
  'მისაბმელი მკრეფები',
  'Professional agricultural equipment from Italy',
  'პროფესიული სოფლის მეურნეობის ტექნიკა იტალიიდან',
  true,
  now(),
  now()
FROM categories WHERE slug_en = 'dry-fruits-equipment';

INSERT INTO products (category_id, name_en, name_ka, slug_en, slug_ka, description_en, description_ka, is_featured, created_at, updated_at)
SELECT 
  id,
  'Handshakers',
  'ხელის შემანერწყვებელი',
  'handshakers',
  'ხელის შემანერწყვებელი',
  'Professional agricultural equipment from Italy',
  'პროფესიული სოფლის მეურნეობის ტექნიკა იტალიიდან',
  true,
  now(),
  now()
FROM categories WHERE slug_en = 'dry-fruits-equipment';

INSERT INTO products (category_id, name_en, name_ka, slug_en, slug_ka, description_en, description_ka, is_featured, created_at, updated_at)
SELECT 
  id,
  'Trailed Shaker Petska',
  'მისაბმელი შემანერწყვებელი Petska',
  'trailed-shaker-petska',
  'მისაბმელი შემანერწყვებელი Petska',
  'Professional agricultural equipment from Italy',
  'პროფესიული სოფლის მეურნეობის ტექნიკა იტალიიდან',
  false,
  now(),
  now()
FROM categories WHERE slug_en = 'dry-fruits-equipment';

INSERT INTO products (category_id, name_en, name_ka, slug_en, slug_ka, description_en, description_ka, is_featured, created_at, updated_at)
SELECT 
  id,
  'Self-propelled Shaker Red Devil',
  'თვითმავალი Red Devil',
  'self-propelled-shaker-red-devil',
  'თვითმავალი Red Devil',
  'Professional agricultural equipment from Italy',
  'პროფესიული სოფლის მეურნეობის ტექნიკა იტალიიდან',
  false,
  now(),
  now()
FROM categories WHERE slug_en = 'dry-fruits-equipment';

INSERT INTO products (category_id, name_en, name_ka, slug_en, slug_ka, description_en, description_ka, is_featured, created_at, updated_at)
SELECT 
  id,
  'Hulling Machines',
  'გაკრის მანქანები',
  'hulling-machines',
  'გაკრის მანქანები',
  'Professional agricultural equipment from Italy',
  'პროფესიული სოფლის მეურნეობის ტექნიკა იტალიიდან',
  false,
  now(),
  now()
FROM categories WHERE slug_en = 'dry-fruits-equipment';

INSERT INTO products (category_id, name_en, name_ka, slug_en, slug_ka, description_en, description_ka, is_featured, created_at, updated_at)
SELECT 
  id,
  'Cracking Machines',
  'გახეთქვის მანქანები',
  'cracking-machines',
  'გახეთქვის მანქანები',
  'Professional agricultural equipment from Italy',
  'პროფესიული სოფლის მეურნეობის ტექნიკა იტალიიდან',
  false,
  now(),
  now()
FROM categories WHERE slug_en = 'dry-fruits-equipment';

INSERT INTO products (category_id, name_en, name_ka, slug_en, slug_ka, description_en, description_ka, is_featured, created_at, updated_at)
SELECT 
  id,
  'Roasting Machine',
  'მოხარშვის მანქანა',
  'roasting-machine',
  'მოხარშვის მანქანა',
  'Professional agricultural equipment from Italy',
  'პროფესიული სოფლის მეურნეობის ტექნიკა იტალიიდან',
  false,
  now(),
  now()
FROM categories WHERE slug_en = 'dry-fruits-equipment';

INSERT INTO products (category_id, name_en, name_ka, slug_en, slug_ka, description_en, description_ka, is_featured, created_at, updated_at)
SELECT 
  id,
  'Jam Processing Line',
  'მურაბის წარმოების ხაზი',
  'jam-processing-line',
  'მურაბის წარმოების ხაზი',
  'Professional agricultural equipment from Italy',
  'პროფესიული სოფლის მეურნეობის ტექნიკა იტალიიდან',
  true,
  now(),
  now()
FROM categories WHERE slug_en = 'processing-equipment';

INSERT INTO products (category_id, name_en, name_ka, slug_en, slug_ka, description_en, description_ka, is_featured, created_at, updated_at)
SELECT 
  id,
  'Tomato Processing Equipment',
  'პომიდვრის გადამუშავების ხაზი',
  'tomato-processing-equipment',
  'პომიდვრის გადამუშავების ხაზი',
  'Professional agricultural equipment from Italy',
  'პროფესიული სოფლის მეურნეობის ტექნიკა იტალიიდან',
  true,
  now(),
  now()
FROM categories WHERE slug_en = 'processing-equipment';

INSERT INTO products (category_id, name_en, name_ka, slug_en, slug_ka, description_en, description_ka, is_featured, created_at, updated_at)
SELECT 
  id,
  'Milk and Yogurt Line',
  'რძისა და იოგურტის ხაზი',
  'milk-and-yogurt-line',
  'რძისა და იოგურტის ხაზი',
  'Professional agricultural equipment from Italy',
  'პროფესიული სოფლის მეურნეობის ტექნიკა იტალიიდან',
  true,
  now(),
  now()
FROM categories WHERE slug_en = 'processing-equipment';

-- Migration completed successfully!
-- RLS policies remain unchanged

-- Verify results
SELECT
  c.name_en as category,
  COUNT(p.id) as products
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
GROUP BY c.name_en, c.display_order
ORDER BY c.display_order;
