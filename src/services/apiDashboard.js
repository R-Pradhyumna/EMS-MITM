/**
 * Dashboard API Module
 *
 * Provides API functions for dashboard operations including:
 * - Retrieving downloaded Scheme of Valuation (SoV) papers
 * - Bulk uploading subjects data via CSV import
 * - Bulk uploading exam schedules via CSV import
 *
 * Uses PapaParse for CSV parsing and validation before database operations.
 *
 * @module apiDashboard
 */

import supabase from "./supabase";
import { PAGE_SIZE } from "../utils/constants";
import Papa from "papaparse";

/**
 * Retrieves paginated list of Scheme of Valuation papers that have been downloaded.
 *
 * Fetches papers marked as downloaded (is_downloaded = true) with relevant metadata
 * for dashboard display and tracking purposes.
 *
 * @async
 * @param {Object} params - Query parameters
 * @param {number} [params.page] - Page number for pagination (1-based)
 * @returns {Promise<Object>} Paginated SoV papers and total count
 * @returns {Array<Object>} returns.data - Array of paper objects with subject_code, academic_year, subject_name, semester, uploaded_by, scheme_file_url
 * @returns {number} returns.count - Total count of downloaded SoV papers
 * @throws {Error} If SoV papers cannot be loaded from database
 *
 * @example
 * const result = await getSchema({ page: 1 });
 * console.log(`Found ${result.count} downloaded SoV papers`);
 */
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

/**
 * Uploads and imports subjects from a CSV file with comprehensive validation.
 *
 * Processes CSV file containing subject data including all required document URLs.
 * Performs validation on all required fields and skips invalid rows while logging warnings.
 * Uses upsert operation to avoid duplicates based on subject_code.
 *
 * Required CSV columns:
 * - subject_code: Unique subject identifier
 * - subject_name: Full name of the subject
 * - subject_type: Type/category of subject
 * - department_id: Numeric department identifier
 * - instructions_url: URL to subject instructions document
 * - syllabus_url: URL to syllabus document
 * - model_paper_url: URL to model question paper
 * - declaration_url: URL to declaration document
 * - see_template_url: URL to SEE template
 * - scheme_template_url: URL to scheme of valuation template
 *
 * @async
 * @param {File} file - CSV file object from user file input
 * @returns {Promise<Object>} Import results with statistics
 * @returns {*} returns.data - Database response data
 * @returns {number} returns.processed - Number of valid rows successfully imported
 * @returns {number} returns.skipped - Number of invalid rows skipped
 * @returns {number} returns.total - Total number of rows in CSV file
 * @throws {Error} If no valid rows found, CSV parsing fails, or database operation fails
 *
 * @example
 * const fileInput = document.getElementById('subjectsFile');
 * const result = await uploadSubjectsFile(fileInput.files[0]);
 * console.log(`Imported ${result.processed} subjects, skipped ${result.skipped}`);
 */
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

/**
 * Uploads and imports exam schedules from a CSV file with validation.
 *
 * Processes CSV file containing exam schedule data for bulk insertion.
 * Validates all required fields and data types before database insertion.
 * Invalid rows are filtered out and not imported.
 *
 * Required CSV columns:
 * - exam_name: Name/title of the examination
 * - department_id: Numeric department identifier
 * - semester: Semester value (e.g., "5", "7")
 * - scheme: Examination scheme identifier
 * - exam_datetime: ISO format datetime (YYYY-MM-DDTHH:mm)
 * - subject_id: Numeric subject identifier
 * - academic_year: Numeric academic year (e.g., 2024)
 *
 * @async
 * @param {File} file - CSV file object selected by CoE user in file input
 * @returns {Promise<*>} Database response data from bulk insert operation
 * @throws {Error} If no valid rows found, CSV parsing fails, or database operation fails
 *
 * @example
 * const fileInput = document.getElementById('scheduleFile');
 * const result = await uploadExamScheduleFile(fileInput.files[0]);
 * console.log('Exam schedule imported successfully');
 */
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
