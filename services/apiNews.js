import supabase from "./supabase";

export async function getNews() {
  const { data, error } = await supabase
    .from("news")
    .select(
      `
      *,
      category:categories(id, name_en, name_ar)
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// get news by id
export async function getNewsById(id) {
  const { data, error } = await supabase
    .from("news")
    .select(
      `
      *,
      category:categories(id, name_en, name_ar)
    `
    )
    .eq("id", id)
    .single(); // بيجيب عنصر واحد فقط

  if (error) throw error;
  if (!data) throw new Error("الخبر غير موجود");

  return data;
}
