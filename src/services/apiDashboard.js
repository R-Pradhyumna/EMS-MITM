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
 * for dashboard display and tracking purposes. Only includes essential fields for
 * performance optimization.
 *
 * @async
 * @param {Object} params - Query parameters
 * @param {number} [params.page] - Page number for pagination (1-based)
 * @returns {Promise<Object>} Paginated SoV papers and total count
 * @returns {Array<Object>} returns.data - Array of paper objects
 * @returns {string} returns.data[].subject_code - Subject code
 * @returns {string} returns.data[].academic_year - Academic year
 * @returns {string} returns.data[].subject_name - Subject name
 * @returns {string} returns.data[].semester - Semester value
 * @returns {string} returns.data[].uploaded_by - Employee ID of uploader
 * @returns {string} returns.data[].scheme_file_url - URL to scheme file
 * @returns {number} returns.count - Total count of downloaded SoV papers
 * @throws {Error} If SoV papers cannot be loaded from database
 *
 * @example
 * const result = await getSchema({ page: 1 });
 * console.log(`Found ${result.count} downloaded SoV papers`);
 *
 * @example
 * // Display all downloaded papers
 * const result = await getSchema({});
 * result.data.forEach(paper => {
 *   console.log(`${paper.subject_code}: ${paper.scheme_file_url}`);
 * });
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
 * Automatically maps department_name to department_id via database trigger.
 * Validates all required fields and provides detailed error reporting for invalid rows.
 *
 * @async
 * @param {File} file - CSV file object from user file input
 * @returns {Promise<Object>} Import results with processing statistics
 * @returns {*} returns.data - Database insert response data
 * @returns {number} returns.processed - Count of successfully validated and imported rows
 * @returns {number} returns.skipped - Count of invalid rows that were not imported
 * @returns {number} returns.total - Total number of rows parsed from CSV
 * @throws {Error} If no valid rows found or CSV parsing/database operation fails
 *
 * @description
 * CSV Format Requirements (all fields required):
 * - subject_code (string): Unique subject identifier (e.g., "M23BCS501")
 * - subject_name (string): Full name of the subject (e.g., "Theory of Computation")
 * - semester (string): Semester number (e.g., "1", "2", "3", etc.)
 * - academic_year (number): Academic year (e.g., 2023, 2024)
 * - subject_type (string, optional): Type/category of subject (defaults to "departmental")
 * - department_name (string): Department name (e.g., "ISE", "CSE")
 *   → Trigger automatically maps this to department_id; ensure department exists in database
 *
 * CSV Parsing Notes:
 * - Column headers are automatically trimmed to handle whitespace
 * - Empty lines are skipped
 * - Non-numeric academic_year values cause row to be rejected
 * - Missing or empty required fields cause row to be rejected
 * - Invalid rows are logged to console for debugging
 *
 * @example
 * // Basic file upload
 * const fileInput = document.getElementById('subjectsFile');
 * const result = await uploadSubjectsFile(fileInput.files[0]);
 * console.log(`Imported ${result.processed}/${result.total} subjects`);
 *
 * @example
 * // With error handling
 * try {
 *   const result = await uploadSubjectsFile(file);
 *   if (result.skipped > 0) {
 *     console.warn(`⚠️ Warning: ${result.skipped} rows were invalid and skipped`);
 *   }
 *   if (result.processed > 0) {
 *     console.log(`✓ Successfully imported ${result.processed} subjects`);
 *   }
 * } catch (error) {
 *   console.error('Import failed:', error.message);
 * }
 */
export async function uploadSubjectsFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(), // ✅ Trim header whitespace
      complete: async function (results) {
        const subjects = results.data;

        const requiredFields = [
          "subject_code",
          "subject_name",
          "semester",
          "academic_year",
          "department_name",
        ];

        // Debug: Log first row to see what's being parsed
        console.log("First row:", subjects[0]);
        console.log("Available columns:", Object.keys(subjects[0] || {}));

        const validRows = subjects
          .filter((row) => {
            const isValid =
              requiredFields.every((field) => {
                const value = row[field];
                return (
                  value && typeof value === "string" && value.trim() !== ""
                );
              }) && !isNaN(Number(row.academic_year));

            if (!isValid) {
              console.warn("Invalid row:", row);
            }

            return isValid;
          })
          .map((row) => ({
            subject_code: row.subject_code.trim(),
            subject_name: row.subject_name.trim(),
            semester: row.semester.trim(),
            academic_year: Number(row.academic_year),
            subject_type: row.subject_type?.trim() || "departmental",
            department_name: row.department_name.trim(),
          }));

        if (validRows.length === 0) {
          reject(
            new Error(
              `No valid rows found. Required fields: ${requiredFields.join(
                ", "
              )}\n` + `First row parsed as: ${JSON.stringify(subjects[0])}`
            )
          );
          return;
        }

        const skippedCount = subjects.length - validRows.length;
        if (skippedCount > 0) {
          console.warn(
            `Skipped ${skippedCount} invalid rows out of ${subjects.length} total rows`
          );
        }

        const { data, error } = await supabase
          .from("subjects")
          .insert(validRows); // ✅ Simple insert, no conflict handling

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
 * Uploads and imports exam schedules from a CSV file with comprehensive validation.
 * Automatically maps department_name to department_id via database trigger.
 * Handles flexible date formats (DD-MM-YYYY and YYYY-MM-DD) with automatic conversion.
 *
 * @async
 * @param {File} file - CSV file object from user file input (text/csv or .csv extension)
 * @returns {Promise<Object>} Import results with processing statistics
 * @returns {*} returns.data - Database insert response data
 * @returns {number} returns.processed - Count of successfully validated and imported exam rows
 * @returns {number} returns.skipped - Count of invalid rows that were not imported
 * @returns {number} returns.total - Total number of rows parsed from CSV
 * @throws {Error} If no valid rows found, CSV parsing fails, or database operation fails
 *
 * @description
 * CSV Format Requirements (all fields required):
 * - exam_name (string): Name/title of the examination (e.g., "ISE Sem 5 - TOC")
 * - semester (string): Semester number (e.g., "5", "7")
 * - exam_datetime (string): Date of exam in DD-MM-YYYY or YYYY-MM-DD format
 *   → Automatically converted to YYYY-MM-DD before database insertion
 * - academic_year (number): Academic year (e.g., 2023, 2024, 2025)
 * - department_name (string): Department name (e.g., "ISE", "CSE")
 *   → Trigger automatically maps this to department_id; ensure department exists
 * - subject_name (string, optional): Name of subject being examined
 *
 * Date Format Handling:
 * - Both DD-MM-YYYY and YYYY-MM-DD formats are accepted
 * - Excel-formatted dates (DD-MM-YYYY) are automatically converted
 * - Date validation occurs before database insertion
 * - Invalid date formats cause row to be rejected
 *
 * CSV Parsing Notes:
 * - Column headers are automatically trimmed to handle whitespace
 * - Empty lines are skipped
 * - Non-numeric semester and academic_year values cause row rejection
 * - Missing or empty required fields cause row rejection
 * - Invalid rows are skipped silently and logged to console for debugging
 *
 * @example
 * // Basic exam schedule import
 * const fileInput = document.getElementById('examScheduleFile');
 * const result = await uploadExamScheduleFile(fileInput.files[0]);
 * console.log(`Imported ${result.processed}/${result.total} exam schedules`);
 *
 * @example
 * // With comprehensive error handling and feedback
 * try {
 *   const result = await uploadExamScheduleFile(file);
 *   if (result.processed === 0) {
 *     alert('No valid exam records found in CSV');
 *   } else {
 *     console.log(`✓ Successfully imported ${result.processed} exams`);
 *     if (result.skipped > 0) {
 *       console.warn(`⚠️ Skipped ${result.skipped} invalid rows`);
 *     }
 *   }
 * } catch (error) {
 *   if (error.message.includes('No valid exam rows')) {
 *     alert('CSV file format is invalid. Please check:\n' +
 *           '- All required columns present\n' +
 *           '- Date format is DD-MM-YYYY or YYYY-MM-DD\n' +
 *           '- No empty cells in required fields');
 *   } else {
 *     console.error('Exam import failed:', error.message);
 *   }
 * }
 */
export async function uploadExamScheduleFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: async function (results) {
        const exams = results.data;

        const requiredFields = [
          "exam_name",
          "semester",
          "exam_datetime",
          "academic_year",
          "department_name",
        ];

        // ✅ Accept BOTH formats: YYYY-MM-DD and DD-MM-YYYY
        const dateRegex = /^(\d{4}-\d{2}-\d{2}|\d{2}-\d{2}-\d{4})$/;

        console.log("Total rows parsed:", exams.length);
        console.log("First row:", exams[0]);

        const validRows = exams
          .filter((row) => {
            return (
              requiredFields.every((field) => {
                const value = row[field];
                return (
                  value && typeof value === "string" && value.trim() !== ""
                );
              }) &&
              dateRegex.test(row.exam_datetime.trim()) &&
              !isNaN(Number(row.academic_year)) &&
              !isNaN(Number(row.semester))
            );
          })
          .map((row) => {
            let dateStr = row.exam_datetime.trim();

            // ✅ Convert DD-MM-YYYY to YYYY-MM-DD
            if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
              const [day, month, year] = dateStr.split("-");
              dateStr = `${year}-${month}-${day}`;
            }

            return {
              exam_name: row.exam_name.trim(),
              semester: row.semester.trim(),
              exam_datetime: dateStr, // ✅ Now YYYY-MM-DD
              academic_year: Number(row.academic_year),
              department_name: row.department_name.trim(),
              subject_name: row.subject_name?.trim() || null,
            };
          });

        if (validRows.length === 0) {
          reject(
            new Error(
              "No valid exam rows found. Date format can be YYYY-MM-DD or DD-MM-YYYY"
            )
          );
          return;
        }

        const skippedCount = exams.length - validRows.length;
        if (skippedCount > 0) {
          console.warn(`Skipped ${skippedCount} invalid rows`);
        }

        const { data, error } = await supabase
          .from("exams")
          .insert(validRows)
          .select();

        if (error) {
          reject(error);
        } else {
          resolve({
            data,
            processed: validRows.length,
            skipped: skippedCount,
            total: exams.length,
          });
        }
      },
      error: (err) => reject(err),
    });
  });
}
