import supabase from "./supabase";

export async function getPapers({ filter, sortBy }) {
  let query = supabase.from("exam_papers").select("*");

  // // Filter
  // if (filter) query = query.eq(filter.field, filter.value);

  // // Sort
  // if (sortBy) {
  //   query = query.order(sortBy.field, {
  //     order: sortBy.direction,
  //   });
  // }

  const { data, error } = await query;

  if (error) {
    throw new Error("Papers could not be loaded!");
  }

  return data;
}

export async function getPaper(id) {
  const { data, error } = await supabase.from("exam_papers").select("*");
  console.log(data);

  if (error) {
    throw new Error("Paper not found!");
  }

  return data;
}

export async function getDepartments() {
  const { data, error } = await supabase.from("departments").select("*");

  if (error) {
    throw new Error("Departments could not be fetched!");
  }

  return data;
}
