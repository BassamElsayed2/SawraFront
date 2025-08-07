import supabase from "./supabase";

export interface Branch {
  id: string;
  name_ar: string;
  name_en: string;
  phone: string;
  // Optional fields that might not exist in the database
  area_ar?: string;
  area_en?: string;
  address_ar?: string;
  address_en?: string;
  works_hours?: string;
  google_map?: string;
  image?: string;
  created_at?: string;
}

export async function getBranches() {
  try {
    // Try to get all fields, but handle missing ones gracefully
    const { data, error } = await supabase.from("branches").select("*");

    if (error) {
      console.error("فشل في جلب البيانات:", error.message);
      console.error("Error details:", error);

      // Return fallback data if table doesn't exist
      return [
        {
          id: "1",
          name_ar: "فرع وسط المدينة",
          name_en: "Downtown Branch",
          phone: "+966 50 123 4567",
          address_ar: "شارع الملك فهد، وسط المدينة",
          address_en: "King Fahd Street, Downtown",
          area_ar: "وسط المدينة",
          area_en: "Downtown",
          works_hours: "8:00 ص - 12:00 م",
          image: "/modern-downtown-restaurant.png",
          google_map: "https://maps.google.com",
        },
        {
          id: "2",
          name_ar: "فرع المول",
          name_en: "Mall Branch",
          phone: "+966 50 234 5678",
          address_ar: "مول الرياض بارك، الطابق الأول",
          address_en: "Riyadh Park Mall, First Floor",
          area_ar: "الرياض بارك",
          area_en: "Riyadh Park",
          works_hours: "10:00 ص - 11:00 م",
          image: "/modern-mall-restaurant.png",
          google_map: "https://maps.google.com",
        },
      ];
    }

    console.log("Branches data:", data); // For debugging
    return data || [];
  } catch (error) {
    console.error("Error in getBranches:", error);
    throw error;
  }
}
