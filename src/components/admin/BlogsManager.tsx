import { useEffect, useMemo, useRef, useState, useId } from "react";
import { BookOpen, Plus, Search, Star, Trash2, Edit, ImagePlus, X, Calendar, Eye, Link2 } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { useBlogs, useCreateBlog, useUpdateBlog, useDeleteBlog } from "@/hooks/useBlogs";
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

type Blog = Database["public"]["Tables"]["blogs"]["Row"];

type BlogFormState = {
  title_en: string;
  title_ka: string;
  title_hy: string;
  slug_en: string;
  slug_ka: string;
  slug_hy: string;
  excerpt_en: string;
  excerpt_ka: string;
  excerpt_hy: string;
  content_en: string;
  content_ka: string;
  content_hy: string;
  featured_image_url: string;
  gallery_image_urls: string[];
  author: string;
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

type FormTab = "general" | "content" | "media" | "seo";

const createEmptyBlogForm = (): BlogFormState => ({
  title_en: "",
  title_ka: "",
  title_hy: "",
  slug_en: "",
  slug_ka: "",
  slug_hy: "",
  excerpt_en: "",
  excerpt_ka: "",
  excerpt_hy: "",
  content_en: "",
  content_ka: "",
  content_hy: "",
  featured_image_url: "",
  gallery_image_urls: [],
  author: "",
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

const formStateFromBlog = (blog: Blog): BlogFormState => {
  const blogRecord = blog as Record<string, unknown>;
  return {
    title_en: blog.title_en,
    title_ka: blog.title_ka,
    title_hy: blogRecord.title_hy as string || "",
    slug_en: blogRecord.slug_en as string || "",
    slug_ka: blogRecord.slug_ka as string || "",
    slug_hy: blogRecord.slug_hy as string || "",
    excerpt_en: blog.excerpt_en || "",
    excerpt_ka: blog.excerpt_ka || "",
    excerpt_hy: blogRecord.excerpt_hy as string || "",
    content_en: blog.content_en || "",
    content_ka: blog.content_ka || "",
    content_hy: blogRecord.content_hy as string || "",
    featured_image_url: blog.featured_image_url || "",
    gallery_image_urls: Array.isArray(blog.gallery_image_urls)
      ? (blog.gallery_image_urls as unknown[]).filter((item): item is string => typeof item === "string")
      : [],
    author: blog.author || "",
    publish_date: blog.publish_date || new Date().toISOString().split('T')[0],
    is_published: blog.is_published ?? false,
    is_featured: blog.is_featured ?? false,
    meta_title_en: blog.meta_title_en || "",
    meta_title_ka: blog.meta_title_ka || "",
    meta_title_hy: blogRecord.meta_title_hy as string || "",
    meta_description_en: blog.meta_description_en || "",
    meta_description_ka: blog.meta_description_ka || "",
    meta_description_hy: blogRecord.meta_description_hy as string || "",
  };
};

export function BlogsManager() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [formTab, setFormTab] = useState<FormTab>("general");
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState<BlogFormState>(createEmptyBlogForm());
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
  const slugEnErrorId = useId();
  const slugEnHintId = useId();
  const slugKaErrorId = useId();
  const slugKaHintId = useId();

  const { data: blogs = [], isLoading: loading } = useBlogs();
  const createBlog = useCreateBlog();
  const updateBlog = useUpdateBlog();
  const deleteBlog = useDeleteBlog();

  useEffect(() => {
    if (!dialogOpen) {
      setEditingBlog(null);
      setMode("create");
      setFormData(createEmptyBlogForm());
      setFormTab("general");
      setImageUploading(false);
      setGalleryUploading(false);
    }
  }, [dialogOpen]);

  const filteredBlogs = useMemo(() => {
    let filtered = [...blogs];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (blog) =>
          blog.title_en.toLowerCase().includes(query) ||
          blog.title_ka.toLowerCase().includes(query) ||
          blog.content_en?.toLowerCase().includes(query) ||
          blog.content_ka?.toLowerCase().includes(query),
      );
    }

    if (showPublishedOnly) {
      filtered = filtered.filter((blog) => blog.is_published);
    }

    return filtered;
  }, [blogs, searchQuery, showPublishedOnly]);

  const resultsLabel = `${filteredBlogs.length} of ${blogs.length} blogs`;
  const slugEnValidation = formData.slug_en ? validateSlug(formData.slug_en) : { valid: true };
  const slugKaValidation = formData.slug_ka ? validateSlug(formData.slug_ka) : { valid: true };

  const startCreate = () => {
    setMode("create");
    setEditingBlog(null);
    setFormData(createEmptyBlogForm());
    setFormTab("general");
    setDialogOpen(true);
  };

  const handleEdit = (blog: Blog) => {
    setMode("edit");
    setEditingBlog(blog);
    setFormData(formStateFromBlog(blog));
    setFormTab("general");
    setDialogOpen(true);
  };

  const handleReset = () => {
    if (mode === "edit" && editingBlog) {
      setFormData(formStateFromBlog(editingBlog));
    } else {
      setFormData(createEmptyBlogForm());
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const uploadedUrl = await uploadImage(file, "blogs/featured");
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
        Array.from(files).map(async (file) => uploadImage(file, "blogs/gallery")),
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

    const slugErrors: string[] = [];
    if (formData.slug_en) {
      const result = validateSlug(formData.slug_en);
      if (!result.valid) {
        slugErrors.push(`English slug — ${result.error ?? "invalid format"}`);
      }
    }
    if (formData.slug_ka) {
      const result = validateSlug(formData.slug_ka);
      if (!result.valid) {
        slugErrors.push(`Georgian slug — ${result.error ?? "invalid format"}`);
      }
    }

    if (slugErrors.length) {
      setFormTab("general");
      toast({
        title: "Fix the slug format",
        description: slugErrors.join(" • "),
        variant: "destructive",
      });
      return;
    }

    const blogPayload = {
      title_en: formData.title_en,
      title_ka: formData.title_ka,
      title_hy: formData.title_hy || null,
      slug_en: formData.slug_en || null,
      slug_ka: formData.slug_ka || null,
      slug_hy: formData.slug_hy || null,
      excerpt_en: formData.excerpt_en || null,
      excerpt_ka: formData.excerpt_ka || null,
      excerpt_hy: formData.excerpt_hy || null,
      content_en: formData.content_en || null,
      content_ka: formData.content_ka || null,
      content_hy: formData.content_hy || null,
      featured_image_url: formData.featured_image_url || null,
      gallery_image_urls: formData.gallery_image_urls.length ? formData.gallery_image_urls : null,
      author: formData.author || null,
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
        await createBlog.mutateAsync(blogPayload as Parameters<typeof createBlog.mutateAsync>[0]);
        toast({ title: "Blog created", description: `${formData.title_en} was added.` });
        setDialogOpen(false);
      } else if (mode === "edit" && editingBlog) {
        const updated = await updateBlog.mutateAsync({ id: editingBlog.id, blogData: blogPayload as Parameters<typeof createBlog.mutateAsync>[0] });
        toast({ title: "Changes saved", description: `${formData.title_en} updated successfully.` });
        if (updated) {
          setEditingBlog(updated as Blog);
          setFormData(formStateFromBlog(updated as Blog));
        }
      }
    } catch (error) {
      toast({
        title: "Unable to save blog",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (blogId: string) => {
    const blog = blogs.find((item) => item.id === blogId);
    const confirmed = window.confirm(
      `Delete "${blog?.title_en ?? "this blog"}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      await deleteBlog.mutateAsync(blogId);
      toast({ title: "Blog deleted", description: blog ? `${blog.title_en} removed.` : "Removed successfully." });
      setDialogOpen(false);
    } catch (error) {
      toast({
        title: "Deletion failed",
        description: error instanceof Error ? error.message : "Could not delete the blog.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <div className="space-y-6">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BookOpen className="h-5 w-5" />
                  Blog Posts
                </CardTitle>
                <CardDescription>
                  Create and manage bilingual blog content with SEO optimization.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                  {resultsLabel}
                </Badge>
                <DialogTrigger asChild>
                  <Button onClick={startCreate} className="gap-2">
                    <Plus className="h-4 w-4" />
                    New blog
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
                  placeholder="Search by title or content"
                  className="pl-9"
                />
              </div>

              <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/40 px-3 py-2">
                <div>
                  <p id={publishedFilterLabelId} className="text-xs font-semibold uppercase text-muted-foreground">
                    Published
                  </p>
                  <p id={publishedFilterDescriptionId} className="text-sm font-medium text-foreground">
                    {showPublishedOnly ? "Only published" : "All posts"}
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
                <span>Blog Post</span>
                <span>Author</span>
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
              ) : filteredBlogs.length ? (
                <div className="divide-y">
                  {filteredBlogs.map((blog) => {
                    const publishDate = blog.publish_date ? new Date(blog.publish_date).toLocaleDateString() : "—";

                    return (
                      <div
                        key={blog.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleEdit(blog)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            handleEdit(blog);
                          }
                        }}
                        className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,80px)] items-center gap-4 px-6 py-4 text-sm transition hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted/20">
                              {blog.featured_image_url ? (
                                <img src={blog.featured_image_url} alt={blog.title_en} className="h-full w-full object-cover" />
                              ) : (
                                <BookOpen className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium text-foreground">{blog.title_en}</span>
                                {blog.is_featured && (
                                  <Badge variant="secondary" className="flex items-center gap-1 text-[10px] uppercase">
                                    <Star className="h-3 w-3 fill-current" />
                                    Featured
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1">{blog.title_ka}</p>
                            </div>
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground">{blog.author || "—"}</div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {publishDate}
                        </div>

                        <div>
                          {blog.is_published ? (
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
                              handleEdit(blog);
                            }}
                            aria-label={`Edit ${blog.title_en}`}
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
                              handleDelete(blog.id);
                            }}
                            aria-label={`Delete ${blog.title_en}`}
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
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">No blogs match your filters</h3>
                  <p className="text-sm text-muted-foreground">
                    Adjust the search, remove filters, or add a new blog to get started.
                  </p>
                  <div className="mt-4 flex justify-center">
                    <Button onClick={startCreate} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add blog
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden min-h-0 flex flex-col">
          <AdminDialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {mode === "create" ? "Create blog post" : editingBlog?.title_en}
            </DialogTitle>
            <DialogDescription className="text-base">
              {mode === "create"
                ? "Create a new blog post with bilingual content and SEO optimization."
                : "Update blog content and SEO metadata."}
            </DialogDescription>
          </AdminDialogHeader>

          <AdminDialogBody>
            <Tabs value={formTab} onValueChange={(value) => setFormTab(value as FormTab)} className="w-full">
              <AdminTabsList columns={4}>
                <AdminTabsTrigger value="general">General</AdminTabsTrigger>
                <AdminTabsTrigger value="content">Content</AdminTabsTrigger>
                <AdminTabsTrigger value="media">Media</AdminTabsTrigger>
                <AdminTabsTrigger value="seo">SEO</AdminTabsTrigger>
              </AdminTabsList>

              <TabsContent value="general" className="mt-0 space-y-8">
                <AdminFormSection title="Blog Titles" icon={BookOpen}>
                  <AdminFormFieldGrid>
                    <div className="space-y-3">
                      <Label htmlFor="title_en" className="text-sm font-semibold">
                        Title (English) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="title_en"
                        value={formData.title_en}
                        onChange={(event) => setFormData({ ...formData, title_en: event.target.value })}
                        required
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
                        onChange={(event) => setFormData({ ...formData, title_ka: event.target.value })}
                        required
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
                        className="h-11"
                      />
                    </div>
                  </AdminFormFieldGrid>
                </AdminFormSection>

                <AdminFormSection
                  title="SEO & URLs"
                  icon={Link2}
                  description="Define the SEO-friendly slugs for each language. Leave blank to auto-generate from the title."
                >
                  <AdminFormFieldGrid>
                    <div className="space-y-3">
                      <Label htmlFor="slug_en" className="text-sm font-semibold">URL Slug (English)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="slug_en"
                          value={formData.slug_en}
                          onChange={(event) => setFormData({ ...formData, slug_en: event.target.value })}
                          placeholder="blog-post-title"
                          className={`h-11 ${slugEnValidation.valid ? "" : "border-destructive"}`}
                          aria-invalid={!slugEnValidation.valid}
                          aria-describedby={[slugEnHintId, !slugEnValidation.valid && slugEnValidation.error ? slugEnErrorId : null]
                            .filter(Boolean)
                            .join(" ")}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setFormData({ ...formData, slug_en: generateSlug(formData.title_en, false) })}
                          disabled={!formData.title_en}
                          className="h-11"
                        >
                          Generate
                        </Button>
                      </div>
                      {!slugEnValidation.valid && slugEnValidation.error ? (
                        <p id={slugEnErrorId} className="text-xs text-destructive font-medium">
                          {slugEnValidation.error}
                        </p>
                      ) : null}
                      <p id={slugEnHintId} className="text-xs text-muted-foreground">Lowercase letters, numbers, and hyphens only</p>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="slug_ka" className="text-sm font-semibold">URL Slug (Georgian)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="slug_ka"
                          value={formData.slug_ka}
                          onChange={(event) => setFormData({ ...formData, slug_ka: event.target.value })}
                          placeholder="blogis-satauri"
                          className={`h-11 ${slugKaValidation.valid ? "" : "border-destructive"}`}
                          aria-invalid={!slugKaValidation.valid}
                          aria-describedby={[slugKaHintId, !slugKaValidation.valid && slugKaValidation.error ? slugKaErrorId : null]
                            .filter(Boolean)
                            .join(" ")}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setFormData({ ...formData, slug_ka: generateSlug(formData.title_ka, true) })}
                          disabled={!formData.title_ka}
                          className="h-11"
                        >
                          Generate
                        </Button>
                      </div>
                      {!slugKaValidation.valid && slugKaValidation.error ? (
                        <p id={slugKaErrorId} className="text-xs text-destructive font-medium">
                          {slugKaValidation.error}
                        </p>
                      ) : null}
                      <p id={slugKaHintId} className="text-xs text-muted-foreground">Georgian transliterated to Latin</p>
                    </div>
                  </AdminFormFieldGrid>
                  <AdminFormFieldGrid>
                    <div className="space-y-3">
                      <Label htmlFor="slug_hy" className="text-sm font-semibold">URL Slug (Armenian)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="slug_hy"
                          value={formData.slug_hy}
                          onChange={(event) => setFormData({ ...formData, slug_hy: event.target.value })}
                          placeholder="blog-post-title-hy"
                          className="h-11"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setFormData({ ...formData, slug_hy: generateSlug(formData.title_hy, false) })}
                          disabled={!formData.title_hy}
                          className="h-11"
                        >
                          Generate
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Armenian transliterated to Latin</p>
                    </div>
                  </AdminFormFieldGrid>
                </AdminFormSection>

                <AdminFormSection title="Author & Publish Date" icon={Calendar}>
                  <AdminFormFieldGrid>
                    <div className="space-y-3">
                      <Label htmlFor="author" className="text-sm font-semibold">Author</Label>
                      <Input
                        id="author"
                        value={formData.author}
                        onChange={(event) => setFormData({ ...formData, author: event.target.value })}
                        className="h-11"
                      />
                    </div>
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
                </AdminFormSection>

                <AdminFormSection title="Publishing Options" icon={Eye}>
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
                            Make this blog post visible to the public
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
                            Featured Blog
                          </Label>
                          <p id={featuredStatusDescriptionId} className="text-xs text-muted-foreground">
                            Display prominently on the homepage and blog listing
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
                <AdminFormSection title="Excerpts">
                  <AdminFormFieldGrid>
                    <div className="space-y-3">
                      <Label htmlFor="excerpt_en" className="font-semibold">Excerpt (English)</Label>
                      <Textarea
                        id="excerpt_en"
                        value={formData.excerpt_en}
                        onChange={(event) => setFormData({ ...formData, excerpt_en: event.target.value })}
                        rows={3}
                        placeholder="A short summary of the blog post..."
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="excerpt_ka" className="font-semibold">Excerpt (Georgian)</Label>
                      <Textarea
                        id="excerpt_ka"
                        value={formData.excerpt_ka}
                        onChange={(event) => setFormData({ ...formData, excerpt_ka: event.target.value })}
                        rows={3}
                        placeholder="ბლოგის მოკლე შეჯამება..."
                      />
                    </div>
                  </AdminFormFieldGrid>
                  <AdminFormFieldGrid>
                    <div className="space-y-3">
                      <Label htmlFor="excerpt_hy" className="font-semibold">Excerpt (Armenian)</Label>
                      <Textarea
                        id="excerpt_hy"
                        value={formData.excerpt_hy}
                        onChange={(event) => setFormData({ ...formData, excerpt_hy: event.target.value })}
                        rows={3}
                        placeholder="Blog post excerpt in Armenian..."
                      />
                    </div>
                  </AdminFormFieldGrid>
                </AdminFormSection>
                <AdminFormSection title="Full Content">
                  <div className="space-y-3">
                    <Label htmlFor="content_en" className="font-semibold">Content (English)</Label>
                    <Textarea
                      id="content_en"
                      value={formData.content_en}
                      onChange={(event) => setFormData({ ...formData, content_en: event.target.value })}
                      rows={10}
                      placeholder="Full blog content in English..."
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="content_ka" className="font-semibold">Content (Georgian)</Label>
                    <Textarea
                      id="content_ka"
                      value={formData.content_ka}
                      onChange={(event) => setFormData({ ...formData, content_ka: event.target.value })}
                      rows={10}
                      placeholder="სრული ბლოგის კონტენტი ქართულად..."
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="content_hy" className="font-semibold">Content (Armenian)</Label>
                    <Textarea
                      id="content_hy"
                      value={formData.content_hy}
                      onChange={(event) => setFormData({ ...formData, content_hy: event.target.value })}
                      rows={10}
                      placeholder="Full blog content in Armenian..."
                    />
                  </div>
                </AdminFormSection>
              </TabsContent>

              <TabsContent value="media" className="mt-0 space-y-8">
                <AdminFormSection title="Featured Image">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
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
                          className="h-11"
                        >
                          {imageUploading ? "Uploading..." : formData.featured_image_url ? "Replace image" : "Upload image"}
                        </Button>
                        {formData.featured_image_url && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setFormData((prev) => ({ ...prev, featured_image_url: "" }))}
                            className="h-11"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Remove
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="featured_image_url" className="text-sm font-semibold">Image URL</Label>
                        <Input
                          id="featured_image_url"
                          value={formData.featured_image_url}
                          onChange={(event) => setFormData({ ...formData, featured_image_url: event.target.value })}
                          placeholder="https://..."
                          className="h-11"
                        />
                      </div>
                    </div>
                  </div>
                </AdminFormSection>

                <AdminFormSection title="Gallery Images">
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleGalleryUpload}
                  />
                  {formData.gallery_image_urls.length ? (
                    <div className="grid gap-4 sm:grid-cols-3">
                      {formData.gallery_image_urls.map((url) => (
                        <div key={url} className="group relative overflow-hidden rounded-lg border-2">
                          <img src={url} alt="Gallery" className="h-32 w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(url)}
                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
                          >
                            <X className="h-4 w-4" />
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={galleryUploading}
                    className="h-11 w-fit"
                  >
                    {galleryUploading ? "Uploading..." : "Upload images"}
                  </Button>
                </AdminFormSection>
              </TabsContent>

              <TabsContent value="seo" className="mt-0 space-y-8">
                <AdminFormSection title="Meta Titles">
                  <AdminFormFieldGrid>
                    <div className="space-y-2">
                      <Label htmlFor="meta_title_en" className="font-semibold">Meta Title (English)</Label>
                      <Input
                        id="meta_title_en"
                        value={formData.meta_title_en}
                        onChange={(event) => setFormData({ ...formData, meta_title_en: event.target.value })}
                        placeholder="SEO-optimized title for English"
                      />
                      <p className="text-xs text-muted-foreground">Recommended: 50-60 characters</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="meta_title_ka" className="font-semibold">Meta Title (Georgian)</Label>
                      <Input
                        id="meta_title_ka"
                        value={formData.meta_title_ka}
                        onChange={(event) => setFormData({ ...formData, meta_title_ka: event.target.value })}
                        placeholder="SEO-ოპტიმიზირებული სათაური ქართულად"
                      />
                      <p className="text-xs text-muted-foreground">რეკომენდებული: 50-60 სიმბოლო</p>
                    </div>
                  </AdminFormFieldGrid>
                  <AdminFormFieldGrid>
                    <div className="space-y-2">
                      <Label htmlFor="meta_title_hy" className="font-semibold">Meta Title (Armenian)</Label>
                      <Input
                        id="meta_title_hy"
                        value={formData.meta_title_hy}
                        onChange={(event) => setFormData({ ...formData, meta_title_hy: event.target.value })}
                        placeholder="SEO-optimized title for Armenian"
                      />
                      <p className="text-xs text-muted-foreground">Recommended: 50-60 characters</p>
                    </div>
                  </AdminFormFieldGrid>
                </AdminFormSection>
                <AdminFormSection title="Meta Descriptions">
                  <AdminFormFieldGrid columns={1} className="gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="meta_description_en" className="font-semibold">Meta Description (English)</Label>
                      <Textarea
                        id="meta_description_en"
                        value={formData.meta_description_en}
                        onChange={(event) => setFormData({ ...formData, meta_description_en: event.target.value })}
                        rows={3}
                        placeholder="Brief description for search engines..."
                      />
                      <p className="text-xs text-muted-foreground">Recommended: 150-160 characters</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="meta_description_ka" className="font-semibold">Meta Description (Georgian)</Label>
                      <Textarea
                        id="meta_description_ka"
                        value={formData.meta_description_ka}
                        onChange={(event) => setFormData({ ...formData, meta_description_ka: event.target.value })}
                        rows={3}
                        placeholder="მოკლე აღწერა საძიებო სისტემებისთვის..."
                      />
                      <p className="text-xs text-muted-foreground">რეკომენდებული: 150-160 სიმბოლო</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="meta_description_hy" className="font-semibold">Meta Description (Armenian)</Label>
                      <Textarea
                        id="meta_description_hy"
                        value={formData.meta_description_hy}
                        onChange={(event) => setFormData({ ...formData, meta_description_hy: event.target.value })}
                        rows={3}
                        placeholder="Brief description for search engines in Armenian..."
                      />
                      <p className="text-xs text-muted-foreground">Recommended: 150-160 characters</p>
                    </div>
                  </AdminFormFieldGrid>
                </AdminFormSection>
              </TabsContent>
            </Tabs>
          </AdminDialogBody>

          <AdminDialogFooter>
            {mode === "edit" && editingBlog && (
              <Button type="button" variant="destructive" onClick={() => handleDelete(editingBlog.id)} className="h-11">
                <Trash2 className="mr-2 h-4 w-4" /> Delete blog
              </Button>
            )}
            <div className="ml-auto flex items-center gap-2">
              <Button type="button" variant="ghost" onClick={handleReset} className="h-11">
                Reset
              </Button>
              <Button type="submit" className="h-11 px-6">
                {mode === "edit" ? "Save changes" : "Create blog"}
              </Button>
            </div>
          </AdminDialogFooter>
        </form>
      </AdminDialogContent>
    </Dialog>
  );
}
