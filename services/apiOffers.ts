import apiClient from "./api-client";

export interface ComboOffer {
  id: string;
  title_ar: string;
  title_en: string;
  description_ar: string | null;
  description_en: string | null;
  image_url: string | null;
  price: number;
  original_price?: number | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active?: boolean;
  created_at: string;
}

export const getComboOffers = async (): Promise<ComboOffer[]> => {
  try {
    const response: any = await apiClient.get("/combo-offers");
    return response.data?.offers || [];
  } catch (error: any) {
    throw new Error(`Error fetching combo offers: ${error.message}`);
  }
};

// Get single combo offer by ID
export const getComboOfferById = async (id: string): Promise<ComboOffer> => {
  try {
    const response: any = await apiClient.get(`/combo-offers/${id}`);
    return response.data?.offer;
  } catch (error: any) {
    throw new Error(`Error fetching combo offer: ${error.message}`);
  }
};
