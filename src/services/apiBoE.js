import supabase from "./supabase";
import { PAGE_SIZE } from "../utils/constants";

export async function getPapers({ filters = [], search = "", page }) {
  let query = supabase.from("exam_papers").select("*", { count: "exact" });

  query = query.eq("status", "CoE-approved");

  // Filter
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
