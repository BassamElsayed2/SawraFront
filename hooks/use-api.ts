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
        return await api.auth.getMe();
      } catch (error) {
        // If 401, user is not logged in - return null instead of throwing
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
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
    queryFn: () => api.products.getAll(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => api.products.getById(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => api.products.create(data),
    onSuccess: () => {
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
    queryFn: () => api.orders.getAll(params),
    staleTime: 1 * 60 * 1000, // 1 minute
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
    mutationFn: ({ file, folder }: { file: File; folder?: string }) =>
      api.upload.image(file, folder),
  });
}

export function useUploadImages() {
  return useMutation({
    mutationFn: ({ files, folder }: { files: File[]; folder?: string }) =>
      api.upload.images(files, folder),
  });
}

export function useDeleteImage() {
  return useMutation({
    mutationFn: (url: string) => api.upload.deleteImage(url),
  });
}
