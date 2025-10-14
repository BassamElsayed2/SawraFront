import apiClient from "./api-client";

export async function getCategories() {
  try {
    const response: any = await apiClient.get("/categories");
    return response.data.categories;
  } catch (error) {
    // Re-throw error to be handled by the caller
    throw error;
  }
}

export async function getCategoryById(id: number) {
  try {
    const response: any = await apiClient.get(`/categories/${id}`);
    return response.data.category;
  } catch (error) {
    // Re-throw error to be handled by the caller
    throw error;
  }
}
