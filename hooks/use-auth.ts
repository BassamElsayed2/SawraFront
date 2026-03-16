"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  signInThunk,
  signOutThunk,
  signUpThunk,
  updateProfileThunk,
} from "@/store/slices/auth-slice";

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  const signIn = async (email: string, password: string) => {
    await dispatch(signInThunk({ email, password })).unwrap();
  };

  const signUp = async (data: {
    email: string;
    password: string;
    full_name: string;
    phone: string;
  }) => {
    await dispatch(signUpThunk(data)).unwrap();
  };

  const signOut = async () => {
    await dispatch(signOutThunk()).unwrap();
  };

  const updateProfile = async (data: { full_name?: string; phone?: string }) => {
    await dispatch(updateProfileThunk(data)).unwrap();
  };

  const checkPhoneExists = async (phone: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/check-phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const result = await response.json();
      return { exists: result.data?.exists || false, error: null };
    } catch (e: any) {
      return { exists: false, error: { message: e?.message || "Unknown error" } };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const result = await response.json();
      if (!response.ok) {
        return { data: null, error: { message: result?.message || "Request failed" } };
      }
      return { data: result, error: null };
    } catch (e: any) {
      return { data: null, error: { message: e?.message || "Unknown error" } };
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    checkPhoneExists,
    resetPassword,
    error: error ? new Error(error) : null,
  };
}
