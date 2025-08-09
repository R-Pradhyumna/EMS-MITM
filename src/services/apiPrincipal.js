import supabase from "./supabase";
import { PAGE_SIZE } from "../utils/constants";
import { formatISO, startOfDay, endOfDay } from "date-fns";
import { groupPapersBySubject } from "./../features/principal/groupPapersBySubject";

// Gets a paginated, grouped list of Locked exam papers for a given day and filters
export async function getPapers({ filters = [], search = "", page, date }) {
  // 1. Prepare the date range for the query, as ISO strings
  //    - If date is supplied, use that. Otherwise, use today.
  const d = date ? new Date(date) : new Date();
  //    - Get the start and end of that day for querying papers on a specific day
  const start = formatISO(startOfDay(d));
  const end = formatISO(endOfDay(d));

  // 2. Build the base Supabase query for exam_papers
  //    - Select all columns ("*")
  //    - Only include "Locked" papers
  //    - Only include papers with 'exam_datetime' in the date range
  let query = supabase
    .from("exam_papers")
    .select("*")
    .eq("status", "Locked")
    .gte("exam_datetime", start)
    .lte("exam_datetime", end);

  // 3. Apply any additional dynamic filters (such as department, semester, etc.)
  //    - Each filter must specify a column (field) and value
  filters.forEach((filter) => {
    if (filter?.field && filter.value) {
      query = query.eq(filter.field, filter.value); // add to query chain
    }
  });

  // 4. If the user typed something in the search box, add a case-insensitive 'subject_code' match
  if (search && search.trim() !== "") {
    query = query.ilike("subject_code", `%${search.trim()}%`);
  }

  // 5. Actually run the query! Await the result from Supabase.
  const { data, error } = await query;

  // 6. Handle any errors from Supabase; throw if there's an error
  if (error) throw new Error("Papers could not be loaded!");

  // 7. Group the resulting papers (data array) by subject_code
  //    - This creates an array where each element is a "row", possibly with subarrays per subject_code
  const grouped = groupPapersBySubject(data ?? []);

  // 8. Paginate the grouped list, showing only PAGE_SIZE number of "rows"
  const count = grouped.length; // How many grouped items there are (for pagination UI)
  const from = (page - 1) * PAGE_SIZE; // Which index to start from, based on the page number
  const to = from + PAGE_SIZE; // Which index to end with
  const paged = grouped.slice(from, to); // Get just this page's items

  // 9. Return the paginated data and the total count to the caller (usually a React query hook/component)
  return { data: paged, count };
}

// Records that a principal-user has downloaded a specific paper for a subject on a given exam date
export async function downloadPaper(
  principal_employee_id, // The logged-in user's employee id (string)
  subject_id, // Which subject (int)
  exam_date, // The exam date (string or Date, expected in correct format)
  downloaded_paper_id // The id of the paper being downloaded
) {
  // 1. Try to insert a row in principal_paper_downloads
  //    - The table tracks (principal, subject, date, paper_downloaded)
  //    - This is used to enforce download lock: only one record per (principal, subject, exam_date) allowed
  const { data, error } = await supabase
    .from("principal_paper_downloads")
    .insert([
      {
        principal_employee_id,
        subject_id,
        exam_date,
        downloaded_paper_id,
      },
    ]);

  // 2. If Supabase returns an error, check what kind it is:
  if (error) {
    console.error("Supabase error:", error); // Log full error for debugging
    // a. If error.code is "23505", the unique constraint failed — principal already downloaded for that subject/date
    if (error.code === "23505") {
      // Postgres unique constraint violation
      throw new Error(
        "You have already downloaded a paper for this subject/exam."
      );
    }
    // b. Some other insert problem (data missing, foreign key, or server error)
    throw new Error("Could not record the download.");
  }

  // 3. If successful, return the data payload (may be undefined if RLS SELECT is not enabled, this is fine)
  return data;
}
