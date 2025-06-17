import supabase from "./supabase";

export async function getGalleries() {
  const { data, error } = await supabase.from("galleries").select("*"); 

  if (error) {
    console.error("فشل في جلب البيانات:", error.message);
    throw new Error("فشل في تحميل المعرض");
  }

  return data;
}


// get gallery by id

export async function getGalleriesById(id) {
  const { data, error } = await supabase
    .from("galleries")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
    if (!data) throw new Error("المعرض غير موجود");

  return data;
}