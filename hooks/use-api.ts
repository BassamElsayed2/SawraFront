// React Query Hooks for API calls
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api-client-rq";

// ============================================
// AUTH HOOKS
// ============================================

export function useAuth() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        const result = await api.auth.getMe();
        // Store in localStorage for persistent cache
        if (result?.data?.user) {
          localStorage.setItem(
            "user_cache",
            JSON.stringify({
              user: result.data.user,
              timestamp: Date.now(),
            })
          );
        }
        return result;
      } catch (error) {
        // If 401, user is not logged in - return null instead of throwing
        // Clear localStorage cache
        localStorage.removeItem("user_cache");
        return null;
      }
    },
    retry: false,
    staleTime: 30 * 60 * 1000, // 30 minutes - البيانات تفضل fresh لمدة 30 دقيقة
    gcTime: 60 * 60 * 1000, // 60 minutes - البيانات تفضل في الذاكرة لمدة ساعة
    refetchOnWindowFocus: false, // منع إعادة الجلب عند الرجوع للنافذة
    refetchOnMount: false, // منع إعادة الجلب عند mount إذا كانت البيانات fresh
    // Load from localStorage initially if available and recent
    initialData: () => {
      try {
        const cached = localStorage.getItem("user_cache");
        if (cached) {
          const { user, timestamp } = JSON.parse(cached);
          // Use cache if less than 30 minutes old
          if (Date.now() - timestamp < 30 * 60 * 1000) {
            return { data: { user } };
          }
        }
      } catch (e) {
        // Invalid cache, ignore
      }
      return undefined;
    },
    initialDataUpdatedAt: () => {
      try {
        const cached = localStorage.getItem("user_cache");
        if (cached) {
          const { timestamp } = JSON.parse(cached);
          return timestamp;
        }
      } catch (e) {
        // Invalid cache, ignore
      }
      return 0;
    },
  });
}

export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.auth.signIn(email, password),
    onSuccess: async () => {
      // Refetch auth query immediately and wait for it to complete
      await queryClient.refetchQueries({ queryKey: ["auth", "me"] });
    },
  });
}

export function useGoogleSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ idToken }: { idToken: string }) =>
      api.auth.googleSignIn(idToken),
    onSuccess: async () => {
      // Refetch auth query immediately and wait for it to complete
      await queryClient.refetchQueries({ queryKey: ["auth", "me"] });
    },
  });
}

export function useFacebookSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ accessToken }: { accessToken: string }) =>
      api.auth.facebookSignIn(accessToken),
    onSuccess: async () => {
      // Refetch auth query immediately and wait for it to complete
      await queryClient.refetchQueries({ queryKey: ["auth", "me"] });
    },
  });
}

export function useSignUp() {
  return useMutation({
    mutationFn: (data: {
      email: string;
      password: string;
      full_name: string;
      phone: string;
    }) => api.auth.signUp(data),
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.auth.signOut(),
    onSuccess: () => {
      // Clear all localStorage cache
      try {
        const cacheKeys = [
          "user_cache",
          "categories_cache",
          "branches_cache",
          "addresses_cache",
          "restaurant-cart", // Clear cart on logout
        ];
        cacheKeys.forEach((key) => localStorage.removeItem(key));

        // Clear all products and orders cache
        Object.keys(localStorage).forEach((key) => {
          if (
            key.startsWith("products_cache_") ||
            key.startsWith("product_") ||
            key.startsWith("orders_cache_")
          ) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        // Ignore storage errors
      }

      // Clear all queries on logout
      queryClient.clear();
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { full_name?: string; phone?: string }) =>
      api.auth.updateProfile(data),
    onSuccess: async () => {
      // Update localStorage cache
      try {
        const cached = localStorage.getItem("user_cache");
        if (cached) {
          const { user } = JSON.parse(cached);
          localStorage.setItem(
            "user_cache",
            JSON.stringify({
              user: { ...user, ...arguments[1] },
              timestamp: Date.now(),
            })
          );
        }
      } catch (e) {
        // Ignore cache update errors
      }
      // Refetch to get latest data from server
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({
      oldPassword,
      newPassword,
    }: {
      oldPassword: string;
      newPassword: string;
    }) => api.auth.changePassword(oldPassword, newPassword),
  });
}

// ============================================
// PRODUCTS HOOKS
// ============================================

export function useProducts(params?: {
  page?: number;
  limit?: number;
  category_id?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const result = await api.products.getAll(params);
      // Cache products in localStorage (with category filter)
      const cacheKey = `products_cache_${JSON.stringify(params || {})}`;
      try {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            data: result,
            timestamp: Date.now(),
          })
        );
      } catch (e) {
        // Ignore storage errors
      }
      return result;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - المنتجات fresh لمدة 15 دقيقة
    gcTime: 30 * 60 * 1000, // 30 minutes في الذاكرة
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    // Load from localStorage if available
    initialData: () => {
      const cacheKey = `products_cache_${JSON.stringify(params || {})}`;
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          // Use cache if less than 15 minutes old
          if (Date.now() - timestamp < 15 * 60 * 1000) {
            return data;
          }
        }
      } catch (e) {
        // Invalid cache
      }
      return undefined;
    },
    initialDataUpdatedAt: () => {
      const cacheKey = `products_cache_${JSON.stringify(params || {})}`;
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { timestamp } = JSON.parse(cached);
          return timestamp;
        }
      } catch (e) {
        // Invalid cache
      }
      return 0;
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: async () => {
      const result = await api.products.getById(id);
      // Cache single product
      try {
        localStorage.setItem(
          `product_${id}_cache`,
          JSON.stringify({
            data: result,
            timestamp: Date.now(),
          })
        );
      } catch (e) {
        // Ignore storage errors
      }
      return result;
    },
    enabled: !!id,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    initialData: () => {
      if (!id) return undefined;
      try {
        const cached = localStorage.getItem(`product_${id}_cache`);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < 15 * 60 * 1000) {
            return data;
          }
        }
      } catch (e) {
        // Invalid cache
      }
      return undefined;
    },
    initialDataUpdatedAt: () => {
      if (!id) return 0;
      try {
        const cached = localStorage.getItem(`product_${id}_cache`);
        if (cached) {
          const { timestamp } = JSON.parse(cached);
          return timestamp;
        }
      } catch (e) {
        // Invalid cache
      }
      return 0;
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => api.products.create(data),
    onSuccess: () => {
      // Clear products cache from localStorage
      try {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("products_cache_") || key.startsWith("product_")) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        // Ignore
      }
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.products.update(id, data),
    onSuccess: (_, variables) => {
      // Clear products cache from localStorage
      try {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("products_cache_") || key.startsWith("product_")) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        // Ignore
      }
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products", variables.id] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.products.delete(id),
    onSuccess: () => {
      // Clear products cache from localStorage
      try {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("products_cache_") || key.startsWith("product_")) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        // Ignore
      }
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// ============================================
// ORDERS HOOKS
// ============================================

export function useOrders(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: async () => {
      const result = await api.orders.getAll(params);
      // Cache orders
      const cacheKey = `orders_cache_${JSON.stringify(params || {})}`;
      try {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            data: result,
            timestamp: Date.now(),
          })
        );
      } catch (e) {
        // Ignore storage errors
      }
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - الطلبات fresh لمدة 5 دقائق
    gcTime: 15 * 60 * 1000, // 15 minutes في الذاكرة
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    initialData: () => {
      const cacheKey = `orders_cache_${JSON.stringify(params || {})}`;
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          // Use cache if less than 5 minutes old
          if (Date.now() - timestamp < 5 * 60 * 1000) {
            return data;
          }
        }
      } catch (e) {
        // Invalid cache
      }
      return undefined;
    },
    initialDataUpdatedAt: () => {
      const cacheKey = `orders_cache_${JSON.stringify(params || {})}`;
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { timestamp } = JSON.parse(cached);
          return timestamp;
        }
      } catch (e) {
        // Invalid cache
      }
      return 0;
    },
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => api.orders.getById(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => api.orders.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.orders.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", id] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.orders.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", variables.id] });
    },
  });
}

// ============================================
// UPLOAD HOOKS
// ============================================

export function useUploadImage() {
  return useMutation({
    mutationFn: ({
      file,
      bucket,
      folder,
    }: {
      file: File;
      bucket?: string;
      folder?: string;
    }) => api.upload.image(file, bucket, folder),
  });
}

export function useUploadBranchImage() {
  return useMutation({
    mutationFn: ({ file, folder }: { file: File; folder?: string }) =>
      api.upload.branchImage(file, folder),
  });
}

export function useUploadAvatarImage() {
  return useMutation({
    mutationFn: ({ file, folder }: { file: File; folder?: string }) =>
      api.upload.avatarImage(file, folder),
  });
}

export function useUploadProductImage() {
  return useMutation({
    mutationFn: ({ file, folder }: { file: File; folder?: string }) =>
      api.upload.productImage(file, folder),
  });
}

export function useUploadComboOfferImage() {
  return useMutation({
    mutationFn: ({ file, folder }: { file: File; folder?: string }) =>
      api.upload.comboOfferImage(file, folder),
  });
}

export function useUploadImages() {
  return useMutation({
    mutationFn: ({
      files,
      bucket,
      folder,
    }: {
      files: File[];
      bucket?: string;
      folder?: string;
    }) => api.upload.images(files, bucket, folder),
  });
}

export function useDeleteImage() {
  return useMutation({
    mutationFn: ({ bucket, path }: { bucket: string; path: string }) =>
      api.upload.deleteImage(bucket, path),
  });
}

// ============================================
// CATEGORIES HOOKS
// ============================================

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { getCategories } = await import("@/services/apiCategories");
      const result = await getCategories();
      // Cache categories
      try {
        localStorage.setItem(
          "categories_cache",
          JSON.stringify({
            data: result,
            timestamp: Date.now(),
          })
        );
      } catch (e) {
        // Ignore storage errors
      }
      return result;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - الفئات نادراً ما تتغير
    gcTime: 60 * 60 * 1000, // 60 minutes في الذاكرة
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    initialData: () => {
      try {
        const cached = localStorage.getItem("categories_cache");
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          // Use cache if less than 30 minutes old
          if (Date.now() - timestamp < 30 * 60 * 1000) {
            return data;
          }
        }
      } catch (e) {
        // Invalid cache
      }
      return undefined;
    },
    initialDataUpdatedAt: () => {
      try {
        const cached = localStorage.getItem("categories_cache");
        if (cached) {
          const { timestamp } = JSON.parse(cached);
          return timestamp;
        }
      } catch (e) {
        // Invalid cache
      }
      return 0;
    },
  });
}

// ============================================
// BRANCHES HOOKS
// ============================================

export function useBranches() {
  return useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const { getBranches } = await import("@/services/apiBranches");
      const result = await getBranches();
      // Cache branches
      try {
        localStorage.setItem(
          "branches_cache",
          JSON.stringify({
            data: result,
            timestamp: Date.now(),
          })
        );
      } catch (e) {
        // Ignore storage errors
      }
      return result;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - الفروع نادراً ما تتغير
    gcTime: 60 * 60 * 1000, // 60 minutes في الذاكرة
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    initialData: () => {
      try {
        const cached = localStorage.getItem("branches_cache");
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          // Use cache if less than 30 minutes old
          if (Date.now() - timestamp < 30 * 60 * 1000) {
            return data;
          }
        }
      } catch (e) {
        // Invalid cache
      }
      return undefined;
    },
    initialDataUpdatedAt: () => {
      try {
        const cached = localStorage.getItem("branches_cache");
        if (cached) {
          const { timestamp } = JSON.parse(cached);
          return timestamp;
        }
      } catch (e) {
        // Invalid cache
      }
      return 0;
    },
  });
}

// ============================================
// ADDRESSES HOOKS
// ============================================

export function useAddresses() {
  return useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const { addressesApi } = await import("@/services/apiAddresses");
      const result = await addressesApi.getAddresses();
      if (result.error) throw new Error(result.error.message);
      // Cache addresses
      try {
        localStorage.setItem(
          "addresses_cache",
          JSON.stringify({
            data: result.data,
            timestamp: Date.now(),
          })
        );
      } catch (e) {
        // Ignore storage errors
      }
      return result.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes في الذاكرة
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    initialData: () => {
      try {
        const cached = localStorage.getItem("addresses_cache");
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          // Use cache if less than 10 minutes old
          if (Date.now() - timestamp < 10 * 60 * 1000) {
            return data;
          }
        }
      } catch (e) {
        // Invalid cache
      }
      return undefined;
    },
    initialDataUpdatedAt: () => {
      try {
        const cached = localStorage.getItem("addresses_cache");
        if (cached) {
          const { timestamp } = JSON.parse(cached);
          return timestamp;
        }
      } catch (e) {
        // Invalid cache
      }
      return 0;
    },
  });
}
