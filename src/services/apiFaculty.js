import supabase, { supabaseUrl } from "./supabase";
import { PAGE_SIZE } from "../utils/constants";

export async function getPapers({ page }) {
  let query = supabase
    .from("exam_papers")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

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

export async function getSubjectsForDepartment() {
  let { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("department_id", 1);

  if (error) {
    throw new Error("Papers could not be loaded!");
  }
  return data;
}

// Works for manual inputs
export async function createEditPapers(newPaper, id) {
  const {
    qp_file,
    scheme_file,
    subject_code,
    subject_name,
    semester,
    academic_year,
    department_name,
  } = newPaper;

  // For testing, we build folderPath directly from inputs
  const folderPath = `Academic Year ${academic_year}/${department_name}/Sem${semester}/${subject_name}`;

  // Define filenames
  const qpFilename = `papers/${folderPath}/QP.docx`;
  const schemeFilename = `papers/${folderPath}/Scheme.docx`;

  // Upload QP File
  const { error: qpError } = await supabase.storage
    .from("papers")
    .upload(qpFilename, qp_file[0], {
      cacheControl: "3600",
      upsert: true,
    });

  if (qpError) throw new Error("Failed to upload Question Paper");

  // Upload Scheme File
  const { error: schemeError } = await supabase.storage
    .from("papers")
    .upload(schemeFilename, scheme_file[0], {
      cacheControl: "3600",
      upsert: true,
    });

  if (schemeError) {
    // Cleanup QP file if scheme upload fails
    await supabase.storage.from("papers").remove([qpFilename]);
    throw new Error("Failed to upload Scheme of Valuation");
  }

  // Get public URLs (for testing purpose, hardcoded URL)
  const qp_file_url = `${supabaseUrl}/storage/v1/object/public/papers/${qpFilename}`;
  const scheme_file_url = `${supabaseUrl}/storage/v1/object/public/papers/${schemeFilename}`;

  // Build payload for DB
  const payload = {
    subject_code,
    subject_name,
    semester: semester,
    academic_year: Number(academic_year),
    department_name: department_name,
    academic_year: Number(academic_year),
    department_name: department_name,
    qp_file_url,
    scheme_file_url,
    qp_file_type: qp_file[0].type,
    scheme_file_type: scheme_file[0].type,
    storage_folder_path: folderPath,
    uploaded_by: "EMP001", // Hardcoded for testing
    status: "Submitted",
  };

  // Create or Edit logic
  let query = supabase.from("exam_papers");

  if (!id) {
    query = query.insert([payload]);
  } else {
    query = query.update(payload).eq("id", id);
  }

  const { data, error } = await query.select().single();

  if (error) {
    console.error("Supabase DB Error:", error); // 👈 Add this to see the real cause
    await supabase.storage.from("papers").remove([qpFilename, schemeFilename]);
    throw new Error("Could not save paper metadata in DB");
  }

  return data;
}
