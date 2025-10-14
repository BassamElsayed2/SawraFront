import apiClient from "./api-client";

export interface Address {
  id: string;
  user_id: string;
  title: string;
  street: string;
  building: string;
  floor: string;
  apartment: string;
  city: string;
  area: string;
  latitude: number;
  longitude: number;
  notes: string;
  is_default: boolean;
  created_at: string;
}

export interface CreateAddressData {
  title: string;
  street: string;
  building?: string;
  floor?: string;
  apartment?: string;
  city: string;
  area: string;
  latitude: number;
  longitude: number;
  notes?: string;
  is_default?: boolean;
}

export const addressesApi = {
  async getAddresses() {
    try {
      const response: any = await apiClient.get("/addresses");
      // Backend returns { success: true, data: [...] }
      // So response.data contains the addresses array
      return { data: response.data || [], error: null };
    } catch (error: any) {
      return { data: [], error: { message: error.message } };
    }
  },

  async addAddress(addressData: CreateAddressData) {
    try {
      const response: any = await apiClient.post("/addresses", addressData);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  },

  async updateAddress(addressId: string, data: Partial<CreateAddressData>) {
    try {
      const response: any = await apiClient.put(
        `/addresses/${addressId}`,
        data
      );
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  },

  async deleteAddress(addressId: string) {
    try {
      await apiClient.delete(`/addresses/${addressId}`);
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },

  async setDefaultAddress(addressId: string) {
    try {
      await apiClient.patch(`/addresses/${addressId}/default`);
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },
};
