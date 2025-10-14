import apiClient from "./api-client";

export interface Branch {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  delivery_fee_per_km: number;
  max_delivery_distance: number;
}

export const deliveryApi = {
  async getBranches() {
    try {
      const response: any = await apiClient.get("/branches");
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  },

  async getNearestBranch(userLat: number, userLng: number) {
    try {
      const response: any = await apiClient.post("/delivery/nearest-branch", {
        latitude: userLat,
        longitude: userLng,
      });
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  },

  async calculateDeliveryFee(userLat: number, userLng: number) {
    try {
      const response: any = await apiClient.post("/delivery/calculate-fee", {
        latitude: userLat,
        longitude: userLng,
      });
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  },

  calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  },

  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  },
};
