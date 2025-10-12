import { createClient } from "@/services/supabase";

const supabase = createClient();

export const authApi = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  async signUp(
    email: string,
    password: string,
    userData: { full_name: string; phone: string }
  ) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { data, error };
    }

    // Create profile record
    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: userData.full_name,
        phone: userData.phone,
      });

      if (profileError) {
        return { data: null, error: profileError };
      }
    }

    return { data, error: null };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return { user, error };
  },

  async updateProfile(
    userId: string,
    data: { full_name?: string; phone?: string }
  ) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", userId)
      .select()
      .single();

    return { profile, error };
  },

  async resetPassword(email: string) {
    // Get current language from pathname
    const pathname = window.location.pathname;
    const lang = pathname.split("/")[1] || "ar"; // Default to 'ar'

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/${lang}/auth/reset-password`,
    });
    return { error };
  },

  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({
      password,
    });
    return { error };
  },

  async checkPhoneExists(phone: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("phone")
      .eq("phone", phone)
      .maybeSingle();

    return { exists: !!data, error };
  },
};
