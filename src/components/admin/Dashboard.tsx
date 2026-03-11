import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, FolderTree, Star, TrendingUp, Upload, Loader2, Download, HardDrive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Stats {
  totalProducts: number;
  totalCategories: number;
  featuredProducts: number;
  recentProducts: number;
}

interface RecentProduct {
  id: string;
  name_en: string;
  created_at: string;
  is_featured: boolean;
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalCategories: 0,
    featuredProducts: 0,
    recentProducts: 0,
  });
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch products
      const { data: products } = await supabase
        .from("products")
        .select("id, name_en, created_at, is_featured")
        .order("created_at", { ascending: false });

      // Fetch categories
      const { data: categories } = await supabase
        .from("categories")
        .select("id");

      // Calculate stats
      const totalProducts = products?.length || 0;
      const totalCategories = categories?.length || 0;
      const featuredProducts = products?.filter(p => p.is_featured).length || 0;

      // Recent products (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentProducts = products?.filter(
        p => p.created_at && new Date(p.created_at) > sevenDaysAgo
      ).length || 0;

      setStats({
        totalProducts,
        totalCategories,
        featuredProducts,
        recentProducts,
      });

      // Set recent products for activity feed
      setRecentProducts(
        products
          ?.filter((p): p is typeof p & { created_at: string } => p.created_at !== null)
          .slice(0, 5)
          .map(p => ({
            id: p.id,
            name_en: p.name_en,
            created_at: p.created_at,
            is_featured: p.is_featured ?? false,
          })) || []
      );
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'schema' | 'data' | 'storage') => {
    try {
      toast({
        title: `Exporting ${type}...`,
        description: "This may take a few moments",
      });

      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL}/functions/v1/export-database?type=${type}`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = type === 'schema' ? 'schema.sql' : type === 'data' ? 'data.sql' : 'storage-files.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export successful",
        description: `${type} exported successfully!`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: `Failed to export ${type}`,
        variant: "destructive",
      });
    }
  };


  const importSampleData = async () => {
    setImporting(true);

    try {
      toast({
        title: "Starting import...",
        description: "This may take a few moments",
      });

      // Sample data
      const categories = [
        { name_en: 'Orchard Equipment', name_ka: 'ბაღის ტექნიკა', slug_en: 'orchard-equipment', display_order: 1 },
        { name_en: 'Vineyard Equipment', name_ka: 'ვენახის ტექნიკა', slug_en: 'vineyard-equipment', display_order: 2 },
        { name_en: 'Dry Fruits Equipment', name_ka: 'კაკლოვანი ტექნიკა', slug_en: 'dry-fruits-equipment', display_order: 3 },
        { name_en: 'Processing Equipment', name_ka: 'გადამამუშავებელი ტექნიკა', slug_en: 'processing-equipment', display_order: 4 }
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

      // Import categories
      let catSuccess = 0;
      for (const cat of categories) {
        try {
          await supabase.from('categories').upsert({
            name_en: cat.name_en,
            name_ka: cat.name_ka,
            slug_en: cat.slug_en,
            slug_ka: cat.slug_en,
            description_en: `Professional ${cat.name_en.toLowerCase()}`,
            description_ka: `პროფესიული ${cat.name_ka.toLowerCase()}`,
            is_featured: true,
            show_in_nav: true,
            display_order: cat.display_order
          } as any, { onConflict: 'slug_en' });
          catSuccess++;
        } catch (err) {
          console.log(`Category error: ${cat.name_en}`, err);
        }
      }

      // Get category IDs
      const { data: cats } = await supabase.from('categories').select('id, slug_en');
      const catMap: any = {};
      (cats as any[] || [])?.forEach((c: any) => catMap[c.slug_en] = c.id);

      const syncProductCategories = async (productId: string, categoryIds: string[]) => {
        await supabase.from('product_categories').delete().eq('product_id', productId);
        if (!categoryIds.length) return;

        const { error } = await supabase
          .from('product_categories')
          .insert(categoryIds.map((categoryId) => ({ product_id: productId, category_id: categoryId })));

        if (error) throw error;
      };

      // Import products
      let prodSuccess = 0;
      for (const prod of products) {
        try {
          const catId = catMap[prod.category_slug];
          if (!catId) continue;

          const { data: upsertedProduct, error } = await supabase
            .from('products')
            .upsert({
              name_en: prod.name_en,
              name_ka: prod.name_ka,
              slug_en: prod.name_en.toLowerCase().replace(/\s+/g, '-'),
              slug_ka: prod.name_ka.toLowerCase().replace(/\s+/g, '-'),
              description_en: 'Professional agricultural equipment from Italy',
              description_ka: 'პროფესიული სოფლის მეურნეობის ტექნიკა იტალიიდან',
              is_featured: true
            } as any, { onConflict: 'slug_en' })
            .select('id')
            .single();

          if (error) throw error;

          if (upsertedProduct?.id) {
            await syncProductCategories(upsertedProduct.id, [catId]);
          }
          prodSuccess++;
        } catch (err) {
          console.log(`Product error: ${prod.name_en}`, err);
        }
      }

      // Refresh dashboard data
      await fetchDashboardData();

      toast({
        title: "Import complete!",
        description: `Added ${catSuccess} categories and ${prodSuccess} products`,
      });

    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import failed",
        description: "Check console for details",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-24" />
                <div className="h-4 w-4 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 mb-2" />
                <div className="h-3 bg-muted rounded w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      description: "All products in catalog",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Categories",
      value: stats.totalCategories,
      icon: FolderTree,
      description: "Product categories",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Featured",
      value: stats.featuredProducts,
      icon: Star,
      description: "Featured products",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
    },
    {
      title: "Recent",
      value: stats.recentProducts,
      icon: TrendingUp,
      description: "Added this week",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Header with Export Buttons */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your website content and settings</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => handleExport('schema')} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Schema
          </Button>
          <Button onClick={() => handleExport('data')} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button onClick={() => handleExport('storage')} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Storage
          </Button>
          <Button onClick={async () => {
            try {
              toast({
                title: "Generating image manifest...",
                description: "This may take a few moments",
              });

              const { data: { session } } = await supabase.auth.getSession();
              
              const response = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL}/functions/v1/export-database?type=storage`,
                {
                  headers: {
                    Authorization: `Bearer ${session?.access_token}`,
                  },
                }
              );

              if (!response.ok) throw new Error('Export failed');

              const storageData = await response.json();
              const manifest = {
                ...storageData,
                downloadInstructions: [
                  "1. Save this JSON file for reference",
                  "2. Use a bulk downloader tool like wget or curl",
                  "3. Each file contains: 'path' (folder structure) and 'url' (download link)",
                  "4. Preserve the 'path' when saving files to maintain folder structure",
                  "5. Example wget: Create urls.txt with all URLs, then run: wget -i urls.txt"
                ]
              };

              const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `image-manifest-${new Date().toISOString().split('T')[0]}.json`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);

              toast({
                title: "Image manifest downloaded",
                description: "Use it to bulk download all images with correct folder paths",
              });
            } catch (error) {
              console.error('Export error:', error);
              toast({
                title: "Export failed",
                description: "Failed to generate image manifest",
                variant: "destructive",
              });
            }
          }} variant="secondary" size="sm">
            <HardDrive className="w-4 h-4 mr-2" />
            Image Migration
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card
            key={index}
            className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4"
            style={{ borderLeftColor: `var(--${stat.color.split('-')[1]}-600)` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Import Section */}
      {(stats.totalProducts === 0 || stats.totalCategories === 0) && (
        <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Upload className="h-5 w-5" />
              Quick Import Sample Data
            </CardTitle>
            <CardContent className="pt-4">
              <p className="text-muted-foreground mb-4">
                Your database appears to be empty. Import sample categories and products to get started quickly.
              </p>
              <Button
                onClick={importSampleData}
                disabled={importing}
                className="w-full"
                size="lg"
              >
                {importing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Import Sample Data (4 categories, 8 products)
                  </>
                )}
              </Button>
            </CardContent>
          </CardHeader>
        </Card>
      )}

      {/* Recent Activity */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentProducts.length > 0 ? (
              recentProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{product.name_en}</p>
                      <p className="text-sm text-muted-foreground">
                        Added {new Date(product.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {product.is_featured && (
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No recent products</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
