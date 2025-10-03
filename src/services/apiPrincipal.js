/**
 * Principal API Module
 *
 * Provides API functions for Principal-specific operations including:
 * - Retrieving and grouping examination papers by subject for daily downloads
 * - Managing paper download tracking and status updates
 * - Retrieving Controller of Examinations (CoE) user list
 *
 * Implements specialized date-based filtering and subject grouping for
 * the Principal's daily paper download workflow.
 *
 * @module apiPrincipal
 */

import supabase from "./supabase";
import { PAGE_SIZE } from "../utils/constants";
import { formatISO, startOfDay, endOfDay } from "date-fns";
import { groupPapersBySubject } from "./../features/principal/groupPapersBySubject";

/**
 * Fetches a paginated, grouped list of exam papers for Principal download workflow.
 *
 * Implements specialized logic for Principal's daily paper download interface:
 * - Filters papers by date range (defaults to current date)
 * - Includes both "Locked" (available) and "Downloaded" (already taken) papers
 * - Groups papers by subject_code to show all download slots per subject
 * - Supports department/year filtering and subject code search
 * - Returns paginated groups (each group = one subject with multiple paper slots)
 *
 * Frontend can use this to show all slots for a subject and disable downloaded ones
 * while keeping them visible for tracking purposes.
 *
 * @async
 * @param {Object} params - Query parameters
 * @param {Array<Object>} [params.filters=[]] - Array of filter objects with field and value properties
 * @param {string} [params.search=""] - Subject code search string (case-insensitive partial match)
 * @param {number} params.page - Page number for pagination (1-based)
 * @param {Date|string} [params.date] - Target date for paper retrieval (defaults to today)
 * @returns {Promise<Object>} Paginated grouped papers and total count
 * @returns {Array<Object>} returns.data - Array of grouped subject objects, each containing multiple paper slots
 * @returns {number} returns.count - Total count of subject groups (not individual papers)
 * @throws {Error} If papers cannot be loaded from database
 *
 * @example
 * const result = await getPapers({
 *   filters: [{ field: 'department_name', value: 'Computer Science' }],
 *   search: 'CS5',
 *   page: 1,
 *   date: '2025-10-03'
 * });
 * console.log(`Found ${result.count} subjects with papers today`);
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
 * Marks a specific exam paper as downloaded by the Principal.
 *
 * Updates the paper's download status in the database:
 * - Sets is_downloaded flag to true
 * - Records download timestamp
 * - Changes status to "Downloaded" to prevent duplicate downloads
 *
 * This enables tracking of which papers have been downloaded and allows
 * the UI to disable already-downloaded slots while keeping them visible.
 *
 * @async
 * @param {number} downloaded_paper_id - Unique identifier of the paper being downloaded
 * @returns {Promise<Array<Object>>} Updated paper object(s) from database
 * @throws {Error} If database update fails
 *
 * @example
 * const updatedPaper = await downloadPaper(789);
 * console.log(`Paper downloaded at: ${updatedPaper[0].downloaded_at}`);
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

/**
 * Retrieves paginated list of Controller of Examinations (CoE) users.
 *
 * Fetches active (non-deleted) users with CoE role for administrative
 * purposes and user management interfaces in Principal dashboard.
 *
 * @async
 * @param {Object} params - Query parameters
 * @param {number} [params.page] - Page number for pagination (1-based)
 * @returns {Promise<Object>} Paginated CoE users and total count
 * @returns {Array<Object>} returns.data - Array of CoE user objects (employee_id, username, department_name, role)
 * @returns {number} returns.count - Total count of active CoE users
 * @throws {Error} If users cannot be loaded from database
 *
 * @example
 * const result = await getCoE({ page: 1 });
 * console.log(`Found ${result.count} CoE users`);
 */
export async function getCoE({ page }) {
  let query = supabase
    .from("users")
    .select("employee_id, username, department_name, role", { count: "exact" })
    .eq("role", "CoE")
    .is("deleted_at", null);

  if (page) {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to);
  }

  // Execute the built query
  const { data, error, count } = await query;

  // Throw user-friendly error on any failure
  if (error) {
    throw new Error("Users could not be loaded!");
  }

  // Return paginated data and the total matching count
  return { data, count };
}
