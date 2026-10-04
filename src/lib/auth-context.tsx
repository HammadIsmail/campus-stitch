"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { JwtUserPayload } from "@/lib/jwt";

interface AuthContextType {
  user: JwtUserPayload | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: { email: string; password?: string; name?: string; studentId?: string; isDemo?: boolean }) => Promise<boolean>;
  signup: (data: {
    name: string;
    studentId: string;
    email: string;
    password?: string;
    code?: string;
    program?: string;
    hostel?: string;
    university?: string;
    department?: string;
    cnic?: string;
    expiryDate?: string;
    cardPhotoUrl?: string;
    avatarUrl?: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = React.useState<JwtUserPayload | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Check current session from /api/auth/me on mount
  const refreshAuth = React.useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUser(data.user);
            return;
          }
        }
      }

      // Check localStorage fallback if cookie isn't accessible
      const localStored = localStorage.getItem("campus_stitch_current_user");
      if (localStored) {
        const parsed = JSON.parse(localStored);
        setUser({
          userId: "u_" + (parsed.student_id || "demo").toLowerCase().replace(/[^a-z0-9]/g, "_"),
          email: parsed.email || "student@uet.edu.pk",
          name: parsed.name || "Muhammad Hammad",
          studentId: parsed.student_id || "2021-CS-104",
          role: parsed.email?.includes("admin") ? "admin" : "student",
          program: parsed.program || "BS Computer Science",
          isVerified: true,
          hostelBlock: parsed.hostel_block || "Hostel Block A",
        });
      } else {
        setUser(null);
      }
    } catch (err) {
      console.warn("Auth check failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const login = async (data: {
    email: string;
    password?: string;
    name?: string;
    studentId?: string;
    isDemo?: boolean;
  }) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Sign in failed");
      }

      if (result.success && result.user) {
        setUser(result.user);
        setToken(result.token);
        localStorage.setItem("campus_stitch_current_user", JSON.stringify(result.user));
        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: {
    name: string;
    studentId: string;
    email: string;
    password?: string;
    code?: string;
    program?: string;
    hostel?: string;
    university?: string;
    department?: string;
    cnic?: string;
    expiryDate?: string;
    cardPhotoUrl?: string;
    avatarUrl?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Registration failed");
      }

      if (result.success && result.user) {
        setUser(result.user);
        setToken(result.token);
        localStorage.setItem("campus_stitch_current_user", JSON.stringify(result.user));
        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
    } catch {}

    setUser(null);
    setToken(null);
    localStorage.removeItem("campus_stitch_current_user");
    router.push("/sign-in");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
