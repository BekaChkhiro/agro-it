"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderTree,
  Package,
  Settings,
  LogOut,
  ShieldCheck,
  BookOpen,
  Trophy,
  Mail,
  Moon,
  Sun,
  Users,
} from "lucide-react";

import { CategoriesManager } from "@/components/admin/CategoriesManager";
import { ProductsManager } from "@/components/admin/ProductsManager";
import { BlogsManager } from "@/components/admin/BlogsManager";
import { SuccessStoriesManager } from "@/components/admin/SuccessStoriesManager";
import { ContactSubmissionsManager } from "@/components/admin/ContactSubmissionsManager";
import { Dashboard } from "@/components/admin/Dashboard";
import { TeamMembersManager } from "@/components/admin/TeamMembersManager";
import { CSVImport } from "@/components/admin/CSVImport";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";

type MenuView =
  | "dashboard"
  | "categories"
  | "products"
  | "blogs"
  | "success_stories"
  | "contact_submissions"
  | "team_members"
  | "settings";

type ThemeMode = "light" | "dark";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<MenuView>("dashboard");
  const [userEmail, setUserEmail] = useState<string>("");
  const initialRootDark = useRef<boolean | null>(null);
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("admin-theme");
      if (stored === "light" || stored === "dark") {
        return stored;
      }
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    }
    return "light";
  });
  const router = useRouter();
  const { toast } = useToast();

  const checkAdminStatus = useCallback(async () => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session) {
        router.push("/auth");
        return;
      }

      setUserEmail(session.user.email || "");

      const { data: roles, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleError) {
        throw roleError;
      }

      if (!roles) {
        toast({
          title: "Access denied",
          description: "Your account does not have administrator permissions.",
          variant: "destructive",
        });
        router.push("/");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Failed to verify admin session", error);
      toast({
        title: "Unable to verify access",
        description: "Please try again or contact an administrator if the issue persists.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [router, toast]);

  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (initialRootDark.current === null) {
      initialRootDark.current = root.classList.contains("dark");
    }
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    return () => {
      if (initialRootDark.current === null) return;
      if (initialRootDark.current) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("admin-theme", theme);
    }
  }, [theme]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Overview & KPIs" },
    { id: "categories", label: "Categories", icon: FolderTree, description: "Manage catalog structure" },
    { id: "products", label: "Products", icon: Package, description: "Maintain product content" },
    { id: "blogs", label: "Blogs", icon: BookOpen, description: "Manage blog posts" },
    { id: "success_stories", label: "Success Stories", icon: Trophy, description: "Customer success stories" },
    { id: "contact_submissions", label: "Contact Submissions", icon: Mail, description: "Customer inquiries & messages" },
    { id: "team_members", label: "Team Members", icon: Users, description: "Manage team member profiles" },
    { id: "settings", label: "CSV Import", icon: Settings, description: "Import categories & products from CSV" },
  ] satisfies Array<{ id: MenuView; label: string; icon: typeof LayoutDashboard; description: string }>;

  const activeItem = menuItems.find((item) => item.id === activeView);

  if (loading) {
    return (
      <div className={cn(theme === "dark" && "dark", "min-h-screen bg-background text-foreground")}>
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <div className="text-lg font-medium">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className={cn(theme === "dark" && "dark", "min-h-screen bg-background text-foreground")}>
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/20 px-3 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-sidebar-foreground/60">Agri Georgia Hub</p>
                <h1 className="text-base font-semibold text-sidebar-foreground">Admin Workspace</h1>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Management</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={activeView === item.id}
                        onClick={() => setActiveView(item.id)}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarSeparator />
          <SidebarFooter>
            <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/10 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-sm font-semibold uppercase text-primary">
                  {userEmail ? userEmail.charAt(0) : "A"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-sidebar-foreground">{userEmail}</p>
                  <p className="text-xs text-sidebar-foreground/70">Administrator</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 w-full gap-2"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
          <div className="flex min-h-screen flex-col">
            <header className="flex h-16 items-center justify-between border-b bg-background/70 px-6 backdrop-blur">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-muted-foreground" />
                <Separator orientation="vertical" className="h-6" />
                <div>
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                          <button
                            type="button"
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                            onClick={() => setActiveView("dashboard")}
                          >
                            Admin
                          </button>
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>{activeItem?.label}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                  <p className="text-sm text-muted-foreground">{activeItem?.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden text-right md:block">
                  <p className="text-sm font-medium text-foreground">{userEmail}</p>
                  <p className="text-xs text-muted-foreground">Secure session</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={toggleTheme}
                  className="relative rounded-full bg-background/80 shadow-soft hover:bg-background"
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  <span className="sr-only">Toggle theme</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout} className="md:hidden">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </header>

          <div className="border-b bg-background/60 backdrop-blur">
            <Tabs value={activeView} onValueChange={(value) => setActiveView(value as MenuView)} className="px-6">
              <TabsList className="h-11 gap-2 bg-transparent p-0">
                {menuItems.map((item) => (
                  <TabsTrigger
                    key={item.id}
                    value={item.id}
                    className={cn(
                      "gap-2 rounded-md px-4 py-2 text-sm font-medium",
                      "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                      "data-[state=inactive]:text-muted-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="px-6 py-8">
                {activeView === "dashboard" && <Dashboard />}
                {activeView === "categories" && <CategoriesManager />}
                {activeView === "products" && <ProductsManager />}
                {activeView === "blogs" && <BlogsManager />}
                {activeView === "success_stories" && <SuccessStoriesManager />}
                {activeView === "contact_submissions" && <ContactSubmissionsManager />}
                {activeView === "team_members" && <TeamMembersManager />}
                {activeView === "settings" && (
                  <CSVImport onImportComplete={() => {
                    // Import completed
                  }} />
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
