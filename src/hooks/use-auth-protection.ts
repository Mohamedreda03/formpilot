"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook to protect routes that require authentication
 * Redirects to home page if user is not authenticated
 * @param redirectTo - Optional custom redirect path (default: '/')
 * @returns { user, loading, isAuthenticated }
 */
export function useProtectedRoute(redirectTo: string = "/") {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  return {
    user,
    loading,
    isAuthenticated: !!user,
  };
}

/**
 * Hook to redirect authenticated users away from auth pages
 * @param redirectTo - Where to redirect authenticated users (default: '/ws/select')
 */
export function useRedirectIfAuthenticated(redirectTo: string = "/ws/select") {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  return {
    user,
    loading,
    isAuthenticated: !!user,
  };
}
