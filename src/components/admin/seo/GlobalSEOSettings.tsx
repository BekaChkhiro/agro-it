"use client";

import { useEffect, useState } from "react";
import { Globe, Save, Building2, Share2, BarChart3 } from "lucide-react";

import { useSEOSettings, useUpdateSEOSettings } from "@/hooks/useSEOSettings";
import { useToast } from "@/hooks/use-toast";
import type { SEOSettings, SocialLinks } from "@/types/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AdminFormSection,
  AdminFormFieldGrid,
} from "@/components/admin/form/primitives";

type FormState = {
  site_name_ka: string;
  site_name_en: string;
  site_name_hy: string;
  default_description_ka: string;
  default_description_en: string;
  default_description_hy: string;
  default_keywords_ka: string;
  default_keywords_en: string;
  default_keywords_hy: string;
  default_og_image: string;
  google_verification: string;
  google_analytics_id: string;
  google_tag_manager_id: string;
  facebook_pixel_id: string;
  social_facebook: string;
  social_instagram: string;
  social_youtube: string;
  social_linkedin: string;
};

function createFormState(settings?: SEOSettings): FormState {
  const social = (settings?.social_links || {}) as SocialLinks;
  return {
    site_name_ka: settings?.site_name_ka || "",
    site_name_en: settings?.site_name_en || "",
    site_name_hy: settings?.site_name_hy || "",
    default_description_ka: settings?.default_description_ka || "",
    default_description_en: settings?.default_description_en || "",
    default_description_hy: settings?.default_description_hy || "",
    default_keywords_ka: settings?.default_keywords_ka || "",
    default_keywords_en: settings?.default_keywords_en || "",
    default_keywords_hy: settings?.default_keywords_hy || "",
    default_og_image: settings?.default_og_image || "",
    google_verification: settings?.google_verification || "",
    google_analytics_id: settings?.google_analytics_id || "",
    google_tag_manager_id: settings?.google_tag_manager_id || "",
    facebook_pixel_id: settings?.facebook_pixel_id || "",
    social_facebook: social.facebook || "",
    social_instagram: social.instagram || "",
    social_youtube: social.youtube || "",
    social_linkedin: social.linkedin || "",
  };
}

export function GlobalSEOSettings() {
  const { data: settings, isLoading } = useSEOSettings();
  const updateSettings = useUpdateSEOSettings();
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(createFormState());

  useEffect(() => {
    if (settings) setForm(createFormState(settings));
  }, [settings]);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({
        site_name_ka: form.site_name_ka,
        site_name_en: form.site_name_en,
        site_name_hy: form.site_name_hy || null,
        default_description_ka: form.default_description_ka || null,
        default_description_en: form.default_description_en || null,
        default_description_hy: form.default_description_hy || null,
        default_keywords_ka: form.default_keywords_ka || null,
        default_keywords_en: form.default_keywords_en || null,
        default_keywords_hy: form.default_keywords_hy || null,
        default_og_image: form.default_og_image || null,
        google_verification: form.google_verification || null,
        google_analytics_id: form.google_analytics_id || null,
        google_tag_manager_id: form.google_tag_manager_id || null,
        facebook_pixel_id: form.facebook_pixel_id || null,
        social_links: {
          facebook: form.social_facebook || undefined,
          instagram: form.social_instagram || undefined,
          youtube: form.social_youtube || undefined,
          linkedin: form.social_linkedin || undefined,
        },
      });
      toast({ title: "Settings saved", description: "Global SEO settings updated successfully." });
    } catch {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Global SEO Settings</h2>
          <p className="text-sm text-muted-foreground">Configure site-wide SEO defaults</p>
        </div>
        <Button onClick={handleSave} disabled={updateSettings.isPending}>
          <Save className="mr-2 h-4 w-4" />
          {updateSettings.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <AdminFormSection title="Site Identity" icon={Globe}>
        <AdminFormFieldGrid columns={2}>
          <div className="space-y-2">
            <Label>Site Name (Georgian)</Label>
            <Input value={form.site_name_ka} onChange={(e) => updateField("site_name_ka", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Site Name (English)</Label>
            <Input value={form.site_name_en} onChange={(e) => updateField("site_name_en", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Site Name (Armenian)</Label>
            <Input value={form.site_name_hy} onChange={(e) => updateField("site_name_hy", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Default OG Image URL</Label>
            <Input value={form.default_og_image} onChange={(e) => updateField("default_og_image", e.target.value)} placeholder="/og-default.jpg" />
          </div>
        </AdminFormFieldGrid>
      </AdminFormSection>

      <AdminFormSection title="Default Descriptions" icon={Globe}>
        <AdminFormFieldGrid columns={1}>
          <div className="space-y-2">
            <Label>Default Description (Georgian)</Label>
            <Textarea value={form.default_description_ka} onChange={(e) => updateField("default_description_ka", e.target.value)} rows={2} />
            <p className="text-xs text-muted-foreground">{form.default_description_ka.length}/160 characters</p>
          </div>
          <div className="space-y-2">
            <Label>Default Description (English)</Label>
            <Textarea value={form.default_description_en} onChange={(e) => updateField("default_description_en", e.target.value)} rows={2} />
            <p className="text-xs text-muted-foreground">{form.default_description_en.length}/160 characters</p>
          </div>
          <div className="space-y-2">
            <Label>Default Description (Armenian)</Label>
            <Textarea value={form.default_description_hy} onChange={(e) => updateField("default_description_hy", e.target.value)} rows={2} />
          </div>
        </AdminFormFieldGrid>
      </AdminFormSection>

      <AdminFormSection title="Default Keywords" icon={Globe}>
        <AdminFormFieldGrid columns={2}>
          <div className="space-y-2">
            <Label>Keywords (Georgian)</Label>
            <Input value={form.default_keywords_ka} onChange={(e) => updateField("default_keywords_ka", e.target.value)} placeholder="keyword1, keyword2" />
          </div>
          <div className="space-y-2">
            <Label>Keywords (English)</Label>
            <Input value={form.default_keywords_en} onChange={(e) => updateField("default_keywords_en", e.target.value)} placeholder="keyword1, keyword2" />
          </div>
          <div className="space-y-2">
            <Label>Keywords (Armenian)</Label>
            <Input value={form.default_keywords_hy} onChange={(e) => updateField("default_keywords_hy", e.target.value)} placeholder="keyword1, keyword2" />
          </div>
        </AdminFormFieldGrid>
      </AdminFormSection>

      <AdminFormSection title="Verification & Analytics" icon={BarChart3}>
        <AdminFormFieldGrid columns={2}>
          <div className="space-y-2">
            <Label>Google Verification Code</Label>
            <Input value={form.google_verification} onChange={(e) => updateField("google_verification", e.target.value)} placeholder="BjtK5MQIj7K..." />
          </div>
          <div className="space-y-2">
            <Label>Google Analytics ID</Label>
            <Input value={form.google_analytics_id} onChange={(e) => updateField("google_analytics_id", e.target.value)} placeholder="G-XXXXXXXXXX" />
          </div>
          <div className="space-y-2">
            <Label>Google Tag Manager ID</Label>
            <Input value={form.google_tag_manager_id} onChange={(e) => updateField("google_tag_manager_id", e.target.value)} placeholder="GTM-XXXXXXX" />
          </div>
          <div className="space-y-2">
            <Label>Facebook Pixel ID</Label>
            <Input value={form.facebook_pixel_id} onChange={(e) => updateField("facebook_pixel_id", e.target.value)} placeholder="XXXXXXXXXXXXXXXX" />
          </div>
        </AdminFormFieldGrid>
      </AdminFormSection>

      <AdminFormSection title="Social Links" icon={Share2}>
        <AdminFormFieldGrid columns={2}>
          <div className="space-y-2">
            <Label>Facebook</Label>
            <Input value={form.social_facebook} onChange={(e) => updateField("social_facebook", e.target.value)} placeholder="https://facebook.com/..." />
          </div>
          <div className="space-y-2">
            <Label>Instagram</Label>
            <Input value={form.social_instagram} onChange={(e) => updateField("social_instagram", e.target.value)} placeholder="https://instagram.com/..." />
          </div>
          <div className="space-y-2">
            <Label>YouTube</Label>
            <Input value={form.social_youtube} onChange={(e) => updateField("social_youtube", e.target.value)} placeholder="https://youtube.com/..." />
          </div>
          <div className="space-y-2">
            <Label>LinkedIn</Label>
            <Input value={form.social_linkedin} onChange={(e) => updateField("social_linkedin", e.target.value)} placeholder="https://linkedin.com/..." />
          </div>
        </AdminFormFieldGrid>
      </AdminFormSection>
    </div>
  );
}
