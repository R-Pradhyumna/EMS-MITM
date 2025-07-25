import supabase from "./supabase";
import { PAGE_SIZE } from "../utils/constants";

export async function getPapers({ filters = [], search = "", page }) {
  let query = supabase.from("exam_papers").select("*", { count: "exact" });

  // Filter
  filters.forEach((filter) => {
    if (filter?.field && filter.value) {
      query = query.eq(filter.field, filter.value);
    }
  });

  if (search && search.trim() !== "") {
    query = query.eq("subject_code", search.trim());
  }
  // if (filters) query = query.eq(filters.field, filters.value);

  if (page) {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error("Papers could not be loaded!");
  }

  return { data, count };
}

export async function getPaper(id) {
  const { data, error } = await supabase.from("exam_papers").select("*");
  console.log(data);

  if (error) {
    throw new Error("Paper not found!");
  }

  return { data, count };
}

export async function getDepartments() {
  const { data, error } = await supabase.from("departments").select("*");

  if (error) {
    throw new Error("Departments could not be fetched!");
  }

  return data;
}
