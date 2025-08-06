/**
 * Groups papers by subject_code for PrincipalTable row-wise rendering.
 *
 * @param {Array} papers - Flat array of paper objects (as returned from the database query)
 * @param {Object} downloadedSubjectsMap - (Optional) Object mapping subject_code to true/false if subject was already downloaded (for UI lock state)
 * @param {Number} papersPerRow - How many papers to show per row (slots); default is 5.
 *
 * @returns {Array} Array of objects, each representing one table row:
 *   [
 *     {
 *       subject_code,
 *       subject_name,
 *       academic_year,
 *       semester,
 *       papers: [paper, ... null slots],
 *       downloaded // Boolean: is this row already locked by download?
 *     }
 *   ]
 */
export function groupPapersBySubject(
  papers,
  downloadedSubjectsMap = {}, // { subject_code: true } if row is downloaded already for UI
  papersPerRow = 5
) {
  // This will accumulate all rows grouped by subject_code
  const grouped = {};

  // Loop through all paper objects
  for (const paper of papers) {
    const code = paper.subject_code;
    // If this subject_code group does not exist yet, create it
    if (!grouped[code]) {
      grouped[code] = {
        subject_code: code, // Unique key for the row group
        subject_name: paper.subject_name, // Always use the same subject name for group
        academic_year: paper.academic_year, // Useful for display or sorting/filtering
        semester: paper.semester, // Ditto
        papers: [], // Will hold all paper objects for this subject
        // Whether this row is locked/disabled for download in the UI
        downloaded: !!downloadedSubjectsMap[code],
      };
    }
    // Push current paper into the correct group
    grouped[code].papers.push(paper);
  }

  // Now for UI rendering: cap + fill the paper list for each row
  Object.values(grouped).forEach((row) => {
    // Optional: sort by creation date (oldest to newest)
    row.papers.sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
    // Fill with nulls to always have exactly N paper slots per row
    while (row.papers.length < papersPerRow) {
      row.papers.push(null);
    }
    // Ensure the array never grows beyond the allowed number of slots
    row.papers = row.papers.slice(0, papersPerRow);
  });

  // Return as a plain array (rows for your table)
  return Object.values(grouped);
}
