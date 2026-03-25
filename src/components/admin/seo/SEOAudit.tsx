"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, XCircle, RefreshCw, Info } from "lucide-react";

import { usePageSEOList } from "@/hooks/usePageSEO";
import { useSEOSettings } from "@/hooks/useSEOSettings";
import { useRedirects } from "@/hooks/useRedirects";
import type { SEOIssue, SEOScoreResult } from "@/types/seo";
import { SEOScoreCard } from "./SEOScoreCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  AdminTabsList,
  AdminTabsTrigger,
} from "@/components/admin/form/primitives";

function runAudit(
  pages: Array<Record<string, unknown>>,
  settings: Record<string, unknown> | null,
  redirects: Array<Record<string, unknown>>
): SEOScoreResult {
  const issues: SEOIssue[] = [];
  const warnings: SEOIssue[] = [];
  const passed: SEOIssue[] = [];
  let totalChecks = 0;
  let passedChecks = 0;

  // Global settings checks
  totalChecks += 4;
  if (settings) {
    if (settings.google_verification) {
      passedChecks++;
      passed.push({ id: "g-verify", title: "Google Verification", description: "Google verification code is set.", severity: "info" });
    } else {
      warnings.push({ id: "g-verify", title: "Missing Google Verification", description: "No Google verification code configured.", severity: "warning" });
    }

    if (settings.google_analytics_id || settings.google_tag_manager_id) {
      passedChecks++;
      passed.push({ id: "analytics", title: "Analytics Configured", description: "Analytics tracking is set up.", severity: "info" });
    } else {
      warnings.push({ id: "analytics", title: "No Analytics", description: "No Google Analytics or GTM configured.", severity: "warning" });
    }

    if (settings.default_og_image) {
      passedChecks++;
      passed.push({ id: "og-default", title: "Default OG Image", description: "Default Open Graph image is set.", severity: "info" });
    } else {
      issues.push({ id: "og-default", title: "Missing Default OG Image", description: "No default Open Graph image configured.", severity: "error" });
    }

    const socialLinks = (settings.social_links || {}) as Record<string, string>;
    const filledSocials = Object.values(socialLinks).filter(Boolean);
    if (filledSocials.length >= 2) {
      passedChecks++;
      passed.push({ id: "social", title: "Social Links", description: `${filledSocials.length} social links configured.`, severity: "info" });
    } else {
      warnings.push({ id: "social", title: "Few Social Links", description: `Only ${filledSocials.length} social links configured. Add more for better SEO.`, severity: "warning" });
    }
  }

  // Page SEO checks
  for (const page of pages) {
    const slug = page.page_slug as string;
    totalChecks += 4;

    // Title check
    const titleKa = (page.title_ka as string) || "";
    const titleEn = (page.title_en as string) || "";

    if (!titleKa && !titleEn) {
      issues.push({
        id: `title-${slug}`,
        title: `Missing Title: /${slug}`,
        description: "No title set for either language.",
        severity: "error",
        entity: slug,
        entityType: "page",
      });
    } else {
      passedChecks++;
      if (titleEn && (titleEn.length < 30 || titleEn.length > 60)) {
        warnings.push({
          id: `title-len-${slug}`,
          title: `Title Length: /${slug}`,
          description: `English title is ${titleEn.length} chars (recommended: 30-60).`,
          severity: "warning",
          entity: slug,
          entityType: "page",
        });
      }
    }

    // Description check
    const descKa = (page.description_ka as string) || "";
    const descEn = (page.description_en as string) || "";

    if (!descKa && !descEn) {
      issues.push({
        id: `desc-${slug}`,
        title: `Missing Description: /${slug}`,
        description: "No meta description set.",
        severity: "error",
        entity: slug,
        entityType: "page",
      });
    } else {
      passedChecks++;
      if (descEn && (descEn.length < 70 || descEn.length > 160)) {
        warnings.push({
          id: `desc-len-${slug}`,
          title: `Description Length: /${slug}`,
          description: `English description is ${descEn.length} chars (recommended: 70-160).`,
          severity: "warning",
          entity: slug,
          entityType: "page",
        });
      }
    }

    // Keywords check
    if (page.keywords_ka || page.keywords_en) {
      passedChecks++;
    } else {
      warnings.push({
        id: `keywords-${slug}`,
        title: `Missing Keywords: /${slug}`,
        description: "No keywords configured.",
        severity: "warning",
        entity: slug,
        entityType: "page",
      });
    }

    // Sitemap check
    if (!page.exclude_from_sitemap) {
      passedChecks++;
    }
  }

  // Redirect chain check
  const redirectMap = new Map<string, string>();
  for (const r of redirects) {
    if (r.is_active) {
      redirectMap.set(r.from_path as string, r.to_path as string);
    }
  }
  for (const [from, to] of redirectMap) {
    if (redirectMap.has(to)) {
      totalChecks++;
      issues.push({
        id: `chain-${from}`,
        title: `Redirect Chain: ${from}`,
        description: `${from} -> ${to} -> ${redirectMap.get(to)} creates a chain.`,
        severity: "error",
      });
    }
  }

  // Duplicate title check
  const titleCounts = new Map<string, string[]>();
  for (const page of pages) {
    const titleEn = (page.title_en as string) || "";
    if (titleEn) {
      const existing = titleCounts.get(titleEn) || [];
      existing.push(page.page_slug as string);
      titleCounts.set(titleEn, existing);
    }
  }
  for (const [title, slugs] of titleCounts) {
    if (slugs.length > 1) {
      totalChecks++;
      warnings.push({
        id: `dup-title-${slugs[0]}`,
        title: "Duplicate Title",
        description: `"${title}" is used on pages: ${slugs.join(", ")}`,
        severity: "warning",
      });
    }
  }

  const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

  return { score, issues, warnings, passed };
}

export function SEOAudit() {
  const { data: pages, isLoading: pagesLoading } = usePageSEOList();
  const { data: settings, isLoading: settingsLoading } = useSEOSettings();
  const { data: redirects, isLoading: redirectsLoading } = useRedirects();

  const [activeTab, setActiveTab] = useState("overview");

  const isLoading = pagesLoading || settingsLoading || redirectsLoading;

  const audit = useMemo(() => {
    if (!pages) return null;
    return runAudit(
      pages as unknown as Array<Record<string, unknown>>,
      settings as unknown as Record<string, unknown> | null,
      (redirects || []) as unknown as Array<Record<string, unknown>>
    );
  }, [pages, settings, redirects]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!audit) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">SEO Audit</h2>
          <p className="text-sm text-muted-foreground">Health check for your site&apos;s SEO</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardContent className="flex items-center justify-center p-6">
            <SEOScoreCard score={audit.score} size="lg" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-6">
            <XCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold">{audit.issues.length}</p>
              <p className="text-sm text-muted-foreground">Errors</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-6">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{audit.warnings.length}</p>
              <p className="text-sm text-muted-foreground">Warnings</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-6">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{audit.passed.length}</p>
              <p className="text-sm text-muted-foreground">Passed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <AdminTabsList>
          <AdminTabsTrigger value="overview">All Issues ({audit.issues.length + audit.warnings.length})</AdminTabsTrigger>
          <AdminTabsTrigger value="errors">Errors ({audit.issues.length})</AdminTabsTrigger>
          <AdminTabsTrigger value="warnings">Warnings ({audit.warnings.length})</AdminTabsTrigger>
          <AdminTabsTrigger value="passed">Passed ({audit.passed.length})</AdminTabsTrigger>
        </AdminTabsList>

        <TabsContent value="overview" className="space-y-3">
          {[...audit.issues, ...audit.warnings].map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
          {audit.issues.length === 0 && audit.warnings.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">No issues found</p>
          )}
        </TabsContent>

        <TabsContent value="errors" className="space-y-3">
          {audit.issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
          {audit.issues.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">No errors found</p>
          )}
        </TabsContent>

        <TabsContent value="warnings" className="space-y-3">
          {audit.warnings.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
          {audit.warnings.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">No warnings found</p>
          )}
        </TabsContent>

        <TabsContent value="passed" className="space-y-3">
          {audit.passed.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function IssueCard({ issue }: { issue: SEOIssue }) {
  const icon =
    issue.severity === "error" ? <XCircle className="h-5 w-5 text-red-500" /> :
    issue.severity === "warning" ? <AlertTriangle className="h-5 w-5 text-yellow-500" /> :
    <CheckCircle2 className="h-5 w-5 text-green-500" />;

  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        {icon}
        <div className="min-w-0 flex-1">
          <p className="font-medium">{issue.title}</p>
          <p className="text-sm text-muted-foreground">{issue.description}</p>
        </div>
        {issue.entityType && (
          <Badge variant="outline" className="text-xs">{issue.entityType}</Badge>
        )}
      </CardContent>
    </Card>
  );
}
