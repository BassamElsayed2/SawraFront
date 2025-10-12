import { createClient } from "@/services/supabase";

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
  async getAddresses(userId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    return { data, error };
  },

  async addAddress(userId: string, addressData: CreateAddressData) {
    const supabase = createClient();
    // If this is set as default, unset other defaults
    if (addressData.is_default) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", userId);
    }

    const { data, error } = await supabase
      .from("addresses")
      .insert({
        user_id: userId,
        ...addressData,
      })
      .select()
      .single();

    return { data, error };
  },

  async updateAddress(addressId: string, data: Partial<CreateAddressData>) {
    const supabase = createClient();
    // If this is set as default, unset other defaults
    if (data.is_default) {
      const { data: address } = await supabase
        .from("addresses")
        .select("user_id")
        .eq("id", addressId)
        .single();

      if (address) {
        await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", address.user_id);
      }
    }

    const { data: updatedAddress, error } = await supabase
      .from("addresses")
      .update(data)
      .eq("id", addressId)
      .select()
      .single();

    return { data: updatedAddress, error };
  },

  async deleteAddress(addressId: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", addressId);

    return { error };
  },

  async setDefaultAddress(addressId: string) {
    const supabase = createClient();
    // First get the user_id from the address
    const { data: address, error: fetchError } = await supabase
      .from("addresses")
      .select("user_id")
      .eq("id", addressId)
      .single();

    if (fetchError) {
      return { error: fetchError };
    }

    // Unset all other defaults for this user
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", address.user_id);

    // Set this address as default
    const { error } = await supabase
      .from("addresses")
      .update({ is_default: true })
      .eq("id", addressId);

    return { error };
  },
};
