/**
 * Principal API Module
 *
 * Provides API functions for Principal-specific operations including:
 * - Retrieving and grouping examination papers by subject for  downloads
 * - Managing paper download tracking and status updates
 * - Retrieving Controller of Examinations (CoE) user list
 *
 * Implements specialized date-based filtering and subject grouping for
 * the Principal's daily paper download workflow.
 *
 * @module apiPrincipal
 */

import { endOfDay, formatISO, startOfDay } from "date-fns";
import { PAGE_SIZE } from "../utils/constants";
import { groupPapersBySubject } from "./../features/principal/groupPapersBySubject";
import supabase from "./supabase";

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
 * Date handling:
 * - Uses date-fns to create full day range (00:00:00 to 23:59:59)
 * - Ensures all papers scheduled for that day are included
 * - Defaults to current date if not specified
 *
 * Grouping logic:
 * - Papers are grouped by subject_code via groupPapersBySubject utility
 * - Each group contains up to 5 paper slots (configurable)
 * - Empty slots are represented as null for consistent UI rendering
 * - Downloaded status is tracked per subject group
 *
 * @async
 * @param {Object} params - Query parameters
 * @param {Array<Object>} [params.filters=[]] - Array of filter objects
 * @param {string} params.filters[].field - Database column name (e.g., 'department_name', 'academic_year')
 * @param {string} params.filters[].value - Filter value
 * @param {string} [params.search=""] - Subject code search string (case-insensitive partial match)
 * @param {number} params.page - Page number for pagination (1-based, required)
 * @param {Date|string} [params.date] - Target date for paper retrieval (defaults to today, YYYY-MM-DD format)
 * @returns {Promise<Object>} Paginated grouped papers and total count
 * @returns {Array<Object>} returns.data - Array of grouped subject objects
 * @returns {string} returns.data[].subject_code - Subject code
 * @returns {string} returns.data[].subject_name - Subject name
 * @returns {Array<Object|null>} returns.data[].papers - Array of paper objects (length = 5, nulls for empty slots)
 * @returns {boolean} returns.data[].downloaded - Whether subject has been downloaded
 * @returns {number} returns.count - Total count of subject groups (not individual papers)
 * @throws {Error} If papers cannot be loaded from database
 *
 * @example
 * // Get today's papers for Computer Science department
 * const result = await getPapers({
 *   filters: [{ field: 'department_name', value: 'Computer Science' }],
 *   search: 'CS5',
 *   page: 1,
 *   date: '2025-10-03'
 * });
 * console.log(`Found ${result.count} subjects with papers today`);
 *
 * @example
 * // Get all papers for today (no filters)
 * const result = await getPapers({ page: 1 });
 * result.data.forEach(group => {
 *   console.log(`${group.subject_code}: ${group.papers.filter(p => p).length} papers`);
 * });
 *
 * @example
 * // Search specific subject code
 * const result = await getPapers({
 *   search: 'CS501',
 *   page: 1,
 *   date: new Date()
 * });
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
 * - Records download timestamp (ISO format)
 * - Changes status to "Downloaded" to prevent duplicate downloads
 * - Enables UI to show paper as already downloaded
 *
 * This enables tracking of which papers have been downloaded and allows
 * the UI to disable already-downloaded slots while keeping them visible
 * for audit trail purposes.
 *
 * Download tracking benefits:
 * - Prevents duplicate downloads
 * - Creates audit trail with timestamp
 * - Maintains visibility of all scheduled papers
 * - Supports download history reporting
 *
 * @async
 * @param {number} downloaded_paper_id - Unique identifier of the paper being downloaded
 * @returns {Promise<Array<Object>>} Updated paper object(s) from database
 * @returns {number} returns[].id - Paper ID
 * @returns {boolean} returns[].is_downloaded - Download flag (true)
 * @returns {string} returns[].downloaded_at - ISO timestamp of download
 * @returns {string} returns[].status - New status ("Downloaded")
 * @throws {Error} If database update fails
 *
 * @example
 * // Mark paper as downloaded
 * const updatedPaper = await downloadPaper(789);
 * console.log(`Paper downloaded at: ${updatedPaper[0].downloaded_at}`);
 *
 * @example
 * // With error handling
 * try {
 *   await downloadPaper(paperId);
 *   console.log('Download recorded successfully');
 *   // Trigger actual file download
 *   window.open(paper.qp_file_url, '_blank');
 * } catch (error) {
 *   console.error('Failed to record download:', error.message);
 *   alert('Download tracking failed. Please try again.');
 * }
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
 * Only returns non-sensitive user information (no passwords or auth data).
 *
 * Use cases:
 * - Principal reviewing CoE staff
 * - User management interface
 * - Department-wise CoE listing
 * - Administrative reporting
 *
 * @async
 * @param {Object} params - Query parameters
 * @param {number} [params.page] - Page number for pagination (1-based)
 * @returns {Promise<Object>} Paginated CoE users and total count
 * @returns {Array<Object>} returns.data - Array of CoE user objects
 * @returns {string} returns.data[].employee_id - Employee identifier
 * @returns {string} returns.data[].username - Display name
 * @returns {string} returns.data[].department_name - Department name
 * @returns {string} returns.data[].role - User role (always "CoE")
 * @returns {number} returns.count - Total count of active CoE users
 * @throws {Error} If users cannot be loaded from database
 *
 * @example
 * // Get first page of CoE users
 * const result = await getCoE({ page: 1 });
 * console.log(`Found ${result.count} CoE users`);
 * result.data.forEach(user => {
 *   console.log(`${user.username} (${user.department_name})`);
 * });
 *
 * @example
 * // Get all CoE users without pagination
 * const result = await getCoE({});
 * console.log('All CoE staff:', result.data);
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
