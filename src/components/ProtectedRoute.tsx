"use client";

import { ReactNode } from "react";
import { useProtectedRoute } from "@/hooks/use-auth-protection";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
  loadingMessage?: string;
}

/**
 * Component to protect routes that require authentication
 * Shows loading state while checking auth, redirects if not authenticated
 */
export function ProtectedRoute({
  children,
  fallback,
  redirectTo = "/",
  loadingMessage = "Checking authentication...",
}: ProtectedRouteProps) {
  const { user, loading } = useProtectedRoute(redirectTo);

  // Show loading while checking auth
  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">{loadingMessage}</p>
          </div>
        </div>
      )
    );
  }

  // If user is not authenticated, redirect will happen in useProtectedRoute
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
}
