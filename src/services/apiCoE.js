import supabase from "./supabase";
import { PAGE_SIZE } from "../utils/constants";

/**
 * Fetches a paginated, filtered, and searchable list of exam papers.
 * @param {Object} params
 * @param {Array} params.filters - Array of { field, value }
 * @param {string} params.search - Search string for subject_code (case-insensitive LIKE)
 * @param {number} params.page - Page number (1-based)
 * @returns {Promise<{data: Array, count: number}>}
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
 * Fetch one exam paper by its unique database ID.
 * @param {number|string} id
 * @returns {Promise<Object>} - The exam paper row
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
 * Approves or updates the status/fields of a specific paper.
 * @param {number|string} id - The paper's database ID
 * @param {Object} obj     - The object containing updated fields (e.g. { status: "Locked" })
 * @returns {Promise<Object>} - The updated row
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

export async function getDepartments() {
  const { data, error } = await supabase.from("departments").select("*");

  if (error) {
    throw new Error("Departments could not be loaded!");
  }

  return data;
}

export async function getAcademicYear() {
  const { data, error } = await supabase
    .from("exam_papers")
    .select("academic_year");

  if (error) {
    throw new Error("Academic Year could not be loaded!");
  }

  return data;
}
