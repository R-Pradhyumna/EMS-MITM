/**
 * Faculty API Module
 *
 * Provides API functions for faculty-specific operations including:
 * - Retrieving faculty's own submitted examination papers
 * - Creating new exam paper submissions with file uploads
 * - Editing existing exam paper submissions
 *
 * Handles atomic file uploads with automatic rollback on failure to maintain data consistency.
 *
 * @module apiFaculty
 */

// Import your Supabase client and constants
import supabase, { supabaseUrl } from "./supabase";
import { PAGE_SIZE } from "../utils/constants";

/**
 * Fetches a paginated, descending list of exam papers submitted by a specific faculty member.
 *
 * Returns only papers uploaded by the specified employee, ordered by creation date (newest first).
 * Includes essential fields for faculty dashboard display.
 *
 * @async
 * @param {Object} params - Query parameters
 * @param {number} [params.page] - Page number for pagination (1-based)
 * @param {string} params.employee_id - Employee ID of the faculty member
 * @returns {Promise<Object>} Paginated papers and total count
 * @returns {Array<Object>} returns.data - Array of exam paper objects with id, subject_code, academic_year, subject_name, semester, status
 * @returns {number} returns.count - Total count of papers uploaded by this faculty member
 * @throws {Error} If papers cannot be loaded from database
 *
 * @example
 * const result = await getPapers({ page: 1, employee_id: 'FAC001' });
 * console.log(`Faculty has ${result.count} papers`);
 */
export async function getPapers({ page, employee_id }) {
  // Start building the query: select all columns, return total count, order by newest first
  let query = supabase
    .from("exam_papers")
    .select("id, subject_code,academic_year,subject_name,semester,status", {
      count: "exact",
    })
    .eq("uploaded_by", employee_id)
    .order("created_at", { ascending: false });

  // If page param exists, add a range for pagination
  if (page) {
    const from = (page - 1) * PAGE_SIZE; // Index of first row on this page
    const to = from + PAGE_SIZE - 1; // Index of last row on this page
    query = query.range(from, to);
  }

  // Actually execute the built query
  const { data, error, count } = await query;

  // Handle DB errors (network, permission, etc)
  if (error) {
    throw new Error("Papers could not be loaded!");
  }

  // Return both the data (array of rows) and total result count
  return { data, count };
}

/**
 * Creates a new exam paper submission or edits an existing one.
 *
 * Handles complete exam paper submission workflow:
 * - Uploads Question Paper and Scheme of Valuation files to storage
 * - Creates/updates database record with metadata
 * - Implements atomic operations with automatic rollback on failure
 * - Supports partial updates (only uploads new files if provided)
 *
 * File upload behavior:
 * - New submission: Both QP and Scheme files are required and uploaded
 * - Edit operation: Only uploads files if new ones are provided in the form
 * - Existing file URLs are preserved if no new files are selected
 *
 * Storage structure: papers/Academic Year YYYY/Department/SemX/Subject Name/
 *
 * @async
 * @param {Object} newPaper - Form data containing paper metadata and files
 * @param {FileList} [newPaper.qp_file] - Question Paper file array (DOCX format)
 * @param {FileList} [newPaper.scheme_file] - Scheme of Valuation file array (DOCX format)
 * @param {string} newPaper.subject_code - Unique subject code
 * @param {string} newPaper.subject_name - Full subject name
 * @param {string} newPaper.semester - Semester value
 * @param {string|number} newPaper.academic_year - Academic year (e.g., 2024)
 * @param {string} newPaper.department_name - Department name
 * @param {string} [newPaper.qp_file_url] - Existing QP file URL (for edit operations)
 * @param {string} [newPaper.scheme_file_url] - Existing Scheme file URL (for edit operations)
 * @param {string} [newPaper.qp_file_type] - Existing QP file MIME type
 * @param {string} [newPaper.scheme_file_type] - Existing Scheme file MIME type
 * @param {string} newPaper.uploaded_by - Employee ID of the faculty member
 * @param {number} [id] - Paper ID for edit operations (undefined for new submissions)
 * @returns {Promise<Object>} Saved exam paper record from database
 * @throws {Error} If file upload fails or database operation fails (triggers automatic cleanup)
 *
 * @example
 * // Create new paper
 * const newPaper = await createEditPapers({
 *   qp_file: qpFileList,
 *   scheme_file: schemeFileList,
 *   subject_code: 'CS501',
 *   subject_name: 'Data Structures',
 *   semester: '5',
 *   academic_year: 2024,
 *   department_name: 'Computer Science',
 *   uploaded_by: 'FAC001'
 * });
 *
 * @example
 * // Edit existing paper (only update QP file)
 * const updatedPaper = await createEditPapers({
 *   qp_file: newQpFileList,
 *   subject_code: 'CS501',
 *   subject_name: 'Data Structures',
 *   semester: '5',
 *   academic_year: 2024,
 *   department_name: 'Computer Science',
 *   qp_file_url: 'https://existing-url.com/qp.docx',
 *   scheme_file_url: 'https://existing-url.com/scheme.docx',
 *   qp_file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 *   scheme_file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 *   uploaded_by: 'FAC001'
 * }, 123);
 */
export async function createEditPapers(newPaper, id) {
  const {
    qp_file,
    scheme_file,
    subject_code,
    subject_name,
    semester,
    academic_year,
    department_name,
    qp_file_url: existingQpFileUrl, // Add these to form defaults
    scheme_file_url: existingSchemeFileUrl, // (these are from DB/form)
    qp_file_type: existingQpFileType,
    scheme_file_type: existingSchemeFileType,
    uploaded_by,
  } = newPaper;

  const folderPath = `Academic Year ${academic_year}/${department_name}/Sem${semester}/${subject_name}`;

  // Question Paper - Only upload if a new file is provided
  let qp_file_url = existingQpFileUrl;
  let qp_file_type = existingQpFileType;
  if (qp_file && qp_file.length > 0) {
    const qpFilename = `papers/${folderPath}/QP.docx`;
    const { error: qpError } = await supabase.storage
      .from("papers")
      .upload(qpFilename, qp_file[0], { cacheControl: "3600", upsert: true });
    if (qpError) throw new Error("Failed to upload Question Paper");
    qp_file_url = `${supabaseUrl}/storage/v1/object/public/papers/${qpFilename}`;
    qp_file_type = qp_file[0].type;
  }

  // Scheme File - Only upload if a new file is provided
  let scheme_file_url = existingSchemeFileUrl;
  let scheme_file_type = existingSchemeFileType;
  if (scheme_file && scheme_file.length > 0) {
    const schemeFilename = `papers/${folderPath}/Scheme.docx`;
    const { error: schemeError } = await supabase.storage
      .from("papers")
      .upload(schemeFilename, scheme_file[0], {
        cacheControl: "3600",
        upsert: true,
      });
    if (schemeError) {
      // If QP file was just uploaded new, remove it to avoid orphan
      if (qp_file && qp_file.length > 0) {
        const qpFilename = `papers/${folderPath}/QP.docx`;
        await supabase.storage.from("papers").remove([qpFilename]);
      }
      throw new Error("Failed to upload Scheme of Valuation");
    }
    scheme_file_url = `${supabaseUrl}/storage/v1/object/public/papers/${schemeFilename}`;
    scheme_file_type = scheme_file[0].type;
  }

  // Build the DB row payload (files unchanged unless new selected)
  const payload = {
    subject_code,
    subject_name,
    semester,
    academic_year: Number(academic_year),
    department_name,
    qp_file_url,
    scheme_file_url,
    qp_file_type,
    scheme_file_type,
    storage_folder_path: folderPath,
    uploaded_by,
    status: "Submitted",
  };

  let query = supabase.from("exam_papers");
  query = !id ? query.insert([payload]) : query.update(payload).eq("id", id);
  const { data, error } = await query.select().single();

  // DB error: remove only new files uploaded in this session!
  if (error) {
    if (qp_file && qp_file.length > 0) {
      const qpFilename = `papers/${folderPath}/QP.docx`;
      await supabase.storage.from("papers").remove([qpFilename]);
    }
    if (scheme_file && scheme_file.length > 0) {
      const schemeFilename = `papers/${folderPath}/Scheme.docx`;
      await supabase.storage.from("papers").remove([schemeFilename]);
    }
    console.error(error);
    throw new Error("Could not save paper metadata in DB");
  }

  return data;
}
