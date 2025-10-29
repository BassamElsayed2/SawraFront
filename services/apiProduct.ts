import apiClient from "./api-client";

export interface Product {
  id?: string;
  title_ar: string;
  title_en: string;
  description_ar?: string;
  description_en?: string;
  category_id: string;
  user_id: string;
  image_url?: string;
  created_at?: string;
}

export interface ProductType {
  id?: string;
  product_id: string;
  name_ar: string;
  name_en: string;
  created_at?: string;
}

export interface ProductSize {
  id?: string;
  type_id: string;
  size_ar: string;
  size_en: string;
  price: number;
  offer_price?: number;
  created_at?: string;
}

export interface ProductTypeWithSizes extends ProductType {
  sizes?: ProductSize[];
}

export interface ProductWithTypes extends Product {
  types?: ProductTypeWithSizes[];
}

export async function getProducts(
  page = 1,
  limit = 10,
  filters?: {
    categoryId?: string;
    branchId?: string;
    search?: string;
    date?: string;
  }
): Promise<{ products: ProductWithTypes[]; total: number }> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.categoryId) {
      params.append("category_id", filters.categoryId);
    }

    if (filters?.branchId) {
      params.append("branch_id", filters.branchId);
    }

    if (filters?.search) {
      params.append("search", filters.search);
    }

    if (filters?.date) {
      params.append("date", filters.date);
    }

    const response: any = await apiClient.get(`/products?${params.toString()}`);

    // Handle different possible response structures
    let products: ProductWithTypes[] = [];
    let total = 0;

    if (Array.isArray(response)) {
      // If response is directly an array
      products = response;
      total = response.length;
    } else if (response && typeof response === "object") {
      // If response is an object, try different possible structures
      if (Array.isArray(response.data)) {
        products = response.data;
        total = response.total || response.data.length;
      } else if (Array.isArray(response.products)) {
        products = response.products;
        total = response.total || response.products.length;
      } else if (response.data && Array.isArray(response.data.products)) {
        products = response.data.products;
        total = response.data.total || response.data.products.length;
      }
    }

    return {
      products,
      total,
    };
  } catch (error: any) {
    // Return empty array instead of throwing to prevent breaking the UI
    return {
      products: [],
      total: 0,
    };
  }
}

export async function getProductById(id: string): Promise<ProductWithTypes> {
  try {
    const response: any = await apiClient.get(`/products/${id}`);
    return response.data;
  } catch (error: any) {
    // Re-throw error to be handled by the caller
    throw error;
  }
}
