import { useEffect, useMemo, useRef, useState, useId } from "react";
import { Trophy, Plus, Search, Star, Trash2, Edit, ImagePlus, X, Calendar, Eye } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { useSuccessStories, useCreateSuccessStory, useUpdateSuccessStory, useDeleteSuccessStory } from "@/hooks/useSuccessStories";
import type { Database } from "@/integrations/supabase/types";
import { generateSlug, validateSlug } from "@/utils/urlHelpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { uploadImage } from "@/lib/storage";
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

type SuccessStory = Database["public"]["Tables"]["success_stories"]["Row"];

type SuccessStoryFormState = {
  title_en: string;
  title_ka: string;
  title_hy: string;
  slug: string;
  slug_hy: string;
  excerpt_en: string;
  excerpt_ka: string;
  excerpt_hy: string;
  content_en: string;
  content_ka: string;
  content_hy: string;
  featured_image_url: string;
  gallery_image_urls: string[];
  customer_name_en: string;
  customer_name_ka: string;
  customer_name_hy: string;
  customer_location_en: string;
  customer_location_ka: string;
  customer_location_hy: string;
  customer_company: string;
  customer_testimonial_en: string;
  customer_testimonial_ka: string;
  customer_testimonial_hy: string;
  product_ids: string[];
  results_achieved: string[];
  publish_date: string;
  is_published: boolean;
  is_featured: boolean;
  meta_title_en: string;
  meta_title_ka: string;
  meta_title_hy: string;
  meta_description_en: string;
  meta_description_ka: string;
  meta_description_hy: string;
};

type FormTab = "general" | "content" | "customer" | "media" | "seo";

const createEmptySuccessStoryForm = (): SuccessStoryFormState => ({
  title_en: "",
  title_ka: "",
  title_hy: "",
  slug: "",
  slug_hy: "",
  excerpt_en: "",
  excerpt_ka: "",
  excerpt_hy: "",
  content_en: "",
  content_ka: "",
  content_hy: "",
  featured_image_url: "",
  gallery_image_urls: [],
  customer_name_en: "",
  customer_name_ka: "",
  customer_name_hy: "",
  customer_location_en: "",
  customer_location_ka: "",
  customer_location_hy: "",
  customer_company: "",
  customer_testimonial_en: "",
  customer_testimonial_ka: "",
  customer_testimonial_hy: "",
  product_ids: [],
  results_achieved: [],
  publish_date: new Date().toISOString().split('T')[0],
  is_published: false,
  is_featured: false,
  meta_title_en: "",
  meta_title_ka: "",
  meta_title_hy: "",
  meta_description_en: "",
  meta_description_ka: "",
  meta_description_hy: "",
});

const formStateFromSuccessStory = (story: SuccessStory): SuccessStoryFormState => {
  const storyRecord = story as Record<string, unknown>;
  return {
    title_en: story.title_en,
    title_ka: story.title_ka,
    title_hy: storyRecord.title_hy as string || "",
    slug: story.slug_en || story.slug_ka || story.slug_ru || "",
    slug_hy: storyRecord.slug_hy as string || "",
    excerpt_en: story.excerpt_en || "",
    excerpt_ka: story.excerpt_ka || "",
    excerpt_hy: storyRecord.excerpt_hy as string || "",
    content_en: story.content_en || "",
    content_ka: story.content_ka || "",
    content_hy: storyRecord.content_hy as string || "",
    featured_image_url: story.featured_image_url || "",
    gallery_image_urls: Array.isArray(story.gallery_image_urls)
      ? (story.gallery_image_urls as unknown[]).filter((item): item is string => typeof item === "string")
      : [],
    customer_name_en: story.customer_name_en || "",
    customer_name_ka: story.customer_name_ka || "",
    customer_name_hy: storyRecord.customer_name_hy as string || "",
    customer_location_en: story.customer_location_en || "",
    customer_location_ka: story.customer_location_ka || "",
    customer_location_hy: storyRecord.customer_location_hy as string || "",
    customer_company: story.customer_company || "",
    customer_testimonial_en: story.customer_testimonial_en || "",
    customer_testimonial_ka: story.customer_testimonial_ka || "",
    customer_testimonial_hy: storyRecord.customer_testimonial_hy as string || "",
    product_ids: Array.isArray(story.product_ids)
      ? (story.product_ids as unknown[]).filter((item): item is string => typeof item === "string")
      : [],
    results_achieved: Array.isArray(story.results_achieved)
      ? (story.results_achieved as unknown[]).filter((item): item is string => typeof item === "string")
      : [],
    publish_date: story.publish_date || new Date().toISOString().split('T')[0],
    is_published: story.is_published ?? false,
    is_featured: story.is_featured ?? false,
    meta_title_en: story.meta_title_en || "",
    meta_title_ka: story.meta_title_ka || "",
    meta_title_hy: storyRecord.meta_title_hy as string || "",
    meta_description_en: story.meta_description_en || "",
    meta_description_ka: story.meta_description_ka || "",
    meta_description_hy: storyRecord.meta_description_hy as string || "",
  };
};

export function SuccessStoriesManager() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [formTab, setFormTab] = useState<FormTab>("general");
  const [editingStory, setEditingStory] = useState<SuccessStory | null>(null);
  const [formData, setFormData] = useState<SuccessStoryFormState>(createEmptySuccessStoryForm());
  const [searchQuery, setSearchQuery] = useState("");
  const [showPublishedOnly, setShowPublishedOnly] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();
  const publishedFilterLabelId = useId();
  const publishedFilterDescriptionId = useId();
  const publishedStatusLabelId = useId();
  const publishedStatusDescriptionId = useId();
  const featuredStatusLabelId = useId();
  const featuredStatusDescriptionId = useId();
  const slugErrorId = useId();
  const slugHintId = useId();

  const { data: successStories = [], isLoading: loading } = useSuccessStories();
  const createSuccessStory = useCreateSuccessStory();
  const updateSuccessStory = useUpdateSuccessStory();
  const deleteSuccessStory = useDeleteSuccessStory();

  useEffect(() => {
    if (!sheetOpen) {
      setEditingStory(null);
      setMode("create");
      setFormData(createEmptySuccessStoryForm());
      setFormTab("general");
      setImageUploading(false);
      setGalleryUploading(false);
    }
  }, [sheetOpen]);

  const filteredSuccessStories = useMemo(() => {
    let filtered = [...successStories];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (story) =>
          story.title_en.toLowerCase().includes(query) ||
          story.title_ka.toLowerCase().includes(query) ||
          story.content_en?.toLowerCase().includes(query) ||
          story.content_ka?.toLowerCase().includes(query) ||
          story.customer_name_en?.toLowerCase().includes(query) ||
          story.customer_name_ka?.toLowerCase().includes(query),
      );
    }

    if (showPublishedOnly) {
      filtered = filtered.filter((story) => story.is_published);
    }

    return filtered;
  }, [successStories, searchQuery, showPublishedOnly]);

  const resultsLabel = `${filteredSuccessStories.length} of ${successStories.length} success stories`;
  const slugValidation = formData.slug ? validateSlug(formData.slug) : { valid: true };

  const startCreate = () => {
    setMode("create");
    setEditingStory(null);
    setFormData(createEmptySuccessStoryForm());
    setFormTab("general");
    setSheetOpen(true);
  };

  const handleEdit = (story: SuccessStory) => {
    setMode("edit");
    setEditingStory(story);
    setFormData(formStateFromSuccessStory(story));
    setFormTab("general");
    setSheetOpen(true);
  };

  const handleReset = () => {
    if (mode === "edit" && editingStory) {
      setFormData(formStateFromSuccessStory(editingStory));
    } else {
      setFormData(createEmptySuccessStoryForm());
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const uploadedUrl = await uploadImage(file, "success-stories/featured");
      setFormData((prev) => ({ ...prev, featured_image_url: uploadedUrl }));
      toast({ title: "Image uploaded", description: "Featured image has been updated." });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unable to upload image.",
        variant: "destructive",
      });
    } finally {
      setImageUploading(false);
      if (event.target) event.target.value = "";
    }
  };

  const handleGalleryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setGalleryUploading(true);
    try {
      const uploads = await Promise.all(
        Array.from(files).map(async (file) => uploadImage(file, "success-stories/gallery")),
      );
      setFormData((prev) => ({
        ...prev,
        gallery_image_urls: [...prev.gallery_image_urls, ...uploads],
      }));
      toast({ title: "Gallery updated", description: `${uploads.length} image(s) added.` });
    } catch (error) {
      toast({
        title: "Gallery upload failed",
        description: error instanceof Error ? error.message : "Unable to upload gallery images.",
        variant: "destructive",
      });
    } finally {
      setGalleryUploading(false);
      if (event.target) event.target.value = "";
    }
  };

  const handleRemoveGalleryImage = (imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      gallery_image_urls: prev.gallery_image_urls.filter((url) => url !== imageUrl),
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (formData.slug) {
      const result = validateSlug(formData.slug);
      if (!result.valid) {
        setFormTab("general");
        toast({
          title: "Fix the slug format",
          description: result.error ?? "Invalid slug format",
          variant: "destructive",
        });
        return;
      }
    }

    const normalizedSlug = formData.slug?.trim() || null;

    const storyPayload = {
      title_en: formData.title_en,
      title_ka: formData.title_ka,
      title_hy: formData.title_hy || null,
      slug_en: normalizedSlug,
      slug_ka: normalizedSlug,
      slug_ru: normalizedSlug,
      slug_hy: formData.slug_hy?.trim() || normalizedSlug,
      excerpt_en: formData.excerpt_en || null,
      excerpt_ka: formData.excerpt_ka || null,
      excerpt_hy: formData.excerpt_hy || null,
      content_en: formData.content_en || null,
      content_ka: formData.content_ka || null,
      content_hy: formData.content_hy || null,
      featured_image_url: formData.featured_image_url || null,
      gallery_image_urls: formData.gallery_image_urls.length ? formData.gallery_image_urls : null,
      customer_name_en: formData.customer_name_en || null,
      customer_name_ka: formData.customer_name_ka || null,
      customer_name_hy: formData.customer_name_hy || null,
      customer_location_en: formData.customer_location_en || null,
      customer_location_ka: formData.customer_location_ka || null,
      customer_location_hy: formData.customer_location_hy || null,
      customer_company: formData.customer_company || null,
      customer_testimonial_en: formData.customer_testimonial_en || null,
      customer_testimonial_ka: formData.customer_testimonial_ka || null,
      customer_testimonial_hy: formData.customer_testimonial_hy || null,
      product_ids: formData.product_ids.length ? formData.product_ids : null,
      results_achieved: formData.results_achieved.length ? formData.results_achieved : null,
      publish_date: formData.publish_date || null,
      is_published: formData.is_published,
      is_featured: formData.is_featured,
      meta_title_en: formData.meta_title_en || null,
      meta_title_ka: formData.meta_title_ka || null,
      meta_title_hy: formData.meta_title_hy || null,
      meta_description_en: formData.meta_description_en || null,
      meta_description_ka: formData.meta_description_ka || null,
      meta_description_hy: formData.meta_description_hy || null,
    };

    try {
      if (mode === "create") {
        await createSuccessStory.mutateAsync(storyPayload as Parameters<typeof createSuccessStory.mutateAsync>[0]);
        toast({ title: "Success story created", description: `${formData.title_en} was added.` });
        setSheetOpen(false);
      } else if (mode === "edit" && editingStory) {
        const updated = await updateSuccessStory.mutateAsync({ id: editingStory.id, storyData: storyPayload as Parameters<typeof createSuccessStory.mutateAsync>[0] });
        toast({ title: "Changes saved", description: `${formData.title_en} updated successfully.` });
        if (updated) {
          setEditingStory(updated as SuccessStory);
          setFormData(formStateFromSuccessStory(updated as SuccessStory));
        }
      }
    } catch (error) {
      toast({
        title: "Unable to save success story",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (storyId: string) => {
    const story = successStories.find((item) => item.id === storyId);
    const confirmed = window.confirm(
      `Delete "${story?.title_en ?? "this success story"}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      await deleteSuccessStory.mutateAsync(storyId);
      toast({ title: "Success story deleted", description: story ? `${story.title_en} removed.` : "Removed successfully." });
      setSheetOpen(false);
    } catch (error) {
      toast({
        title: "Deletion failed",
        description: error instanceof Error ? error.message : "Could not delete the success story.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
      <div className="space-y-6">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Trophy className="h-5 w-5" />
                  Success Stories
                </CardTitle>
                <CardDescription>
                  Showcase customer success stories with bilingual content and SEO optimization.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                  {resultsLabel}
                </Badge>
                <DialogTrigger asChild>
                  <Button onClick={startCreate} className="gap-2">
                    <Plus className="h-4 w-4" />
                    New success story
                  </Button>
                </DialogTrigger>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search by title, content, or customer name"
                  className="pl-9"
                />
              </div>

              <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/40 px-3 py-2">
                <div>
                  <p id={publishedFilterLabelId} className="text-xs font-semibold uppercase text-muted-foreground">
                    Published
                  </p>
                  <p id={publishedFilterDescriptionId} className="text-sm font-medium text-foreground">
                    {showPublishedOnly ? "Only published" : "All stories"}
                  </p>
                </div>
                <Switch
                  id="published-toggle"
                  aria-labelledby={publishedFilterLabelId}
                  aria-describedby={publishedFilterDescriptionId}
                  checked={showPublishedOnly}
                  onCheckedChange={(checked) => setShowPublishedOnly(checked)}
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-border/60 shadow-sm">
        <CardContent className="px-0">
          <ScrollArea className="max-h-[60vh]">
            <div className="min-w-full">
              <div className="sticky top-0 z-10 grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,80px)] gap-4 border-b border-border/60 bg-muted/60 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur">
                <span>Success Story</span>
                <span>Customer</span>
                <span>Publish Date</span>
                <span>Status</span>
                <span className="text-right">Actions</span>
              </div>

              {loading ? (
                <div className="space-y-2 px-6 py-4">
                  {[...Array(6)].map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredSuccessStories.length ? (
                <div className="divide-y">
                  {filteredSuccessStories.map((story) => {
                    const publishDate = story.publish_date ? new Date(story.publish_date).toLocaleDateString() : "—";

                    return (
                      <div
                        key={story.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleEdit(story)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            handleEdit(story);
                          }
                        }}
                        className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,80px)] items-center gap-4 px-6 py-4 text-sm transition hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted/20">
                              {story.featured_image_url ? (
                                <img src={story.featured_image_url} alt={story.title_en} className="h-full w-full object-cover" />
                              ) : (
                                <Trophy className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium text-foreground">{story.title_en}</span>
                                {story.is_featured && (
                                  <Badge variant="secondary" className="flex items-center gap-1 text-[10px] uppercase">
                                    <Star className="h-3 w-3 fill-current" />
                                    Featured
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1">{story.title_ka}</p>
                            </div>
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground">{story.customer_name_en || "—"}</div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {publishDate}
                        </div>

                        <div>
                          {story.is_published ? (
                            <Badge variant="default" className="text-[10px] uppercase">
                              <Eye className="mr-1 h-3 w-3" />
                              Published
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] uppercase">
                              Draft
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleEdit(story);
                            }}
                            aria-label={`Edit ${story.title_en}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDelete(story.id);
                            }}
                            aria-label={`Delete ${story.title_en}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="px-6 py-12 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-muted-foreground/50 text-muted-foreground">
                    <Trophy className="h-8 w-8" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">No success stories found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? "Try adjusting your search criteria." : "Add a new success story to get started."}
                  </p>
                  <div className="mt-4 flex justify-center">
                    <Button onClick={startCreate} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add success story
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        </Card>
      </div>

      <AdminDialogContent>
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <AdminDialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {mode === "create" ? "Create Success Story" : `Edit ${editingStory?.title_en}`}
            </DialogTitle>
            <DialogDescription className="text-base">
              {mode === "create"
                ? "Add a new customer success story with bilingual content."
                : "Update the customer success story details."}
            </DialogDescription>
          </AdminDialogHeader>

          <AdminDialogBody>
            <Tabs value={formTab} onValueChange={(v) => setFormTab(v as FormTab)} className="w-full">
              <AdminTabsList columns={4}>
                <AdminTabsTrigger value="general">General</AdminTabsTrigger>
                <AdminTabsTrigger value="content">Content</AdminTabsTrigger>
                <AdminTabsTrigger value="customer">Testimonials</AdminTabsTrigger>
                <AdminTabsTrigger value="media">Media</AdminTabsTrigger>
                <AdminTabsTrigger value="seo">SEO</AdminTabsTrigger>
              </AdminTabsList>

              <TabsContent value="general" className="mt-0 space-y-8">
                <AdminFormSection title="Story Titles">
                  <AdminFormFieldGrid>
                    <div className="space-y-3">
                      <Label htmlFor="title_en" className="text-sm font-semibold">
                        Title (English) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="title_en"
                        value={formData.title_en}
                        onChange={(event) => {
                          const value = event.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            title_en: value,
                            slug: prev.slug || generateSlug(value),
                          }));
                        }}
                        required
                        placeholder="Success story title in English"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="title_ka" className="text-sm font-semibold">
                        Title (Georgian) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="title_ka"
                        value={formData.title_ka}
                        onChange={(event) => {
                          const value = event.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            title_ka: value,
                          }));
                        }}
                        required
                        placeholder="წარმატების ისტორიის სათაური"
                        className="h-11"
                      />
                    </div>
                  </AdminFormFieldGrid>
                  <AdminFormFieldGrid>
                    <div className="space-y-3">
                      <Label htmlFor="title_hy" className="text-sm font-semibold">
                        Title (Armenian)
                      </Label>
                      <Input
                        id="title_hy"
                        value={formData.title_hy}
                        onChange={(event) => setFormData({ ...formData, title_hy: event.target.value })}
                        placeholder="Success story title in Armenian"
                        className="h-11"
                      />
                    </div>
                  </AdminFormFieldGrid>
                </AdminFormSection>

                <AdminFormSection
                  title="SEO Slug"
                  description="Custom URL segment. Leave blank to auto-generate from English title."
                >
                  <AdminFormFieldGrid columns={1}>
                    <div className="space-y-3">
                      <Label htmlFor="slug" className="text-sm font-semibold">Slug</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(event) => setFormData({ ...formData, slug: event.target.value })}
                        placeholder="url-friendly-slug"
                        className={`h-11 ${slugValidation.valid ? "" : "border-destructive"}`}
                        aria-invalid={!slugValidation.valid}
                        aria-describedby={[slugHintId, !slugValidation.valid && slugValidation.error ? slugErrorId : null]
                          .filter(Boolean)
                          .join(" ")}
                      />
                      {!slugValidation.valid && slugValidation.error ? (
                        <p id={slugErrorId} className="text-xs text-destructive font-medium">
                          {slugValidation.error}
                        </p>
                      ) : null}
                      <p id={slugHintId} className="text-xs text-muted-foreground">
                        Lowercase letters, numbers, and hyphens only. Used for all language versions.
                      </p>
                    </div>
                  </AdminFormFieldGrid>
                  <AdminFormFieldGrid columns={1}>
                    <div className="space-y-3">
                      <Label htmlFor="slug_hy" className="text-sm font-semibold">Slug (Armenian)</Label>
                      <Input
                        id="slug_hy"
                        value={formData.slug_hy}
                        onChange={(event) => setFormData({ ...formData, slug_hy: event.target.value })}
                        placeholder="url-friendly-slug-hy"
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        Optional separate slug for Armenian. Leave blank to use the main slug.
                      </p>
                    </div>
                  </AdminFormFieldGrid>
                </AdminFormSection>

                <AdminFormSection title="Editorial Summary">
                  <AdminFormFieldGrid>
                    <div className="space-y-3">
                      <Label htmlFor="excerpt_en" className="text-sm font-semibold">Excerpt (English)</Label>
                      <Textarea
                        id="excerpt_en"
                        value={formData.excerpt_en}
                        onChange={(event) => setFormData({ ...formData, excerpt_en: event.target.value })}
                        rows={3}
                        placeholder="Brief summary in English..."
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="excerpt_ka" className="text-sm font-semibold">Excerpt (Georgian)</Label>
                      <Textarea
                        id="excerpt_ka"
                        value={formData.excerpt_ka}
                        onChange={(event) => setFormData({ ...formData, excerpt_ka: event.target.value })}
                        rows={3}
                        placeholder="მოკლე აღწერა ქართულად..."
                      />
                    </div>
                  </AdminFormFieldGrid>
                  <AdminFormFieldGrid>
                    <div className="space-y-3">
                      <Label htmlFor="excerpt_hy" className="text-sm font-semibold">Excerpt (Armenian)</Label>
                      <Textarea
                        id="excerpt_hy"
                        value={formData.excerpt_hy}
                        onChange={(event) => setFormData({ ...formData, excerpt_hy: event.target.value })}
                        rows={3}
                        placeholder="Brief summary in Armenian..."
                      />
                    </div>
                  </AdminFormFieldGrid>
                </AdminFormSection>

                <AdminFormSection title="Publishing Options">
                  <AdminFormFieldGrid>
                    <div className="space-y-3">
                      <Label htmlFor="publish_date" className="text-sm font-semibold">Publish Date</Label>
                      <Input
                        id="publish_date"
                        type="date"
                        value={formData.publish_date}
                        onChange={(event) => setFormData({ ...formData, publish_date: event.target.value })}
                        className="h-11"
                      />
                    </div>
                  </AdminFormFieldGrid>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <Label
                            htmlFor="is_published"
                            id={publishedStatusLabelId}
                            className="text-sm font-semibold text-foreground"
                          >
                            Published
                          </Label>
                          <p id={publishedStatusDescriptionId} className="text-xs text-muted-foreground">
                            Make this story visible on the public site.
                          </p>
                        </div>
                        <Switch
                          id="is_published"
                          aria-labelledby={publishedStatusLabelId}
                          aria-describedby={publishedStatusDescriptionId}
                          checked={formData.is_published}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                        />
                      </div>
                    </div>
                    <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <Label
                            htmlFor="is_featured"
                            id={featuredStatusLabelId}
                            className="text-sm font-semibold text-foreground"
                          >
                            Featured Story
                          </Label>
                          <p id={featuredStatusDescriptionId} className="text-xs text-muted-foreground">
                            Highlight on landing pages and promotional surfaces.
                          </p>
                        </div>
                        <Switch
                          id="is_featured"
                          aria-labelledby={featuredStatusLabelId}
                          aria-describedby={featuredStatusDescriptionId}
                          checked={formData.is_featured}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                        />
                      </div>
                    </div>
                  </div>
                </AdminFormSection>
              </TabsContent>

              <TabsContent value="content" className="mt-0 space-y-8">
                <AdminFormSection title="Story Content">
                  <div className="space-y-3">
                    <Label htmlFor="content_en" className="text-sm font-semibold">Content (English)</Label>
                    <Textarea
                      id="content_en"
                      value={formData.content_en}
                      onChange={(event) => setFormData({ ...formData, content_en: event.target.value })}
                      rows={12}
                      placeholder="Full story content in English..."
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="content_ka" className="text-sm font-semibold">Content (Georgian)</Label>
                    <Textarea
                      id="content_ka"
                      value={formData.content_ka}
                      onChange={(event) => setFormData({ ...formData, content_ka: event.target.value })}
                      rows={12}
                      placeholder="სრული ისტორიის კონტენტი ქართულად..."
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="content_hy" className="text-sm font-semibold">Content (Armenian)</Label>
                    <Textarea
                      id="content_hy"
                      value={formData.content_hy}
                      onChange={(event) => setFormData({ ...formData, content_hy: event.target.value })}
                      rows={12}
                      placeholder="Full story content in Armenian..."
                    />
                  </div>
                </AdminFormSection>
              </TabsContent>

              <TabsContent value="customer" className="mt-0 space-y-8">
                <AdminFormSection title="Customer Details">
                  <AdminFormFieldGrid>
                    <div className="space-y-3">
                      <Label htmlFor="customer_name_hy" className="text-sm font-semibold">Customer Name (Armenian)</Label>
                      <Input
                        id="customer_name_hy"
                        value={formData.customer_name_hy}
                        onChange={(event) => setFormData({ ...formData, customer_name_hy: event.target.value })}
                        placeholder="Customer name in Armenian"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="customer_location_hy" className="text-sm font-semibold">Customer Location (Armenian)</Label>
                      <Input
                        id="customer_location_hy"
                        value={formData.customer_location_hy}
                        onChange={(event) => setFormData({ ...formData, customer_location_hy: event.target.value })}
                        placeholder="Customer location in Armenian"
                        className="h-11"
                      />
                    </div>
                  </AdminFormFieldGrid>
                </AdminFormSection>
                <AdminFormSection title="Testimonials">
                  <AdminFormFieldGrid>
                    <div className="space-y-3">
                      <Label htmlFor="customer_testimonial_en" className="text-sm font-semibold">Testimonial (English)</Label>
                      <Textarea
                        id="customer_testimonial_en"
                        value={formData.customer_testimonial_en}
                        onChange={(event) => setFormData({ ...formData, customer_testimonial_en: event.target.value })}
                        rows={4}
                        placeholder="Customer testimonial in English..."
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="customer_testimonial_ka" className="text-sm font-semibold">Testimonial (Georgian)</Label>
                      <Textarea
                        id="customer_testimonial_ka"
                        value={formData.customer_testimonial_ka}
                        onChange={(event) => setFormData({ ...formData, customer_testimonial_ka: event.target.value })}
                        rows={4}
                        placeholder="მომხმარებლის რეკომენდაცია ქართულად..."
                      />
                    </div>
                  </AdminFormFieldGrid>
                  <AdminFormFieldGrid>
                    <div className="space-y-3">
                      <Label htmlFor="customer_testimonial_hy" className="text-sm font-semibold">Testimonial (Armenian)</Label>
                      <Textarea
                        id="customer_testimonial_hy"
                        value={formData.customer_testimonial_hy}
                        onChange={(event) => setFormData({ ...formData, customer_testimonial_hy: event.target.value })}
                        rows={4}
                        placeholder="Customer testimonial in Armenian..."
                      />
                    </div>
                  </AdminFormFieldGrid>
                </AdminFormSection>
              </TabsContent>

              <TabsContent value="media" className="mt-0 space-y-8">
                <AdminFormSection title="Featured Image">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="grid gap-6 md:grid-cols-[260px_1fr]">
                    <div className="overflow-hidden rounded-lg border-2 border-dashed bg-muted/30">
                      {formData.featured_image_url ? (
                        <img src={formData.featured_image_url} alt="Featured" className="h-48 w-full object-cover" />
                      ) : (
                        <div className="flex h-48 w-full flex-col items-center justify-center gap-3 text-muted-foreground">
                          <ImagePlus className="h-8 w-8" />
                          <span className="text-sm font-medium">No image selected</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="default"
                          onClick={() => imageInputRef.current?.click()}
                          disabled={imageUploading}
                          className="h-11 gap-2"
                        >
                          <ImagePlus className="h-4 w-4" />
                          {imageUploading ? "Uploading..." : formData.featured_image_url ? "Replace image" : "Upload image"}
                        </Button>
                        {formData.featured_image_url && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setFormData((prev) => ({ ...prev, featured_image_url: "" }))}
                            className="h-11 gap-2"
                          >
                            <X className="h-4 w-4" />
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </AdminFormSection>

                <AdminFormSection title="Gallery Images">
                  <div className="flex items-center gap-3">
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => galleryInputRef.current?.click()}
                      disabled={galleryUploading}
                      className="h-11 gap-2"
                    >
                      <ImagePlus className="h-4 w-4" />
                      {galleryUploading ? "Uploading..." : "Add images"}
                    </Button>
                  </div>
                  {formData.gallery_image_urls.length > 0 ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {formData.gallery_image_urls.map((url) => (
                        <div key={url} className="group relative overflow-hidden rounded-lg border-2">
                          <img src={url} alt="Gallery" className="h-24 w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(url)}
                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed bg-muted/20 p-8 text-muted-foreground">
                      <ImagePlus className="h-8 w-8" />
                      <span className="text-sm font-medium">No gallery images yet</span>
                    </div>
                  )}
                </AdminFormSection>
              </TabsContent>

              <TabsContent value="seo" className="mt-0 space-y-8">
                <AdminFormSection title="Meta Titles">
                  <AdminFormFieldGrid>
                    <div className="space-y-2">
                      <Label htmlFor="meta_title_en" className="text-sm font-semibold">Meta Title (English)</Label>
                      <Input
                        id="meta_title_en"
                        value={formData.meta_title_en}
                        onChange={(event) => setFormData({ ...formData, meta_title_en: event.target.value })}
                        placeholder="SEO title (max 60 characters)"
                        maxLength={60}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="meta_title_ka" className="text-sm font-semibold">Meta Title (Georgian)</Label>
                      <Input
                        id="meta_title_ka"
                        value={formData.meta_title_ka}
                        onChange={(event) => setFormData({ ...formData, meta_title_ka: event.target.value })}
                        placeholder="SEO სათაური (მაქს 60 სიმბოლო)"
                        maxLength={60}
                      />
                    </div>
                  </AdminFormFieldGrid>
                  <AdminFormFieldGrid>
                    <div className="space-y-2">
                      <Label htmlFor="meta_title_hy" className="text-sm font-semibold">Meta Title (Armenian)</Label>
                      <Input
                        id="meta_title_hy"
                        value={formData.meta_title_hy}
                        onChange={(event) => setFormData({ ...formData, meta_title_hy: event.target.value })}
                        placeholder="SEO title in Armenian (max 60 characters)"
                        maxLength={60}
                      />
                    </div>
                  </AdminFormFieldGrid>
                </AdminFormSection>

                <AdminFormSection title="Meta Descriptions">
                  <AdminFormFieldGrid columns={1} className="gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="meta_description_en" className="text-sm font-semibold">Meta Description (English)</Label>
                      <Textarea
                        id="meta_description_en"
                        value={formData.meta_description_en}
                        onChange={(event) => setFormData({ ...formData, meta_description_en: event.target.value })}
                        rows={3}
                        placeholder="SEO description (max 160 characters)"
                        maxLength={160}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="meta_description_ka" className="text-sm font-semibold">Meta Description (Georgian)</Label>
                      <Textarea
                        id="meta_description_ka"
                        value={formData.meta_description_ka}
                        onChange={(event) => setFormData({ ...formData, meta_description_ka: event.target.value })}
                        rows={3}
                        placeholder="SEO აღწერა (მაქს 160 სიმბოლო)"
                        maxLength={160}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="meta_description_hy" className="text-sm font-semibold">Meta Description (Armenian)</Label>
                      <Textarea
                        id="meta_description_hy"
                        value={formData.meta_description_hy}
                        onChange={(event) => setFormData({ ...formData, meta_description_hy: event.target.value })}
                        rows={3}
                        placeholder="SEO description in Armenian (max 160 characters)"
                        maxLength={160}
                      />
                    </div>
                  </AdminFormFieldGrid>
                </AdminFormSection>
              </TabsContent>
          </Tabs>
        </AdminDialogBody>

        <AdminDialogFooter>
          {mode === "edit" && editingStory && (
            <Button type="button" variant="destructive" onClick={() => handleDelete(editingStory.id)} className="h-11">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          )}
          <div className="ml-auto flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={handleReset} className="h-11">
              Reset
            </Button>
            <Button type="submit" className="h-11 px-6">
              {mode === "edit" ? "Save changes" : "Create story"}
            </Button>
          </div>
        </AdminDialogFooter>
        </form>
      </AdminDialogContent>
    </Dialog>
  );
}
