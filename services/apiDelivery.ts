import { createClient } from "@/services/supabase";

const supabase = createClient();

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
    const { data, error } = await supabase.from("branches").select("*");

    return { data, error };
  },

  async getNearestBranch(userLat: number, userLng: number) {
    const { data: branches, error } = await this.getBranches();

    if (error || !branches) {
      return { data: null, error };
    }

    let nearestBranch = null;
    let minDistance = Infinity;

    for (const branch of branches) {
      const distance = this.calculateDistance(
        userLat,
        userLng,
        branch.latitude,
        branch.longitude
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestBranch = branch;
      }
    }

    return { data: nearestBranch, error: null };
  },

  async calculateDeliveryFee(userLat: number, userLng: number) {
    const { data: nearestBranch, error } = await this.getNearestBranch(
      userLat,
      userLng
    );

    if (error || !nearestBranch) {
      return { data: null, error };
    }

    const distance = this.calculateDistance(
      userLat,
      userLng,
      nearestBranch.latitude,
      nearestBranch.longitude
    );

    // Check if within delivery range
    if (distance > nearestBranch.max_delivery_distance) {
      return {
        data: {
          fee: 0,
          distance,
          available: false,
          message: "Outside delivery area",
        },
        error: null,
      };
    }

    const fee =
      Math.round(distance * nearestBranch.delivery_fee_per_km * 100) / 100;

    return {
      data: {
        fee,
        distance,
        available: true,
        branch: nearestBranch,
      },
      error: null,
    };
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


