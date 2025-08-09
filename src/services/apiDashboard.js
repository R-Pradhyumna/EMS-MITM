import supabase from "./supabase";
import { PAGE_SIZE } from "../utils/constants";
import Papa from "papaparse";

export async function getSchema({ page }) {
  let query = supabase
    .from("exam_papers")
    .select("*", { count: "exact" })
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

        // Validate: All fields must be present and non-null/non-empty
        const validRows = subjects
          .filter(
            (row) =>
              row.subject_code && // must exist and not be empty
              row.subject_name && // must exist and not be empty
              row.subject_type && // must exist and not be empty
              row.department_id && // must exist and not be empty/string
              !isNaN(Number(row.department_id)) // must be a valid department ID (number)
          )
          .map((row) => ({
            subject_code: row.subject_code,
            subject_name: row.subject_name,
            subject_type: row.subject_type,
            department_id: Number(row.department_id),
          }));

        if (validRows.length === 0) {
          reject(
            new Error(
              "No valid rows found. All fields must be present for every subject!"
            )
          );
          return;
        }

        // Upsert using subject_code to avoid duplicates, but only with valid complete rows
        const { data, error } = await supabase
          .from("subjects")
          .upsert(validRows, { onConflict: ["subject_code"] });

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
