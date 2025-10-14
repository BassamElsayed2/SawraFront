"use client";

import { createContext, useContext, ReactNode } from "react";
import {
  useAuth as useAuthQuery,
  useSignIn,
  useSignUp,
  useSignOut,
  useUpdateProfile,
} from "@/hooks/use-api";

interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  email_verified: boolean;
  phone_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: {
    email: string;
    password: string;
    full_name: string;
    phone: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: {
    full_name?: string;
    phone?: string;
  }) => Promise<void>;
  checkPhoneExists: (phone: string) => Promise<{ exists: boolean; error: any }>;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Use React Query hooks
  const { data: authData, isLoading, error: queryError } = useAuthQuery();
  const signInMutation = useSignIn();
  const signUpMutation = useSignUp();
  const signOutMutation = useSignOut();
  const updateProfileMutation = useUpdateProfile();

  const user = authData?.data?.user || null;

  const signIn = async (email: string, password: string) => {
    try {
      await signInMutation.mutateAsync({ email, password });
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (data: {
    email: string;
    password: string;
    full_name: string;
    phone: string;
  }) => {
    try {
      await signUpMutation.mutateAsync(data);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await signOutMutation.mutateAsync();
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (data: {
    full_name?: string;
    phone?: string;
  }) => {
    try {
      await updateProfileMutation.mutateAsync(data);
    } catch (error) {
      throw error;
    }
  };

  const checkPhoneExists = async (phone: string) => {
    try {
      const response: any = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/check-phone`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phone }),
        }
      );
      const result = await response.json();
      return { exists: result.data?.exists || false, error: null };
    } catch (error: any) {
      return { exists: false, error: { message: error.message } };
    }
  };

  const value = {
    user,
    loading: isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    checkPhoneExists,
    error: queryError as Error | null,
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
