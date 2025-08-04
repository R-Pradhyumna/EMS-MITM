import supabase from "./supabase";
import { PAGE_SIZE } from "../utils/constants";
import { formatISO, startOfDay, endOfDay } from "date-fns";
import { groupPapersBySubject } from "./../features/principal/groupPapersBySubject";

export async function getPapers({ filters = [], search = "", page, date }) {
  // Compute day start and end in ISO
  const d = date ? new Date(date) : new Date();
  const start = formatISO(startOfDay(d));
  const end = formatISO(endOfDay(d));

  // Build the query - always chain SELECT before any filter
  let query = supabase
    .from("exam_papers")
    .select("*")
    .eq("status", "Locked")
    .gte("exam_datetime", start)
    .lte("exam_datetime", end);

  // Dynamic filters (must match actual column names in your table)
  filters.forEach((filter) => {
    if (filter?.field && filter.value) {
      query = query.eq(filter.field, filter.value);
    }
  });

  if (search && search.trim() !== "") {
    query = query.ilike("subject_code", `%${search.trim()}%`);
  }

  // Only now do you await the result!
  const { data, error } = await query;

  if (error) throw new Error("Papers could not be loaded!");

  // GROUP papers by subject_code
  const grouped = groupPapersBySubject(data ?? []);

  // PAGINATE the grouped results by subject row
  const count = grouped.length;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE;
  const paged = grouped.slice(from, to);

  return { data: paged, count };
}

export async function approvePaper(id, obj) {
  const { data, error } = await supabase
    .from("exam_papers")
    .update(obj)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error("Paper could not be locked!");
  }

  return data;
}
