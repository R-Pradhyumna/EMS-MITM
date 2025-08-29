import supabase from "./supabase";
import { PAGE_SIZE } from "../utils/constants";

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
