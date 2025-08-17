import supabase from "./supabase";
import { PAGE_SIZE } from "../utils/constants";
import { formatISO, startOfDay, endOfDay } from "date-fns";
import { groupPapersBySubject } from "./../features/principal/groupPapersBySubject";

/**
 * getPapers
 * ---------
 * Fetches a paginated, grouped list of exam papers for the Principal.
 * - Supports dynamic filters (department, year, etc.), keyword search, and date-based selection.
 * - Always includes both "Locked" and "Downloaded" papers for that date,
 *   letting frontend show all download slots and disable downloaded ones.
 * - Groups papers so each row is a subject with its N slots (papers).
 * - Returns just the current page plus total count for pagination.
 */
export async function getPapers({ filters = [], search = "", page, date }) {
  // 1. Prepare the date range for the query (defaults to today if not provided)
  //    Format as ISO strings for Supabase range query
  const d = date ? new Date(date) : new Date();
  const start = formatISO(startOfDay(d));
  const end = formatISO(endOfDay(d));

  // 2. Build base Supabase query
  //    - Only select papers meeting date range AND
  //    - status IN ('Locked', 'Downloaded') so UI can show both available and already-touched slots
  let query = supabase
    .from("exam_papers")
    .select(
      "id,subject_code,subject_id,academic_year,department_name,is_downloaded,qp_file_url,exam_datetime,status"
    )
    .in("status", ["Locked", "Downloaded"])
    .gte("exam_datetime", start)
    .lte("exam_datetime", end);

  // 3. Apply dynamic filters (department, year, etc.)
  //    For each filter: query.eq(column, value)
  filters.forEach((filter) => {
    if (filter?.field && filter.value) {
      query = query.eq(filter.field, filter.value);
    }
  });

  // 4. Apply subject code search if provided by user
  //    ilike = case-insensitive partial match
  if (search && search.trim() !== "") {
    query = query.ilike("subject_code", `%${search.trim()}%`);
  }

  // 5. Execute the Supabase query (await the result)
  const { data, error } = await query;

  // 6. Handle Supabase errors clearly
  if (error) throw new Error("Papers could not be loaded!");

  // 7. Group papers by subject_code
  //    Each group represents a subject row holding all papers/slots for frontend table
  const grouped = groupPapersBySubject(data ?? []);

  // 8. Paginate results: only PAGE_SIZE "rows" (subject groups) per page
  const count = grouped.length; // total number of grouped subjects/rows for pagination
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE;
  const paged = grouped.slice(from, to);

  // 9. Return paginated group list and full count
  //    - data: paged list of grouped subjects for frontend table
  //    - count: total number of subject rows (for pagination controls)
  return { data: paged, count };
}

/**
 * downloadPaper
 * -------------
 * Marks one paper as "Downloaded" in the database.
 * - Sets 'is_downloaded' and 'downloaded_at'.
 * - Changes status to 'Downloaded' (so future queries can show disabled slots, but not hide them).
 * - Returns raw updated paper data for frontend to refresh state.
 */
export async function downloadPaper(downloaded_paper_id) {
  const { data, error } = await supabase
    .from("exam_papers")
    .update({
      is_downloaded: true,
      downloaded_at: new Date().toISOString(),
      status: "Downloaded", // marks this paper as downloaded so future fetches can show disabled UI
    })
    .eq("id", downloaded_paper_id)
    .select();

  if (error) {
    console.error("Failed to update exam_papers:", error);
    throw new Error("Could not record or mark download.");
  }

  return data; // Paper object with updated status/flags
}
