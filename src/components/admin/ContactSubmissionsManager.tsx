import { useEffect, useMemo, useState } from "react";
import { Mail, Plus, Search, Trash2, Eye, MessageSquare, Phone, User, Calendar, CheckCircle2 } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { useContactSubmissions, useUpdateContactSubmission, useDeleteContactSubmission } from "@/hooks/useContactSubmissions";
import type { Database } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ContactSubmission = Database["public"]["Tables"]["contact_submissions"]["Row"];

const STATUS_OPTIONS = [
  { value: "new", label: "New", variant: "default" as const, icon: Mail },
  { value: "read", label: "Read", variant: "secondary" as const, icon: Eye },
  { value: "replied", label: "Replied", variant: "outline" as const, icon: MessageSquare },
  { value: "archived", label: "Archived", variant: "outline" as const, icon: CheckCircle2 },
];

export function ContactSubmissionsManager() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [viewingSubmission, setViewingSubmission] = useState<ContactSubmission | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const { data: submissions = [], isLoading: loading } = useContactSubmissions();
  const updateSubmission = useUpdateContactSubmission();
  const deleteSubmission = useDeleteContactSubmission();

  useEffect(() => {
    if (!sheetOpen) {
      setViewingSubmission(null);
    }
  }, [sheetOpen]);

  const filteredSubmissions = useMemo(() => {
    let filtered = [...submissions];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (submission) =>
          submission.name?.toLowerCase().includes(query) ||
          submission.email?.toLowerCase().includes(query) ||
          submission.phone?.toLowerCase().includes(query) ||
          submission.message?.toLowerCase().includes(query) ||
          submission.category?.toLowerCase().includes(query),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((submission) => submission.status === statusFilter);
    }

    return filtered;
  }, [submissions, searchQuery, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts = { new: 0, read: 0, replied: 0, archived: 0 };
    submissions.forEach((sub) => {
      if (sub.status && sub.status in counts) {
        counts[sub.status as keyof typeof counts]++;
      }
    });
    return counts;
  }, [submissions]);

  const resultsLabel = `${filteredSubmissions.length} of ${submissions.length} submissions`;

  const handleView = async (submission: ContactSubmission) => {
    setViewingSubmission(submission);
    setSheetOpen(true);

    // Mark as read if it's new
    if (submission.status === "new") {
      try {
        await updateSubmission.mutateAsync({
          id: submission.id,
          submissionData: { status: "read" },
        });
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!viewingSubmission) return;

    try {
      const updated = await updateSubmission.mutateAsync({
        id: viewingSubmission.id,
        submissionData: { status },
      });
      toast({ title: "Status updated", description: `Changed to ${status}.` });
      if (updated) {
        setViewingSubmission(updated as ContactSubmission);
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Could not update status.",
        variant: "destructive",
      });
    }
  };


  const handleDelete = async (submissionId: string) => {
    const submission = submissions.find((item) => item.id === submissionId);
    const confirmed = window.confirm(
      `Delete submission from "${submission?.name ?? "this contact"}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      await deleteSubmission.mutateAsync(submissionId);
      toast({ title: "Submission deleted", description: submission ? `${submission.name} removed.` : "Removed successfully." });
      setSheetOpen(false);
    } catch (error) {
      toast({
        title: "Deletion failed",
        description: error instanceof Error ? error.message : "Could not delete the submission.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string | null) => {
    const statusOption = STATUS_OPTIONS.find((opt) => opt.value === status);
    if (!statusOption) return null;
    const Icon = statusOption.icon;
    return (
      <Badge variant={statusOption.variant} className="flex items-center gap-1 text-[10px] uppercase">
        <Icon className="h-3 w-3" />
        {statusOption.label}
      </Badge>
    );
  };

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <div className="space-y-6">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Mail className="h-5 w-5" />
                  Contact Submissions
                </CardTitle>
                <CardDescription>
                  Manage and respond to customer inquiries and contact form submissions
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                  {resultsLabel}
                </Badge>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search by name, email, phone, or message"
                  className="pl-9"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses ({submissions.length})</SelectItem>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label} ({statusCounts[option.value as keyof typeof statusCounts]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="px-0">
            <div className="overflow-hidden">
              <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,80px)] gap-4 border-b border-border/60 bg-muted/40 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <span>Contact</span>
                <span>Category</span>
                <span>Submitted</span>
                <span>Status</span>
                <span className="text-right">Actions</span>
              </div>

              {loading ? (
                <div className="space-y-2 px-6 py-4">
                  {[...Array(6)].map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredSubmissions.length ? (
                <ScrollArea className="max-h-[60vh]">
                  <div className="divide-y">
                    {filteredSubmissions.map((submission) => {
                      const submittedDate = submission.created_at
                        ? new Date(submission.created_at).toLocaleDateString()
                        : "—";

                      return (
                        <div
                          key={submission.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleView(submission)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              handleView(submission);
                            }
                          }}
                          className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,80px)] items-center gap-4 px-6 py-4 text-sm transition hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{submission.name}</span>
                              {submission.status === "new" && (
                                <Badge variant="destructive" className="text-[9px]">
                                  NEW
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              {submission.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {submission.email}
                                </span>
                              )}
                              {submission.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {submission.phone}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1">{submission.message}</p>
                          </div>

                          <div className="text-sm text-muted-foreground">{submission.category || "—"}</div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {submittedDate}
                          </div>

                          <div>{getStatusBadge(submission.status)}</div>

                          <div className="flex items-center justify-end gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleView(submission);
                              }}
                              aria-label={`View ${submission.name}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDelete(submission.id);
                              }}
                              aria-label={`Delete ${submission.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <div className="px-6 py-12 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-muted-foreground/50 text-muted-foreground">
                    <Mail className="h-8 w-8" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">No submissions found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery || statusFilter !== "all"
                      ? "Try adjusting your search or filters."
                      : "Contact form submissions will appear here."}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <SheetContent side="right" className="w-full max-w-lg overflow-y-auto">
        {viewingSubmission && (
          <div className="flex h-full flex-col gap-6">
            <SheetHeader className="text-left">
              <SheetTitle>Contact Submission</SheetTitle>
              <SheetDescription>
                View and manage this contact form submission
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 space-y-6">
              <div className="space-y-4 rounded-lg border border-border/60 bg-muted/20 p-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Name</Label>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{viewingSubmission.name}</span>
                  </div>
                </div>

                {viewingSubmission.email && (
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground">Email</Label>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${viewingSubmission.email}`} className="text-primary hover:underline">
                        {viewingSubmission.email}
                      </a>
                    </div>
                  </div>
                )}

                {viewingSubmission.phone && (
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground">Phone</Label>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${viewingSubmission.phone}`} className="text-primary hover:underline">
                        {viewingSubmission.phone}
                      </a>
                    </div>
                  </div>
                )}

                {viewingSubmission.category && (
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground">Category</Label>
                    <Badge variant="outline">{viewingSubmission.category}</Badge>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Submitted</Label>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {viewingSubmission.created_at
                      ? new Date(viewingSubmission.created_at).toLocaleString()
                      : "—"}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Message</Label>
                <div className="rounded-md border border-border/60 bg-muted/10 p-3 text-sm">
                  {viewingSubmission.message}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-semibold">Status</Label>
                <Select value={viewingSubmission.status || "new"} onValueChange={handleStatusChange}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            </div>

            <SheetFooter className="gap-3">
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleDelete(viewingSubmission.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
              <Button type="button" variant="outline" onClick={() => setSheetOpen(false)}>
                Close
              </Button>
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
