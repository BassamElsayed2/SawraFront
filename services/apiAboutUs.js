import supabase from "./supabase";

export async function getAboutUs() {
  const { data: site_settings, error } = await supabase
    .from("site_settings")
    .select("*")
    .single();

  if (error) throw error;
  return site_settings;
}
