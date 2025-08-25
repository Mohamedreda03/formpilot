"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { FirstTimeUserSetup } from "@/components/FirstTimeUserSetup";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, User, Settings } from "lucide-react";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute loadingMessage="Loading workspace...">
      <WorkspaceLayoutContent>{children}</WorkspaceLayoutContent>
    </ProtectedRoute>
  );
}

function WorkspaceLayoutContent({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();

  // Fix hydration issue
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get current workspace info from URL params
  const workspaceId = pathname.split("/")[2]; // Gets ID from /ws/[id]

  // Handle special routes like /ws/select
  if (pathname === "/ws/select") {
    return <div className="min-h-screen">{children}</div>;
  }

  // If no workspace ID and not on select page, don't render sidebar layout
  if (!workspaceId) {
    return <div className="min-h-screen">{children}</div>;
  }

  const selectedWorkspaceId = workspaceId;
  const currentWorkspaceName = "My Workspace"; // This would come from your data source

  const handleWorkspaceSelect = (workspaceId: string) => {
    router.push(`/ws/${workspaceId}`);
  };

  // Generate breadcrumb items based on pathname
  const generateBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean);
    const breadcrumbs = [{ name: "FormPilot.", href: "/ws" }];

    if (paths.length > 1) {
      for (let i = 1; i < paths.length; i++) {
        const path = "/" + paths.slice(0, i + 1).join("/");
        const name = paths[i].charAt(0).toUpperCase() + paths[i].slice(1);
        breadcrumbs.push({ name, href: path });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <FirstTimeUserSetup />
      {/* Top Navbar - Fixed with higher z-index */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 shrink-0 items-center justify-between border-b px-4 bg-background">
        <div className="flex items-center gap-2">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((breadcrumb, index) => (
                <React.Fragment key={breadcrumb.href}>
                  <BreadcrumbItem>
                    {index === breadcrumbs.length - 1 ? (
                      <BreadcrumbPage>{breadcrumb.name}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={breadcrumb.href}>
                        {breadcrumb.name}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Right side navbar: important links + user menu */}
        <div className="flex items-center gap-3">
          <nav className="hidden sm:flex items-center gap-4">
            <a href="/dashboard" className="text-sm hover:underline">
              Dashboard
            </a>
            <a href="/forms" className="text-sm hover:underline">
              Forms
            </a>
            <a href="/settings" className="text-sm hover:underline">
              Settings
            </a>
          </nav>

          <UserNav />
        </div>
      </header>

      {/* Content Area with top margin to account for fixed navbar */}
      <div className="flex flex-1 pt-16">
        <SidebarProvider>
          <AppSidebar
            onWorkspaceSelect={handleWorkspaceSelect}
            selectedWorkspaceId={selectedWorkspaceId}
            currentWorkspaceName={currentWorkspaceName}
          />
          <SidebarInset className="flex flex-1 flex-col">
            <main className="flex-1 p-6">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
}

function UserNav() {
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (!mounted) {
    return (
      <Button variant="ghost" className="h-9 w-9 p-0">
        <Avatar className="h-9 w-9">
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 w-9 p-0">
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
