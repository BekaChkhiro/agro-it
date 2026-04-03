"use client";

import { useState } from "react";
import { Search, Edit, Save, Package } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { SERPPreview } from "./SERPPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  AdminDialogBody,
  AdminDialogContent,
  AdminDialogFooter,
  AdminDialogHeader,
  AdminFormFieldGrid,
  AdminTabsList,
  AdminTabsTrigger,
} from "@/components/admin/form/primitives";

const db = supabase as any;

type SEOFormState = {
  meta_title_ka: string;
  meta_title_en: string;
  meta_title_hy: string;
  meta_description_ka: string;
  meta_description_en: string;
  meta_description_hy: string;
  keywords_ka: string;
  keywords_en: string;
  keywords_hy: string;
  og_image_override: string;
  robots_override: string;
};

const emptyForm: SEOFormState = {
  meta_title_ka: "",
  meta_title_en: "",
  meta_title_hy: "",
  meta_description_ka: "",
  meta_description_en: "",
  meta_description_hy: "",
  keywords_ka: "",
  keywords_en: "",
  keywords_hy: "",
  og_image_override: "",
  robots_override: "",
};

type ProductRow = {
  id: string;
  name_en: string;
  name_ka: string;
  slug_en: string | null;
  image_url: string | null;
  meta_title_ka: string | null;
  meta_title_en: string | null;
  meta_title_hy: string | null;
  meta_description_ka: string | null;
  meta_description_en: string | null;
  meta_description_hy: string | null;
  keywords_ka: string | null;
  keywords_en: string | null;
  keywords_hy: string | null;
  og_image_override: string | null;
  robots_override: string | null;
};

function useProducts() {
  return useQuery({
    queryKey: ["products-seo"],
    queryFn: async () => {
      const { data, error } = await db
        .from("products")
        .select("id, name_en, name_ka, slug_en, image_url, meta_title_ka, meta_title_en, meta_title_hy, meta_description_ka, meta_description_en, meta_description_hy, keywords_ka, keywords_en, keywords_hy, og_image_override, robots_override")
        .order("name_en", { ascending: true });
      if (error) throw error;
      return data as ProductRow[];
    },
  });
}

function useUpdateProductSEO() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data: seoData }: { id: string; data: Record<string, unknown> }) => {
      const { error } = await db.from("products").update(seoData).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products-seo"] });
    },
  });
}

export function ProductSEOManager() {
  const { data: products, isLoading } = useProducts();
  const updateSEO = useUpdateProductSEO();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);
  const [form, setForm] = useState<SEOFormState>(emptyForm);
  const [activeTab, setActiveTab] = useState("meta");

  const filtered = (products || []).filter(
    (p) =>
      p.name_en.toLowerCase().includes(search.toLowerCase()) ||
      p.name_ka.includes(search)
  );

  const updateField = (field: keyof SEOFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openEdit = (product: ProductRow) => {
    setEditingProduct(product);
    setForm({
      meta_title_ka: product.meta_title_ka || "",
      meta_title_en: product.meta_title_en || "",
      meta_title_hy: product.meta_title_hy || "",
      meta_description_ka: product.meta_description_ka || "",
      meta_description_en: product.meta_description_en || "",
      meta_description_hy: product.meta_description_hy || "",
      keywords_ka: product.keywords_ka || "",
      keywords_en: product.keywords_en || "",
      keywords_hy: product.keywords_hy || "",
      og_image_override: product.og_image_override || "",
      robots_override: product.robots_override || "",
    });
    setActiveTab("meta");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingProduct) return;

    const payload: Record<string, unknown> = {
      meta_title_ka: form.meta_title_ka || null,
      meta_title_en: form.meta_title_en || null,
      meta_title_hy: form.meta_title_hy || null,
      meta_description_ka: form.meta_description_ka || null,
      meta_description_en: form.meta_description_en || null,
      meta_description_hy: form.meta_description_hy || null,
      keywords_ka: form.keywords_ka || null,
      keywords_en: form.keywords_en || null,
      keywords_hy: form.keywords_hy || null,
      og_image_override: form.og_image_override || null,
      robots_override: form.robots_override || null,
    };

    try {
      await updateSEO.mutateAsync({ id: editingProduct.id, data: payload });
      toast({ title: "Updated", description: `SEO for "${editingProduct.name_en}" updated.` });
      setDialogOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Operation failed";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const hasSEO = (p: ProductRow) =>
    !!(p.meta_title_en || p.meta_title_ka || p.meta_description_en || p.meta_description_ka || p.keywords_en || p.keywords_ka);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const seoCount = (products || []).filter(hasSEO).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Product SEO</h2>
        <p className="text-sm text-muted-foreground">
          Manage SEO meta tags for each product ({seoCount}/{products?.length || 0} configured)
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="pl-10" />
      </div>

      <div className="grid gap-3">
        {filtered.map((product) => (
          <Card key={product.id} className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center justify-between p-4">
              <div className="min-w-0 flex-1 flex items-center gap-3">
                {product.image_url && (
                  <img src={product.image_url} alt="" className="h-10 w-10 rounded object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium truncate">{product.name_ka}</span>
                    <span className="text-sm text-muted-foreground truncate">/ {product.name_en}</span>
                    {hasSEO(product) ? (
                      <Badge variant="secondary" className="text-xs shrink-0">SEO Set</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-yellow-600 shrink-0">No SEO</Badge>
                    )}
                  </div>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {product.meta_title_en || product.meta_description_en || "No meta tags set"}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                <Edit className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">No products found</p>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AdminDialogContent>
          <AdminDialogHeader>
            <DialogTitle>Edit SEO: {editingProduct?.name_ka} / {editingProduct?.name_en}</DialogTitle>
            <DialogDescription>Configure SEO meta tags for this product</DialogDescription>
          </AdminDialogHeader>
          <AdminDialogBody>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <AdminTabsList>
                <AdminTabsTrigger value="meta">Meta Tags</AdminTabsTrigger>
                <AdminTabsTrigger value="og">Open Graph</AdminTabsTrigger>
                <AdminTabsTrigger value="advanced">Advanced</AdminTabsTrigger>
              </AdminTabsList>

              <TabsContent value="meta" className="space-y-6">
                <SERPPreview
                  title={form.meta_title_en || editingProduct?.name_en || ""}
                  url={`https://agroit.ge/en/${editingProduct?.slug_en || ""}`}
                  description={form.meta_description_en || ""}
                />

                <AdminFormFieldGrid columns={2}>
                  <div className="space-y-2">
                    <Label>SEO Title (Georgian)</Label>
                    <Input value={form.meta_title_ka} onChange={(e) => updateField("meta_title_ka", e.target.value)} />
                    <p className="text-xs text-muted-foreground">{form.meta_title_ka.length}/60</p>
                  </div>
                  <div className="space-y-2">
                    <Label>SEO Title (English)</Label>
                    <Input value={form.meta_title_en} onChange={(e) => updateField("meta_title_en", e.target.value)} />
                    <p className="text-xs text-muted-foreground">{form.meta_title_en.length}/60</p>
                  </div>
                </AdminFormFieldGrid>

                <AdminFormFieldGrid columns={2}>
                  <div className="space-y-2">
                    <Label>SEO Description (Georgian)</Label>
                    <Textarea value={form.meta_description_ka} onChange={(e) => updateField("meta_description_ka", e.target.value)} rows={3} />
                    <p className="text-xs text-muted-foreground">{form.meta_description_ka.length}/160</p>
                  </div>
                  <div className="space-y-2">
                    <Label>SEO Description (English)</Label>
                    <Textarea value={form.meta_description_en} onChange={(e) => updateField("meta_description_en", e.target.value)} rows={3} />
                    <p className="text-xs text-muted-foreground">{form.meta_description_en.length}/160</p>
                  </div>
                </AdminFormFieldGrid>

                <AdminFormFieldGrid columns={2}>
                  <div className="space-y-2">
                    <Label>Keywords (Georgian)</Label>
                    <Input value={form.keywords_ka} onChange={(e) => updateField("keywords_ka", e.target.value)} placeholder="keyword1, keyword2" />
                  </div>
                  <div className="space-y-2">
                    <Label>Keywords (English)</Label>
                    <Input value={form.keywords_en} onChange={(e) => updateField("keywords_en", e.target.value)} placeholder="keyword1, keyword2" />
                  </div>
                </AdminFormFieldGrid>
              </TabsContent>

              <TabsContent value="og" className="space-y-6">
                <div className="space-y-2">
                  <Label>OG Image URL</Label>
                  <Input value={form.og_image_override} onChange={(e) => updateField("og_image_override", e.target.value)} placeholder="Override default OG image" />
                  <p className="text-xs text-muted-foreground">Leave empty to use product image</p>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6">
                <div className="space-y-2">
                  <Label>Robots Override</Label>
                  <Input value={form.robots_override} onChange={(e) => updateField("robots_override", e.target.value)} placeholder="e.g. noindex, nofollow" />
                  <p className="text-xs text-muted-foreground">Leave empty for default (index, follow)</p>
                </div>
              </TabsContent>
            </Tabs>
          </AdminDialogBody>
          <AdminDialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={updateSEO.isPending}>
              <Save className="mr-2 h-4 w-4" />
              Save SEO
            </Button>
          </AdminDialogFooter>
        </AdminDialogContent>
      </Dialog>
    </div>
  );
}
