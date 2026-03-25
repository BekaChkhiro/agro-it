"use client";

import { useEffect, useState } from "react";
import { Code2, Save, Plus, Trash2, Building2, MapPin, Clock, HelpCircle } from "lucide-react";

import { useSEOSettings, useUpdateSEOSettings } from "@/hooks/useSEOSettings";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  AdminFormFieldGrid,
  AdminFormSection,
  AdminTabsList,
  AdminTabsTrigger,
} from "@/components/admin/form/primitives";

type OrgSchema = {
  name: string;
  alternateName: string;
  description: string;
  logo: string;
  telephone: string;
  email: string;
  address_street: string;
  address_city: string;
  address_region: string;
  address_postal: string;
  address_country: string;
};

type LocalBizSchema = {
  type: string;
  telephone: string;
  latitude: string;
  longitude: string;
  priceRange: string;
  openingHours: string[];
};

type FAQItem = {
  question: string;
  answer: string;
};

const emptyOrg: OrgSchema = {
  name: "AGROIT",
  alternateName: "აგროით",
  description: "",
  logo: "",
  telephone: "",
  email: "",
  address_street: "",
  address_city: "Tbilisi",
  address_region: "",
  address_postal: "",
  address_country: "GE",
};

const emptyBiz: LocalBizSchema = {
  type: "Store",
  telephone: "",
  latitude: "",
  longitude: "",
  priceRange: "$$",
  openingHours: ["Mo-Fr 09:00-18:00", "Sa 10:00-15:00"],
};

function generateOrgJsonLd(org: OrgSchema) {
  return JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: org.name,
      alternateName: org.alternateName,
      description: org.description,
      logo: org.logo,
      telephone: org.telephone,
      email: org.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: org.address_street,
        addressLocality: org.address_city,
        addressRegion: org.address_region,
        postalCode: org.address_postal,
        addressCountry: org.address_country,
      },
    },
    null,
    2
  );
}

function generateBizJsonLd(biz: LocalBizSchema) {
  return JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      additionalType: biz.type,
      telephone: biz.telephone,
      geo: {
        "@type": "GeoCoordinates",
        latitude: biz.latitude,
        longitude: biz.longitude,
      },
      priceRange: biz.priceRange,
      openingHours: biz.openingHours,
    },
    null,
    2
  );
}

function generateFaqJsonLd(items: FAQItem[]) {
  return JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: items
        .filter((i) => i.question && i.answer)
        .map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
    },
    null,
    2
  );
}

export function SchemaOrgManager() {
  const { data: settings, isLoading } = useSEOSettings();
  const updateSettings = useUpdateSEOSettings();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("organization");
  const [org, setOrg] = useState<OrgSchema>(emptyOrg);
  const [biz, setBiz] = useState<LocalBizSchema>(emptyBiz);
  const [faqItems, setFaqItems] = useState<FAQItem[]>([{ question: "", answer: "" }]);
  const [showOrgPreview, setShowOrgPreview] = useState(false);
  const [showBizPreview, setShowBizPreview] = useState(false);
  const [showFaqPreview, setShowFaqPreview] = useState(false);

  useEffect(() => {
    if (settings) {
      const orgData = (settings.organization_schema || {}) as Record<string, unknown>;
      const bizData = (settings.local_business_schema || {}) as Record<string, unknown>;

      if (Object.keys(orgData).length > 0) {
        setOrg({
          name: (orgData.name as string) || emptyOrg.name,
          alternateName: (orgData.alternateName as string) || emptyOrg.alternateName,
          description: (orgData.description as string) || "",
          logo: (orgData.logo as string) || "",
          telephone: (orgData.telephone as string) || "",
          email: (orgData.email as string) || "",
          address_street: (orgData.address_street as string) || "",
          address_city: (orgData.address_city as string) || emptyOrg.address_city,
          address_region: (orgData.address_region as string) || "",
          address_postal: (orgData.address_postal as string) || "",
          address_country: (orgData.address_country as string) || "GE",
        });
      }

      if (Object.keys(bizData).length > 0) {
        setBiz({
          type: (bizData.type as string) || emptyBiz.type,
          telephone: (bizData.telephone as string) || "",
          latitude: (bizData.latitude as string) || "",
          longitude: (bizData.longitude as string) || "",
          priceRange: (bizData.priceRange as string) || "$$",
          openingHours: (bizData.openingHours as string[]) || emptyBiz.openingHours,
        });
      }

      if (orgData.faq_items) {
        setFaqItems(orgData.faq_items as FAQItem[]);
      }
    }
  }, [settings]);

  const updateOrg = (field: keyof OrgSchema, value: string) => {
    setOrg((prev) => ({ ...prev, [field]: value }));
  };

  const updateBiz = (field: keyof LocalBizSchema, value: string | string[]) => {
    setBiz((prev) => ({ ...prev, [field]: value }));
  };

  const addFaqItem = () => {
    setFaqItems((prev) => [...prev, { question: "", answer: "" }]);
  };

  const removeFaqItem = (index: number) => {
    setFaqItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFaqItem = (index: number, field: "question" | "answer", value: string) => {
    setFaqItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({
        organization_schema: { ...org, faq_items: faqItems },
        local_business_schema: biz as unknown as Record<string, unknown>,
      });
      toast({ title: "Saved", description: "Schema.org data updated." });
    } catch {
      toast({ title: "Error", description: "Failed to save.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Schema.org / Structured Data</h2>
          <p className="text-sm text-muted-foreground">Configure structured data for rich search results</p>
        </div>
        <Button onClick={handleSave} disabled={updateSettings.isPending}>
          <Save className="mr-2 h-4 w-4" />
          {updateSettings.isPending ? "Saving..." : "Save All"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <AdminTabsList>
          <AdminTabsTrigger value="organization">Organization</AdminTabsTrigger>
          <AdminTabsTrigger value="local_business">Local Business</AdminTabsTrigger>
          <AdminTabsTrigger value="faq">FAQ Schema</AdminTabsTrigger>
        </AdminTabsList>

        <TabsContent value="organization" className="space-y-6">
          <AdminFormSection title="Organization Info" icon={Building2}>
            <AdminFormFieldGrid columns={2}>
              <div className="space-y-2">
                <Label>Organization Name</Label>
                <Input value={org.name} onChange={(e) => updateOrg("name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Alternate Name</Label>
                <Input value={org.alternateName} onChange={(e) => updateOrg("alternateName", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={org.description} onChange={(e) => updateOrg("description", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input value={org.logo} onChange={(e) => updateOrg("logo", e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Telephone</Label>
                <Input value={org.telephone} onChange={(e) => updateOrg("telephone", e.target.value)} placeholder="+995..." />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={org.email} onChange={(e) => updateOrg("email", e.target.value)} />
              </div>
            </AdminFormFieldGrid>
          </AdminFormSection>

          <AdminFormSection title="Address" icon={MapPin}>
            <AdminFormFieldGrid columns={2}>
              <div className="space-y-2">
                <Label>Street Address</Label>
                <Input value={org.address_street} onChange={(e) => updateOrg("address_street", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={org.address_city} onChange={(e) => updateOrg("address_city", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Region</Label>
                <Input value={org.address_region} onChange={(e) => updateOrg("address_region", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Postal Code</Label>
                <Input value={org.address_postal} onChange={(e) => updateOrg("address_postal", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Country Code</Label>
                <Input value={org.address_country} onChange={(e) => updateOrg("address_country", e.target.value)} placeholder="GE" />
              </div>
            </AdminFormFieldGrid>
          </AdminFormSection>

          <Collapsible open={showOrgPreview} onOpenChange={setShowOrgPreview}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm">
                <Code2 className="mr-2 h-4 w-4" />
                {showOrgPreview ? "Hide" : "Show"} JSON-LD Preview
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <pre className="mt-3 overflow-auto rounded-lg bg-muted/50 p-4 text-xs">{generateOrgJsonLd(org)}</pre>
            </CollapsibleContent>
          </Collapsible>
        </TabsContent>

        <TabsContent value="local_business" className="space-y-6">
          <AdminFormSection title="Business Details" icon={Building2}>
            <AdminFormFieldGrid columns={2}>
              <div className="space-y-2">
                <Label>Business Type</Label>
                <Input value={biz.type} onChange={(e) => updateBiz("type", e.target.value)} placeholder="Store, Restaurant, etc." />
              </div>
              <div className="space-y-2">
                <Label>Telephone</Label>
                <Input value={biz.telephone} onChange={(e) => updateBiz("telephone", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Latitude</Label>
                <Input value={biz.latitude} onChange={(e) => updateBiz("latitude", e.target.value)} placeholder="41.7151" />
              </div>
              <div className="space-y-2">
                <Label>Longitude</Label>
                <Input value={biz.longitude} onChange={(e) => updateBiz("longitude", e.target.value)} placeholder="44.8271" />
              </div>
              <div className="space-y-2">
                <Label>Price Range</Label>
                <Input value={biz.priceRange} onChange={(e) => updateBiz("priceRange", e.target.value)} placeholder="$$" />
              </div>
            </AdminFormFieldGrid>
          </AdminFormSection>

          <AdminFormSection title="Opening Hours" icon={Clock}>
            <div className="space-y-3">
              {biz.openingHours.map((hours, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={hours}
                    onChange={(e) => {
                      const newHours = [...biz.openingHours];
                      newHours[i] = e.target.value;
                      updateBiz("openingHours", newHours);
                    }}
                    placeholder="Mo-Fr 09:00-18:00"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => updateBiz("openingHours", biz.openingHours.filter((_, idx) => idx !== i))}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateBiz("openingHours", [...biz.openingHours, ""])}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Hours
              </Button>
            </div>
          </AdminFormSection>

          <Collapsible open={showBizPreview} onOpenChange={setShowBizPreview}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm">
                <Code2 className="mr-2 h-4 w-4" />
                {showBizPreview ? "Hide" : "Show"} JSON-LD Preview
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <pre className="mt-3 overflow-auto rounded-lg bg-muted/50 p-4 text-xs">{generateBizJsonLd(biz)}</pre>
            </CollapsibleContent>
          </Collapsible>
        </TabsContent>

        <TabsContent value="faq" className="space-y-6">
          <AdminFormSection title="FAQ Items" icon={HelpCircle} description="Add frequently asked questions for rich search results">
            <div className="space-y-4">
              {faqItems.map((item, i) => (
                <Card key={i}>
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Q&A #{i + 1}</span>
                      <Button variant="ghost" size="icon" onClick={() => removeFaqItem(i)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label>Question</Label>
                      <Input
                        value={item.question}
                        onChange={(e) => updateFaqItem(i, "question", e.target.value)}
                        placeholder="Frequently asked question..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Answer</Label>
                      <Textarea
                        value={item.answer}
                        onChange={(e) => updateFaqItem(i, "answer", e.target.value)}
                        rows={2}
                        placeholder="Answer..."
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={addFaqItem}>
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </div>
          </AdminFormSection>

          <Collapsible open={showFaqPreview} onOpenChange={setShowFaqPreview}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm">
                <Code2 className="mr-2 h-4 w-4" />
                {showFaqPreview ? "Hide" : "Show"} JSON-LD Preview
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <pre className="mt-3 overflow-auto rounded-lg bg-muted/50 p-4 text-xs">{generateFaqJsonLd(faqItems)}</pre>
            </CollapsibleContent>
          </Collapsible>
        </TabsContent>
      </Tabs>
    </div>
  );
}
