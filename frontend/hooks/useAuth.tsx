"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { login, register, getMe } from "@/lib/api/auth";
import { forgotPassword as apiForgotPassword, resetPassword as apiResetPassword } from "@/lib/api/users";
import type { LoginFormData, RegisterFormData, AuthResponse } from "@/lib/types/auth";
import { User } from "@/lib/types/user";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  signIn: (credentials: LoginFormData) => Promise<AuthResponse>;
  signUp: (data: RegisterFormData) => Promise<AuthResponse>;
  forgotPassword: (email: string) => Promise<{ message: string }>;
  resetPassword: (token: string, password: string) => Promise<{ token: string; user: User }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
          const user = await getMe(storedToken);
          setUser(user);
          setToken(storedToken);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error("Authentication check failed:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (credentials: LoginFormData): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await login(credentials);
      const { token, user } = response;
      setUser(user);
      setToken(token);
      setIsAuthenticated(true);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      return response;
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (data: RegisterFormData): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);
    try {
      console.log("register data", data);
      const response = await register(data);
      const { token, user } = response;
      setUser(user);
      setToken(token);
      setIsAuthenticated(true);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      return response;
      
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
    
  };

  const forgotPassword = async (email: string): Promise<{ message: string }> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiForgotPassword(email);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to send reset email");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, password: string): Promise<{ token: string; user: User }> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiResetPassword(token, password);
      const { token: newToken, user: updatedUser } = response;
      setUser(updatedUser);
      setToken(newToken);
      setIsAuthenticated(true);
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      router.push("/dashboard");
      return response;
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to reset password");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    router.push("/login");
  };

  const value = {
    user,
    token,
    loading,
    error,
    signIn,
    signUp,
    forgotPassword,
    resetPassword,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}