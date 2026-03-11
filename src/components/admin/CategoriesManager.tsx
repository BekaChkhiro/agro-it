import { useCallback, useEffect, useMemo, useRef, useState, useId } from "react";
import { ChevronDown, ChevronRight, FolderTree, Plus, RefreshCw, Search, Trash2 } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/hooks/useCategories";
import type { Database } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { uploadImage } from "@/lib/storage";
import { validateSlug } from "@/utils/urlHelpers";
import { AdminFormFieldGrid, AdminFormSection } from "@/components/admin/form/primitives";

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

interface CategoryNode extends CategoryRow {
  children: CategoryNode[];
}

interface CategoryFormState {
  name_en: string;
  name_ka: string;
  name_hy: string;
  description_en: string;
  description_ka: string;
  description_hy: string;
  icon: string;
  parent_id: string;
  slug_en: string;
  slug_ka: string;
  slug_hy: string;
  path_en: string;
  path_ka: string;
  path_hy: string;
  show_in_nav: boolean;
  is_featured: boolean;
  display_order: string;
  banner_image_url: string;
}

const createEmptyFormState = (overrides: Partial<CategoryFormState> = {}): CategoryFormState => ({
  name_en: "",
  name_ka: "",
  name_hy: "",
  description_en: "",
  description_ka: "",
  description_hy: "",
  icon: "",
  parent_id: "",
  slug_en: "",
  slug_ka: "",
  slug_hy: "",
  path_en: "",
  path_ka: "",
  path_hy: "",
  show_in_nav: true,
  is_featured: false,
  display_order: "0",
  banner_image_url: "",
  ...overrides,
});

const formStateFromCategory = (category: CategoryRow): CategoryFormState => ({
  name_en: category.name_en,
  name_ka: category.name_ka,
  name_hy: (category as Record<string, unknown>).name_hy as string || "",
  description_en: category.description_en || "",
  description_ka: category.description_ka || "",
  description_hy: (category as Record<string, unknown>).description_hy as string || "",
  icon: category.icon || "",
  parent_id: category.parent_id || "",
  slug_en: (category as Record<string, unknown>).slug_en as string || "",
  slug_ka: (category as Record<string, unknown>).slug_ka as string || "",
  slug_hy: (category as Record<string, unknown>).slug_hy as string || "",
  path_en: category.path_en || "",
  path_ka: category.path_ka || "",
  path_hy: (category as Record<string, unknown>).path_hy as string || "",
  show_in_nav: category.show_in_nav ?? true,
  is_featured: category.is_featured ?? false,
  display_order: category.display_order?.toString() || "0",
  banner_image_url: category.banner_image_url || "",
});

// Helper function to generate slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

const buildCategoryTree = (categories: CategoryRow[]): CategoryNode[] => {
  const map = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

  categories.forEach((category) => {
    map.set(category.id, { ...category, children: [] });
  });

  const sortNodes = (nodes: CategoryNode[]) => {
    nodes.sort((a, b) => {
      const orderA = a.display_order ?? 0;
      const orderB = b.display_order ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      return a.name_en.localeCompare(b.name_en);
    });
    nodes.forEach((node) => sortNodes(node.children));
    return nodes;
  };

  map.forEach((node) => {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return sortNodes(roots);
};

const flattenTreeForSelect = (nodes: CategoryNode[], depth = 0): Array<{ id: string; label: string }> => {
  const results: Array<{ id: string; label: string }> = [];
  nodes.forEach((node) => {
    const prefix = depth > 0 ? `${"\u2014 ".repeat(depth)}` : "";
    results.push({ id: node.id, label: `${prefix}${node.name_en}` });
    if (node.children.length) {
      results.push(...flattenTreeForSelect(node.children, depth + 1));
    }
  });
  return results;
};

const buildCategoryCrumbs = (category: CategoryRow | null, categories: CategoryRow[]) => {
  if (!category) return [] as CategoryRow[];
  const map = new Map<string, CategoryRow>();
  categories.forEach((cat) => map.set(cat.id, cat));

  const crumbs: CategoryRow[] = [];
  let current: CategoryRow | undefined | null = category;

  while (current) {
    crumbs.unshift(current);
    if (!current.parent_id) break;
    current = map.get(current.parent_id);
  }

  return crumbs;
};

export function CategoriesManager() {
  const { data: categories = [], isLoading: loading, refetch } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [parentForNew, setParentForNew] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryFormState>(createEmptyFormState());
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => new Set());
  const [bannerUploading, setBannerUploading] = useState(false);
  const bannerInputId = useId();
  const showInNavLabelId = useId();
  const showInNavDescriptionId = useId();
  const featuredCategoryLabelId = useId();
  const featuredCategoryDescriptionId = useId();
  const slugErrorId = useId();
  const slugHintId = useId();
  const bannerFileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId],
  );

  useEffect(() => {
    if (selectedCategory && !isCreating) {
      setFormData(formStateFromCategory(selectedCategory));
    }
  }, [selectedCategory, isCreating]);

  useEffect(() => {
    setExpandedNodes((prev) => {
      if (prev.size > 0 || !categories.length) return prev;
      const next = new Set(prev);
      categories.forEach((category) => {
        if (!category.parent_id) {
          next.add(category.id);
        }
      });
      return next;
    });
  }, [categories]);

  const tree = useMemo(() => buildCategoryTree(categories), [categories]);

  const matchSet = useMemo(() => {
    if (!searchQuery.trim()) return new Set<string>();
    const needle = searchQuery.toLowerCase();
    const matches = new Set<string>();
    categories.forEach((category) => {
      if (
        category.name_en.toLowerCase().includes(needle) ||
        category.name_ka.toLowerCase().includes(needle) ||
        category.icon?.toLowerCase().includes(needle)
      ) {
        matches.add(category.id);
      }
    });
    return matches;
  }, [searchQuery, categories]);

  const nodeMatchesFilter = useCallback(
    (node: CategoryNode): boolean => {
      if (matchSet.size === 0) return true;
      if (matchSet.has(node.id)) return true;
      return node.children.some((child) => nodeMatchesFilter(child));
    },
    [matchSet],
  );

  const selectOptions = useMemo(() => flattenTreeForSelect(tree), [tree]);
  const breadcrumbs = useMemo(() => buildCategoryCrumbs(selectedCategory, categories), [selectedCategory, categories]);
  const slugValidation = formData.slug_en ? validateSlug(formData.slug_en) : { valid: true };

  const startCreate = (parentId: string | null = null) => {
    setIsCreating(true);
    setParentForNew(parentId);
    setSelectedCategoryId(null);
    setFormData(createEmptyFormState({ parent_id: parentId ?? "" }));
    if (parentId) {
      setExpandedNodes((prev) => {
        const next = new Set(prev);
        next.add(parentId);
        return next;
      });
    }
  };

  const handleToggleNode = (id: string) => {
    setExpandedNodes((prev) => {
      if (matchSet.size > 0) return prev;
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const resolvedSlugEn = (formData.slug_en || generateSlug(formData.name_en)).trim();
    const resolvedSlugKa = (formData.slug_ka || generateSlug(formData.name_ka)).trim();
    
    const slugCheck = validateSlug(resolvedSlugEn);
    if (!slugCheck.valid) {
      toast({
        title: "Fix the slug format",
        description: slugCheck.error ?? "Slug must use lowercase letters, numbers, or single hyphens",
        variant: "destructive",
      });
      return;
    }

    const resolvedSlugHy = (formData.slug_hy || generateSlug(formData.name_hy)).trim();

    const categoryData = {
      name_en: formData.name_en,
      name_ka: formData.name_ka,
      name_hy: formData.name_hy || null,
      description_en: formData.description_en || null,
      description_ka: formData.description_ka || null,
      description_hy: formData.description_hy || null,
      icon: formData.icon || null,
      parent_id: formData.parent_id || null,
      slug_en: resolvedSlugEn,
      slug_ka: resolvedSlugKa,
      slug_hy: resolvedSlugHy || null,
      path_en: formData.path_en || null,
      path_ka: formData.path_ka || null,
      path_hy: formData.path_hy || null,
      show_in_nav: Boolean(formData.show_in_nav),
      is_featured: Boolean(formData.is_featured), // Explicitly convert to boolean to ensure false is sent
      display_order: Number.parseInt(formData.display_order, 10) || 0,
      banner_image_url: formData.banner_image_url || null,
    } as Parameters<typeof createCategory.mutateAsync>[0]; // Type assertion needed for _hy fields

    try {
      if (isCreating) {
        const created = await createCategory.mutateAsync(categoryData);
        toast({ title: "Category created", description: `${formData.name_en} is now live.` });
        setIsCreating(false);
        if (created?.id) {
          setSelectedCategoryId(created.id);
        }
      } else if (selectedCategory) {
        await updateCategory.mutateAsync({ id: selectedCategory.id, categoryData });
        toast({ title: "Changes saved", description: `${formData.name_en} updated successfully.` });
      }
    } catch (error) {
      toast({
        title: "Unable to save category",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    const confirmed = window.confirm(
      `Delete “${selectedCategory.name_en}”? This action will remove the category for all languages.`,
    );
    if (!confirmed) return;

    try {
      await deleteCategory.mutateAsync(selectedCategory.id);
      toast({ title: "Category deleted", description: `${selectedCategory.name_en} removed.` });
      setSelectedCategoryId(null);
      setIsCreating(false);
      setFormData(createEmptyFormState());
    } catch (error) {
      toast({
        title: "Deletion failed",
        description: error instanceof Error ? error.message : "Could not delete category.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    if (isCreating) {
      startCreate(parentForNew);
    } else if (selectedCategory) {
      setFormData(formStateFromCategory(selectedCategory));
    } else {
      setFormData(createEmptyFormState());
    }
  };

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setBannerUploading(true);
    try {
      const uploadedUrl = await uploadImage(file, "categories/banners");
      setFormData((prev) => ({ ...prev, banner_image_url: uploadedUrl }));
      toast({ title: "Banner uploaded", description: "Category hero image ready." });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unable to upload image.",
        variant: "destructive",
      });
    } finally {
      setBannerUploading(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const handleBannerRemove = () => {
    setFormData((prev) => ({ ...prev, banner_image_url: "" }));
  };

  const renderTree = (nodes: CategoryNode[], depth = 0): React.ReactNode => {
    return nodes.map((node) => {
      const hasChildren = node.children.length > 0;
      const matches = nodeMatchesFilter(node);
      const highlight = matchSet.size > 0 && matchSet.has(node.id);
      const isExpanded = matchSet.size > 0 ? matches : expandedNodes.has(node.id);
      const isActive = !isCreating && selectedCategoryId === node.id;
      const dimmed = matchSet.size > 0 && !matches;

      return (
        <div key={node.id}>
          <CategoryTreeNode
            node={node}
            depth={depth}
            isActive={isActive}
            isExpanded={isExpanded}
            hasChildren={hasChildren}
            highlight={highlight}
            dimmed={dimmed}
            onSelect={(id) => {
              setSelectedCategoryId(id);
              setIsCreating(false);
              setParentForNew(null);
            }}
            onToggle={() => handleToggleNode(node.id)}
            onCreateChild={() => startCreate(node.id)}
          />
          {hasChildren && isExpanded && <div>{renderTree(node.children, depth + 1)}</div>}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Catalog Categories</h2>
          <p className="text-sm text-muted-foreground">
            Curate the navigation tree and localized descriptions similar to the Magento catalog manager.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => startCreate(null)}>
            <Plus className="mr-2 h-4 w-4" />
            New root category
          </Button>
          <Button variant="ghost" size="icon" onClick={() => refetch()} aria-label="Refresh categories">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FolderTree className="h-5 w-5" />
                  Category tree
                </CardTitle>
                <CardDescription>Browse and drill into the hierarchical structure.</CardDescription>
              </div>
              {selectedCategory && !isCreating && (
                <Button variant="outline" size="sm" onClick={() => startCreate(selectedCategory.id)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New subcategory
                </Button>
              )}
            </div>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search categories, icons, or slugs"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            <ScrollArea className="max-h-[70vh] pr-2">
              <div className="space-y-1">
                {loading ? (
                  [...Array(8)].map((_, index) => <Skeleton key={index} className="h-8 w-full" />)
                ) : tree.length ? (
                  renderTree(tree)
                ) : (
                  <div className="rounded-md border border-dashed border-muted-foreground/40 p-6 text-center">
                    <p className="text-sm font-medium text-muted-foreground">
                      No categories yet. Start by adding your first root category.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <CardTitle>
                {isCreating
                  ? parentForNew
                    ? "Create subcategory"
                    : "Create root category"
                  : selectedCategory
                    ? selectedCategory.name_en
                    : "Select a category"}
              </CardTitle>
              <CardDescription>
                {isCreating
                  ? "Fill out the details and publish to add this category to your storefront."
                  : selectedCategory
                  ? "Update the localized content and visibility options below."
                  : "Choose a category from the tree to begin editing."}
              </CardDescription>
              {!isCreating && breadcrumbs.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                  {breadcrumbs.map((crumb, index) => (
                    <span key={crumb.id} className="flex items-center gap-1">
                      {index > 0 && <ChevronRight className="h-3 w-3" />}
                      {crumb.name_en}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {!isCreating && selectedCategory && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => startCreate(selectedCategory.id)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add child
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {(isCreating || selectedCategory) ? (
              <form onSubmit={handleSubmit} className="space-y-10">
                <AdminFormSection title="Category Names">
                  <AdminFormFieldGrid>
                    <div className="space-y-3">
                      <Label htmlFor="name_en" className="text-sm font-semibold">
                        Name (English) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name_en"
                        value={formData.name_en}
                        onChange={(event) => setFormData({ ...formData, name_en: event.target.value })}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="name_ka" className="text-sm font-semibold">
                        Name (Georgian) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name_ka"
                        value={formData.name_ka}
                        onChange={(event) => setFormData({ ...formData, name_ka: event.target.value })}
                        required
                        className="h-11"
                      />
                    </div>
                  </AdminFormFieldGrid>
                  <AdminFormFieldGrid>
                    <div className="space-y-3">
                      <Label htmlFor="name_hy" className="text-sm font-semibold">
                        Name (Armenian)
                      </Label>
                      <Input
                        id="name_hy"
                        value={formData.name_hy}
                        onChange={(event) => setFormData({ ...formData, name_hy: event.target.value })}
                        className="h-11"
                      />
                    </div>
                  </AdminFormFieldGrid>
                </AdminFormSection>

                <AdminFormSection
                  title="SEO & Slugs"
                  description="Override the auto-generated slug if needed. Lowercase letters, numbers, and single hyphens only."
                >
                  <AdminFormFieldGrid>
                    <div className="space-y-3">
                      <Label htmlFor="slug_en" className="text-sm font-semibold">Slug (English)</Label>
                      <Input
                        id="slug_en"
                        value={formData.slug_en}
                        onChange={(event) => setFormData({ ...formData, slug_en: event.target.value })}
                        placeholder={generateSlug(formData.name_en)}
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
                        Leave blank to auto-generate from the English name.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="slug_ka" className="text-sm font-semibold">Slug (Georgian)</Label>
                      <Input
                        id="slug_ka"
                        value={formData.slug_ka}
                        onChange={(event) => setFormData({ ...formData, slug_ka: event.target.value })}
                        placeholder={generateSlug(formData.name_ka)}
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        Leave blank to auto-generate from the Georgian name.
                      </p>
                    </div>
                  </AdminFormFieldGrid>
                  <AdminFormFieldGrid>
                    <div className="space-y-3">
                      <Label htmlFor="slug_hy" className="text-sm font-semibold">Slug (Armenian)</Label>
                      <Input
                        id="slug_hy"
                        value={formData.slug_hy}
                        onChange={(event) => setFormData({ ...formData, slug_hy: event.target.value })}
                        placeholder={generateSlug(formData.name_hy)}
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        Leave blank to auto-generate from the Armenian name.
                      </p>
                    </div>
                  </AdminFormFieldGrid>
                </AdminFormSection>

                <AdminFormSection title="Hierarchy & Ordering">
                  <AdminFormFieldGrid>
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Parent category</Label>
                      <Select
                        value={formData.parent_id || "root"}
                        onValueChange={(value) =>
                          setFormData({ ...formData, parent_id: value === "root" ? "" : value })
                        }
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Attach to..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="root">None (root level)</SelectItem>
                          {selectOptions
                            .filter((option) => option.id !== selectedCategoryId)
                            .map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="display_order" className="text-sm font-semibold">Display order</Label>
                      <Input
                        id="display_order"
                        type="number"
                        min={0}
                        value={formData.display_order}
                        onChange={(event) => setFormData({ ...formData, display_order: event.target.value })}
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">Lower numbers appear first within their parent.</p>
                    </div>
                  </AdminFormFieldGrid>
                </AdminFormSection>

                <AdminFormSection title="Paths & Descriptions">
                  <AdminFormFieldGrid>
                    <div className="space-y-3">
                      <Label htmlFor="path_en" className="text-sm font-semibold">Path (English)</Label>
                      <Input
                        id="path_en"
                        value={formData.path_en}
                        onChange={(event) => setFormData({ ...formData, path_en: event.target.value })}
                        placeholder="/en/vineyard-equipment"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="path_ka" className="text-sm font-semibold">Path (Georgian)</Label>
                      <Input
                        id="path_ka"
                        value={formData.path_ka}
                        onChange={(event) => setFormData({ ...formData, path_ka: event.target.value })}
                        placeholder="/ვენახის-ტექნიკა"
                        className="h-11"
                      />
                    </div>
                  </AdminFormFieldGrid>
                  <AdminFormFieldGrid>
                    <div className="space-y-3">
                      <Label htmlFor="path_hy" className="text-sm font-semibold">Path (Armenian)</Label>
                      <Input
                        id="path_hy"
                        value={formData.path_hy}
                        onChange={(event) => setFormData({ ...formData, path_hy: event.target.value })}
                        placeholder="/hy/vineyard-equipment"
                        className="h-11"
                      />
                    </div>
                  </AdminFormFieldGrid>
                  <AdminFormFieldGrid>
                    <div className="space-y-3">
                      <Label htmlFor="description_en" className="text-sm font-semibold">Description (English)</Label>
                      <Textarea
                        id="description_en"
                        value={formData.description_en}
                        onChange={(event) => setFormData({ ...formData, description_en: event.target.value })}
                        rows={4}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="description_ka" className="text-sm font-semibold">Description (Georgian)</Label>
                      <Textarea
                        id="description_ka"
                        value={formData.description_ka}
                        onChange={(event) => setFormData({ ...formData, description_ka: event.target.value })}
                        rows={4}
                      />
                    </div>
                  </AdminFormFieldGrid>
                  <AdminFormFieldGrid>
                    <div className="space-y-3">
                      <Label htmlFor="description_hy" className="text-sm font-semibold">Description (Armenian)</Label>
                      <Textarea
                        id="description_hy"
                        value={formData.description_hy}
                        onChange={(event) => setFormData({ ...formData, description_hy: event.target.value })}
                        rows={4}
                      />
                    </div>
                  </AdminFormFieldGrid>
                </AdminFormSection>

                <AdminFormSection title="Appearance & Visibility">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="icon" className="text-sm font-semibold">Icon reference</Label>
                      <Input
                        id="icon"
                        value={formData.icon}
                        onChange={(event) => setFormData({ ...formData, icon: event.target.value })}
                        placeholder="grape"
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        Reference the icon identifier used across the storefront (e.g. lucide icon name).
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-5">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <Label
                              htmlFor="show_in_nav"
                              id={showInNavLabelId}
                              className="text-sm font-semibold text-foreground"
                            >
                              Show in main navigation
                            </Label>
                            <p id={showInNavDescriptionId} className="text-xs text-muted-foreground">
                              Applies to root-level categories exposed in the storefront mega menu.
                            </p>
                          </div>
                          <Switch
                            id="show_in_nav"
                            aria-labelledby={showInNavLabelId}
                            aria-describedby={showInNavDescriptionId}
                            checked={formData.show_in_nav}
                            onCheckedChange={(checked) => setFormData({ ...formData, show_in_nav: checked })}
                          />
                        </div>
                      </div>
                      <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-5">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <Label
                              htmlFor="is_featured"
                              id={featuredCategoryLabelId}
                              className="text-sm font-semibold text-foreground"
                            >
                              Featured on homepage
                            </Label>
                            <p id={featuredCategoryDescriptionId} className="text-xs text-muted-foreground">
                              Display this category in the featured section on the homepage.
                            </p>
                          </div>
                          <Switch
                            id="is_featured"
                            aria-labelledby={featuredCategoryLabelId}
                            aria-describedby={featuredCategoryDescriptionId}
                            checked={formData.is_featured}
                            onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor={bannerInputId} className="text-sm font-semibold">Banner image</Label>
                      <input
                        id={bannerInputId}
                        ref={bannerFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleBannerUpload}
                      />
                      {formData.banner_image_url ? (
                        <div className="space-y-3">
                          <div className="overflow-hidden rounded-lg border-2 border-dashed bg-muted/30">
                            <img
                              src={formData.banner_image_url}
                              alt="Category banner"
                              className="max-h-48 w-full object-cover"
                            />
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              type="button"
                              variant="default"
                              onClick={() => bannerFileInputRef.current?.click()}
                              disabled={bannerUploading}
                              className="h-11"
                            >
                              {bannerUploading ? "Uploading..." : "Replace image"}
                            </Button>
                            <Button type="button" variant="outline" onClick={handleBannerRemove} className="h-11">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed bg-muted/20 p-8 text-center text-muted-foreground">
                          <p className="text-sm font-medium">Upload a 1920×800px hero image for this category.</p>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => bannerFileInputRef.current?.click()}
                            disabled={bannerUploading}
                            className="h-11"
                          >
                            {bannerUploading ? "Uploading..." : "Upload banner"}
                          </Button>
                        </div>
                      )}
                      <Input
                        placeholder="https://..."
                        value={formData.banner_image_url}
                        onChange={(event) => setFormData({ ...formData, banner_image_url: event.target.value })}
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        Paste a direct URL if your image is already hosted elsewhere.
                      </p>
                    </div>
                  </div>
                </AdminFormSection>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Button type="button" variant="ghost" onClick={handleReset} className="h-11">
                    Reset changes
                  </Button>
                  <div className="flex flex-wrap items-center gap-2">
                    {!isCreating && selectedCategory && (
                      <Button type="button" variant="destructive" onClick={handleDelete} className="h-11">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    )}
                    <Button type="submit" className="h-11 px-6">
                      {isCreating ? "Create category" : "Save changes"}
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="rounded-lg border border-dashed border-muted-foreground/40 bg-muted/20 p-8 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Select a category on the left or create a new one to begin editing.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface CategoryTreeNodeProps {
  node: CategoryNode;
  depth: number;
  isActive: boolean;
  isExpanded: boolean;
  hasChildren: boolean;
  highlight: boolean;
  dimmed: boolean;
  onSelect: (id: string) => void;
  onToggle: () => void;
  onCreateChild: () => void;
}

const CategoryTreeNode = ({
  node,
  depth,
  isActive,
  isExpanded,
  hasChildren,
  highlight,
  dimmed,
  onSelect,
  onToggle,
  onCreateChild,
}: CategoryTreeNodeProps) => {
  return (
    <div
      className={cn(
        "group flex items-center rounded-md border border-transparent px-2 py-1.5 text-sm transition", 
        isActive && "border-primary/40 bg-primary/10 text-primary shadow-sm",
        !isActive && "hover:bg-muted",
        dimmed && "opacity-50",
      )}
      style={{ paddingLeft: depth * 16 }}
    >
      <button
        type="button"
        aria-label={isExpanded ? "Collapse" : "Expand"}
        onClick={(event) => {
          event.stopPropagation();
          if (hasChildren) onToggle();
        }}
        className={cn(
          "mr-2 flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition", 
          hasChildren ? "hover:bg-muted" : "opacity-0",
        )}
      >
        {hasChildren ? (
          isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
        ) : (
          <span className="h-4 w-4" />
        )}
      </button>
      <button
        type="button"
        className="flex flex-1 flex-col items-start text-left"
        onClick={() => onSelect(node.id)}
      >
        <span className={cn("font-medium", highlight && "text-primary")}>{node.name_en}</span>
        <span className="text-xs text-muted-foreground">{node.name_ka}</span>
      </button>
      <div className="ml-2 flex items-center gap-1">
        {node.show_in_nav && <Badge variant="secondary" className="text-[10px] uppercase">Nav</Badge>}
        {node.banner_image_url && (
          <Badge variant="secondary" className="text-[10px] uppercase">
            Hero
          </Badge>
        )}
        {node.icon && (
          <Badge variant="outline" className="text-[10px]">
            {node.icon}
          </Badge>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 transition group-hover:opacity-100"
          onClick={(event) => {
            event.stopPropagation();
            onCreateChild();
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
