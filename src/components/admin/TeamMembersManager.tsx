import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Upload, ArrowUp, ArrowDown } from "lucide-react";
import {
  useTeamMembers,
  useCreateTeamMember,
  useUpdateTeamMember,
  useDeleteTeamMember,
  type TeamMember,
} from "@/hooks/useTeamMembers";
import { uploadImage } from "@/lib/storage";
import { Skeleton } from "@/components/ui/skeleton";

export const TeamMembersManager = () => {
  const { data: members, isLoading } = useTeamMembers();
  const createMember = useCreateTeamMember();
  const updateMember = useUpdateTeamMember();
  const deleteMember = useDeleteTeamMember();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name_en: "",
    name_ka: "",
    name_ru: "",
    name_hy: "",
    position_en: "",
    position_ka: "",
    position_ru: "",
    position_hy: "",
    image_url: "",
    email: "",
    phone: "",
    display_order: 0,
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImage(file, "team-members");
      setFormData({ ...formData, image_url: url });
    } catch (error) {
      console.error("Image upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingMember) {
      await updateMember.mutateAsync({ id: editingMember.id, ...formData });
    } else {
      await createMember.mutateAsync(formData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name_en: member.name_en,
      name_ka: member.name_ka,
      name_ru: member.name_ru || "",
      name_hy: (member as unknown as Record<string, unknown>).name_hy as string || "",
      position_en: member.position_en,
      position_ka: member.position_ka,
      position_ru: member.position_ru || "",
      position_hy: (member as unknown as Record<string, unknown>).position_hy as string || "",
      image_url: member.image_url || "",
      email: member.email || "",
      phone: member.phone || "",
      display_order: member.display_order,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this team member?")) {
      await deleteMember.mutateAsync(id);
    }
  };

  const handleReorder = async (member: TeamMember, direction: "up" | "down") => {
    const newOrder = direction === "up" ? member.display_order - 1 : member.display_order + 1;
    await updateMember.mutateAsync({ id: member.id, display_order: newOrder });
  };

  const resetForm = () => {
    setEditingMember(null);
    setFormData({
      name_en: "",
      name_ka: "",
      name_ru: "",
      name_hy: "",
      position_en: "",
      position_ka: "",
      position_ru: "",
      position_hy: "",
      image_url: "",
      email: "",
      phone: "",
      display_order: members?.length || 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Team Members</h2>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMember ? "Edit Team Member" : "Add New Team Member"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Profile Image</Label>
                <div className="flex items-center gap-4">
                  {formData.image_url && (
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </div>
              </div>

              <Tabs defaultValue="en" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="ka">ქართული</TabsTrigger>
                  <TabsTrigger value="ru">Русский</TabsTrigger>
                  <TabsTrigger value="hy">Հայերեն</TabsTrigger>
                </TabsList>

                <TabsContent value="en" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name_en">Name (English) *</Label>
                    <Input
                      id="name_en"
                      value={formData.name_en}
                      onChange={(e) =>
                        setFormData({ ...formData, name_en: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position_en">Position (English) *</Label>
                    <Input
                      id="position_en"
                      value={formData.position_en}
                      onChange={(e) =>
                        setFormData({ ...formData, position_en: e.target.value })
                      }
                      required
                    />
                  </div>
                </TabsContent>

                <TabsContent value="ka" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name_ka">სახელი (ქართული) *</Label>
                    <Input
                      id="name_ka"
                      value={formData.name_ka}
                      onChange={(e) =>
                        setFormData({ ...formData, name_ka: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position_ka">პოზიცია (ქართული) *</Label>
                    <Input
                      id="position_ka"
                      value={formData.position_ka}
                      onChange={(e) =>
                        setFormData({ ...formData, position_ka: e.target.value })
                      }
                      required
                    />
                  </div>
                </TabsContent>

                <TabsContent value="ru" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name_ru">Имя (Русский)</Label>
                    <Input
                      id="name_ru"
                      value={formData.name_ru}
                      onChange={(e) =>
                        setFormData({ ...formData, name_ru: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position_ru">Должность (Русский)</Label>
                    <Input
                      id="position_ru"
                      value={formData.position_ru}
                      onChange={(e) =>
                        setFormData({ ...formData, position_ru: e.target.value })
                      }
                    />
                  </div>
                </TabsContent>

                <TabsContent value="hy" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name_hy">Name (Armenian)</Label>
                    <Input
                      id="name_hy"
                      value={formData.name_hy}
                      onChange={(e) =>
                        setFormData({ ...formData, name_hy: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position_hy">Position (Armenian)</Label>
                    <Input
                      id="position_hy"
                      value={formData.position_hy}
                      onChange={(e) =>
                        setFormData({ ...formData, position_hy: e.target.value })
                      }
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({ ...formData, display_order: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {editingMember ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Team Members List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
                <Skeleton className="h-4 w-32 mx-auto mb-2" />
                <Skeleton className="h-3 w-24 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {members?.map((member) => (
            <Card key={member.id}>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <img
                    src={member.image_url || "/placeholder.svg"}
                    alt={member.name_en}
                    className="h-24 w-24 rounded-full object-cover border-4 border-primary"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{member.name_en}</h3>
                    <p className="text-sm text-muted-foreground">{member.position_en}</p>
                    {member.email && (
                      <p className="text-xs text-muted-foreground mt-1">{member.email}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReorder(member, "up")}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReorder(member, "down")}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(member)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};



