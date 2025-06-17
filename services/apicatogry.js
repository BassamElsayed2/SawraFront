import supabase from "./supabase";

export async function getCategories() {
  const { data, error } = await supabase.from("categories").select("*");

  if (error) throw error;
  return data;
}

export async function getCategoryById(id) {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name_ar, name_en")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

