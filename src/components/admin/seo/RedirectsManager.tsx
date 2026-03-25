"use client";

import { useState } from "react";
import { ArrowRight, Plus, Search, Trash2, Edit, Save, ToggleLeft, ToggleRight } from "lucide-react";

import { useRedirects, useCreateRedirect, useUpdateRedirect, useDeleteRedirect, useToggleRedirect } from "@/hooks/useRedirects";
import { useToast } from "@/hooks/use-toast";
import type { Redirect } from "@/types/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent } from "@/components/ui/tabs";
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

type RedirectForm = {
  from_path: string;
  to_path: string;
  status_code: string;
  is_regex: boolean;
  is_active: boolean;
  notes: string;
};

const emptyForm: RedirectForm = {
  from_path: "",
  to_path: "",
  status_code: "301",
  is_regex: false,
  is_active: true,
  notes: "",
};

export function RedirectsManager() {
  const { data: redirects, isLoading } = useRedirects();
  const createRedirect = useCreateRedirect();
  const updateRedirect = useUpdateRedirect();
  const deleteRedirect = useDeleteRedirect();
  const toggleRedirect = useToggleRedirect();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RedirectForm>(emptyForm);
  const [bulkText, setBulkText] = useState("");
  const [activeTab, setActiveTab] = useState<string>("single");

  const filtered = (redirects || []).filter(
    (r) => r.from_path.includes(search) || r.to_path.includes(search)
  );

  const updateField = (field: keyof RedirectForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setActiveTab("single");
    setDialogOpen(true);
  };

  const openEdit = (redirect: Redirect) => {
    setEditingId(redirect.id);
    setForm({
      from_path: redirect.from_path,
      to_path: redirect.to_path,
      status_code: String(redirect.status_code),
      is_regex: redirect.is_regex ?? false,
      is_active: redirect.is_active ?? true,
      notes: redirect.notes || "",
    });
    setActiveTab("single");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.from_path.trim() || !form.to_path.trim()) {
      toast({ title: "Error", description: "Both paths are required.", variant: "destructive" });
      return;
    }

    const payload = {
      from_path: form.from_path.trim(),
      to_path: form.to_path.trim(),
      status_code: parseInt(form.status_code),
      is_regex: form.is_regex,
      is_active: form.is_active,
      notes: form.notes || null,
    };

    try {
      if (editingId) {
        await updateRedirect.mutateAsync({ id: editingId, data: payload });
        toast({ title: "Updated", description: "Redirect updated." });
      } else {
        await createRedirect.mutateAsync(payload);
        toast({ title: "Created", description: "Redirect created." });
      }
      setDialogOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Operation failed";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const handleBulkImport = async () => {
    const lines = bulkText.split("\n").filter((l) => l.trim());
    let created = 0;
    let failed = 0;

    for (const line of lines) {
      const parts = line.split("->").map((s) => s.trim());
      if (parts.length !== 2 || !parts[0] || !parts[1]) {
        failed++;
        continue;
      }
      try {
        await createRedirect.mutateAsync({
          from_path: parts[0],
          to_path: parts[1],
          status_code: 301,
          is_regex: false,
          is_active: true,
          notes: null,
        });
        created++;
      } catch {
        failed++;
      }
    }

    toast({
      title: "Bulk Import Complete",
      description: `Created: ${created}, Failed: ${failed}`,
    });
    setBulkText("");
    setBulkDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this redirect?")) return;
    try {
      await deleteRedirect.mutateAsync(id);
      toast({ title: "Deleted", description: "Redirect removed." });
    } catch {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  const handleToggle = async (id: string, currentState: boolean) => {
    try {
      await toggleRedirect.mutateAsync({ id, is_active: !currentState });
    } catch {
      toast({ title: "Error", description: "Failed to toggle.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Redirects</h2>
          <p className="text-sm text-muted-foreground">{redirects?.length || 0} redirect rules</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setBulkDialogOpen(true)}>
            Bulk Import
          </Button>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Redirect
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search redirects..." className="pl-10" />
      </div>

      <div className="grid gap-3">
        {filtered.map((redirect) => (
          <Card key={redirect.id} className={`transition-shadow hover:shadow-md ${!redirect.is_active ? "opacity-50" : ""}`}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{redirect.from_path}</code>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{redirect.to_path}</code>
                </div>
                {redirect.notes && <p className="mt-1 text-xs text-muted-foreground">{redirect.notes}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={redirect.status_code === 301 ? "default" : "secondary"}>
                  {redirect.status_code}
                </Badge>
                {redirect.is_regex && <Badge variant="outline" className="text-xs">Regex</Badge>}
                {redirect.hit_count ? (
                  <span className="text-xs text-muted-foreground">{redirect.hit_count} hits</span>
                ) : null}
                <Button variant="ghost" size="icon" onClick={() => handleToggle(redirect.id, redirect.is_active ?? true)}>
                  {redirect.is_active ? <ToggleRight className="h-4 w-4 text-green-500" /> : <ToggleLeft className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(redirect)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(redirect.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">No redirects found</p>
        )}
      </div>

      {/* Single Redirect Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AdminDialogContent>
          <AdminDialogHeader>
            <DialogTitle>{editingId ? "Edit Redirect" : "Add Redirect"}</DialogTitle>
            <DialogDescription>Configure redirect rule</DialogDescription>
          </AdminDialogHeader>
          <AdminDialogBody>
            <div className="space-y-6">
              <AdminFormFieldGrid columns={2}>
                <div className="space-y-2">
                  <Label>From Path *</Label>
                  <Input value={form.from_path} onChange={(e) => updateField("from_path", e.target.value)} placeholder="/old-page" />
                </div>
                <div className="space-y-2">
                  <Label>To Path *</Label>
                  <Input value={form.to_path} onChange={(e) => updateField("to_path", e.target.value)} placeholder="/new-page" />
                </div>
              </AdminFormFieldGrid>
              <AdminFormFieldGrid columns={2}>
                <div className="space-y-2">
                  <Label>Status Code</Label>
                  <Select value={form.status_code} onValueChange={(v) => updateField("status_code", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="301">301 - Permanent</SelectItem>
                      <SelectItem value="302">302 - Temporary</SelectItem>
                      <SelectItem value="307">307 - Temporary (preserve method)</SelectItem>
                      <SelectItem value="308">308 - Permanent (preserve method)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input value={form.notes} onChange={(e) => updateField("notes", e.target.value)} placeholder="Optional note" />
                </div>
              </AdminFormFieldGrid>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_regex} onCheckedChange={(v) => updateField("is_regex", v)} />
                  <Label>Regex Pattern</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_active} onCheckedChange={(v) => updateField("is_active", v)} />
                  <Label>Active</Label>
                </div>
              </div>
            </div>
          </AdminDialogBody>
          <AdminDialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createRedirect.isPending || updateRedirect.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {editingId ? "Update" : "Create"}
            </Button>
          </AdminDialogFooter>
        </AdminDialogContent>
      </Dialog>

      {/* Bulk Import Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <AdminDialogContent>
          <AdminDialogHeader>
            <DialogTitle>Bulk Import Redirects</DialogTitle>
            <DialogDescription>One redirect per line: /old-path -&gt; /new-path</DialogDescription>
          </AdminDialogHeader>
          <AdminDialogBody>
            <Textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={10}
              placeholder={"/old-page -> /new-page\n/another-old -> /another-new"}
              className="font-mono text-sm"
            />
          </AdminDialogBody>
          <AdminDialogFooter>
            <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleBulkImport} disabled={!bulkText.trim()}>
              Import
            </Button>
          </AdminDialogFooter>
        </AdminDialogContent>
      </Dialog>
    </div>
  );
}
