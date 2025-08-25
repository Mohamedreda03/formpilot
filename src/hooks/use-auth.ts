import { useEffect, useState } from "react";
import { account } from "@/lib/appwrite-config";
import { Models } from "appwrite";

export interface User extends Models.User<Models.Preferences> {}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await account.get();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();
      setUser(user);
      return user;
    } catch (error) {
      console.error("Login failed:", error);
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

  const register = async (email: string, password: string, name: string) => {
    try {
      await account.create("unique()", email, password, name);
      return await login(email, password);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  return {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user,
  };
};
