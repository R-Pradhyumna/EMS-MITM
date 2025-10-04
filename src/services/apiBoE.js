/**
 * Board of Examiners (BoE) API Module
 *
 * Provides API functions for Board of Examiners operations including:
 * - Retrieving and filtering examination papers for department review
 * - Approving/locking papers after scrutiny
 * - Uploading scrutinized (corrected) question papers and schemes
 * - Managing faculty lists within departments
 *
 * @module apiBoE
 */

import supabase, { supabaseUrl } from "./supabase";
import { PAGE_SIZE } from "../utils/constants";

/**
 * Retrieves paginated examination papers for a specific department with filtering and search.
 *
 * Excludes papers with "Submitted" status (shows only papers in review/approved states).
 * Results are ordered by creation date (newest first) and support multiple filter criteria.
 *
 * @async
 * @param {import('./types').QueryOptions & {department_name: string}} params - Query parameters with department filter
 * @returns {Promise<import('./types').PaginatedResponse<import('./types').ExamPaper>>} Paginated papers and total count
 * @throws {Error} If papers cannot be loaded from database
 *
 * @example
 * const result = await getPapers({
 *   filters: [{ field: 'semester', value: '5' }],
 *   search: 'CS501',
 *   page: 1,
 *   department_name: 'Computer Science'
 * });
 */
export async function getPapers({
  filters = [],
  search = "",
  page,
  department_name,
}) {
  let query = supabase
    .from("exam_papers")
    .select("*", { count: "exact" }) // all fields, and total count for pagination
    .eq("department_name", department_name)
    .order("created_at", { ascending: false }); // newest papers first

  // Filter out all papers with status === "Submitted"
  query = query.neq("status", "Submitted");

  // Apply all filters in filters array, if present
  filters.forEach((filter) => {
    // Only apply if field & value are non-falsy ('' won't filter)
    if (filter?.field && filter.value) {
      query = query.eq(filter.field, filter.value);
    }
  });

  // Search by exact subject_code (if non-empty string)
  if (search && search.trim() !== "") {
    query = query.eq("subject_code", search.trim());
  }

  // Apply pagination (Supabase: from-to are inclusive, 0-based)
  if (page) {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to);
  }

  // Execute the built query
  const { data, error, count } = await query;

  // Throw user-friendly error on any failure
  if (error) {
    throw new Error("Papers could not be loaded!");
  }

  // Return paginated data and the total matching count
  return { data, count };
}

/**
 * Retrieves a single examination paper by its ID.
 *
 * @async
 * @param {number|string} id - Unique identifier of the exam paper
 * @returns {Promise<import('./types').ExamPaper>} Complete exam paper object with all fields
 * @throws {Error} If paper is not found or database query fails
 *
 * @example
 * const paper = await getPaper(123);
 * console.log(`Paper for ${paper.subject_name} loaded`);
 */
export async function getPaper(id) {
  const { data, error } = await supabase
    .from("exam_papers")
    .select("*")
    .eq("id", id)
    .single(); // return just one row

  if (error) {
    throw new Error("Paper not found!");
  }

  return data;
}

/**
 * Approves and locks an examination paper after BoE review.
 *
 * Updates the paper's status and related fields (typically setting status to "BoE-approved"
 * or "Locked" and recording approval metadata).
 *
 * @async
 * @param {number|string} id - Unique identifier of the exam paper to approve
 * @param {Partial<import('./types').ExamPaper>} obj - Update object containing approval data (status, timestamps, etc.)
 * @returns {Promise<import('./types').ExamPaper>} Updated exam paper object
 * @throws {Error} If paper cannot be locked/approved
 *
 * @example
 * const approvedPaper = await approvePaper(123, {
 *   status: 'BoE-approved',
 *   approved_by: 'EMP001'
 * });
 */
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

/**
 * Uploads scrutinized (corrected) question paper and scheme files to storage.
 *
 * Performs atomic upload of both files to maintain data consistency:
 * - Uploads corrected QP file
 * - Uploads corrected Scheme file
 * - If Scheme upload fails, automatically removes QP to prevent partial state
 * - Files are stored in the paper's designated storage folder
 *
 * @async
 * @param {import('./types').ExamPaper} paper - Exam paper object containing storage metadata
 * @param {File} qpFile - Corrected Question Paper file (DOCX format)
 * @param {File} schemaFile - Corrected Scheme of Valuation file (DOCX format)
 * @returns {Promise<{qp_file_url: string, scheme_file_url: string}>} Public URLs for uploaded files
 * @throws {Error} If either file is missing or upload fails
 *
 * @example
 * const urls = await uploadScrutinizedFiles(
 *   paper,
 *   qpFileObject,
 *   schemeFileObject
 * );
 * console.log('Files uploaded:', urls.qp_file_url, urls.scheme_file_url);
 */
export async function uploadScrutinizedFiles(paper, qpFile, schemaFile) {
  // Quick validation
  if (!qpFile || !schemaFile)
    throw new Error("QP and Schema files are required");

  // Compute storage folder and filenames from paper context
  const folderPath = paper.storage_folder_path;
  const qpFilename = `papers/${folderPath}/QP.docx`;
  const schemaFilename = `papers/${folderPath}/Scheme.docx`;

  // Upload QP; throws if fails
  const { error: qpError } = await supabase.storage
    .from("papers")
    .upload(qpFilename, qpFile, { cacheControl: "3600", upsert: true });

  if (qpError) throw new Error("Failed to upload corrected Question Paper");

  // Upload Scheme; if it fails, remove QP to maintain consistency
  const { error: schemaError } = await supabase.storage
    .from("papers")
    .upload(schemaFilename, schemaFile, { cacheControl: "3600", upsert: true });

  if (schemaError) {
    await supabase.storage.from("papers").remove([qpFilename]);
    throw new Error("Failed to upload corrected Scheme of Valuation");
  }

  // Construct new public file URLs (supabaseUrl must be imported/available in your real code)
  return {
    qp_file_url: `${supabaseUrl}/storage/v1/object/public/papers/${qpFilename}`,
    scheme_file_url: `${supabaseUrl}/storage/v1/object/public/papers/${schemaFilename}`,
  };
}

/**
 * Retrieves paginated list of faculty members for a specific department.
 *
 * Filters for active faculty users (not soft-deleted) within the specified department.
 * Results include employee ID, username, department name, and role.
 *
 * @async
 * @param {{department_name: string, page?: number}} params - Query parameters with department filter
 * @returns {Promise<import('./types').PaginatedResponse<import('./types').User>>} Paginated faculty list and total count
 * @throws {Error} If faculties cannot be loaded from database
 *
 * @example
 * const result = await getFaculties({
 *   department_name: 'Computer Science',
 *   page: 1
 * });
 * console.log(`Found ${result.count} faculty members`);
 */
export async function getFaculties({ department_name, page }) {
  let query = supabase
    .from("users")
    .select("employee_id, username, department_name, role", { count: "exact" })
    .eq("department_name", department_name)
    .eq("role", "faculty")
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
    throw new Error("Faculties could not be loaded!");
  }

  // Return paginated data and the total matching count
  return { data, count };
}

/**
 * Generates a temporary signed URL for previewing a paper file online.
 *
 * Creates a time-limited (30 minutes) signed URL that allows BoE members
 * to preview DOCX/DOC examination files in Office Online Viewer without downloading.
 * The URL expires automatically for security. Respects Row Level Security policies.
 *
 * @async
 * @param {string} filePath - Storage path or full URL of the file (from qp_file_url or scheme_file_url)
 * @returns {Promise<string>} Signed URL valid for 30 minutes
 * @throws {Error} If signed URL cannot be generated or user lacks permissions
 *
 * @example
 * // Generate preview URL for question paper
 * const previewUrl = await getFilePreviewUrl(paper.qp_file_url);
 * const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl)}`;
 * window.open(viewerUrl, '_blank');
 */
export async function getFilePreviewUrl(filePath) {
  // Extract just the path portion (remove supabase URL prefix if present)
  const path = filePath.includes("storage/v1/object/public/papers/")
    ? filePath.split("storage/v1/object/public/papers/")[1]
    : filePath;

  const { data, error } = await supabase.storage
    .from("papers")
    .createSignedUrl(path, 1800); // 30 minutes = 1800 seconds

  if (error) {
    console.error("Signed URL generation error:", error);
    throw new Error("Could not generate preview URL");
  }

  return data.signedUrl;
}
