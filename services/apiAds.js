import supabase from "./supabase";

export async function getAds() {
  const { data, error } = await supabase.from("ads").select("*");

  if (error) {
    console.error("فشل في جلب البيانات:", error.message);
    throw new Error("فشل في تحميل الاعلانات");
  }

  return data;
}
