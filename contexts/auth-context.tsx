"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { createClient } from "@/services/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface Profile {
  id: string;
  full_name: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    userData: { full_name: string; phone: string }
  ) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  checkPhoneExists: (phone: string) => Promise<{ exists: boolean; error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      }

      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("Auth state changed:", event, session?.user?.email);

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error };
    }

    // ✅ التحقق من أن المستخدم ليس admin
    if (data.user) {
      const { data: adminProfile } = await supabase
        .from("admin_profiles")
        .select("user_id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      // ❌ إذا المستخدم موجود في admin_profiles، منعه من الدخول
      if (adminProfile) {
        await supabase.auth.signOut();
        return {
          error: {
            message:
              "هذا الحساب مخصص للإدارة. يرجى استخدام لوحة التحكم للدخول.",
          },
        };
      }
    }

    return { error: null };
  };

  const signUp = async (
    email: string,
    password: string,
    userData: { full_name: string; phone: string }
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { error };
    }

    // Create profile record
    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: userData.full_name,
        phone: userData.phone,
      });

      if (profileError) {
        console.error("Error creating profile:", profileError);
        return { error: profileError };
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    try {
      // Clear state immediately before signing out
      setUser(null);
      setSession(null);
      setProfile(null);

      // Sign out from Supabase with scope 'local' to clear all sessions
      await supabase.auth.signOut({ scope: "local" });

      // Additional cleanup: Remove all Supabase-related cookies
      if (typeof document !== "undefined") {
        const cookies = document.cookie.split(";");
        for (const cookie of cookies) {
          const [name] = cookie.split("=");
          const cookieName = name.trim();
          // Remove Supabase auth cookies
          if (cookieName.includes("supabase") || cookieName.includes("sb-")) {
            document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${window.location.hostname}`;
            document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          }
        }
      }
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return { error: new Error("No user logged in") };

    const { error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", user.id);

    if (!error) {
      setProfile((prev) => (prev ? { ...prev, ...data } : null));
    }

    return { error };
  };

  const resetPassword = async (email: string) => {
    // Get current language from pathname
    const pathname = window.location.pathname;
    const lang = pathname.split("/")[1] || "ar"; // Default to 'ar'

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/${lang}/auth/reset-password`,
    });
    return { error };
  };

  const checkPhoneExists = async (phone: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("phone")
      .eq("phone", phone)
      .maybeSingle();

    return { exists: !!data, error };
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    checkPhoneExists,
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
