/**
 * Controller of Examinations (CoE) API Module
 *
 * Provides API functions for Controller of Examinations operations including:
 * - Institution-wide examination paper management and filtering
 * - Paper approval and status updates
 * - Department and academic year data retrieval
 * - User management for BoE and Principal roles
 *
 * @module apiCoE
 */

import supabase from "./supabase";
import { PAGE_SIZE } from "../utils/constants";

/**
 * Fetches a paginated, filtered, and searchable list of exam papers across all departments.
 *
 * Supports advanced filtering with multiple criteria including array-based filters (IN clause)
 * and case-insensitive search on subject codes. Results are ordered by creation date (newest first).
 *
 * @async
 * @param {Object} params - Query parameters
 * @param {Array<Object>} [params.filters=[]] - Array of filter objects with field and value properties
 * @param {string} params.filters[].field - Database column name to filter on
 * @param {*} params.filters[].value - Value to filter by (string, number, or array for IN clause)
 * @param {string} [params.search=""] - Search string for subject_code (case-insensitive partial match)
 * @param {number} [params.page] - Page number for pagination (1-based)
 * @returns {Promise<Object>} Paginated papers and total count
 * @returns {Array<Object>} returns.data - Array of exam paper objects
 * @returns {number} returns.count - Total count of matching papers
 * @throws {Error} If papers cannot be loaded from database
 *
 * @example
 * // Filter with array (multiple departments)
 * const result = await getPapers({
 *   filters: [{ field: 'department_name', value: ['CS', 'IT'] }],
 *   search: 'CS5',
 *   page: 1
 * });
 *
 * @example
 * // Single value filter
 * const result = await getPapers({
 *   filters: [{ field: 'status', value: 'Locked' }],
 *   page: 1
 * });
 */
export async function getPapers({ filters = [], search = "", page }) {
  // Start build: select all columns, request row count, order by newest first
  let query = supabase
    .from("exam_papers")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  // Apply each filter (if field and value are set, skip empty/blank/undefined)
  filters.forEach((filter) => {
    if (filter?.field && filter.value !== undefined && filter.value !== null) {
      // If filter is for multiple values (e.g., [1,2,3]), use 'in' (WHERE field IN ...)
      if (Array.isArray(filter.value)) {
        query = query.in(filter.field, filter.value);
        // Else, for a single value (not empty string), use 'eq' (WHERE field = value)
      } else if (filter.value !== "") {
        query = query.eq(filter.field, filter.value);
      }
    }
  });

  // Apply case-insensitive search, if search is non-empty (on subject_code)
  if (search && search.trim() !== "") {
    query = query.ilike("subject_code", `%${search.trim()}%`);
  }

  // Pagination: apply a range based on page number and PAGE_SIZE
  if (page) {
    const from = (page - 1) * PAGE_SIZE; // Index to start from
    const to = from + PAGE_SIZE - 1; // Index to end at
    query = query.range(from, to);
  }

  // Execute query, retrieving: data (rows), error object, count (total matching results)
  const { data, error, count } = await query;

  // Throw a user-friendly error on failure
  if (error) {
    throw new Error("Papers could not be loaded!");
  }

  // Return both page's rows and total count (for pagination UI)
  return { data, count };
}

/**
 * Fetches a single exam paper by its unique database ID.
 *
 * @async
 * @param {number|string} id - Unique identifier of the exam paper
 * @returns {Promise<Object>} Complete exam paper object with all fields
 * @throws {Error} If paper is not found or database query fails
 *
 * @example
 * const paper = await getPaper(456);
 * console.log(`Loaded paper: ${paper.subject_name}`);
 */
export async function getPaper(id) {
  const { data, error } = await supabase
    .from("exam_papers")
    .select("*")
    .eq("id", id)
    .single(); // Only one expected

  if (error) {
    throw new Error("Paper not found!");
  }

  return data;
}

/**
 * Approves or updates the status and fields of a specific exam paper.
 *
 * Used by CoE to lock papers after verification, update approval status,
 * or modify other paper attributes.
 *
 * @async
 * @param {number|string} id - The paper's database ID
 * @param {Object} obj - Object containing fields to update (e.g., { status: "Locked", approved_at: "2025-10-03" })
 * @returns {Promise<Object>} Updated exam paper object
 * @throws {Error} If paper cannot be locked or updated
 *
 * @example
 * const updatedPaper = await approvePaper(456, {
 *   status: 'Locked',
 *   locked_by: 'CoE Admin',
 *   locked_at: new Date().toISOString()
 * });
 */
export async function approvePaper(id, obj) {
  const { data, error } = await supabase
    .from("exam_papers")
    .update(obj)
    .eq("id", id)
    .select()
    .single(); // Return updated row

  if (error) {
    throw new Error("Paper could not be locked!");
  }

  return data;
}

/**
 * Retrieves all departments in the institution.
 *
 * Returns complete department list for dropdown menus, filtering options,
 * and department-based workflows.
 *
 * @async
 * @returns {Promise<Array<Object>>} Array of department objects with id and name
 * @throws {Error} If departments cannot be loaded from database
 *
 * @example
 * const departments = await getDepartments();
 * console.log(`Found ${departments.length} departments`);
 */
export async function getDepartments() {
  const { data, error } = await supabase.from("departments").select("*");

  if (error) {
    throw new Error("Departments could not be loaded!");
  }

  return data;
}

/**
 * Retrieves all distinct academic years from exam papers.
 *
 * Returns list of academic years for filtering and historical data access.
 * Used in dropdown filters to show available years with examination data.
 *
 * @async
 * @returns {Promise<Array<Object>>} Array of objects containing academic_year values
 * @throws {Error} If academic years cannot be loaded from database
 *
 * @example
 * const years = await getAcademicYear();
 * const uniqueYears = [...new Set(years.map(y => y.academic_year))];
 */
export async function getAcademicYear() {
  const { data, error } = await supabase
    .from("exam_papers")
    .select("academic_year");

  if (error) {
    throw new Error("Academic Year could not be loaded!");
  }

  return data;
}

/**
 * Retrieves paginated list of BoE and Principal users.
 *
 * Fetches active (non-deleted) users with BoE or Principal roles for
 * administrative purposes and user management interfaces.
 *
 * @async
 * @param {Object} params - Query parameters
 * @param {number} [params.page] - Page number for pagination (1-based)
 * @returns {Promise<Object>} Paginated users and total count
 * @returns {Array<Object>} returns.data - Array of user objects (employee_id, username, department_name, role)
 * @returns {number} returns.count - Total count of matching users
 * @throws {Error} If users cannot be loaded from database
 *
 * @example
 * const result = await getUsers({ page: 1 });
 * console.log(`Found ${result.count} BoE/Principal users`);
 */
export async function getUsers({ page }) {
  let query = supabase
    .from("users")
    .select("employee_id, username, department_name, role", { count: "exact" })
    .or("role.eq.BoE,role.eq.Principal")
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
