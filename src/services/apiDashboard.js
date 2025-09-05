import supabase from "./supabase";
import { PAGE_SIZE } from "../utils/constants";
import Papa from "papaparse";

export async function getSchema({ page }) {
  let query = supabase
    .from("exam_papers")
    .select(
      "subject_code, academic_year,subject_name,semester,uploaded_by,scheme_file_url",
      {
        count: "exact",
      }
    )
    .eq("is_downloaded", true);

  // Pagination: apply a range based on page number and PAGE_SIZE
  if (page) {
    const from = (page - 1) * PAGE_SIZE; // Index to start from
    const to = from + PAGE_SIZE - 1; // Index to end at
    query = query.range(from, to);
  }

  // Execute query, retrieving: data (rows), error object, count (total matching results)
  const { data, error, count } = await query;

  // Throw a user-friendly error on failure
  if (error) {
    throw new Error("SoV papers could not be loaded!");
  }

  // Return both page's rows and total count (for pagination UI)
  return { data, count };
}

// file: CSV file object from user
export async function uploadSubjectsFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async function (results) {
        const subjects = results.data;

        // Updated validation to include all 6 document URLs
        const requiredFields = [
          "subject_code",
          "subject_name",
          "subject_type",
          "department_id",
          "instructions_url",
          "syllabus_url",
          "model_paper_url",
          "declaration_url",
          "see_template_url",
          "scheme_template_url",
        ];

        // Enhanced validation for all required fields including URLs
        const validRows = subjects
          .filter((row) => {
            return (
              requiredFields.every((field) => {
                return (
                  row[field] &&
                  typeof row[field] === "string" &&
                  row[field].trim() !== ""
                );
              }) && !isNaN(Number(row.department_id))
            );
          })
          .map((row) => ({
            subject_code: row.subject_code,
            subject_name: row.subject_name,
            subject_type: row.subject_type,
            department_id: Number(row.department_id),
            // Add the 6 document URLs
            instructions_url: row.instructions_url,
            syllabus_url: row.syllabus_url,
            model_paper_url: row.model_paper_url,
            declaration_url: row.declaration_url,
            see_template_url: row.see_template_url,
            scheme_template_url: row.scheme_template_url,
          }));

        if (validRows.length === 0) {
          reject(
            new Error(
              "No valid rows found. All fields including document URLs must be present for every subject!"
            )
          );
          return;
        }

        // Report skipped rows for debugging
        const skippedCount = subjects.length - validRows.length;
        if (skippedCount > 0) {
          console.warn(
            `Skipped ${skippedCount} invalid rows out of ${subjects.length} total rows`
          );
        }

        // Upsert using subject_code to avoid duplicates
        const { data, error } = await supabase
          .from("subjects")
          .upsert(validRows, { onConflict: ["subject_code"] });

        if (error) {
          reject(error);
        } else {
          resolve({
            data,
            processed: validRows.length,
            skipped: skippedCount,
            total: subjects.length,
          });
        }
      },
      error: (err) => reject(err),
    });
  });
}

// file: CSV file selected by CoE user in file input
export async function uploadExamScheduleFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async function (results) {
        const exams = results.data;

        // Validate: all columns required and correctly typed!
        const validRows = exams
          .filter(
            (row) =>
              row.exam_name &&
              row.department_id &&
              row.semester &&
              row.scheme &&
              row.exam_datetime &&
              row.subject_id &&
              row.academic_year &&
              !isNaN(Number(row.department_id)) &&
              !isNaN(Number(row.subject_id)) &&
              !isNaN(Number(row.academic_year))
          )
          .map((row) => ({
            exam_name: row.exam_name,
            department_id: Number(row.department_id),
            semester: row.semester,
            scheme: row.scheme,
            exam_datetime: row.exam_datetime, // Must be ISO format (YYYY-MM-DDTHH:mm)
            subject_id: Number(row.subject_id),
            academic_year: Number(row.academic_year),
          }));

        if (validRows.length === 0) {
          reject(
            new Error(
              "No valid exam rows found. Each row must fill all required fields!"
            )
          );
          return;
        }

        // Bulk insert into 'exams' table
        const { data, error } = await supabase.from("exams").insert(validRows);

        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      },
      error: (err) => reject(err),
    });
  });
}
