"use client";

import { useEffect, useState } from "react";
import { Bot, Save, RotateCcw } from "lucide-react";

import { useSEOSettings, useUpdateSEOSettings } from "@/hooks/useSEOSettings";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_ROBOTS_TXT = `# Robots.txt for AGROIT
User-agent: *
Allow: /

# Block tracking parameters
Disallow: /*?utm_*
Disallow: /*?fbclid=*
Disallow: /*?gclid=*
Disallow: /*?session_id=*
Disallow: /*?ref=*

# Block admin and auth pages
Disallow: /admin
Disallow: /auth

# Allow specific bots
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

# Sitemap
Sitemap: https://www.agroit.ge/sitemap.xml
`;

export function RobotsTxtEditor() {
  const { data: settings, isLoading } = useSEOSettings();
  const updateSettings = useUpdateSEOSettings();
  const { toast } = useToast();
  const [content, setContent] = useState("");

  useEffect(() => {
    if (settings) {
      setContent(settings.robots_txt_content || DEFAULT_ROBOTS_TXT);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({ robots_txt_content: content });
      toast({ title: "Saved", description: "robots.txt updated successfully." });
    } catch {
      toast({ title: "Error", description: "Failed to save robots.txt.", variant: "destructive" });
    }
  };

  const handleReset = () => {
    setContent(DEFAULT_ROBOTS_TXT);
  };

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Robots.txt Editor</h2>
          <p className="text-sm text-muted-foreground">Control which pages search engines can crawl</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Default
          </Button>
          <Button onClick={handleSave} disabled={updateSettings.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {updateSettings.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bot className="h-4 w-4" />
              Editor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              className="font-mono text-sm"
              spellCheck={false}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap rounded-lg bg-muted/50 p-4 text-sm">
              {content}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
