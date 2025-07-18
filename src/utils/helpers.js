// export async function uploadPDFToDrive(file, accessToken, folderId = null) {
//   const metadata = {
//     name: file.name,
//     mimeType: file.type,
//     ...(folderId && { parents: [folderId] }),
//   };

//   const form = new FormData();
//   form.append(
//     "metadata",
//     new Blob([JSON.stringify(metadata)], { type: "application/json" })
//   );
//   form.append("file", file);

//   const res = await fetch(
//     "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
//     {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//       body: form,
//     }
//   );

//   if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
//   const { id } = await res.json();
//   return `https://drive.google.com/file/d/${id}/view`;
// }

export async function uploadWordFileAnonymously(file, folderId = null) {
  const accessToken = "YOUR_MANUALLY_GENERATED_TOKEN"; // 🔴 FOR TESTING ONLY

  const metadata = {
    name: file.name,
    mimeType: file.type,
    ...(folderId && { parents: [folderId] }),
  };

  const form = new FormData();
  form.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" })
  );
  form.append("file", file);

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    }
  );

  const result = await res.json();
  if (!res.ok) throw new Error(`Upload failed: ${result.error?.message}`);
  return `https://drive.google.com/file/d/${result.id}/view`;
}
