// hooks/useAuth.ts
"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "./config";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  keyBalance: number;
  isVerified: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialCheck, setInitialCheck] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth-check`, {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
        setInitialCheck(true);
      }
    };
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setLoading(false); // Ensure loading is false after login

        // Redirect after successful login
        router.push("/");
        return data;
      }
    } catch (error) {
      console.error("Login error:", error);
      throw new Error("Login failed");
    }
    throw new Error("Login failed");
  };

  const register = async (
    email: string,
    password: string,
    role: string,
    fullName: string,
    description?: string,
    skills?: string[]
  ) => {
    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          role,
          name: fullName,
          ...(description && { description }),
          ...(skills && { skills }),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setLoading(false);
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw new Error("Registration failed");
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear user state, even if logout request fails
      setUser(null);
      setLoading(false);
    }
  };

  const requireAuth = useCallback(() => {
    if (initialCheck && !loading && !user) {
      router.push("/sign-in");
    }
  }, [initialCheck, loading, user, router]);

  const redirectIfAuth = useCallback(() => {
    if (initialCheck && !loading && user) {
      router.push("/");
    }
  }, [initialCheck, loading, user, router]);

  return {
    user,
    loading,
    initialCheck, // New flag to know if we've completed the first auth check
    isAuthenticated: !!user,
    login,
    logout,
    requireAuth,
    redirectIfAuth,
    // checkAuthStatus,
    register,
  };
}
