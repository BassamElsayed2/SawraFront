import { createClient } from "./supabase";

const supabase = createClient();

export interface ComboOffer {
  id: string;
  title_ar: string;
  title_en: string;
  description_ar: string | null;
  description_en: string | null;
  image_url: string | null;
  total_price: number;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

export const getComboOffers = async (): Promise<ComboOffer[]> => {
  const { data, error } = await supabase
    .from("combo_offers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Error fetching combo offers: ${error.message}`);
  }

  return data || [];
};

// Get single combo offer by ID
export const getComboOfferById = async (id: string): Promise<ComboOffer> => {
  const { data, error } = await supabase
    .from("combo_offers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Error fetching combo offer: ${error.message}`);
  }

  return data;
};
