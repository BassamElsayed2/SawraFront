"use server";

import { serverRequestWithApiKey } from "@/lib/server-request";

// ============================================
// TYPES
// ============================================

interface PaginationParams {
  page?: number;
  limit?: number;
}

interface ProductParams extends PaginationParams {
  category_id?: string;
  branch_id?: string;
  search?: string;
}

// ============================================
// AUTH ACTIONS
// ============================================

export async function getMe() {
  try {
    return await serverRequestWithApiKey<any>("/auth/me");
  } catch (error) {
    return null;
  }
}

export async function signIn(email: string, password: string) {
  return serverRequestWithApiKey<any>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function signUp(data: {
  email: string;
  password: string;
  full_name: string;
  phone: string;
}) {
  return serverRequestWithApiKey<any>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function signOut() {
  return serverRequestWithApiKey<any>("/auth/logout", {
    method: "POST",
  });
}

export async function updateProfile(data: { full_name?: string; phone?: string }) {
  return serverRequestWithApiKey<any>("/auth/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function changePassword(oldPassword: string, newPassword: string) {
  return serverRequestWithApiKey<any>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ oldPassword, newPassword }),
  });
}

export async function googleSignIn(idToken: string) {
  return serverRequestWithApiKey<any>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });
}

export async function facebookSignIn(accessToken: string) {
  return serverRequestWithApiKey<any>("/auth/facebook", {
    method: "POST",
    body: JSON.stringify({ accessToken }),
  });
}

// ============================================
// PRODUCTS ACTIONS
// ============================================

export async function getProducts(params?: ProductParams) {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page != null) queryParams.set("page", String(params.page));
    if (params?.limit != null) queryParams.set("limit", String(params.limit));
    if (params?.category_id) queryParams.set("category_id", params.category_id);
    if (params?.branch_id) queryParams.set("branch_id", params.branch_id);
    if (params?.search) queryParams.set("search", params.search);
    
    const query = queryParams.toString();
    const response = await serverRequestWithApiKey<any>(`/products${query ? `?${query}` : ""}`);
    
    // Handle different response structures
    let products = [];
    let total = 0;
    
    if (Array.isArray(response)) {
      products = response;
      total = response.length;
    } else if (response) {
      products = response.products || response.data?.products || response.data || [];
      total = response.total || response.data?.total || products.length;
    }
    
    return { products, total };
  } catch (error) {
    return { products: [], total: 0 };
  }
}

export async function getProductById(id: string) {
  return serverRequestWithApiKey<any>(`/products/${id}`);
}

/** Latest products (by created_at DESC). Use limit=10 for home. */
export async function getLatestProducts(
  limit: number = 10,
  branch_id?: string
) {
  const { products, total } = await getProducts({ limit, page: 1, branch_id });
  return { products, total };
}

/** Top products by order count. Only show when result has at least 10. */
export async function getBestsellers(limit: number = 10, branch_id?: string) {
  try {
    const queryParams = new URLSearchParams();
    queryParams.set("limit", String(limit));
    if (branch_id) queryParams.set("branch_id", branch_id);
    const data = await serverRequestWithApiKey<{ products: any[]; total: number }>(
      `/products/bestsellers?${queryParams.toString()}`
    );
    const products = data?.products ?? [];
    const total = data?.total ?? products.length;
    return { products, total };
  } catch {
    return { products: [], total: 0 };
  }
}

/** Combo offers for home (server-side). */
export async function getComboOffers() {
  try {
    const data = await serverRequestWithApiKey<{ offers?: any[] }>("/combo-offers");
    return Array.isArray(data?.offers) ? data.offers : [];
  } catch {
    return [];
  }
}

export async function createProduct(data: any) {
  return serverRequestWithApiKey<any>("/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProduct(id: string, data: any) {
  return serverRequestWithApiKey<any>(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id: string) {
  return serverRequestWithApiKey<any>(`/products/${id}`, {
    method: "DELETE",
  });
}

// ============================================
// CATEGORIES ACTIONS
// ============================================

export async function getCategories() {
  try {
    const response = await serverRequestWithApiKey<any>("/categories");
    // Handle different response structures
    return response?.categories || response?.data?.categories || response || [];
  } catch (error) {
    return [];
  }
}

export async function getCategoryById(id: string) {
  return serverRequestWithApiKey<any>(`/categories/${id}`);
}

export async function createCategory(data: any) {
  return serverRequestWithApiKey<any>("/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCategory(id: string, data: any) {
  return serverRequestWithApiKey<any>(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id: string) {
  return serverRequestWithApiKey<any>(`/categories/${id}`, {
    method: "DELETE",
  });
}

// ============================================
// BRANCHES ACTIONS
// ============================================

export async function getBranches() {
  try {
    const response = await serverRequestWithApiKey<any>("/branches");
    const branches = response?.branches || response || [];
    
    // Map image_url to image for compatibility with frontend
    if (Array.isArray(branches)) {
      return branches.map((branch: any) => ({
        ...branch,
        image: branch.image_url,
      }));
    }
    return [];
  } catch (error) {
    return [];
  }
}

export async function getBranchById(id: string) {
  return serverRequestWithApiKey<any>(`/branches/${id}`);
}

export async function createBranch(data: any) {
  return serverRequestWithApiKey<any>("/branches", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateBranch(id: string, data: any) {
  return serverRequestWithApiKey<any>(`/branches/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteBranch(id: string) {
  return serverRequestWithApiKey<any>(`/branches/${id}`, {
    method: "DELETE",
  });
}

// ============================================
// ORDERS ACTIONS
// ============================================

export async function getOrders(params?: PaginationParams) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set("page", params.page.toString());
  if (params?.limit) queryParams.set("limit", params.limit.toString());
  
  const query = queryParams.toString();
  return serverRequestWithApiKey<any>(`/orders${query ? `?${query}` : ""}`);
}

export async function getOrderById(id: string) {
  return serverRequestWithApiKey<any>(`/orders/${id}`);
}

export async function createOrder(data: any) {
  return serverRequestWithApiKey<any>("/orders", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function cancelOrder(id: string) {
  return serverRequestWithApiKey<any>(`/orders/${id}/cancel`, {
    method: "POST",
  });
}

export async function updateOrderStatus(id: string, status: string) {
  return serverRequestWithApiKey<any>(`/orders/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

// ============================================
// ADDRESSES ACTIONS
// ============================================

export async function getAddresses() {
  return serverRequestWithApiKey<any>("/addresses");
}

export async function getAddressById(id: string) {
  return serverRequestWithApiKey<any>(`/addresses/${id}`);
}

export async function createAddress(data: any) {
  return serverRequestWithApiKey<any>("/addresses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAddress(id: string, data: any) {
  return serverRequestWithApiKey<any>(`/addresses/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteAddress(id: string) {
  return serverRequestWithApiKey<any>(`/addresses/${id}`, {
    method: "DELETE",
  });
}

// ============================================
// UPLOAD ACTIONS (FormData)
// ============================================

export async function uploadImage(formData: FormData, bucket?: string, folder?: string) {
  if (bucket) formData.append("bucket", bucket);
  if (folder) formData.append("folder", folder);
  
  return serverRequestWithApiKey<any>("/upload/image", {
    method: "POST",
    body: formData,
    headers: {}, // Remove Content-Type to let browser set it with boundary
  });
}

export async function uploadImages(formData: FormData, bucket?: string, folder?: string) {
  if (bucket) formData.append("bucket", bucket);
  if (folder) formData.append("folder", folder);
  
  return serverRequestWithApiKey<any>("/upload/images", {
    method: "POST",
    body: formData,
    headers: {},
  });
}

export async function deleteImage(bucket: string, path: string) {
  return serverRequestWithApiKey<any>("/upload/delete", {
    method: "DELETE",
    body: JSON.stringify({ bucket, path }),
  });
}

// ============================================
// OFFERS / COMBO OFFERS ACTIONS
// ============================================

export async function getOffers(params?: PaginationParams) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set("page", params.page.toString());
  if (params?.limit) queryParams.set("limit", params.limit.toString());
  
  const query = queryParams.toString();
  return serverRequestWithApiKey<any>(`/offers${query ? `?${query}` : ""}`);
}

export async function getOfferById(id: string) {
  return serverRequestWithApiKey<any>(`/offers/${id}`);
}

export async function createOffer(data: any) {
  return serverRequestWithApiKey<any>("/offers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateOffer(id: string, data: any) {
  return serverRequestWithApiKey<any>(`/offers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteOffer(id: string) {
  return serverRequestWithApiKey<any>(`/offers/${id}`, {
    method: "DELETE",
  });
}

// ============================================
// PAYMENTS ACTIONS
// ============================================

export async function initiatePayment(data: {
  order_id: string;
  amount: number;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  currency?: string;
}) {
  return serverRequestWithApiKey<any>("/payments/initiate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function verifyPayment(paymentId: string) {
  return serverRequestWithApiKey<any>(`/payments/verify/${paymentId}`);
}

export async function getPaymentStatus(paymentId: string) {
  return serverRequestWithApiKey<any>(`/payments/status/${paymentId}`);
}

// ============================================
// DELIVERY ACTIONS
// ============================================

export async function calculateDeliveryFee(data: {
  user_latitude: number;
  user_longitude: number;
  branch_id?: string;
}) {
  return serverRequestWithApiKey<any>("/delivery/calculate-fee", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getNearestBranch(latitude: number, longitude: number) {
  return serverRequestWithApiKey<any>(`/delivery/nearest-branch?lat=${latitude}&lng=${longitude}`);
}
