"use client";

import { useState } from "react";
import { Settings, FileText, ArrowRightLeft, Map, Bot, Code2, Activity } from "lucide-react";

import { GlobalSEOSettings } from "./GlobalSEOSettings";
import { PageSEOManager } from "./PageSEOManager";
import { RedirectsManager } from "./RedirectsManager";
import { SitemapManager } from "./SitemapManager";
import { RobotsTxtEditor } from "./RobotsTxtEditor";
import { SchemaOrgManager } from "./SchemaOrgManager";
import { SEOAudit } from "./SEOAudit";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  AdminTabsList,
  AdminTabsTrigger,
} from "@/components/admin/form/primitives";

type SEOTab = "global" | "pages" | "redirects" | "sitemap" | "robots" | "schema" | "audit";

export function SEOModule() {
  const [activeTab, setActiveTab] = useState<SEOTab>("global");

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SEOTab)}>
        <AdminTabsList columns={7}>
          <AdminTabsTrigger value="global">
            <Settings className="mr-2 h-4 w-4" />
            Global
          </AdminTabsTrigger>
          <AdminTabsTrigger value="pages">
            <FileText className="mr-2 h-4 w-4" />
            Pages
          </AdminTabsTrigger>
          <AdminTabsTrigger value="redirects">
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Redirects
          </AdminTabsTrigger>
          <AdminTabsTrigger value="sitemap">
            <Map className="mr-2 h-4 w-4" />
            Sitemap
          </AdminTabsTrigger>
          <AdminTabsTrigger value="robots">
            <Bot className="mr-2 h-4 w-4" />
            Robots.txt
          </AdminTabsTrigger>
          <AdminTabsTrigger value="schema">
            <Code2 className="mr-2 h-4 w-4" />
            Schema.org
          </AdminTabsTrigger>
          <AdminTabsTrigger value="audit">
            <Activity className="mr-2 h-4 w-4" />
            Audit
          </AdminTabsTrigger>
        </AdminTabsList>

        <TabsContent value="global">
          <GlobalSEOSettings />
        </TabsContent>
        <TabsContent value="pages">
          <PageSEOManager />
        </TabsContent>
        <TabsContent value="redirects">
          <RedirectsManager />
        </TabsContent>
        <TabsContent value="sitemap">
          <SitemapManager />
        </TabsContent>
        <TabsContent value="robots">
          <RobotsTxtEditor />
        </TabsContent>
        <TabsContent value="schema">
          <SchemaOrgManager />
        </TabsContent>
        <TabsContent value="audit">
          <SEOAudit />
        </TabsContent>
      </Tabs>
    </div>
  );
}
