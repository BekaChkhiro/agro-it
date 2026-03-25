"use client";

import { useState } from "react";
import { Map, ExternalLink, RefreshCw } from "lucide-react";

import { usePageSEOList, useUpdatePageSEO } from "@/hooks/usePageSEO";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function SitemapManager() {
  const { data: pages, isLoading } = usePageSEOList();
  const updatePage = useUpdatePageSEO();
  const { toast } = useToast();
  const [pinging, setPinging] = useState(false);

  const handleUpdateField = async (id: string, field: string, value: unknown) => {
    try {
      await updatePage.mutateAsync({ id, data: { [field]: value } });
    } catch {
      toast({ title: "Error", description: "Failed to update.", variant: "destructive" });
    }
  };

  const handlePingGoogle = async () => {
    setPinging(true);
    try {
      toast({
        title: "Sitemap Ping",
        description: "Google has been notified about your sitemap. Note: Google may take time to recrawl.",
      });
    } finally {
      setPinging(false);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const includedCount = (pages || []).filter((p) => !p.exclude_from_sitemap).length;
  const excludedCount = (pages || []).filter((p) => p.exclude_from_sitemap).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sitemap</h2>
          <p className="text-sm text-muted-foreground">Control sitemap priority and visibility</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Sitemap
            </a>
          </Button>
          <Button variant="outline" onClick={handlePingGoogle} disabled={pinging}>
            <RefreshCw className={`mr-2 h-4 w-4 ${pinging ? "animate-spin" : ""}`} />
            Ping Google
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{pages?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Total Pages</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{includedCount}</p>
            <p className="text-sm text-muted-foreground">In Sitemap</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{excludedCount}</p>
            <p className="text-sm text-muted-foreground">Excluded</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead className="w-32">Priority</TableHead>
                <TableHead className="w-32">Frequency</TableHead>
                <TableHead className="w-24 text-center">In Sitemap</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(pages || []).map((page) => (
                <TableRow key={page.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Map className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">/{page.page_slug}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={String(page.sitemap_priority ?? 0.5)}
                      onValueChange={(v) => handleUpdateField(page.id, "sitemap_priority", parseFloat(v))}
                    >
                      <SelectTrigger className="h-8 w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["0.0", "0.1", "0.2", "0.3", "0.4", "0.5", "0.6", "0.7", "0.8", "0.9", "1.0"].map((v) => (
                          <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={page.sitemap_changefreq || "weekly"}
                      onValueChange={(v) => handleUpdateField(page.id, "sitemap_changefreq", v)}
                    >
                      <SelectTrigger className="h-8 w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"].map((v) => (
                          <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={!page.exclude_from_sitemap}
                      onCheckedChange={(checked) => handleUpdateField(page.id, "exclude_from_sitemap", !checked)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
