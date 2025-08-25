"use client";
import * as React from "react";
import { useState } from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AppSidebar } from "@/components/app-sidebar";
import { Bell, ChevronDown } from "lucide-react";

export default function FormsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedWorkspaceId, setSelectedWorkspaceId] =
    useState<string>("private");

  const handleWorkspaceSelect = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
    // Navigate to workspace or update URL
  };

  const handleLogout = () => {
    // Implement logout logic
  };

  return (
    <SidebarProvider>
      <AppSidebar
        onWorkspaceSelect={handleWorkspaceSelect}
        selectedWorkspaceId={selectedWorkspaceId}
        currentWorkspaceName="Private"
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Forms</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>My workspace</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/user.jpg" alt="User" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">User Name</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
