// API Client with React Query - للاستخدام مع TanStack Query (React Query)

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface FetchOptions extends RequestInit {
  data?: any;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const { data, headers, ...customConfig } = options;

    const config: RequestInit = {
      method: data ? "POST" : "GET",
      ...customConfig,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      credentials: "include", // Include cookies for JWT
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return {} as T;
    }

    const result = await response.json();

    if (!response.ok) {
      // Handle validation errors with detailed messages
      if (result.errors && Array.isArray(result.errors)) {
        const errorMessages = result.errors
          .map((err: any) => `${err.field}: ${err.message}`)
          .join(", ");
        throw new Error(errorMessages || result.message || "Validation failed");
      }
      throw new Error(result.message || "API request failed");
    }

    return result;
  }

  async get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options?: FetchOptions
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "POST", data });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options?: FetchOptions
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PUT", data });
  }

  async delete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    options?: FetchOptions
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PATCH", data });
  }

  // Upload file with FormData
  async uploadFile(
    endpoint: string,
    file: File,
    additionalData?: Record<string, unknown>
  ): Promise<any> {
    const formData = new FormData();
    formData.append("image", file);

    if (additionalData) {
      Object.keys(additionalData).forEach((key) => {
        const value = additionalData[key];
        if (typeof value === "string" || value instanceof Blob) {
          formData.append(key, value);
        } else if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Upload failed");
    }

    return response.json();
  }
}

export const apiClient = new ApiClient(API_URL);

// Export typed functions for React Query
export const api = {
  // Auth
  auth: {
    signIn: (email: string, password: string) =>
      apiClient.post("/auth/signin", { email, password }),
    signUp: (data: {
      email: string;
      password: string;
      full_name: string;
      phone: string;
    }) => apiClient.post("/auth/signup", data),
    googleSignIn: (idToken: string) =>
      apiClient.post("/auth/google", { idToken }),
    signOut: () => apiClient.post("/auth/signout"),
    getMe: () => apiClient.get("/auth/me"),
    updateProfile: (data: { full_name?: string; phone?: string }) =>
      apiClient.put("/auth/profile", data),
    changePassword: (oldPassword: string, newPassword: string) =>
      apiClient.put("/auth/change-password", {
        old_password: oldPassword,
        new_password: newPassword,
      }),
  },

  // Products
  products: {
    getAll: (params?: {
      page?: number;
      limit?: number;
      category_id?: string;
      search?: string;
    }) => {
      const queryString = new URLSearchParams(
        params as Record<string, string>
      ).toString();
      return apiClient.get(`/products${queryString ? `?${queryString}` : ""}`);
    },
    getById: (id: string) => apiClient.get(`/products/${id}`),
    create: (data: any) => apiClient.post("/products", data),
    update: (id: string, data: any) => apiClient.put(`/products/${id}`, data),
    delete: (id: string) => apiClient.delete(`/products/${id}`),
  },

  // Orders
  orders: {
    getAll: (params?: { page?: number; limit?: number }) => {
      const queryString = new URLSearchParams(
        params as Record<string, string>
      ).toString();
      return apiClient.get(`/orders${queryString ? `?${queryString}` : ""}`);
    },
    getById: (id: string) => apiClient.get(`/orders/${id}`),
    create: (data: any) => apiClient.post("/orders", data),
    cancel: (id: string) => apiClient.put(`/orders/${id}/cancel`),
    updateStatus: (id: string, status: string) =>
      apiClient.put(`/orders/${id}/status`, { status }),
  },

  // Upload
  upload: {
    image: (file: File, bucket?: string, folder?: string) =>
      apiClient.uploadFile("/upload/image", file, { bucket, folder }),
    branchImage: (file: File, folder?: string) =>
      apiClient.uploadFile("/upload/branch-image", file, { folder }),
    avatarImage: (file: File, folder?: string) =>
      apiClient.uploadFile("/upload/image", file, {
        bucket: "AVATARS",
        folder,
      }),
    productImage: (file: File, folder?: string) =>
      apiClient.uploadFile("/upload/image", file, {
        bucket: "PRODUCT_IMAGES",
        folder,
      }),
    comboOfferImage: (file: File, folder?: string) =>
      apiClient.uploadFile("/upload/image", file, {
        bucket: "COMBO_OFFERS_MEDIA",
        folder,
      }),
    images: (files: File[], bucket?: string, folder?: string) =>
      Promise.all(
        files.map((file) =>
          apiClient.uploadFile("/upload/image", file, { bucket, folder })
        )
      ),
    deleteImage: (bucket: string, path: string) =>
      apiClient.delete("/upload/image", { data: { bucket, path } }),
  },
};

export default apiClient;
