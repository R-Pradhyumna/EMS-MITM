import supabase from "./supabase";

export async function getPapers() {
  const { data, error } = await supabase
    .from("exam_papers")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("Papers could not be loaded!");
  }
  return data;
}

export async function createEditPapers(newPaper, id) {
  // const hasFilePath = newPaper.file?.startsWith?.(supabaseUrl);

  // const fileName = `{newPaper.file.name}`
  // const imagePath = hasFilePath ? newPaper : `${supabaseUrl/${fileName}}`; //Dynamically create this for different papers

  // 1. Create/edit paper
  let query = supabase.from("exam_papers");
  // A - Create
  if (!id) query = query.insert([{ ...newPaper, file: filePath }]); //Because field name in form is same as name in Supabase

  // B - Edit
  if (id) query = query.update({ ...newPaper, file: filePath }).eq("id", id);

  const { data, error } = await query.select().single();

  if (error) {
    throw new Error("Paper could not be created!");
  }

  // 2. Upload file
  const { error: storageError } = await supabase.storage
    .from("papers")
    .upload(filename, newPaper.file);

  // 3. Delete the cabin if there was an error uploading files
  if (storageError) {
    await supabase.from("exam_papers").delete().eq("id", data.id);
    throw new Error(
      "File could not be uploaded and the paper was not created!"
    );
  }

  return data;
}
