"use client"

import React, { createContext, useContext, useState } from "react";
import { toast } from "sonner";
import { authAPI } from "@/lib/api";

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login(email, password);
      
      if (response.success && response.data) {
        setIsAuthenticated(true);
        
        // Get role from backend response
        const userData = response.data as { user?: { role?: string } };
        const role = userData.user?.role?.toLowerCase() || "student";
        setUserRole(role);
        
        toast.success("Logged in successfully");
        return true;
      } else {
        toast.error(response.error || "Login failed");
        return false;
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
      return false;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setIsAuthenticated(false);
      setUserRole(null);
      toast.info("Logged out successfully");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const response = await authAPI.changePassword(oldPassword, newPassword);
      
      if (response.success) {
        toast.success("Password changed successfully");
        return true;
      } else {
        toast.error(response.error || "Failed to change password");
        return false;
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
      return false;
    }
  };

  const value = {
    isAuthenticated,
    userRole,
    login,
    logout,
    changePassword
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
