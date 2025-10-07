/**
 * Board of Examiners (BoE) API Module
 *
 * @module apiBoE
 */

import supabase, { supabaseUrl } from "./supabase";
import { PAGE_SIZE } from "../utils/constants";

/**
 * Retrieves paginated examination papers for a specific department.
 *
 * @async
 * @param {Object} params - Query parameters
 * @param {Array<Object>} [params.filters=[]] - Array of filter objects with field and value
 * @param {string} [params.search=''] - Subject code search term
 * @param {number} [params.page] - Page number for pagination
 * @param {string} params.department_name - Department name to filter by
 * @returns {Promise<Object>} Object with data array and count
 * @throws {Error} If papers cannot be loaded
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
    .select("*", { count: "exact" })
    .eq("department_name", department_name)
    .order("created_at", { ascending: false });

  query = query.neq("status", "Submitted");

  filters.forEach((filter) => {
    if (filter?.field && filter.value) {
      query = query.eq(filter.field, filter.value);
    }
  });

  if (search && search.trim() !== "") {
    query = query.eq("subject_code", search.trim());
  }

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

/**
 * Retrieves a single examination paper by its ID.
 *
 * @async
 * @param {number|string} id - Unique identifier of the exam paper
 * @returns {Promise<Object>} Complete exam paper object
 * @throws {Error} If paper is not found
 *
 * @example
 * const paper = await getPaper(123);
 */
export async function getPaper(id) {
  const { data, error } = await supabase
    .from("exam_papers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error("Paper not found!");
  }

  return data;
}

/**
 * Approves and locks an examination paper.
 *
 * @async
 * @param {number|string} id - Paper ID
 * @param {Object} obj - Update object with status and approval data
 * @returns {Promise<Object>} Updated paper object
 * @throws {Error} If paper cannot be locked
 *
 * @example
 * const paper = await approvePaper(123, {
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
 * Uploads scrutinized question paper and scheme files.
 *
 * @async
 * @param {Object} paper - Exam paper object with storage path
 * @param {File} qpFile - Corrected Question Paper file
 * @param {File} schemaFile - Corrected Scheme file
 * @returns {Promise<Object>} Object with qp_file_url and scheme_file_url
 * @throws {Error} If upload fails
 *
 * @example
 * const urls = await uploadScrutinizedFiles(paper, qpFile, schemeFile);
 */
export async function uploadScrutinizedFiles(paper, qpFile, schemaFile) {
  if (!qpFile || !schemaFile)
    throw new Error("QP and Schema files are required");

  const folderPath = paper.storage_folder_path;
  const qpFilename = `papers/${folderPath}/QP.docx`;
  const schemaFilename = `papers/${folderPath}/Scheme.docx`;

  const { error: qpError } = await supabase.storage
    .from("papers")
    .upload(qpFilename, qpFile, { cacheControl: "3600", upsert: true });

  if (qpError) throw new Error("Failed to upload corrected Question Paper");

  const { error: schemaError } = await supabase.storage
    .from("papers")
    .upload(schemaFilename, schemaFile, { cacheControl: "3600", upsert: true });

  if (schemaError) {
    await supabase.storage.from("papers").remove([qpFilename]);
    throw new Error("Failed to upload corrected Scheme of Valuation");
  }

  return {
    qp_file_url: `${supabaseUrl}/storage/v1/object/public/papers/${qpFilename}`,
    scheme_file_url: `${supabaseUrl}/storage/v1/object/public/papers/${schemaFilename}`,
  };
}

/**
 * Retrieves paginated list of faculty members.
 *
 * @async
 * @param {Object} params - Query parameters
 * @param {string} params.department_name - Department name
 * @param {number} [params.page] - Page number
 * @returns {Promise<Object>} Object with data array and count
 * @throws {Error} If faculties cannot be loaded
 *
 * @example
 * const result = await getFaculties({
 *   department_name: 'Computer Science',
 *   page: 1
 * });
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

  const { data, error, count } = await query;

  if (error) {
    throw new Error("Faculties could not be loaded!");
  }

  return { data, count };
}

/**
 * Generates a temporary signed URL for file preview.
 *
 * @async
 * @param {string} filePath - Storage path or full URL of the file
 * @returns {Promise<string>} Signed URL valid for 30 minutes
 * @throws {Error} If signed URL cannot be generated
 *
 * @example
 * const previewUrl = await getFilePreviewUrl(paper.qp_file_url);
 */
export async function getFilePreviewUrl(filePath) {
  const path = filePath.includes("storage/v1/object/public/papers/")
    ? filePath.split("storage/v1/object/public/papers/")[1]
    : filePath;

  const { data, error } = await supabase.storage
    .from("papers")
    .createSignedUrl(path, 1800);

  if (error) {
    console.error("Signed URL generation error:", error);
    throw new Error("Could not generate preview URL");
  }

  return data.signedUrl;
}
