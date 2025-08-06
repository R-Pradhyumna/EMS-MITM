// Import your Supabase client and constants
import supabase, { supabaseUrl } from "./supabase";
import { PAGE_SIZE } from "../utils/constants";

/**
 * Fetches a paginated, descending list of exam papers
 * @param {Object} param0
 * @param {number} param0.page - Page number (1-based)
 * @returns {Promise<{data: Array, count: number}>}
 */
export async function getPapers({ page }) {
  // Start building the query: select all columns, return total count, order by newest first
  let query = supabase
    .from("exam_papers")
    .select("*", { count: "exact" })
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
  // Destructure inputs from the form object
  const {
    qp_file, // Array of File objects, e.g. from <input type="file">
    scheme_file, // Array of File objects
    subject_code,
    subject_name,
    semester,
    academic_year,
    department_name,
  } = newPaper;

  // Compute the storage "folder" for this paper in your bucket, based on input fields
  const folderPath = `Academic Year ${academic_year}/${department_name}/Sem${semester}/${subject_name}`;

  // Fixed filenames for upload (could add more uniqueness!)
  const qpFilename = `papers/${folderPath}/QP.docx`;
  const schemeFilename = `papers/${folderPath}/Scheme.docx`;

  // --- Upload QP File to Supabase Storage ---
  const { error: qpError } = await supabase.storage
    .from("papers")
    .upload(qpFilename, qp_file[0], {
      cacheControl: "3600", // Optional: cache control in seconds
      upsert: true, // Overwrite if exists (for editing)
    });

  if (qpError) throw new Error("Failed to upload Question Paper");

  // --- Upload Scheme File to Supabase Storage ---
  const { error: schemeError } = await supabase.storage
    .from("papers")
    .upload(schemeFilename, scheme_file[0], {
      cacheControl: "3600",
      upsert: true,
    });

  if (schemeError) {
    // On failure, cleanup the previously uploaded QP file to avoid orphan files
    await supabase.storage.from("papers").remove([qpFilename]);
    throw new Error("Failed to upload Scheme of Valuation");
  }

  // Manually construct public URLs for each file (Supabase pattern)
  const qp_file_url = `${supabaseUrl}/storage/v1/object/public/papers/${qpFilename}`;
  const scheme_file_url = `${supabaseUrl}/storage/v1/object/public/papers/${schemeFilename}`;

  // Build the DB row payload
  const payload = {
    subject_code,
    subject_name,
    semester: semester,
    academic_year: Number(academic_year),
    department_name,
    qp_file_url,
    scheme_file_url,
    qp_file_type: qp_file[0].type,
    scheme_file_type: scheme_file[0].type,
    storage_folder_path: folderPath,
    uploaded_by: "EMP001", // TODO: Replace with actual user/employee from auth!
    status: "Submitted",
  };

  // Prepare the insert or update DB query, based on whether id is present
  let query = supabase.from("exam_papers");
  if (!id) {
    query = query.insert([payload]);
  } else {
    query = query.update(payload).eq("id", id);
  }

  // Execute the DB query, pull single row result
  const { data, error } = await query.select().single();

  // If DB insert/update fails, cleanup both files from storage
  if (error) {
    console.error("Supabase DB Error:", error);
    await supabase.storage.from("papers").remove([qpFilename, schemeFilename]);
    throw new Error("Could not save paper metadata in DB");
  }

  // Return the saved item for further logic/UI
  return data;
}
