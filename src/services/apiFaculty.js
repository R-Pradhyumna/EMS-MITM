// Import your Supabase client and constants
import supabase, { supabaseUrl } from "./supabase";
import { PAGE_SIZE } from "../utils/constants";

/**
 * Fetches a paginated, descending list of exam papers
 * @param {Object} param0
 * @param {number} param0.page - Page number (1-based)
 * @returns {Promise<{data: Array, count: number}>}
 */
export async function getPapers({ page, employee_id }) {
  // Start building the query: select all columns, return total count, order by newest first
  let query = supabase
    .from("exam_papers")
    .select("*", { count: "exact" })
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
 * Creates or edits a paper (handles file uploads and DB row insert/update)
 * @param {Object} newPaper - Input fields and files from form
 * @param {number|undefined} id - If present, updates existing record
 * @returns {Promise<Object>} - Saved record from the database
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
