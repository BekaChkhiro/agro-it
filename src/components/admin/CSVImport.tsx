// CSVImport component manages bulk category and product ingestion for admins
// CSVImport page-level component coordinates bulk data ingestion via CSV files
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Download, AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface CSVImportProps {
  onImportComplete?: () => void;
}

type ImportMode = 'add' | 'update' | 'overwrite' | 'delete';
type ImportType = 'categories' | 'products';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
  warnings: string[];
}

// CSVImport renders the admin-side CSV uploader with import controls and feedback
export function CSVImport({ onImportComplete }: CSVImportProps) {
  const [importType, setImportType] = useState<ImportType>('categories');
  const [importMode, setImportMode] = useState<ImportMode>('add');
  const [csvText, setCsvText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [includeImages, setIncludeImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // handleFileUpload reads the selected CSV file into local state
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvText(text);
    };
    reader.readAsText(file);
  };

  // downloadTemplate provides sample CSV content depending on the selected import type
  const downloadTemplate = () => {
    let csvContent = '';

    if (importType === 'categories') {
      csvContent = `parent_slug,name_en,name_ka,slug_en,slug_ka,description_en,description_ka,is_featured,show_in_nav,display_order,banner_image_url,icon
ROOT,Orchard Equipment,ხეხილის ტექნიკა,orchard,xeqilis-teqnika,Comprehensive machinery for professional orchards,პროფესიული ბაღების სრულყოფილი ტექნიკა,true,true,1,/src/assets/orchard-category.webp,🍎
orchard,Orchard Mulching & Inter-row Care,ბაღის მულჩერი და რიგშორისი მოვლა,orchard-mulching,baghis-mulchireba,Mulchers and under-tree care systems with sensors,მულჩერები და ხისქვეშა მოვლის სენსორიანი სისტემები,false,false,1,,
orchard,Orchard Sprayers & Nutrition,ბაღის შესხურება და კვება,orchard-sprayers,baghis-sesquraveba,Reverse-aspiration sprayers and nutrient spreaders,უკუასპირაციული შესხურება და საკვები გამფანტველები,false,false,2,,
orchard,Orchard Harvest Platforms,ბაღის საკრეფი პლატფორმები,orchard-harvest,baghis-sakrefi-platforma,Harvest platforms and conveyors protecting delicate fruit,საკრეფი პლატფორმები და კონვეიერები ნაზი მოსავლისთვის,false,false,3,,
ROOT,Vineyard Innovations,ვენახის ინოვაციები,vineyard-inno,venaxis-inovaciebi,Precision tools engineered for vineyards,სიზუსტის ინსტრუმენტები ვენახებისთვის,true,true,2,/src/assets/vineyard-category.webp,🍇
vineyard-inno,Vineyard Pruning Systems,ვენახის ჩხვლეტის სისტემები,vineyard-pruning,venaxis-chxvletis-sisteme,Manual and automatic pruning heads for any trellis,ხელისა და ავტომატური ჩხვლეტის თავები ნებისმიერი სისტვისთვის,false,false,1,,
vineyard-inno,Vineyard Canopy Management,ვენახის გვირგვინის მართვა,vineyard-canopy,venaxis-gvirgvins-martva,Leaf stripping and windrowing equipment for airflow,ფოთლების მოსაშორებელი და ქინდროერი ჰაერის ცვლისთვის,false,false,2,,
vineyard-inno,Vineyard Protection & Spraying,ვენახის დაცვა და შესხურება,vineyard-protection,venaxis-dacva-sesquraveba,Drop-save sprayers and herbicide bars with sensors,დროპ-სეივ შესხურება და სენსორიანი ჰერბიციდის ბარები,false,false,3,,
ROOT,Nut & Dry Fruit Systems,კაკლის და ხმელი ხილის სისტემები,dryfruit-systems,kaklis-da-xmeli-sisteme,Harvest and processing lines for nuts and dry fruits,კაკლისა და ხმელი ხილის მოსავლისა და გადამუშავების ხაზები,true,true,3,/src/assets/dryfruits-category.webp,🌰
dryfruit-systems,Dry Fruit Harvest & Shaking,ხმელი ხილის საკრეფი და შემკრავი,dry-harvest,kaklis-sakrepi-shakeri,Self-propelled harvesters and hydraulic shakers,თვითმავალი საკრეფები და ჰიდრავლიკური შემკრავები,false,false,1,,
dryfruit-systems,Dry Fruit Processing Lines,ხმელი ხილის გადამამუშავებელი ხაზები,dry-processing,kaklis-gadamamushaveba,Hulling, cracking and cleaning solutions for nuts,გაპარსვის გატეხვის და გასუფთავების გადაწყვეტილებები,false,false,2,,
dryfruit-systems,Dry Fruit Finishing & Value Add,ხმელი ხილის დასრულება და ღირებულება,dry-finishing,kaklis-dasruleba,Roasting, coating and bar production machinery,შემწვარი საფარის და ბარის წარმოების დანადგარები,false,false,3,,
ROOT,Post-Harvest & Packaging,მოსავლისშემდგომი და შეფუთვის ხაზები,post-harvest,mosavlis-shemdeg-linebi,Turn-key sorting storage and packaging solutions,სრული გადაწყვეტები დახარისხების საწყობის და შეფუთვისთვის,true,true,4,/src/assets/processing-equipment.webp,⚙️
post-harvest,Post-Harvest Sorting & Calibration,მოსავლისშემდგომი დახარისხება და კალიბრაცია,post-sorting,mosavlis-daxariscxeba,AI-enabled grading and calibration up to 20 tons/hour,AI-ზე დაფუძნებული დახარისხება საათში 20 ტონამდე,false,false,1,,
post-harvest,Cold Storage & Atmosphere,ცივი საწყობი და ატმოსფერო,post-cold,mosavlis-civi-sawyobi,Controlled-atmosphere and ultra-low oxygen storage,კონტროლირებადი ატმოსფეროს და უკიდურესად დაბალი ჟანგბადის საწყობი,false,false,2,,
post-harvest,Packaging & Bottling Lines,შეფუთვის და ჩამოსხმის ხაზები,post-packaging,mosavlis-shefutvis-xazi,Net baggers, flow packers and bottling monoblocs,ბადის შეფუთვის ნაკადოვანი მანქანები და ჩამოსხმის მონობლოკები,false,false,3,,`;
    } else {
      csvContent = `category_slug,name_en,name_ka,slug_en,slug_ka,description_en,description_ka,is_featured,price,video_url,image_url,gallery_images
orchard-mulching,Mulcher with IT Hydraulic Disk,მულჩერი IT ჰიდრავლიკური დისკით,mulcher-it-hydraulic,mulcher-it-hidravlika,Disc-assisted mulcher with hydraulic tree sensor,დისკიანი მულჩერი ხის ჰიდრავლიკური სენსორით,true,0,https://youtu.be/iRYc1L109M0,/src/assets/orchard-mulcher.webp,
orchard-mulching,Mulcher TCK for Prunings,მულჩერი TCK ჩვრებისთვის,mulcher-tck-prunings,mulcher-tck-chvrebistvis,Pickup roll mulcher handling thick prunings,პიკაპ-როლიკიანი მულჩერი სქელი ჩხვლეტისთვის,true,0,https://www.youtube.com/shorts/_oLQRqtkYSo,/src/assets/mulcher-compact.webp,
orchard-mulching,Forestry Mulcher with Hammer Roller,ტყის მულჩერი ჩაქუჩების როლიკით,forestry-hammer-mulcher,tyis-mulcheri-chakuchit,Forestry rotor mulcher with hydraulic push frame,ტყის როტორის მულჩერი ჰიდრავლიკური ჩარჩოთი,false,0,,/src/assets/forestry-mulcher.webp,
orchard-sprayers,Sprayer Rhone Top,შესხურების აპარატი Rhone Top,sprayer-rhone-top,sprayer-rhone-top,Reverse aspiration tower sprayer with brass filters,უკუასპირაციული კოშკური შესხურება ბრასის ფილტრებით,true,0,,/src/assets/vineyard-sprayer.webp,
orchard-sprayers,Annovi Manure Spreader,ანნოვის სასუქის გამფანტველი,annovi-manure-spreader,annovi-sasqis-gamfantveli,Compact spreader with three-speed chain conveyor,კომპაქტური გამფანტველი სამსიჩქარიანი ჯაჭვით,false,0,,/src/assets/manure-spreader.webp,
orchard-harvest,Harvesting Platforms,საკრეფი პლატფორმები,harvesting-platforms,sakrefi-platformebi,Wide platforms with automatic bin rotation,ფართო პლატფორმები ავტომატური კონტეინერის შეცვლით,true,0,,/src/assets/harvesting-platform.webp,
orchard-harvest,Fama Windrower,ფამა ქინდროერი,fama-windrower,fama-kindroeri,Windrower with multi-directional hoisting arms,ქინდროერი მრავალმიმართულებიანი ამწე მკლავებით,false,0,,/src/assets/harvesting-platform.webp,
vineyard-pruning,Mulcher TFB Medium Duty,მულჩერი TFB საშუალო დატვირთვისთვის,mulcher-tfb-medium,mulcher-tfb-sashualo,Low-profile mulcher dedicated to vineyard rows,დაბალპროფილიანი მულჩერი ვენახის რიგებისთვის,true,0,,/src/assets/mulcher-tfb.webp,
vineyard-pruning,Bilateral Pruning Machine,ორმხრივი ჩხვლეტის მანქანა,bilateral-pruning-machine,ormxvri-chxvletis-manqana,Two-row pruning machine with joystick control,ორმეხიანი ჩხვლეტის მანქანა ჯოისტიკით,true,0,,/src/assets/pruning-machine.webp,
vineyard-canopy,Leaves Strippers,ფოთლების მოსაშორებელი სისტემა,leaves-strippers,photlebi-mosashorebeli-sistema,Low-pressure defoliation kit for healthy canopy,დაბალი წნევის დეფოლიაციის კომპლექტი,false,0,,/src/assets/leaf-stripper.webp,
vineyard-canopy,Inter-row Tool Carrier,რიგშორისი სამუშაო პლატფორმა,inter-row-tool-carrier,rigshorisi-samushavo-platforma,Rear mounted hydraulic tool carrier for 25+ tools,უკანა დამაგრებული ჰიდრავლიკური ინსტრუმენტების მატარებელი,false,0,,/src/assets/tool-carrier.webp,
vineyard-protection,Sprayers for Vineyards Drop-Save,ვენახის დროპ-სეივ შესხურება,drop-save-sprayer,drop-save-sesquraveba,Drop-save sprayer recovering half of sprayed liquid,დროპ-სეივ შესხურება გამოშვებული სითხის ნახევრის დაბრუნებით,true,0,,/src/assets/vineyard-sprayer.webp,
vineyard-protection,Herbicide Bar with Pneumatic Sensor,ჰერბიციდის ბარი პნევმატური სენსორით,herbicide-bar-pneumatic,herbicide-bar-pnevmatikuri-sensori,Hydraulic herbicide bar with automatic tree detection,ჰიდრავლიკური ჰერბიციდის ბარი ავტომატური ხის დეტექციით,false,0,,/src/assets/herbicide-bar.webp,
dry-harvest,Facma Self-propelled Harvester,Facma თვითმავალი საკრეფი,facma-self-propelled,facma-tvitmavali-sakrepi,Self-propelled harvester for almonds and hazelnuts,თვითმავალი საკრეფი ნიგოზისა და თხილისთვის,true,0,,/src/assets/nut-harvester.webp,
dry-harvest,Trailed Shaker Petska,მისაბმელი შემკრავი Petska,trailed-shaker-petska,misabmeli-shemkhravi-petska,Hydraulic clamp shaker for compact orchards,ჰიდრავლიკური კლამპის შემკრავი მცირე ბაღებისთვის,false,0,,/src/assets/petska-shaker.webp,
dry-processing,Hulling Machines for Almonds,ნუშის გატყავების მანქანები,hulling-machines-almonds,nushis-gatqavebis-manqanebi,Scalable huller line from 500 to 6000 kg/hour,მასშტაბური გატყავების ხაზი 500-6000 კგ/სთ,false,0,,/src/assets/hulling-machine.webp,
dry-processing,Cracking Machine for Walnuts,კაკლის გატეხვის მანქანა,cracking-machine-walnuts,kaklis-gatekvis-manqana,Modular cracking line with automatic calibration,მოდულური გატეხვის ხაზი ავტომატური კალიბრაციით,false,0,,/src/assets/processing-equipment.webp,
dry-finishing,Roasting Machine for Dry Fruits,ხმელი ხილის შემწვარი მანქანა,roasting-machine-dry-fruits,hmeli-xilis-shemwvri-manqana,Temperature-controlled roasting drum for nuts,ტემპერატურის კონტროლირებადი შემწვარი დრამი,false,0,,/src/assets/processing-equipment.webp,
dry-finishing,Energy Bar Production Line,ენერგეტიკული ბარების ხაზი,energy-bar-production-line,energobar-ebis-xazi,Automatic bar production up to 80 bars per minute,ავტომატური ხაზი წუთში 80 ბარამდე,false,0,,/src/assets/processing-equipment.webp,
post-sorting,Calibration and Sorting Solutions,კალიბრაციის და დახარისხების გადაწყვეტა,calibration-sorting-solutions,kalibraciis-da-daxariscxebis-gadawyvetileba,Turn-key sorting by weight diameter color and quality,სრული დახარისხება წონის დიამეტრის ფერის და ხარისხის მიხედვით,true,0,,/src/assets/calibration-sorting.webp,
post-sorting,AI Optical Sorting Conveyor,AI ოპტიკური დახარისხების კონვეიერი,ai-optical-sorting-conveyor,ai-optikuri-daxariscxebis-konveieri,AI-enabled conveyor for apples pears and tomatoes,AI კონვეიერი ვაშლის მსხლის და პომიდვრისთვის,false,0,,/src/assets/calibration-sorting.webp,
post-cold,Cold Storage Turn-Key Project,ცივი საწყობის სრული პროექტი,cold-storage-turnkey-project,civi-sawyobis-sruli-proeqti,Controlled atmosphere cold storage with full service,კონტროლირებადი ატმოსფეროს ცივი საწყობი სრული მომსახურებით,true,0,,/src/assets/cold-storage.webp,
post-cold,Ultra Low Oxygen Storage,ულტრა დაბალჟანგბადიანი საწყობი,ultra-low-oxygen-storage,ultra-dabal-jangbadiani-sawyobi,Ultra-low oxygen storage program for berries and stone fruit,ულტრა დაბალი ჟანგბადის საწყობი კენკრისა და ქვის ხილისთვის,false,0,,/src/assets/cold-storage.webp,
post-packaging,Net Bag Packaging Machine,ბადის შეფუთვის მანქანა,net-bag-packaging-machine,badis-shefutvis-manqana,High-output net bagger for mixed produce,მაღალი წარმადობის ბადის შეფუთვის დანადგარი,false,0,,/src/assets/processing-equipment.webp,
post-packaging,Flow Pack Machine,ნაკადოვანი შეფუთვის მანქანა,flow-pack-machine,nakadviani-shefutvis-manqana,Automatic dosing and sealing for granular goods,ავტომატური დოზირება და დალუქვა გრანულირებული პროდუქტებისთვის,false,0,,/src/assets/processing-equipment.webp,
post-packaging,Filling Corking & Labelling Line,შევსება დახუფვა და ეტიკეტირება,filling-corking-labelling-line,shesvda-daxufva-etiketireba,Bottling turnkey line for beverages and creams,სრული ჩამოსხმის ხაზი სასმელებისა და კრემებისთვის,false,0,,/src/assets/processing-equipment.webp,`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${importType}-template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // parseCSV converts CSV text into a matrix while respecting simple quoted values
  const parseCSV = (csvText: string): string[][] => {
    const lines = csvText
      .split('\n')
      .map(line => line.replace(/\r$/, ''))
      .filter(line => {
        const trimmed = line.trim();
        return trimmed && !trimmed.startsWith('#');
      });
    return lines.map(line => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current);
          current = '';
        } else {
          current += char;
        }
      }

      result.push(current);
      return result;
    });
  };

  // uploadImageFromUrl optionally uploads remote images to Supabase storage
  const uploadImageFromUrl = async (imageUrl: string): Promise<string | null> => {
    if (!imageUrl || !includeImages) return null;

    try {
      // If it's already a Supabase storage URL, return as-is
      if (imageUrl.includes('supabase')) {
        return imageUrl;
      }

      // Download image from URL
      const response = await fetch(imageUrl);
      if (!response.ok) return null;

      const blob = await response.blob();
      const fileName = `imported-${Date.now()}-${Math.random().toString(36).substring(7)}.${blob.type.split('/')[1]}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('products')
        .upload(fileName, blob);

      if (error) return null;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      return null;
    }
  };

  // importCategories handles category creation, updates, and hierarchy assignment
  const importCategories = async (data: string[][]): Promise<ImportResult> => {
    const result: ImportResult = { success: 0, failed: 0, errors: [], warnings: [] };
    const headers = data[0];

    if (importMode === 'overwrite') {
      await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }

    const headerIndex = (name: string) => headers.findIndex(header => header.trim().toLowerCase() === name.toLowerCase());
    const parentSlugIndex = headerIndex('parent_slug');
    const nameEnIndex = headerIndex('name_en');
    const nameKaIndex = headerIndex('name_ka');
    const slugEnIndex = headerIndex('slug_en');
    const slugKaIndex = headerIndex('slug_ka');
    const descriptionEnIndex = headerIndex('description_en');
    const descriptionKaIndex = headerIndex('description_ka');
    const isFeaturedIndex = headerIndex('is_featured');
    const showInNavIndex = headerIndex('show_in_nav');
    const displayOrderIndex = headerIndex('display_order');
    const bannerImageIndex = headerIndex('banner_image_url');
    const iconIndex = headerIndex('icon');

    const { data: existingCategories } = await supabase
      .from('categories')
      .select('id, slug_en');

    const categoryMap: Record<string, string> = {};
    (existingCategories as any[] || [])?.forEach((category: any) => {
      if (category.slug_en) {
        categoryMap[category.slug_en] = category.id;
      }
    });

    if (importMode === 'overwrite') {
      Object.keys(categoryMap).forEach(key => delete categoryMap[key]);
    }

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row.length < headers.length) continue;

      try {
        const slug_en = slugEnIndex >= 0 ? row[slugEnIndex]?.trim() : '';
        const parentSlug = parentSlugIndex >= 0 ? row[parentSlugIndex]?.trim() : '';
        const parentIsRoot = parentSlug === '' || parentSlug?.toUpperCase() === 'ROOT';
        let parentId: string | null = null;

        if (!parentIsRoot && parentSlug) {
          parentId = categoryMap[parentSlug];
          if (!parentId) {
            result.warnings.push(`Row ${i + 1}: Parent slug "${parentSlug}" not found, skipped`);
            continue;
          }
        }

        const categoryData = {
          parent_id: parentId,
          name_en: nameEnIndex >= 0 ? row[nameEnIndex]?.trim() : '',
          name_ka: nameKaIndex >= 0 ? row[nameKaIndex]?.trim() : '',
          slug_en,
          slug_ka: slugKaIndex >= 0 ? row[slugKaIndex]?.trim() : '',
          description_en: descriptionEnIndex >= 0 ? row[descriptionEnIndex]?.trim() : '',
          description_ka: descriptionKaIndex >= 0 ? row[descriptionKaIndex]?.trim() : '',
          is_featured: isFeaturedIndex >= 0 ? row[isFeaturedIndex]?.toLowerCase() === 'true' : false,
          show_in_nav: showInNavIndex >= 0 ? row[showInNavIndex]?.toLowerCase() === 'true' : false,
          display_order: displayOrderIndex >= 0 ? parseInt(row[displayOrderIndex]) || 0 : 0,
          banner_image_url: bannerImageIndex >= 0 ? row[bannerImageIndex]?.trim() || null : null,
          icon: iconIndex >= 0 ? row[iconIndex]?.trim() || null : null
        };

        if (!categoryData.name_en) {
          result.warnings.push(`Row ${i + 1}: Missing name_en, skipped`);
          continue;
        }

        if (slug_en === 'ROOT') {
          result.warnings.push(`Row ${i + 1} (${categoryData.name_en}): Slug must not be ROOT, skipped`);
          continue;
        }

        if (!slug_en) {
          result.warnings.push(`Row ${i + 1} (${categoryData.name_en}): Missing slug_en, skipped`);
          continue;
        }

        let imageUrl = categoryData.banner_image_url;
        if (imageUrl && includeImages) {
          imageUrl = await uploadImageFromUrl(imageUrl) || imageUrl;
        }

        const existingCategoryId = slug_en ? categoryMap[slug_en] : undefined;

        let error;
        let upsertedId: string | undefined;

        if (existingCategoryId) {
          const updateResult = await supabase
            .from('categories')
            .update({
              ...categoryData,
              banner_image_url: imageUrl,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingCategoryId)
            .select('id')
            .single();
          error = updateResult.error;
          upsertedId = updateResult.data?.id;
        } else {
          const insertResult = await supabase
            .from('categories')
            .insert({
              ...categoryData,
              banner_image_url: imageUrl,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            } as any)
            .select('id')
            .single();
          error = insertResult.error;
          upsertedId = insertResult.data?.id;
        }

        if (error) {
          result.failed++;
          result.errors.push(`Row ${i + 1} (${categoryData.name_en}): ${error.message}`);
        } else {
          result.success++;
          if (slug_en && upsertedId) {
            categoryMap[slug_en] = upsertedId;
          }
        }

        const denominators = Math.max(1, data.length - 1);
        setProgress(Math.round((i / denominators) * 100));
      } catch (error) {
        result.failed++;
        const message = error instanceof Error ? error.message : String(error);
        result.errors.push(`Row ${i + 1}: ${message}`);
      }
    }

    return result;
  };

  const syncProductCategories = async (productId: string, categoryIds: string[]) => {
    await supabase.from('product_categories').delete().eq('product_id', productId);
    if (!categoryIds.length) return;

    const { error } = await supabase
      .from('product_categories')
      .insert(categoryIds.map((categoryId) => ({ product_id: productId, category_id: categoryId })));

    if (error) throw error;
  };

  // importProducts handles product creation and updates based on CSV rows
  const importProducts = async (data: string[][]): Promise<ImportResult> => {
    const result: ImportResult = { success: 0, failed: 0, errors: [], warnings: [] };
    const headers = data[0];

    if (importMode === 'overwrite') {
      await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }

    // Get category mappings
    const { data: categories } = await supabase
      .from('categories')
      .select('id, slug_en');

    const categoryMap: { [key: string]: string } = {};
    (categories as any[] || [])?.forEach((cat: any) => {
      if (cat.slug_en) categoryMap[cat.slug_en] = cat.id;
    });

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row.length < headers.length) continue;

      try {
        const rawCategoryValue = row[0]?.trim() || "";
        const categorySlugs = rawCategoryValue
          .split(/[,|]/)
          .map((slug) => slug.trim())
          .filter(Boolean);
        const categoryIds = categorySlugs
          .map((slug) => categoryMap[slug])
          .filter((id): id is string => Boolean(id));

        if (!categoryIds.length) {
          result.warnings.push(`Row ${i + 1}: Category "${rawCategoryValue}" not found, skipped`);
          continue;
        }

        const productData = {
          name_en: row[1]?.trim(),
          name_ka: row[2]?.trim(),
          slug_en: row[3]?.trim(),
          slug_ka: row[4]?.trim(),
          description_en: row[5]?.trim(),
          description_ka: row[6]?.trim(),
          is_featured: row[7]?.toLowerCase() === 'true',
          price: parseFloat(row[8]) || 0,
          video_url: row[9]?.trim() || null,
          image_url: row[10]?.trim() || null,
          gallery_image_urls: row[11]?.split(',').map(url => url.trim()).filter(url => url) || null
        };

        if (!productData.name_en) {
          result.warnings.push(`Row ${i + 1}: Missing name_en, skipped`);
          continue;
        }

        // Handle images
        let mainImageUrl = productData.image_url;
        let galleryUrls = productData.gallery_image_urls;

        if (includeImages) {
          if (mainImageUrl) {
            mainImageUrl = await uploadImageFromUrl(mainImageUrl) || mainImageUrl;
          }
          if (galleryUrls) {
            const uploadedUrls = await Promise.all(
              galleryUrls.map(url => uploadImageFromUrl(url))
            );
            galleryUrls = uploadedUrls.filter((url): url is string => url !== null);
          }
        }

        // Check if product exists
        const queryResult = (await supabase
          .from('products')
          .select('id')
          .eq('slug_en', (productData as any).slug_en)
          .single()) as any;
        const { data: existingProduct } = queryResult;

        let error;
        let productId: string | null = null;
        if (existingProduct) {
          // Update existing product
          const updateResult = await supabase
            .from('products')
            .update({
              ...productData,
              image_url: mainImageUrl,
              gallery_image_urls: galleryUrls,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingProduct.id)
            .select('id')
            .single();
          error = updateResult.error;
          productId = existingProduct.id;
        } else {
          // Insert new product
          const insertResult = await supabase
            .from('products')
            .insert({
              ...productData,
              image_url: mainImageUrl,
              gallery_image_urls: galleryUrls,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            } as any)
            .select('id')
            .single();
          error = insertResult.error;
          productId = insertResult.data?.id ?? null;
        }

        if (error) {
          result.failed++;
          result.errors.push(`Row ${i + 1} (${productData.name_en}): ${error.message}`);
        } else {
          if (productId) {
            await syncProductCategories(productId, categoryIds);
          }
          result.success++;
        }

        const denominators = Math.max(1, data.length - 1);
        setProgress(Math.round((i / denominators) * 100));
      } catch (error) {
        result.failed++;
        const message = error instanceof Error ? error.message : String(error);
        result.errors.push(`Row ${i + 1}: ${message}`);
      }
    }

    return result;
  };

  // handleImport orchestrates parsing then delegates to the chosen importer
  const handleImport = async () => {
    if (!csvText.trim()) {
      toast({
        title: "No CSV data",
        description: "Please provide CSV data or upload a file",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResult(null);

    try {
      const data = parseCSV(csvText);

      if (data.length < 2) {
        throw new Error("CSV must have at least a header row and one data row");
      }

      let result: ImportResult;

      if (importType === 'categories') {
        result = await importCategories(data);
      } else {
        result = await importProducts(data);
      }

      setResult(result);

      toast({
        title: "Import completed",
        description: `Successfully imported ${result.success} items${result.failed > 0 ? `, ${result.failed} failed` : ''}`,
        variant: result.failed > 0 ? "destructive" : "default",
      });

      if (result.success > 0) {
        onImportComplete?.();
      }

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            CSV Import Tool
          </CardTitle>
          <CardDescription>
            Import categories or products from CSV files. Supports add, update, overwrite, and delete operations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Import Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="import-type">Import Type</Label>
              <Select value={importType} onValueChange={(value: ImportType) => setImportType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select import type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="categories">Categories</SelectItem>
                  <SelectItem value="products">Products</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="import-mode">Import Mode</Label>
              <Select value={importMode} onValueChange={(value: ImportMode) => setImportMode(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select import mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add/Update (Safe)</SelectItem>
                  <SelectItem value="update">Update Only</SelectItem>
                  <SelectItem value="overwrite">Overwrite All</SelectItem>
                  <SelectItem value="delete">Delete Listed Items</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-images"
              checked={includeImages}
              onCheckedChange={(checked) => setIncludeImages(checked === true)}
            />
            <Label htmlFor="include-images" className="text-sm">
              Include images (upload from URLs in CSV)
            </Label>
          </div>

          {/* CSV Input */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
              >
                <FileText className="mr-2 h-4 w-4" />
                Upload CSV File
              </Button>
              <Button
                variant="outline"
                onClick={downloadTemplate}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="csv-text">Or paste CSV data here:</Label>
              <Textarea
                id="csv-text"
                placeholder="Paste your CSV data here..."
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
          </div>

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Import Button */}
          <Button
            onClick={handleImport}
            disabled={isProcessing || !csvText.trim()}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Start Import
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.failed > 0 ? (
                <XCircle className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{result.success}</div>
                <div className="text-sm text-muted-foreground">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{result.failed}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>

            {result.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-2">Errors:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {result.errors.map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {result.warnings.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-2">Warnings:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {result.warnings.map((warning, index) => (
                      <li key={index} className="text-sm">{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Help */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">CSV Format Help</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Categories CSV Format:</h4>
            <code className="text-sm bg-muted p-2 rounded block">
              name_en,name_ka,slug_en,slug_ka,description_en,description_ka,is_featured,show_in_nav,display_order,banner_image_url,icon
            </code>
          </div>

          <div>
            <h4 className="font-medium mb-2">Products CSV Format:</h4>
            <code className="text-sm bg-muted p-2 rounded block">
              category_slug,name_en,name_ka,slug_en,slug_ka,description_en,description_ka,is_featured,price,video_url,image_url,gallery_images
            </code>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>• Use quotes around fields containing commas</p>
            <p>• Leave fields empty for default values</p>
            <p>• Image URLs will be uploaded to Supabase Storage when the Include images option is checked</p>
            <p>• Gallery images should be comma-separated URLs</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
