import supabase from "./supabase";

export async function getBranches() {
  const { data, error } = await supabase.from("branches").select("*");

  if (error) {
    console.error("فشل في جلب البيانات:", error.message);
    throw new Error("فشل في تحميل الفروع");
  }

  return data;
}
