import apiClient from "./api-client";

export const newAuthApi = {
  async signIn(email: string, password: string) {
    try {
      const response = await apiClient.post("/auth/signin", {
        email,
        password,
      });
      return { data: response, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  },

  async signUp(
    email: string,
    password: string,
    userData: { full_name: string; phone: string }
  ) {
    try {
      const response = await apiClient.post("/auth/signup", {
        email,
        password,
        ...userData,
      });
      return { data: response, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  },

  async signOut() {
    try {
      await apiClient.post("/auth/signout");
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },

  async getCurrentUser() {
    try {
      const response: any = await apiClient.get("/auth/me");
      return { user: response.data.user, error: null };
    } catch (error: any) {
      return { user: null, error: { message: error.message } };
    }
  },

  async updateProfile(
    userId: string,
    data: { full_name?: string; phone?: string }
  ) {
    try {
      await apiClient.put("/auth/profile", data);
      return { profile: data, error: null };
    } catch (error: any) {
      return { profile: null, error: { message: error.message } };
    }
  },

  async changePassword(oldPassword: string, newPassword: string) {
    try {
      await apiClient.put("/auth/change-password", {
        old_password: oldPassword,
        new_password: newPassword,
      });
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },

  async checkPhoneExists(phone: string) {
    try {
      // This endpoint needs to be implemented in backend
      const response: any = await apiClient.post("/auth/check-phone", {
        phone,
      });
      return { exists: response.data.exists, error: null };
    } catch (error: any) {
      return { exists: false, error: { message: error.message } };
    }
  },

  async googleSignIn(idToken: string) {
    try {
      const response = await apiClient.post("/auth/google", {
        idToken,
      });
      return { data: response, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  },
};
