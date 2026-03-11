-- Migration: Import Brochure Products
-- This migration clears existing data and imports products from the brochure
-- Run this in Supabase SQL Editor

-- Step 1: Clear existing data (preserving structure)
DELETE FROM products;
DELETE FROM categories;

-- Step 2: Insert Categories
INSERT INTO categories (name_en, name_ka, slug_en, slug_ka, description_en, description_ka, is_featured, show_in_nav, display_order, parent_id, created_at, updated_at)
VALUES
  ('Orchard Equipment', 'ბაღის ტექნიკა', 'orchard-equipment', 'baghis-teqnika', 
   'Complete range of equipment for orchard maintenance - from mulchers to harvesting platforms',
   'ბაღის მოვლისთვის აღჭურვილობის სრული სპექტრი - მულჩერებიდან მოსავლის აღების პლატფორმებამდე',
   true, true, 1, NULL, now(), now()),
   
  ('Vineyard Equipment', 'ვენახის ტექნიკა', 'vineyard-equipment', 'venaxis-teqnika',
   'Professional vineyard equipment for pruning, mulching, spraying and grape harvesting',
   'პროფესიული ვენახის აღჭურვილობა ჩეთვლისთვის, მულჩირებისთვის, შესხურებისთვის და ყურძნის მოსავლისთვის',
   true, true, 2, NULL, now(), now()),
   
  ('Dry Fruits Equipment', 'კაკლოვანი კულტურების ტექნიკა', 'dry-fruits-equipment', 'kaklovani-teqnika',
   'Complete solutions for almonds, hazelnuts and walnuts cultivation and processing',
   'სრული გადაწყვეტები ნუშის, თხილისა და კაკლის მოსავლისა და გადამუშავებისთვის',
   true, true, 3, NULL, now(), now()),
   
  ('Processing Equipment', 'გადამამუშავებელი ტექნიკა', 'processing-equipment', 'gadamamushavebeli-teqnika',
   'Turn-key processing solutions for fruits, vegetables, dairy and beverages',
   'სრული გადამამუშავებელი ხაზები ხილის, ბოსტნეულის, რძის პროდუქტებისა და სასმელებისთვის',
   true, true, 4, NULL, now(), now());

-- Step 3: Insert Products (Orchard Equipment)
INSERT INTO products (category_id, name_en, name_ka, slug_en, slug_ka, description_en, description_ka, specs_en, specs_ka, video_url, is_featured, display_order, created_at, updated_at)
SELECT 
  (SELECT id FROM categories WHERE slug_en = 'orchard-equipment'),
  'Mulcher with IT Hydraulic Disk',
  'მულჩერი IT ჰიდრავლიკური დისკით',
  'mulcher-it-hydraulic-disk',
  'mulcheri-it-hidravlikuri-diski',
  'Professional orchard mulcher with hydraulic disk for cutting grass between trees. Features lateral mechanical movement and hydraulic sensor to recognize trees.',
  'პროფესიული ბაღის მულჩერი ჰიდრავლიკური დისკით ხეებს შორის ბალახის საჭრელად. აქვს გვერდითი მექანიკური მოძრაობა და ჰიდრავლიკური სენსორი ხეების ამოსაცნობად.',
  '{"Available sizes": "1.3 to 2.0 meters", "Cutting capacity": "Up to 5cm", "Movement": "Lateral mechanical", "Sensor": "Hydraulic tree recognition"}'::jsonb,
  '{"ხელმისაწვდომი ზომები": "1.3-დან 2.0 მეტრამდე", "ჭრის სიმძლავრე": "5სმ-მდე", "მოძრაობა": "გვერდითი მექანიკური", "სენსორი": "ჰიდრავლიკური ხეების ამოცნობა"}'::jsonb,
  'https://youtu.be/iRYc1L109M0',
  true,
  1,
  now(),
  now();

INSERT INTO products (category_id, name_en, name_ka, slug_en, slug_ka, description_en, description_ka, specs_en, specs_ka, video_url, is_featured, display_order, created_at, updated_at)
SELECT 
  (SELECT id FROM categories WHERE slug_en = 'orchard-equipment'),
  'Mulcher TCK for Prunings',
  'მულჩერი TCK ჩეთილებისთვის',
  'mulcher-tck-prunings',
  'mulcheri-tck-chetilebi',
  'Heavy-duty mulcher with pick-up roll system for efficient pruning processing. Features helical cutting system and calibrated discharge grill.',
  'მძიმე დატვირთვის მულჩერი შეგროვების როლით ჩეთილების ეფექტური დამუშავებისთვის. აქვს სპირალური ჭრის სისტემა და კალიბრირებული გამოსავალი გრილი.',
  '{"Available sizes": "1.0 to 2.1 meters", "Cutting capacity": "Up to 6cm", "Pick-up": "Roll system", "Rotor": "Helical cutting"}'::jsonb,
  '{"ხელმისაწვდომი ზომები": "1.0-დან 2.1 მეტრამდე", "ჭრის სიმძლავრე": "6სმ-მდე", "შეგროვება": "როლიკის სისტემა", "როტორი": "სპირალური ჭრა"}'::jsonb,
  'https://www.youtube.com/shorts/_oLQRqtkYSo?feature=share',
  true,
  2,
  now(),
  now();

-- Add more products following the same pattern...

-- Verify import
SELECT 
  'Categories' as type,
  count(*) as count
FROM categories
UNION ALL
SELECT 
  'Products' as type,
  count(*) as count
FROM products;

-- Show category breakdown
SELECT 
  c.name_en,
  c.name_ka,
  count(p.id) as product_count
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
GROUP BY c.id, c.name_en, c.name_ka
ORDER BY c.display_order;

