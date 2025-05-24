import supabase from "./supabase";

export async function getPapers() {
  const { data, error } = await supabase.from("examPapers").select("*");

  if (error) {
    throw new Error("Papers could not be loaded!");
  }
  return data;
}
