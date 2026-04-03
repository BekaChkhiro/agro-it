"use client";

import { useEffect, useState } from "react";
import { Search, Edit, Save, FolderTree } from "lucide-react";

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
};

type CategoryRow = {
  id: string;
  name_en: string;
  name_ka: string;
  slug_en: string | null;
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
};

function useCategories() {
  return useQuery({
    queryKey: ["categories-seo"],
    queryFn: async () => {
      const { data, error } = await db
        .from("categories")
        .select("id, name_en, name_ka, slug_en, meta_title_ka, meta_title_en, meta_title_hy, meta_description_ka, meta_description_en, meta_description_hy, keywords_ka, keywords_en, keywords_hy, og_image_override")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as CategoryRow[];
    },
  });
}

function useUpdateCategorySEO() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data: seoData }: { id: string; data: Record<string, unknown> }) => {
      const { error } = await db.from("categories").update(seoData).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories-seo"] });
    },
  });
}

export function CategorySEOManager() {
  const { data: categories, isLoading } = useCategories();
  const updateSEO = useUpdateCategorySEO();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null);
  const [form, setForm] = useState<SEOFormState>(emptyForm);
  const [activeTab, setActiveTab] = useState("meta");

  const filtered = (categories || []).filter(
    (c) =>
      c.name_en.toLowerCase().includes(search.toLowerCase()) ||
      c.name_ka.includes(search)
  );

  const updateField = (field: keyof SEOFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openEdit = (cat: CategoryRow) => {
    setEditingCategory(cat);
    setForm({
      meta_title_ka: cat.meta_title_ka || "",
      meta_title_en: cat.meta_title_en || "",
      meta_title_hy: cat.meta_title_hy || "",
      meta_description_ka: cat.meta_description_ka || "",
      meta_description_en: cat.meta_description_en || "",
      meta_description_hy: cat.meta_description_hy || "",
      keywords_ka: cat.keywords_ka || "",
      keywords_en: cat.keywords_en || "",
      keywords_hy: cat.keywords_hy || "",
      og_image_override: cat.og_image_override || "",
    });
    setActiveTab("meta");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingCategory) return;

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
    };

    try {
      await updateSEO.mutateAsync({ id: editingCategory.id, data: payload });
      toast({ title: "Updated", description: `SEO for "${editingCategory.name_en}" updated.` });
      setDialogOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Operation failed";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const hasSEO = (cat: CategoryRow) =>
    !!(cat.meta_title_en || cat.meta_title_ka || cat.meta_description_en || cat.meta_description_ka || cat.keywords_en || cat.keywords_ka);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Category SEO</h2>
        <p className="text-sm text-muted-foreground">
          Manage SEO meta tags for each category ({categories?.length || 0} categories)
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search categories..." className="pl-10" />
      </div>

      <div className="grid gap-3">
        {filtered.map((cat) => (
          <Card key={cat.id} className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center justify-between p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <FolderTree className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{cat.name_ka}</span>
                  <span className="text-sm text-muted-foreground">/ {cat.name_en}</span>
                  {hasSEO(cat) ? (
                    <Badge variant="secondary" className="text-xs">SEO Set</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-yellow-600">No SEO</Badge>
                  )}
                </div>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {cat.meta_title_en || cat.meta_description_en || "No meta tags set"}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}>
                <Edit className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">No categories found</p>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AdminDialogContent>
          <AdminDialogHeader>
            <DialogTitle>Edit SEO: {editingCategory?.name_ka} / {editingCategory?.name_en}</DialogTitle>
            <DialogDescription>Configure SEO meta tags for this category</DialogDescription>
          </AdminDialogHeader>
          <AdminDialogBody>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <AdminTabsList>
                <AdminTabsTrigger value="meta">Meta Tags</AdminTabsTrigger>
                <AdminTabsTrigger value="og">Open Graph</AdminTabsTrigger>
              </AdminTabsList>

              <TabsContent value="meta" className="space-y-6">
                <SERPPreview
                  title={form.meta_title_en || editingCategory?.name_en || ""}
                  url={`https://agroit.ge/${editingCategory?.slug_en || ""}`}
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
