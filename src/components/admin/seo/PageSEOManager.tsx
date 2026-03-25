"use client";

import { useEffect, useState } from "react";
import { FileText, Plus, Search, Trash2, Edit, Save } from "lucide-react";

import { usePageSEOList, useCreatePageSEO, useUpdatePageSEO, useDeletePageSEO } from "@/hooks/usePageSEO";
import { useToast } from "@/hooks/use-toast";
import type { PageSEO } from "@/types/seo";
import { SERPPreview } from "./SERPPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AdminDialogBody,
  AdminDialogContent,
  AdminDialogFooter,
  AdminDialogHeader,
  AdminFormFieldGrid,
  AdminFormSection,
  AdminTabsList,
  AdminTabsTrigger,
} from "@/components/admin/form/primitives";

type PageFormState = {
  page_slug: string;
  title_ka: string;
  title_en: string;
  title_hy: string;
  description_ka: string;
  description_en: string;
  description_hy: string;
  keywords_ka: string;
  keywords_en: string;
  keywords_hy: string;
  og_title_ka: string;
  og_title_en: string;
  og_title_hy: string;
  og_description_ka: string;
  og_description_en: string;
  og_description_hy: string;
  og_image: string;
  canonical_url: string;
  robots: string;
  schema_type: string;
  sitemap_priority: string;
  sitemap_changefreq: string;
  exclude_from_sitemap: boolean;
};

const emptyForm: PageFormState = {
  page_slug: "",
  title_ka: "",
  title_en: "",
  title_hy: "",
  description_ka: "",
  description_en: "",
  description_hy: "",
  keywords_ka: "",
  keywords_en: "",
  keywords_hy: "",
  og_title_ka: "",
  og_title_en: "",
  og_title_hy: "",
  og_description_ka: "",
  og_description_en: "",
  og_description_hy: "",
  og_image: "",
  canonical_url: "",
  robots: "index, follow",
  schema_type: "WebPage",
  sitemap_priority: "0.5",
  sitemap_changefreq: "weekly",
  exclude_from_sitemap: false,
};

function formFromPage(page: PageSEO): PageFormState {
  return {
    page_slug: page.page_slug,
    title_ka: page.title_ka || "",
    title_en: page.title_en || "",
    title_hy: page.title_hy || "",
    description_ka: page.description_ka || "",
    description_en: page.description_en || "",
    description_hy: page.description_hy || "",
    keywords_ka: page.keywords_ka || "",
    keywords_en: page.keywords_en || "",
    keywords_hy: page.keywords_hy || "",
    og_title_ka: page.og_title_ka || "",
    og_title_en: page.og_title_en || "",
    og_title_hy: page.og_title_hy || "",
    og_description_ka: page.og_description_ka || "",
    og_description_en: page.og_description_en || "",
    og_description_hy: page.og_description_hy || "",
    og_image: page.og_image || "",
    canonical_url: page.canonical_url || "",
    robots: page.robots || "index, follow",
    schema_type: page.schema_type || "WebPage",
    sitemap_priority: String(page.sitemap_priority ?? 0.5),
    sitemap_changefreq: page.sitemap_changefreq || "weekly",
    exclude_from_sitemap: page.exclude_from_sitemap ?? false,
  };
}

export function PageSEOManager() {
  const { data: pages, isLoading } = usePageSEOList();
  const createPage = useCreatePageSEO();
  const updatePage = useUpdatePageSEO();
  const deletePage = useDeletePageSEO();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PageFormState>(emptyForm);
  const [activeTab, setActiveTab] = useState("meta");

  const filtered = (pages || []).filter(
    (p) => p.page_slug.includes(search.toLowerCase()) || (p.title_en || "").toLowerCase().includes(search.toLowerCase())
  );

  const updateField = (field: keyof PageFormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setActiveTab("meta");
    setDialogOpen(true);
  };

  const openEdit = (page: PageSEO) => {
    setEditingId(page.id);
    setForm(formFromPage(page));
    setActiveTab("meta");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.page_slug.trim()) {
      toast({ title: "Error", description: "Page slug is required.", variant: "destructive" });
      return;
    }

    const payload = {
      page_slug: form.page_slug.trim(),
      title_ka: form.title_ka || null,
      title_en: form.title_en || null,
      title_hy: form.title_hy || null,
      description_ka: form.description_ka || null,
      description_en: form.description_en || null,
      description_hy: form.description_hy || null,
      keywords_ka: form.keywords_ka || null,
      keywords_en: form.keywords_en || null,
      keywords_hy: form.keywords_hy || null,
      og_title_ka: form.og_title_ka || null,
      og_title_en: form.og_title_en || null,
      og_title_hy: form.og_title_hy || null,
      og_description_ka: form.og_description_ka || null,
      og_description_en: form.og_description_en || null,
      og_description_hy: form.og_description_hy || null,
      og_image: form.og_image || null,
      canonical_url: form.canonical_url || null,
      robots: form.robots || "index, follow",
      schema_type: form.schema_type || "WebPage",
      sitemap_priority: parseFloat(form.sitemap_priority) || 0.5,
      sitemap_changefreq: form.sitemap_changefreq || "weekly",
      exclude_from_sitemap: form.exclude_from_sitemap,
    };

    try {
      if (editingId) {
        await updatePage.mutateAsync({ id: editingId, data: payload });
        toast({ title: "Updated", description: `Page SEO for "${form.page_slug}" updated.` });
      } else {
        await createPage.mutateAsync(payload);
        toast({ title: "Created", description: `Page SEO for "${form.page_slug}" created.` });
      }
      setDialogOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Operation failed";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string, slug: string) => {
    if (!confirm(`Delete SEO settings for "${slug}"?`)) return;
    try {
      await deletePage.mutateAsync(id);
      toast({ title: "Deleted", description: `SEO settings for "${slug}" removed.` });
    } catch {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Page SEO</h2>
          <p className="text-sm text-muted-foreground">Manage meta tags for each page</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Page
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search pages..." className="pl-10" />
      </div>

      <div className="grid gap-3">
        {filtered.map((page) => (
          <Card key={page.id} className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center justify-between p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">/{page.page_slug}</span>
                  {page.exclude_from_sitemap && <Badge variant="outline" className="text-xs">No Sitemap</Badge>}
                  {page.robots && page.robots.includes("noindex") && <Badge variant="destructive" className="text-xs">Noindex</Badge>}
                </div>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {page.title_en || page.title_ka || "No title set"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Priority: {page.sitemap_priority}
                </Badge>
                <Button variant="ghost" size="icon" onClick={() => openEdit(page)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(page.id, page.page_slug)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">No pages found</p>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AdminDialogContent>
          <AdminDialogHeader>
            <DialogTitle>{editingId ? "Edit Page SEO" : "Add Page SEO"}</DialogTitle>
            <DialogDescription>Configure SEO settings for this page</DialogDescription>
          </AdminDialogHeader>
          <AdminDialogBody>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <AdminTabsList>
                <AdminTabsTrigger value="meta">Meta Tags</AdminTabsTrigger>
                <AdminTabsTrigger value="og">Open Graph</AdminTabsTrigger>
                <AdminTabsTrigger value="sitemap">Sitemap</AdminTabsTrigger>
                <AdminTabsTrigger value="advanced">Advanced</AdminTabsTrigger>
              </AdminTabsList>

              <TabsContent value="meta" className="space-y-6">
                <div className="space-y-2">
                  <Label>Page Slug *</Label>
                  <Input
                    value={form.page_slug}
                    onChange={(e) => updateField("page_slug", e.target.value)}
                    placeholder="e.g. home, about, contact"
                    disabled={!!editingId}
                  />
                </div>

                <SERPPreview
                  title={form.title_en || form.title_ka || ""}
                  url={`https://agroit.ge/${form.page_slug === "home" ? "" : form.page_slug}`}
                  description={form.description_en || form.description_ka || ""}
                />

                <AdminFormFieldGrid columns={2}>
                  <div className="space-y-2">
                    <Label>Title (Georgian)</Label>
                    <Input value={form.title_ka} onChange={(e) => updateField("title_ka", e.target.value)} />
                    <p className="text-xs text-muted-foreground">{form.title_ka.length}/60</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Title (English)</Label>
                    <Input value={form.title_en} onChange={(e) => updateField("title_en", e.target.value)} />
                    <p className="text-xs text-muted-foreground">{form.title_en.length}/60</p>
                  </div>
                </AdminFormFieldGrid>

                <AdminFormFieldGrid columns={2}>
                  <div className="space-y-2">
                    <Label>Description (Georgian)</Label>
                    <Textarea value={form.description_ka} onChange={(e) => updateField("description_ka", e.target.value)} rows={3} />
                    <p className="text-xs text-muted-foreground">{form.description_ka.length}/160</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Description (English)</Label>
                    <Textarea value={form.description_en} onChange={(e) => updateField("description_en", e.target.value)} rows={3} />
                    <p className="text-xs text-muted-foreground">{form.description_en.length}/160</p>
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
                <AdminFormFieldGrid columns={2}>
                  <div className="space-y-2">
                    <Label>OG Title (Georgian)</Label>
                    <Input value={form.og_title_ka} onChange={(e) => updateField("og_title_ka", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>OG Title (English)</Label>
                    <Input value={form.og_title_en} onChange={(e) => updateField("og_title_en", e.target.value)} />
                  </div>
                </AdminFormFieldGrid>
                <AdminFormFieldGrid columns={2}>
                  <div className="space-y-2">
                    <Label>OG Description (Georgian)</Label>
                    <Textarea value={form.og_description_ka} onChange={(e) => updateField("og_description_ka", e.target.value)} rows={2} />
                  </div>
                  <div className="space-y-2">
                    <Label>OG Description (English)</Label>
                    <Textarea value={form.og_description_en} onChange={(e) => updateField("og_description_en", e.target.value)} rows={2} />
                  </div>
                </AdminFormFieldGrid>
                <div className="space-y-2">
                  <Label>OG Image URL</Label>
                  <Input value={form.og_image} onChange={(e) => updateField("og_image", e.target.value)} placeholder="/og-default.jpg" />
                </div>
              </TabsContent>

              <TabsContent value="sitemap" className="space-y-6">
                <AdminFormFieldGrid columns={2}>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={form.sitemap_priority} onValueChange={(v) => updateField("sitemap_priority", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["0.0", "0.1", "0.2", "0.3", "0.4", "0.5", "0.6", "0.7", "0.8", "0.9", "1.0"].map((v) => (
                          <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Change Frequency</Label>
                    <Select value={form.sitemap_changefreq} onValueChange={(v) => updateField("sitemap_changefreq", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"].map((v) => (
                          <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </AdminFormFieldGrid>
                <div className="flex items-center gap-3">
                  <Switch checked={form.exclude_from_sitemap} onCheckedChange={(v) => updateField("exclude_from_sitemap", v)} />
                  <Label>Exclude from Sitemap</Label>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6">
                <AdminFormFieldGrid columns={2}>
                  <div className="space-y-2">
                    <Label>Canonical URL</Label>
                    <Input value={form.canonical_url} onChange={(e) => updateField("canonical_url", e.target.value)} placeholder="Leave empty for auto" />
                  </div>
                  <div className="space-y-2">
                    <Label>Robots</Label>
                    <Select value={form.robots} onValueChange={(v) => updateField("robots", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="index, follow">index, follow</SelectItem>
                        <SelectItem value="noindex, follow">noindex, follow</SelectItem>
                        <SelectItem value="index, nofollow">index, nofollow</SelectItem>
                        <SelectItem value="noindex, nofollow">noindex, nofollow</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </AdminFormFieldGrid>
                <div className="space-y-2">
                  <Label>Schema Type</Label>
                  <Select value={form.schema_type} onValueChange={(v) => updateField("schema_type", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["WebPage", "AboutPage", "ContactPage", "CollectionPage", "FAQPage", "ItemPage"].map((v) => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>
          </AdminDialogBody>
          <AdminDialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createPage.isPending || updatePage.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {editingId ? "Update" : "Create"}
            </Button>
          </AdminDialogFooter>
        </AdminDialogContent>
      </Dialog>
    </div>
  );
}
