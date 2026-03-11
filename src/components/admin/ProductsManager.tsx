import { useEffect, useMemo, useRef, useState, useId } from "react";
import { BadgeCheck, Package, Plus, Search, Star, Trash2, Edit, ImagePlus, X, Link2, Loader2, CheckCircle2, ChevronLeft, ChevronRight, Copy } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/useCategories";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import { useProductCategories, useUpdateProductCategories } from "@/hooks/useProductCategories";
import type { Database, Json } from "@/integrations/supabase/types";
import { generateSlug, validateSlug } from "@/utils/urlHelpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Dialog, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
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

type Category = Database["public"]["Tables"]["categories"]["Row"];
type CategoryWithParent = Category & { parent?: Category | null };
type Product = Database["public"]["Tables"]["products"]["Row"] & {
  category?: CategoryWithParent | null;
  categories?: CategoryWithParent[];
  category_ids?: string[];
};

type ProductFormState = {
  name_en: string;
  name_ka: string;
  name_hy: string;
  slug_en: string;
  slug_ka: string;
  slug_hy: string;
  description_en: string;
  description_ka: string;
  description_hy: string;
  additional_info_en: string;
  additional_info_ka: string;
  additional_info_hy: string;
  category_ids: string[];
  image_url: string;
  video_url: string;
  video_description_en: string;
  video_description_ka: string;
  video_description_hy: string;
  price: string;
  is_featured: boolean;
  specs_en: string;
  specs_ka: string;
  specs_hy: string;
  gallery_image_urls: string[];
  related_product_ids: string[];
};

type FormStep = "basics" | "media" | "content" | "translations";

const createEmptyProductForm = (): ProductFormState => ({
  name_en: "",
  name_ka: "",
  name_hy: "",
  slug_en: "",
  slug_ka: "",
  slug_hy: "",
  description_en: "",
  description_ka: "",
  description_hy: "",
  additional_info_en: "",
  additional_info_ka: "",
  additional_info_hy: "",
  category_ids: [],
  image_url: "",
  video_url: "",
  video_description_en: "",
  video_description_ka: "",
  video_description_hy: "",
  price: "",
  is_featured: false,
  specs_en: "",
  specs_ka: "",
  specs_hy: "",
  gallery_image_urls: [],
  related_product_ids: [],
});

const formStateFromProduct = (product: Product, categoryIds: string[] = []): ProductFormState => {
  const productWithRelated = product as Product & { related_product_ids?: Json };
  const productRecord = product as Record<string, unknown>;
  return {
    name_en: product.name_en,
    name_ka: product.name_ka,
    name_hy: productRecord.name_hy as string || "",
    slug_en: productRecord.slug_en as string || "",
    slug_ka: productRecord.slug_ka as string || "",
    slug_hy: productRecord.slug_hy as string || "",
    description_en: product.description_en || "",
    description_ka: product.description_ka || "",
    description_hy: productRecord.description_hy as string || "",
    additional_info_en: productRecord.additional_info_en as string || "",
    additional_info_ka: productRecord.additional_info_ka as string || "",
    additional_info_hy: productRecord.additional_info_hy as string || "",
    category_ids: categoryIds,
    image_url: product.image_url || "",
    video_url: product.video_url || "",
    video_description_en: product.video_description_en || "",
    video_description_ka: product.video_description_ka || "",
    video_description_hy: productRecord.video_description_hy as string || "",
    price: typeof product.price === "number" ? product.price.toString() : "",
    is_featured: product.is_featured ?? false,
    specs_en: product.specs_en ? JSON.stringify(product.specs_en, null, 2) : "",
    specs_ka: product.specs_ka ? JSON.stringify(product.specs_ka, null, 2) : "",
    specs_hy: productRecord.specs_hy ? JSON.stringify(productRecord.specs_hy, null, 2) : "",
    gallery_image_urls: Array.isArray(product.gallery_image_urls)
      ? (product.gallery_image_urls as unknown[]).filter((item): item is string => typeof item === "string")
      : [],
    related_product_ids: Array.isArray(productWithRelated.related_product_ids)
      ? (productWithRelated.related_product_ids as unknown[]).filter((item): item is string => typeof item === "string")
      : [],
  };
};

const priceFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function ProductsManager() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [currentStep, setCurrentStep] = useState<FormStep>("basics");
  const [translationLang, setTranslationLang] = useState<"ka" | "hy" | "ru">("ka");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormState>(createEmptyProductForm());
  const [originalFormData, setOriginalFormData] = useState<ProductFormState | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [mainImageUploading, setMainImageUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryUrlDraft, setGalleryUrlDraft] = useState("");
  const mainImageInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();
  const featuredProductLabelId = useId();
  const featuredProductDescriptionId = useId();
  const featuredFilterLabelId = useId();
  const featuredFilterDescriptionId = useId();
  const slugEnErrorId = useId();
  const slugEnHintId = useId();
  const slugKaErrorId = useId();
  const slugKaHintId = useId();

  const { data: products = [], isLoading: loading } = useProducts();
  const { data: categories = [] } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { data: productCategoryIds = [] } = useProductCategories(editingProduct?.id);
  const updateProductCategories = useUpdateProductCategories();
  
  const isSaving = createProduct.isPending || updateProduct.isPending;

  useEffect(() => {
    if (!dialogOpen) {
      setEditingProduct(null);
      setMode("create");
      setFormData(createEmptyProductForm());
      setOriginalFormData(null);
      setCurrentStep("basics");
      setTranslationLang("ka");
      setGalleryUrlDraft("");
      setMainImageUploading(false);
      setGalleryUploading(false);
    }
  }, [dialogOpen]);

  const categoryLookup = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((category) => map.set(category.id, category));
    return map;
  }, [categories]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name_en.toLowerCase().includes(query) ||
          product.name_ka.toLowerCase().includes(query) ||
          product.description_en?.toLowerCase().includes(query) ||
          product.description_ka?.toLowerCase().includes(query),
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category_ids?.includes(selectedCategory));
    }

    if (showFeaturedOnly) {
      filtered = filtered.filter((product) => product.is_featured);
    }

    return filtered;
  }, [products, searchQuery, selectedCategory, showFeaturedOnly]);

  const resultsLabel = `${filteredProducts.length} of ${products.length} products`;
  const slugEnValidation = formData.slug_en ? validateSlug(formData.slug_en) : { valid: true };
  const slugKaValidation = formData.slug_ka ? validateSlug(formData.slug_ka) : { valid: true };

  const isBasicsStepValid = (): boolean => {
    if (!formData.name_en.trim()) return false;
    if (formData.slug_en && !slugEnValidation.valid) return false;
    return true;
  };

  const steps: FormStep[] = ["basics", "media", "content", "translations"];
  const currentStepIndex = steps.indexOf(currentStep);
  const canGoNext = currentStepIndex < steps.length - 1 && (currentStep === "basics" ? isBasicsStepValid() : true);
  const canGoBack = currentStepIndex > 0;

  const handleNext = () => {
    if (!canGoNext) return;
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const handleBack = () => {
    if (!canGoBack) return;
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const isStepComplete = (step: FormStep): boolean => {
    switch (step) {
      case "basics":
        return isBasicsStepValid();
      case "media":
        return !!formData.image_url;
      case "content":
        return !!formData.description_en.trim();
      case "translations":
        return !!formData.name_ka.trim() || !!formData.name_hy.trim() || !!(formData as Record<string, unknown>).name_ru;
      default:
        return false;
    }
  };

  const startCreate = () => {
    setMode("create");
    setEditingProduct(null);
    const emptyForm = createEmptyProductForm();
    setFormData(emptyForm);
    setOriginalFormData(emptyForm);
    setCurrentStep("basics");
    setTranslationLang("ka");
    setDialogOpen(true);
    setGalleryUrlDraft("");
    setMainImageUploading(false);
    setGalleryUploading(false);
  };

  const handleEdit = (product: Product) => {
    setMode("edit");
    setEditingProduct(product);
    const resolvedCategoryIds =
      (product as Product & { category_ids?: string[] }).category_ids?.length
        ? (product as Product & { category_ids?: string[] }).category_ids
        : productCategoryIds;
    const initialFormData = formStateFromProduct(product, resolvedCategoryIds || []);
    setFormData(initialFormData);
    setOriginalFormData(initialFormData);
    setCurrentStep("basics");
    setTranslationLang("ka");
    setDialogOpen(true);
    setGalleryUrlDraft("");
    setMainImageUploading(false);
    setGalleryUploading(false);
  };

  const areFormsEqual = (form1: ProductFormState, form2: ProductFormState): boolean => {
    return (
      form1.name_en === form2.name_en &&
      form1.name_ka === form2.name_ka &&
      form1.name_hy === form2.name_hy &&
      form1.slug_en === form2.slug_en &&
      form1.slug_ka === form2.slug_ka &&
      form1.slug_hy === form2.slug_hy &&
      form1.description_en === form2.description_en &&
      form1.description_ka === form2.description_ka &&
      form1.description_hy === form2.description_hy &&
      form1.additional_info_en === form2.additional_info_en &&
      form1.additional_info_ka === form2.additional_info_ka &&
      form1.additional_info_hy === form2.additional_info_hy &&
      JSON.stringify(form1.category_ids) === JSON.stringify(form2.category_ids) &&
      form1.image_url === form2.image_url &&
      form1.video_url === form2.video_url &&
      form1.video_description_en === form2.video_description_en &&
      form1.video_description_ka === form2.video_description_ka &&
      form1.video_description_hy === form2.video_description_hy &&
      form1.price === form2.price &&
      form1.is_featured === form2.is_featured &&
      form1.specs_en === form2.specs_en &&
      form1.specs_ka === form2.specs_ka &&
      form1.specs_hy === form2.specs_hy &&
      JSON.stringify(form1.gallery_image_urls) === JSON.stringify(form2.gallery_image_urls) &&
      JSON.stringify(form1.related_product_ids) === JSON.stringify(form2.related_product_ids)
    );
  };

  const handleReset = () => {
    if (!originalFormData) return;
    
    const hasChanges = !areFormsEqual(formData, originalFormData);
    
    if (hasChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to reset the form? All your changes will be lost."
      );
      if (!confirmed) return;
    }
    
    setFormData(originalFormData);
    setGalleryUrlDraft("");
  };

  const copyFieldFromEnglish = (field: "name" | "slug" | "description" | "additional_info" | "video_description") => {
    const lang = translationLang;
    const enField = `${field}_en` as keyof ProductFormState;
    const targetField = `${field}_${lang}` as keyof ProductFormState;
    
    if (typeof formData[enField] === "string" && typeof formData[targetField] === "string") {
      setFormData({ ...formData, [targetField]: formData[enField] });
    }
  };

  const autofillAllFromEnglish = () => {
    const lang = translationLang;
    const updates: Partial<ProductFormState> = {};

    if (lang === "ka") {
      updates.name_ka = formData.name_en;
      updates.slug_ka = formData.slug_en;
      updates.description_ka = formData.description_en;
      updates.additional_info_ka = formData.additional_info_en;
      updates.video_description_ka = formData.video_description_en;
    } else if (lang === "hy") {
      updates.name_hy = formData.name_en;
      updates.slug_hy = formData.slug_en;
      updates.description_hy = formData.description_en;
      updates.additional_info_hy = formData.additional_info_en;
      updates.video_description_hy = formData.video_description_en;
    } else if (lang === "ru") {
      const ruFields = ["name_ru", "slug_ru", "description_ru", "additional_info_ru", "video_description_ru"] as const;
      ruFields.forEach((field) => {
        const enField = field.replace("_ru", "_en") as keyof ProductFormState;
        if (typeof formData[enField] === "string") {
          updates[field] = formData[enField];
        }
      });
    }

    setFormData({ ...formData, ...updates });
    toast({ title: "Autofilled", description: `All ${lang.toUpperCase()} fields copied from English.` });
  };

  const hasRussianFields = (): boolean => {
    return "name_ru" in formData;
  };

  const parseSpecsField = (value: string, label: string): Json | null => {
    if (!value.trim()) return null;
    try {
      return JSON.parse(value) as Json;
    } catch (error) {
      setCurrentStep("media");
      toast({
        title: "Invalid JSON",
        description: `${label} must be valid JSON. ${error instanceof Error ? error.message : ""}`,
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleMainImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setMainImageUploading(true);
    try {
      const uploadedUrl = await uploadImage(file, "products/main");
      setFormData((prev) => ({ ...prev, image_url: uploadedUrl }));
      toast({ title: "Primary image uploaded", description: "The product cover has been updated." });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unable to upload image.",
        variant: "destructive",
      });
    } finally {
      setMainImageUploading(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const handleGalleryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setGalleryUploading(true);
    try {
      const uploads = await Promise.all(
        Array.from(files).map(async (file) => uploadImage(file, "products/gallery")),
      );
      setFormData((prev) => ({
        ...prev,
        gallery_image_urls: [...prev.gallery_image_urls, ...uploads],
      }));
      toast({ title: "Gallery updated", description: `${uploads.length} image(s) added.` });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unable to upload gallery images.",
        variant: "destructive",
      });
    } finally {
      setGalleryUploading(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const handleRemoveGalleryImage = (imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      gallery_image_urls: prev.gallery_image_urls.filter((url) => url !== imageUrl),
    }));
  };

  const handleAddGalleryUrl = () => {
    const trimmed = galleryUrlDraft.trim();
    if (!trimmed) return;
    setFormData((prev) => ({
      ...prev,
      gallery_image_urls: [...prev.gallery_image_urls, trimmed],
    }));
    setGalleryUrlDraft("");
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
      setCurrentStep("basics");
      toast({
        title: "Fix the slug format",
        description: slugErrors.join(" • "),
        variant: "destructive",
      });
      return;
    }

    if (!isBasicsStepValid()) {
      setCurrentStep("basics");
      toast({
        title: "Missing required fields",
        description: "Please complete Step 1: Basics (English) with at least the product name.",
        variant: "destructive",
      });
      return;
    }

    let specsEn: Json | null = null;
    let specsKa: Json | null = null;
    let specsHy: Json | null = null;

    try {
      specsEn = parseSpecsField(formData.specs_en, "Specs (English)");
      specsKa = parseSpecsField(formData.specs_ka, "Specs (Georgian)");
      specsHy = parseSpecsField(formData.specs_hy, "Specs (Armenian)");
    } catch {
      return;
    }

    const productPayload = {
      name_en: formData.name_en,
      name_ka: formData.name_ka,
      name_hy: formData.name_hy || null,
      slug_en: formData.slug_en || null,
      slug_ka: formData.slug_ka || null,
      slug_hy: formData.slug_hy || null,
      description_en: formData.description_en || null,
      description_ka: formData.description_ka || null,
      description_hy: formData.description_hy || null,
      additional_info_en: formData.additional_info_en || null,
      additional_info_ka: formData.additional_info_ka || null,
      additional_info_hy: formData.additional_info_hy || null,
      // category_id removed - now using junction table
      image_url: formData.image_url || null,
      video_url: formData.video_url || null,
      video_description_en: formData.video_description_en || null,
      video_description_ka: formData.video_description_ka || null,
      video_description_hy: formData.video_description_hy || null,
      price: formData.price ? Number.parseFloat(formData.price) : null,
      is_featured: formData.is_featured,
      specs_en: specsEn,
      specs_ka: specsKa,
      specs_hy: specsHy,
      gallery_image_urls: formData.gallery_image_urls.length ? formData.gallery_image_urls : null,
      related_product_ids: formData.related_product_ids.length ? (formData.related_product_ids as Json) : null,
    };

    try {
      if (mode === "create") {
        const newProduct = await createProduct.mutateAsync(productPayload as Parameters<typeof createProduct.mutateAsync>[0]);
        if (newProduct && formData.category_ids.length > 0) {
          await updateProductCategories.mutateAsync({
            productId: newProduct.id,
            categoryIds: formData.category_ids,
          });
        }
        toast({ title: "Product created", description: `${formData.name_en} was added to the catalog.` });
        setDialogOpen(false);
      } else if (mode === "edit" && editingProduct) {
        const updated = await updateProduct.mutateAsync({ id: editingProduct.id, productData: productPayload as Parameters<typeof createProduct.mutateAsync>[0] });
        await updateProductCategories.mutateAsync({
          productId: editingProduct.id,
          categoryIds: formData.category_ids,
        });
        toast({ title: "Changes saved", description: `${formData.name_en} updated successfully.` });
        if (updated) {
          const updatedProduct = updated as Product;
          setEditingProduct(updatedProduct);
          const updatedFormData = formStateFromProduct(updatedProduct, formData.category_ids);
          setFormData(updatedFormData);
          setOriginalFormData(updatedFormData);
        }
      }
    } catch (error) {
      toast({
        title: "Unable to save product",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (productId: string) => {
    const product = products.find((item) => item.id === productId);
    const confirmed = window.confirm(
      `Delete "${product?.name_en ?? "this product"}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      await deleteProduct.mutateAsync(productId);
      toast({ title: "Product deleted", description: product ? `${product.name_en} removed.` : "Removed successfully." });
      setDialogOpen(false);
    } catch (error) {
      toast({
        title: "Deletion failed",
        description: error instanceof Error ? error.message : "Could not delete the product.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-xl">
                <Package className="h-5 w-5" />
                Catalog products
              </CardTitle>
              <CardDescription>
                Review, filter, and curate the merchandise catalog with a Magento-inspired administrative grid.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                {resultsLabel}
              </Badge>
              <Dialog open={dialogOpen} onOpenChange={(open) => {
                  if (!open && isSaving) {
                    toast({
                      title: "Save in progress",
                      description: "Please wait for the save operation to complete.",
                      variant: "destructive",
                    });
                    return;
                  }
                  setDialogOpen(open);
                }}>
                <DialogTrigger asChild>
                  <Button onClick={startCreate} className="gap-2">
                    <Plus className="h-4 w-4" />
                    New product
                  </Button>
                </DialogTrigger>

                <AdminDialogContent>
                  <AdminDialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                      {mode === "create" ? "Create new product" : `Edit: ${editingProduct?.name_en}`}
                    </DialogTitle>
                    <DialogDescription className="text-base">
                      {mode === "create"
                        ? "Fill in the details below to add a new product to your catalog."
                        : "Update product information and save changes to synchronize with your storefront."}
                    </DialogDescription>
                  </AdminDialogHeader>

                  <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
                    <AdminDialogBody>
                      <div className="mb-8">
                        <div className="mb-8 h-12 w-full rounded-none border border-border/60 bg-muted/50 p-0 text-muted-foreground flex overflow-x-auto md:grid md:overflow-visible" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
                          {steps.map((step) => {
                            const stepLabels = {
                              basics: "1. Basics (EN)",
                              media: "2. Media & Specs",
                              content: "3. Content (EN)",
                              translations: "4. Translations",
                            };
                            const isComplete = isStepComplete(step);
                            return (
                              <button
                                key={step}
                                type="button"
                                onClick={() => setCurrentStep(step)}
                                className={`inline-flex h-full items-center justify-center whitespace-nowrap px-4 text-base font-semibold transition-colors rounded-none border-r border-border/60 flex-none basis-40 first:border-l border-l-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:flex-1 ${
                                  currentStep === step ? "bg-background text-foreground" : "text-muted-foreground"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {isComplete && <CheckCircle2 className="h-4 w-4 text-primary" />}
                                  {stepLabels[step]}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {currentStep === "basics" && (
                        <div className="space-y-8">
                          <AdminFormSection title="Product Information (English)">
                            <div className="space-y-3">
                              <Label htmlFor="name_en" className="text-sm font-bold text-foreground flex items-center gap-2">
                                <span className="text-destructive">*</span>
                                Name (English)
                              </Label>
                              <Input
                                id="name_en"
                                value={formData.name_en}
                                onChange={(event) => setFormData({ ...formData, name_en: event.target.value })}
                                required
                                className="h-11"
                                placeholder="Enter product name in English"
                              />
                            </div>
                          </AdminFormSection>

                          <AdminFormSection title="SEO & URLs">
                            <div className="space-y-3">
                              <Label htmlFor="slug_en" className="text-sm font-bold text-foreground">URL Slug (English)</Label>
                              <div className="flex gap-2">
                                <Input
                                  id="slug_en"
                                  value={formData.slug_en}
                                  onChange={(event) => setFormData({ ...formData, slug_en: event.target.value })}
                                  placeholder="product-name"
                                  className={`h-11 ${slugEnValidation.valid ? "" : "border-destructive"}`}
                                  aria-invalid={!slugEnValidation.valid}
                                  aria-describedby={[slugEnHintId, !slugEnValidation.valid && slugEnValidation.error ? slugEnErrorId : null]
                                    .filter(Boolean)
                                    .join(" ")}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setFormData({ ...formData, slug_en: generateSlug(formData.name_en, false) })}
                                  disabled={!formData.name_en}
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
                              <p id={slugEnHintId} className="text-xs text-muted-foreground">
                                SEO-friendly URL (lowercase, hyphens only)
                              </p>
                            </div>
                          </AdminFormSection>

                          <AdminFormSection title="Categorization & Pricing">
                            <AdminFormFieldGrid>
                              <div className="space-y-3">
                                <Label className="text-sm font-bold text-foreground">Categories</Label>
                                <div className="space-y-2 rounded-lg border p-4 max-h-48 overflow-y-auto">
                                  {categories.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No categories available</p>
                                  ) : (
                                    categories.map((category) => (
                                      <div key={category.id} className="flex items-center space-x-2">
                                        <input
                                          type="checkbox"
                                          id={`category-${category.id}`}
                                          checked={formData.category_ids.includes(category.id)}
                                          onChange={(e) => {
                                            const isChecked = e.target.checked;
                                            setFormData({
                                              ...formData,
                                              category_ids: isChecked
                                                ? [...formData.category_ids, category.id]
                                                : formData.category_ids.filter(id => id !== category.id),
                                            });
                                          }}
                                          className="h-4 w-4 rounded border-gray-300"
                                        />
                                        <Label
                                          htmlFor={`category-${category.id}`}
                                          className="text-sm font-normal cursor-pointer"
                                        >
                                          {category.name_en}
                                        </Label>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                              <div className="space-y-3">
                                <Label htmlFor="price" className="text-sm font-bold text-foreground">Price (USD)</Label>
                                <Input
                                  id="price"
                                  type="number"
                                  step="0.01"
                                  value={formData.price}
                                  onChange={(event) => setFormData({ ...formData, price: event.target.value })}
                                  className="h-11"
                                  placeholder="0.00"
                                />
                              </div>
                            </AdminFormFieldGrid>
                          </AdminFormSection>

                          <AdminFormSection title="Display Options">
                            <div className="flex items-center justify-between rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 px-6 py-4">
                              <div>
                                <Label
                                  htmlFor="is_featured"
                                  id={featuredProductLabelId}
                                  className="text-base font-semibold text-foreground"
                                >
                                  Featured Product
                                </Label>
                                <p id={featuredProductDescriptionId} className="text-sm text-muted-foreground">
                                  Highlight this product on landing pages and promotional surfaces
                                </p>
                              </div>
                              <Switch
                                id="is_featured"
                                aria-labelledby={featuredProductLabelId}
                                aria-describedby={featuredProductDescriptionId}
                                checked={formData.is_featured}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                                className="scale-110"
                              />
                            </div>
                          </AdminFormSection>

                          <AdminFormSection
                            title="Related Products"
                            icon={Link2}
                            description="Select products to display as recommendations on this product's page"
                          >
                            <Select
                              value=""
                              onValueChange={(value) => {
                                if (value && !formData.related_product_ids.includes(value) && value !== editingProduct?.id) {
                                  setFormData({
                                    ...formData,
                                    related_product_ids: [...formData.related_product_ids, value],
                                  });
                                }
                              }}
                            >
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Add related product..." />
                              </SelectTrigger>
                              <SelectContent>
                                {products
                                  .filter(
                                    (p) =>
                                      p.id !== editingProduct?.id && !formData.related_product_ids.includes(p.id),
                                  )
                                  .map((product) => (
                                    <SelectItem key={product.id} value={product.id}>
                                      {product.name_en}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            {formData.related_product_ids.length > 0 && (
                              <div className="mt-4 space-y-3">
                                {formData.related_product_ids.map((productId) => {
                                  const relatedProduct = products.find((p) => p.id === productId);
                                  if (!relatedProduct) return null;
                                  return (
                                    <div
                                      key={productId}
                                      className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3 transition hover:bg-muted/50"
                                    >
                                      <div className="flex items-center gap-3">
                                        {relatedProduct.image_url && (
                                          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded border border-border/60 bg-white">
                                            <img
                                              src={relatedProduct.image_url}
                                              alt={relatedProduct.name_en}
                                              className="max-h-full max-w-full object-contain"
                                            />
                                          </div>
                                        )}
                                        <div>
                                          <p className="text-sm font-semibold">{relatedProduct.name_en}</p>
                                          <p className="text-xs text-muted-foreground">{relatedProduct.name_ka}</p>
                                        </div>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          setFormData({
                                            ...formData,
                                            related_product_ids: formData.related_product_ids.filter(
                                              (id) => id !== productId,
                                            ),
                                          })
                                        }
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </AdminFormSection>
                        </div>
                      )}

                      {currentStep === "content" && (
                        <div className="space-y-8">
                          <AdminFormSection title="Product Description (English)">
                            <div className="space-y-3">
                              <Label htmlFor="description_en" className="text-sm font-bold text-foreground">
                                Description (English)
                              </Label>
                              <RichTextEditor
                                id="description_en"
                                value={formData.description_en}
                                onChange={(value) => setFormData({ ...formData, description_en: value })}
                                placeholder="Enter a detailed product description in English..."
                              />
                            </div>
                          </AdminFormSection>

                          <AdminFormSection title="Additional Information (English)">
                            <div className="space-y-3">
                              <Label htmlFor="additional_info_en" className="text-sm font-bold text-foreground">
                                Additional Info (English)
                              </Label>
                              <RichTextEditor
                                id="additional_info_en"
                                value={formData.additional_info_en}
                                onChange={(value) => setFormData({ ...formData, additional_info_en: value })}
                                placeholder="Enter additional product information in English..."
                              />
                            </div>
                          </AdminFormSection>
                        </div>
                      )}

                      {currentStep === "media" && (
                        <div className="space-y-8">
                          <AdminFormSection title="Primary Product Image">
                            <input
                              ref={mainImageInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleMainImageUpload}
                            />
                            <div className="grid gap-6 md:grid-cols-[300px_1fr]">
                              <div className="overflow-hidden rounded-lg border-2 border-dashed bg-muted/30">
                                {formData.image_url ? (
                                  <div className="flex h-60 w-full items-center justify-center bg-white/70">
                                    <img
                                      src={formData.image_url}
                                      alt="Primary"
                                      className="max-h-full max-w-full object-contain"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex h-60 w-full flex-col items-center justify-center gap-3 text-muted-foreground">
                                    <ImagePlus className="h-12 w-12" />
                                    <span className="text-sm font-medium">No image selected</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col gap-4">
                                <div className="flex flex-wrap items-center gap-3">
                                  <Button
                                    type="button"
                                    variant="default"
                                    onClick={() => mainImageInputRef.current?.click()}
                                    disabled={mainImageUploading}
                                    className="h-11"
                                  >
                                    <ImagePlus className="mr-2 h-4 w-4" />
                                    {mainImageUploading ? "Uploading..." : formData.image_url ? "Replace image" : "Upload image"}
                                  </Button>
                                  {formData.image_url && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => setFormData((prev) => ({ ...prev, image_url: "" }))}
                                      className="h-11"
                                    >
                                      <X className="mr-2 h-4 w-4" />
                                      Remove
                                    </Button>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="image_url" className="text-sm font-bold text-muted-foreground">
                                    Or paste an existing URL
                                  </Label>
                                  <Input
                                    id="image_url"
                                    value={formData.image_url}
                                    onChange={(event) => setFormData({ ...formData, image_url: event.target.value })}
                                    placeholder="https://example.com/image.jpg"
                                    className="h-11"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="video_url" className="text-sm font-bold text-foreground">
                                    Video URL (Optional)
                                  </Label>
                                  <Input
                                    id="video_url"
                                    value={formData.video_url}
                                    onChange={(event) => setFormData({ ...formData, video_url: event.target.value })}
                                    placeholder="https://youtube.com/... or https://www.facebook.com/..."
                                    className="h-11"
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Accepts full YouTube links, including <code className="font-mono text-[11px]">/watch</code>, <code className="font-mono text-[11px]">youtu.be</code>, or <code className="font-mono text-[11px]">/shorts</code> formats, as well as Facebook video URLs or <code className="font-mono text-[11px]">fb.watch</code> links.
                                  </p>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="video_description_en" className="text-sm font-bold text-foreground">
                                    Video Description (English)
                                  </Label>
                                  <Textarea
                                    id="video_description_en"
                                    value={formData.video_description_en}
                                    onChange={(event) =>
                                      setFormData({ ...formData, video_description_en: event.target.value })
                                    }
                                    rows={3}
                                    className="resize-none"
                                    placeholder="Add context that appears next to the embedded video..."
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
                              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
                                {formData.gallery_image_urls.map((url) => (
                                  <div key={url} className="group relative overflow-hidden rounded-lg border-2 bg-white/70">
                                    <div className="flex h-40 w-full items-center justify-center bg-muted/20">
                                      <img src={url} alt="Gallery" className="max-h-full max-w-full object-contain" />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveGalleryImage(url)}
                                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed bg-muted/20 p-12 text-muted-foreground">
                                <ImagePlus className="h-12 w-12" />
                                <span className="text-sm font-medium">No gallery images yet</span>
                              </div>
                            )}
                            <div className="flex flex-wrap items-center gap-3">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => galleryInputRef.current?.click()}
                                disabled={galleryUploading}
                                className="h-11"
                              >
                                <ImagePlus className="mr-2 h-4 w-4" />
                                {galleryUploading ? "Uploading..." : "Upload images"}
                              </Button>
                              <div className="flex flex-1 items-center gap-2">
                                <Input
                                  placeholder="Or paste image URL..."
                                  value={galleryUrlDraft}
                                  onChange={(event) => setGalleryUrlDraft(event.target.value)}
                                  className="h-11"
                                />
                                <Button
                                  type="button"
                                  variant="secondary"
                                  onClick={handleAddGalleryUrl}
                                  disabled={!galleryUrlDraft.trim()}
                                  className="h-11"
                                >
                                  Add
                                </Button>
                              </div>
                            </div>
                          </AdminFormSection>

                          <AdminFormSection title="Technical Specifications (JSON Format)">
                            <AdminFormFieldGrid>
                              <div className="space-y-3">
                                <Label htmlFor="specs_en" className="text-sm font-bold text-foreground">Specs (English)</Label>
                                <Textarea
                                  id="specs_en"
                                  value={formData.specs_en}
                                  onChange={(event) => setFormData({ ...formData, specs_en: event.target.value })}
                                  rows={8}
                                  placeholder='{"width": "120cm", "power": "50HP", "weight": "500kg"}'
                                  className="font-mono text-xs resize-none"
                                />
                              </div>
                              <div className="space-y-3">
                                <Label htmlFor="specs_ka" className="text-sm font-bold text-foreground">Specs (Georgian)</Label>
                                <Textarea
                                  id="specs_ka"
                                  value={formData.specs_ka}
                                  onChange={(event) => setFormData({ ...formData, specs_ka: event.target.value })}
                                  rows={8}
                                  placeholder='{"სიგანე": "120სმ", "სიმძლავრე": "50ცხ", "წონა": "500კგ"}'
                                  className="font-mono text-xs resize-none"
                                />
                              </div>
                            </AdminFormFieldGrid>
                            <AdminFormFieldGrid>
                              <div className="space-y-3">
                                <Label htmlFor="specs_hy" className="text-sm font-bold text-foreground">Specs (Armenian)</Label>
                                <Textarea
                                  id="specs_hy"
                                  value={formData.specs_hy}
                                  onChange={(event) => setFormData({ ...formData, specs_hy: event.target.value })}
                                  rows={8}
                                  placeholder='{"width": "120cm", "power": "50HP", "weight": "500kg"}'
                                  className="font-mono text-xs resize-none"
                                />
                              </div>
                            </AdminFormFieldGrid>
                          </AdminFormSection>
                        </div>
                      )}

                      {currentStep === "translations" && (
                        <div className="space-y-8">
                          <AdminFormSection title="Translation Language">
                            <div className="flex gap-3">
                              <Button
                                type="button"
                                variant={translationLang === "ka" ? "default" : "outline"}
                                onClick={() => setTranslationLang("ka")}
                                className="h-11"
                              >
                                Georgian (KA)
                              </Button>
                              <Button
                                type="button"
                                variant={translationLang === "hy" ? "default" : "outline"}
                                onClick={() => setTranslationLang("hy")}
                                className="h-11"
                              >
                                Armenian (HY)
                              </Button>
                              {hasRussianFields() && (
                                <Button
                                  type="button"
                                  variant={translationLang === "ru" ? "default" : "outline"}
                                  onClick={() => setTranslationLang("ru")}
                                  className="h-11"
                                >
                                  Russian (RU)
                                </Button>
                              )}
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={autofillAllFromEnglish}
                                className="h-11 ml-auto"
                              >
                                <Copy className="mr-2 h-4 w-4" />
                                Autofill all from English
                              </Button>
                            </div>
                          </AdminFormSection>

                          <AdminFormSection title={`Product Information (${translationLang.toUpperCase()})`}>
                            <div className="space-y-6">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor={`name_${translationLang}`} className="text-sm font-bold text-foreground">
                                    Name ({translationLang.toUpperCase()})
                                  </Label>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyFieldFromEnglish("name")}
                                    className="h-8 text-xs"
                                  >
                                    <Copy className="mr-1 h-3 w-3" />
                                    Copy from EN
                                  </Button>
                                </div>
                                <Input
                                  id={`name_${translationLang}`}
                                  value={translationLang === "ka" ? formData.name_ka : translationLang === "hy" ? formData.name_hy : (formData as Record<string, unknown>).name_ru as string || ""}
                                  onChange={(event) => {
                                    const key = `name_${translationLang}` as keyof ProductFormState;
                                    setFormData({ ...formData, [key]: event.target.value });
                                  }}
                                  className="h-11"
                                  placeholder={translationLang === "ka" ? "შეიყვანეთ პროდუქტის სახელი ქართულად" : translationLang === "hy" ? "Enter product name in Armenian" : "Введите название продукта на русском"}
                                />
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor={`slug_${translationLang}`} className="text-sm font-bold text-foreground">
                                    URL Slug ({translationLang.toUpperCase()})
                                  </Label>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyFieldFromEnglish("slug")}
                                    className="h-8 text-xs"
                                  >
                                    <Copy className="mr-1 h-3 w-3" />
                                    Copy from EN
                                  </Button>
                                </div>
                                <div className="flex gap-2">
                                  <Input
                                    id={`slug_${translationLang}`}
                                    value={translationLang === "ka" ? formData.slug_ka : translationLang === "hy" ? formData.slug_hy : (formData as Record<string, unknown>).slug_ru as string || ""}
                                    onChange={(event) => {
                                      const key = `slug_${translationLang}` as keyof ProductFormState;
                                      setFormData({ ...formData, [key]: event.target.value });
                                    }}
                                    placeholder={translationLang === "ka" ? "produktis-saxeli" : translationLang === "hy" ? "product-slug-hy" : "nazvanie-produkta"}
                                    className="h-11"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      const nameField = translationLang === "ka" ? formData.name_ka : translationLang === "hy" ? formData.name_hy : (formData as Record<string, unknown>).name_ru as string || "";
                                      const slugKey = `slug_${translationLang}` as keyof ProductFormState;
                                      setFormData({ ...formData, [slugKey]: generateSlug(nameField, translationLang === "ka") });
                                    }}
                                    disabled={!((translationLang === "ka" ? formData.name_ka : translationLang === "hy" ? formData.name_hy : (formData as Record<string, unknown>).name_ru as string || "").trim())}
                                    className="h-11"
                                  >
                                    Generate
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </AdminFormSection>

                          <AdminFormSection title={`Product Description (${translationLang.toUpperCase()})`}>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label htmlFor={`description_${translationLang}`} className="text-sm font-bold text-foreground">
                                  Description ({translationLang.toUpperCase()})
                                </Label>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyFieldFromEnglish("description")}
                                  className="h-8 text-xs"
                                >
                                  <Copy className="mr-1 h-3 w-3" />
                                  Copy from EN
                                </Button>
                              </div>
                              <RichTextEditor
                                id={`description_${translationLang}`}
                                value={translationLang === "ka" ? formData.description_ka : translationLang === "hy" ? formData.description_hy : (formData as Record<string, unknown>).description_ru as string || ""}
                                onChange={(value) => {
                                  const key = `description_${translationLang}` as keyof ProductFormState;
                                  setFormData({ ...formData, [key]: value });
                                }}
                                placeholder={translationLang === "ka" ? "შეიყვანეთ დეტალური აღწერა ქართულად..." : translationLang === "hy" ? "Enter detailed description in Armenian..." : "Введите подробное описание продукта на русском..."}
                              />
                            </div>
                          </AdminFormSection>

                          <AdminFormSection title={`Additional Information (${translationLang.toUpperCase()})`}>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label htmlFor={`additional_info_${translationLang}`} className="text-sm font-bold text-foreground">
                                  Additional Info ({translationLang.toUpperCase()})
                                </Label>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyFieldFromEnglish("additional_info")}
                                  className="h-8 text-xs"
                                >
                                  <Copy className="mr-1 h-3 w-3" />
                                  Copy from EN
                                </Button>
                              </div>
                              <RichTextEditor
                                id={`additional_info_${translationLang}`}
                                value={translationLang === "ka" ? formData.additional_info_ka : translationLang === "hy" ? formData.additional_info_hy : (formData as Record<string, unknown>).additional_info_ru as string || ""}
                                onChange={(value) => {
                                  const key = `additional_info_${translationLang}` as keyof ProductFormState;
                                  setFormData({ ...formData, [key]: value });
                                }}
                                placeholder={translationLang === "ka" ? "შეიყვანეთ დამატებითი ინფორმაცია ქართულად..." : translationLang === "hy" ? "Enter additional information in Armenian..." : "Введите дополнительную информацию на русском..."}
                              />
                            </div>
                          </AdminFormSection>

                          <AdminFormSection title={`Video Description (${translationLang.toUpperCase()})`}>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label htmlFor={`video_description_${translationLang}`} className="text-sm font-bold text-foreground">
                                  Video Description ({translationLang.toUpperCase()})
                                </Label>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyFieldFromEnglish("video_description")}
                                  className="h-8 text-xs"
                                >
                                  <Copy className="mr-1 h-3 w-3" />
                                  Copy from EN
                                </Button>
                              </div>
                              <Textarea
                                id={`video_description_${translationLang}`}
                                value={translationLang === "ka" ? formData.video_description_ka : translationLang === "hy" ? formData.video_description_hy : (formData as Record<string, unknown>).video_description_ru as string || ""}
                                onChange={(event) => {
                                  const key = `video_description_${translationLang}` as keyof ProductFormState;
                                  setFormData({ ...formData, [key]: event.target.value });
                                }}
                                rows={3}
                                className="resize-none"
                                placeholder={translationLang === "ka" ? "დამატეთ ტექსტი, რომელიც გამოჩნდება ვიდეოს გვერდით..." : translationLang === "hy" ? "Add text that appears next to the video in Armenian..." : "Добавьте текст, который появится рядом с видео..."}
                              />
                            </div>
                          </AdminFormSection>
                        </div>
                      )}
                    </AdminDialogBody>

                    <AdminDialogFooter>
                      {mode === "edit" && editingProduct && (
                        <Button type="button" variant="destructive" onClick={() => handleDelete(editingProduct.id)} className="h-11" disabled={isSaving}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete product
                        </Button>
                      )}
                      <div className="flex items-center gap-3 ml-auto">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleBack}
                          disabled={!canGoBack || isSaving}
                          className="h-11"
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                        <Button type="button" variant="ghost" onClick={handleReset} className="h-11" disabled={isSaving}>
                          Reset
                        </Button>
                        {currentStepIndex < steps.length - 1 && (
                          <Button
                            type="button"
                            onClick={handleNext}
                            disabled={!canGoNext || isSaving}
                            className="h-11"
                          >
                            Next
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        )}
                        <Button type="submit" size="lg" className="h-11 px-8" disabled={isSaving || !isBasicsStepValid()}>
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {mode === "edit" ? "Saving..." : "Creating..."}
                            </>
                          ) : (
                            <>
                              {mode === "edit" ? "Save changes" : "Create product"}
                            </>
                          )}
                        </Button>
                      </div>
                    </AdminDialogFooter>
                  </form>
                </AdminDialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_220px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by name, description, or keywords"
                className="pl-9"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/40 px-3 py-2">
              <div>
                <p id={featuredFilterLabelId} className="text-xs font-semibold uppercase text-muted-foreground">
                  Featured
                </p>
                <p id={featuredFilterDescriptionId} className="text-sm font-medium text-foreground">
                  {showFeaturedOnly ? "Only featured products" : "All products"}
                </p>
              </div>
              <Switch
                id="featured-toggle"
                aria-labelledby={featuredFilterLabelId}
                aria-describedby={featuredFilterDescriptionId}
                checked={showFeaturedOnly}
                onCheckedChange={(checked) => setShowFeaturedOnly(checked)}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="border-border/60 shadow-sm">
        <CardContent className="px-0">
          <ScrollArea className="max-h-[60vh]">
            <div className="min-w-full">
              <div className="sticky top-0 z-10 grid grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,80px)] gap-4 border-b border-border/60 bg-muted/60 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur">
                <span>Product</span>
                <span>Category</span>
                <span>Price</span>
                <span>Media</span>
                <span>Created</span>
                <span className="text-right">Actions</span>
              </div>

              {loading ? (
                <div className="space-y-2 px-6 py-4">
                  {[...Array(6)].map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredProducts.length ? (
                <div className="divide-y">
                  {filteredProducts.map((product) => {
                    const categoryNames = (product.categories ?? [])
                      .map((category) => category?.name_en)
                      .filter((name): name is string => Boolean(name));
                    const categoryName = categoryNames.length ? categoryNames.join(", ") : "Unassigned";
                    const createdOn = product.created_at ? new Date(product.created_at) : null;
                    const createdLabel = createdOn ? createdOn.toLocaleDateString() : "—";
                    const priceLabel =
                      typeof product.price === "number" ? priceFormatter.format(product.price) : "—";
                    const galleryImages = Array.isArray(product.gallery_image_urls)
                      ? product.gallery_image_urls.filter((item): item is string => typeof item === "string")
                      : [];
                    const galleryCount = galleryImages.length;

                    return (
                      <div
                        key={product.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleEdit(product)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            handleEdit(product);
                          }
                        }}
                        className="grid grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,80px)] items-center gap-4 px-6 py-4 text-sm transition hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted/20">
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.name_en}
                                  className="max-h-full max-w-full object-contain"
                                />
                              ) : (
                                <Package className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium text-foreground">{product.name_en}</span>
                                {product.is_featured && (
                                  <Badge variant="secondary" className="flex items-center gap-1 text-[10px] uppercase">
                                    <Star className="h-3 w-3 fill-current" />
                                    Featured
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1">{product.name_ka}</p>
                            </div>
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground">{categoryName}</div>

                        <div className="text-sm font-medium text-foreground">{priceLabel}</div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-[10px] uppercase">
                            {`${galleryCount} gallery`}
                          </Badge>
                          {product.image_url ? (
                            <Badge variant="secondary" className="text-[10px] uppercase">
                              Primary
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-[10px] uppercase">
                              Missing
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <BadgeCheck className="h-4 w-4" />
                          {createdLabel}
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleEdit(product);
                            }}
                            aria-label={`Edit ${product.name_en}`}
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
                              handleDelete(product.id);
                            }}
                            aria-label={`Delete ${product.name_en}`}
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
                    <Package className="h-8 w-8" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">No products match your filters</h3>
                  <p className="text-sm text-muted-foreground">
                    Adjust the search, remove filters, or add a new product to get started.
                  </p>
                  <div className="mt-4 flex justify-center">
                    <Button onClick={startCreate} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add product
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
