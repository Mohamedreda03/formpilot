"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { account } from "@/lib/appwrite";
import { Models, OAuthProvider } from "appwrite";

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
    } catch (error) {
      // No active session
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password);
      const currentUser = await account.get();
      setUser(currentUser);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      await account.create("unique()", email, password, name);
      await login(email, password);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      // Create OAuth2 session with Google
      account.createOAuth2Session(
        OAuthProvider.Google,
        `${window.location.origin}/dashboard`, // success redirect
        `${window.location.origin}/auth?error=google_auth_failed` // failure redirect
      );
    } catch (error) {
      console.error("Google login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  const value = {
    user,
    loading: !mounted || loading, // Keep loading true until mounted
    login,
    register,
    loginWithGoogle,
    logout,
  };

  // Prevent hydration mismatch by showing loading until mounted
  if (!mounted) {
    const fallbackValue = {
      user: null,
      loading: true,
      login,
      register,
      loginWithGoogle,
      logout,
    };
    return (
      <AuthContext.Provider value={fallbackValue}>
        {children}
      </AuthContext.Provider>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
