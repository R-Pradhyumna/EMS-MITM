/**
 * Uploads and imports subjects from an XLSX file with comprehensive validation.
 * Automatically maps department_name to department_id via database trigger.
 * Validates all required fields and provides detailed error reporting for invalid rows.
 *
 * @async
 * @param {File} file - XLSX file object from user file input
 * @returns {Promise<Object>} Import results with processing statistics
 * @returns {*} returns.data - Database insert response data
 * @returns {number} returns.processed - Count of successfully validated and imported rows
 * @returns {number} returns.skipped - Count of invalid rows that were not imported
 * @returns {number} returns.total - Total number of rows parsed from Excel
 * @throws {Error} If no valid rows found or Excel parsing/database operation fails
 *
 * @description
 * Excel Format Requirements (all fields required):
 * - subject_code (string): Unique subject identifier (e.g., "M23BCS501")
 * - subject_name (string): Full name of the subject (e.g., "Theory of Computation")
 * - semester (string): Semester number (e.g., "1", "2", "3", etc.)
 * - academic_year (number): Academic year (e.g., 2023, 2024)
 * - subject_type (string, optional): Type/category of subject (defaults to "departmental")
 * - department_name (string): Department name (e.g., "ISE", "CSE")
 *   → Trigger automatically maps this to department_id; ensure department exists in database
 *
 * Excel Parsing Notes:
 * - First row must contain column headers (case-sensitive)
 * - Column headers are automatically trimmed to handle whitespace
 * - Empty rows are skipped automatically
 * - Non-numeric academic_year values cause row to be rejected
 * - Missing or empty required fields cause row to be rejected
 * - Invalid rows are logged to console for debugging
 * - Supports .xlsx and .xls formats
 * - Uses dynamic imports for optimal bundle size (tree-shakeable)
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
  // ✅ Dynamic import for tree shaking - only loads xlsx when needed
  const { read, utils } = await import("xlsx");

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async function (e) {
      try {
        // Read the Excel file as array buffer
        const binaryData = new Uint8Array(e.target.result);
        const workbook = read(binaryData, {
          type: "array",
          cellDates: true, // Parse dates as Date objects
          cellNF: false, // Don't include number formats
          cellText: false, // Return typed values, not text
        });

        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON with first row as headers
        const subjects = utils.sheet_to_json(worksheet, {
          raw: false, // Convert values to strings for consistent handling
          defval: "", // Default value for empty cells
          blankrows: false, // Skip empty rows
        });

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
            // Trim all string values in the row and normalize keys
            const trimmedRow = {};
            Object.keys(row).forEach((key) => {
              const trimmedKey = key.trim();
              const value = row[key];
              trimmedRow[trimmedKey] =
                typeof value === "string" ? value.trim() : value;
            });

            // Replace original row with trimmed version for validation
            Object.assign(row, trimmedRow);

            const isValid =
              requiredFields.every((field) => {
                const value = row[field];
                return (
                  value !== undefined &&
                  value !== null &&
                  value !== "" &&
                  String(value).trim() !== ""
                );
              }) && !isNaN(Number(row.academic_year));

            if (!isValid) {
              console.warn("Invalid row:", row);
            }

            return isValid;
          })
          .map((row) => ({
            subject_code: String(row.subject_code).trim(),
            subject_name: String(row.subject_name).trim(),
            semester: String(row.semester).trim(),
            academic_year: Number(row.academic_year),
            subject_type: row.subject_type
              ? String(row.subject_type).trim()
              : "departmental",
            department_name: String(row.department_name).trim(),
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
      } catch (err) {
        reject(new Error(`Excel parsing failed: ${err.message}`));
      }
    };

    reader.onerror = (err) => reject(new Error(`File reading failed: ${err}`));

    // Read file as ArrayBuffer (recommended for xlsx)
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Uploads and imports exam schedules from an XLSX file with comprehensive validation.
 * Automatically maps department_name to department_id via database trigger.
 * Handles Excel date formats, serial numbers, and text dates with automatic conversion.
 *
 * @async
 * @param {File} file - XLSX file object from user file input (.xlsx or .xls extension)
 * @returns {Promise<Object>} Import results with processing statistics
 * @returns {*} returns.data - Database insert response data
 * @returns {number} returns.processed - Count of successfully validated and imported exam rows
 * @returns {number} returns.skipped - Count of invalid rows that were not imported
 * @returns {number} returns.total - Total number of rows parsed from Excel
 * @throws {Error} If no valid rows found, Excel parsing fails, or database operation fails
 *
 * @description
 * Excel Format Requirements (all fields required):
 * - exam_name (string): Name/title of the examination (e.g., "ISE Sem 5 - TOC")
 * - semester (string/number): Semester number (e.g., "5", "7")
 * - exam_datetime (string/Date): Date of exam in multiple formats:
 *   → Native Excel dates (automatically parsed with cellDates: true)
 *   → DD-MM-YYYY text format (e.g., "15-03-2024")
 *   → YYYY-MM-DD text format (e.g., "2024-03-15")
 *   → Excel serial date numbers (e.g., 45015)
 *   → All formats automatically converted to YYYY-MM-DD for database
 * - academic_year (number): Academic year (e.g., 2023, 2024, 2025)
 * - department_name (string): Department name (e.g., "ISE", "CSE")
 *   → Trigger automatically maps this to department_id; ensure department exists
 * - subject_name (string, optional): Name of subject being examined
 *
 * Excel Date Handling:
 * - Excel Date objects are parsed with cellDates: true option
 * - Excel serial numbers (e.g., 45015) are automatically converted
 * - Text dates in DD-MM-YYYY format are parsed and converted
 * - Text dates in YYYY-MM-DD format are used as-is
 * - Invalid date formats cause row to be rejected
 * - Uses dynamic imports for optimal bundle size
 *
 * Excel Parsing Notes:
 * - First row must contain column headers (case-sensitive)
 * - Column headers are automatically trimmed to handle whitespace
 * - Empty rows are skipped automatically
 * - Non-numeric semester and academic_year values cause row rejection
 * - Missing or empty required fields cause row rejection
 * - Invalid rows are logged to console for debugging
 * - Supports both .xlsx and .xls formats
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
 *     alert('No valid exam records found in Excel file');
 *   } else {
 *     console.log(`✓ Successfully imported ${result.processed} exams`);
 *     if (result.skipped > 0) {
 *       console.warn(`⚠️ Skipped ${result.skipped} invalid rows`);
 *     }
 *   }
 * } catch (error) {
 *   if (error.message.includes('No valid exam rows')) {
 *     alert('Excel file format is invalid. Please check:\n' +
 *           '- All required columns present\n' +
 *           '- Date column contains valid dates\n' +
 *           '- No empty cells in required fields');
 *   } else {
 *     console.error('Exam import failed:', error.message);
 *   }
 * }
 */
export async function uploadExamScheduleFile(file) {
  // ✅ Dynamic import for tree shaking - only loads xlsx when needed
  const { read, utils } = await import("xlsx");

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async function (e) {
      try {
        // Read the Excel file as array buffer
        const binaryData = new Uint8Array(e.target.result);
        const workbook = read(binaryData, {
          type: "array",
          cellDates: true, // ✅ Parse Excel dates as JavaScript Date objects
          cellNF: false,
          cellText: false,
        });

        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON with first row as headers
        const exams = utils.sheet_to_json(worksheet, {
          raw: false, // Convert to strings for consistent handling
          defval: "", // Default value for empty cells
          blankrows: false, // Skip empty rows
        });

        const requiredFields = [
          "exam_name",
          "semester",
          "exam_date", // ✅ Match Excel column name
          "academic_year",
          "department_name",
        ];

        console.log("Total rows parsed:", exams.length);
        console.log("First row:", exams[0]);

        /**
         * Helper function to convert various date formats to YYYY-MM-DD
         * Handles: Excel Date objects, DD-MM-YYYY, YYYY-MM-DD, MM/DD/YY, MM/DD/YYYY, Excel serial numbers
         */
        const convertToYYYYMMDD = (dateValue) => {
          // Case 1: Already a JavaScript Date object (from cellDates: true)
          if (dateValue instanceof Date) {
            const year = dateValue.getFullYear();
            const month = String(dateValue.getMonth() + 1).padStart(2, "0");
            const day = String(dateValue.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
          }

          // Case 2: String date
          if (typeof dateValue === "string") {
            const trimmed = dateValue.trim();

            // ✅ MM/DD/YY format (e.g., "11/9/25")
            if (/^\d{1,2}\/\d{1,2}\/\d{2}$/.test(trimmed)) {
              const [month, day, year] = trimmed.split("/");
              // Convert 2-digit year to 4-digit (25 -> 2025, 95 -> 1995)
              const fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`;
              const paddedMonth = month.padStart(2, "0");
              const paddedDay = day.padStart(2, "0");
              return `${fullYear}-${paddedMonth}-${paddedDay}`;
            }

            // ✅ MM/DD/YYYY format (e.g., "11/9/2025")
            if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
              const [month, day, year] = trimmed.split("/");
              const paddedMonth = month.padStart(2, "0");
              const paddedDay = day.padStart(2, "0");
              return `${year}-${paddedMonth}-${paddedDay}`;
            }

            // DD-MM-YYYY format
            if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
              const [day, month, year] = trimmed.split("-");
              return `${year}-${month}-${day}`;
            }

            // YYYY-MM-DD format (already correct)
            if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
              return trimmed;
            }
          }

          // Case 3: Excel serial number (numeric)
          if (typeof dateValue === "number") {
            // Convert Excel serial date to JS Date
            const excelEpoch = new Date(1899, 11, 30); // Dec 30, 1899
            const jsDate = new Date(
              excelEpoch.getTime() + dateValue * 86400000
            );

            const year = jsDate.getFullYear();
            const month = String(jsDate.getMonth() + 1).padStart(2, "0");
            const day = String(jsDate.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
          }

          return null; // Invalid date format
        };

        const validRows = exams
          .filter((row) => {
            // Trim all string values in the row and normalize keys
            const trimmedRow = {};
            Object.keys(row).forEach((key) => {
              const trimmedKey = key.trim();
              const value = row[key];
              trimmedRow[trimmedKey] =
                typeof value === "string" ? value.trim() : value;
            });

            // Replace original row with trimmed version
            Object.assign(row, trimmedRow);

            // Validate required fields exist and are not empty
            const hasRequiredFields = requiredFields.every((field) => {
              const value = row[field];
              return (
                value !== undefined &&
                value !== null &&
                value !== "" &&
                String(value).trim() !== ""
              );
            });

            // ✅ Fix: Validate date using exam_date field (not exam_datetime)
            const validDate = convertToYYYYMMDD(row.exam_date) !== null;

            // Validate numeric fields
            const validNumericFields =
              !isNaN(Number(row.academic_year)) && !isNaN(Number(row.semester));

            const isValid =
              hasRequiredFields && validDate && validNumericFields;

            if (!isValid) {
              console.warn("Invalid row:", row);
            }

            return isValid;
          })
          .map((row) => {
            // ✅ Fix: Convert exam_date (not exam_datetime)
            const convertedDate = convertToYYYYMMDD(row.exam_date);

            return {
              exam_name: String(row.exam_name).trim(),
              semester: String(row.semester).trim(),
              exam_datetime: convertedDate, // ✅ Database expects exam_datetime
              academic_year: Number(row.academic_year),
              department_name: String(row.department_name).trim(),
              subject_name: row.subject_name
                ? String(row.subject_name).trim()
                : null,
            };
          });

        if (validRows.length === 0) {
          reject(
            new Error(
              `No valid exam rows found. Required fields: ${requiredFields.join(
                ", "
              )}\n` +
                `Supported date formats: Excel dates, DD-MM-YYYY, YYYY-MM-DD, MM/DD/YY, MM/DD/YYYY, Excel serial numbers\n` +
                `First row parsed as: ${JSON.stringify(exams[0])}`
            )
          );
          return;
        }

        const skippedCount = exams.length - validRows.length;
        if (skippedCount > 0) {
          console.warn(
            `Skipped ${skippedCount} invalid rows out of ${exams.length} total rows`
          );
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
      } catch (err) {
        reject(new Error(`Excel parsing failed: ${err.message}`));
      }
    };

    reader.onerror = (err) => reject(new Error(`File reading failed: ${err}`));

    // Read file as ArrayBuffer (recommended for xlsx)
    reader.readAsArrayBuffer(file);
  });
}
