/**
 * Groups exam papers by their subject_code for PrincipalTable row-wise rendering.
 *
 * @param {Array<Object>} papers - Flat array of paper objects (typically from DB query).
 * @param {Object} downloadedSubjectsMap - Optional: map of subject_code to true/false if previously downloaded (for UI lock state/per-row disable).
 * @param {Number} papersPerRow - How many paper "slots" to show per row (UI columns), default is 5.
 * @returns {Array<Object>} Array of subject-grouped rows, each with subject_code, subject details,
 *                         a capped-and-padded papers array (length = papersPerRow), and lock state.
 *
 * Example returned row format:
 * [
 *   {
 *     subject_code: "18CS32",
 *     subject_name: "Data Structures",
 *     academic_year: "2023",
 *     semester: "4",
 *     papers: [paperObj, paperObj, null, null, null], // always length = papersPerRow
 *     downloaded: true
 *   },
 *   ...
 * ]
 */
export function groupPapersBySubject(
  papers,
  downloadedSubjectsMap = {},
  papersPerRow = 5
) {
  // Use object to group papers per subject_code
  const grouped = {};

  // 1. Grouping step: iterate through flat papers array
  for (const paper of papers) {
    const code = paper.subject_code;
    // If this subject code hasn't been seen, start new group row
    if (!grouped[code]) {
      grouped[code] = {
        subject_code: code,
        subject_name: paper.subject_name, // Consistent per group
        academic_year: paper.academic_year, // For filters, sort, display
        semester: paper.semester,
        papers: [],
        downloaded: !!downloadedSubjectsMap[code], // UI disables download for this subject row
      };
    }
    // Place this paper in the subject's group
    grouped[code].papers.push(paper);
  }

  // 2. Post-processing for UI:
  //   - Sort by created_at (oldest first, can change as needed)
  //   - Pad/truncate papers array to exact "paper slot" count
  Object.values(grouped).forEach((row) => {
    // Sort papers for consistent order (by created_at asc)
    row.papers.sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
    // Pad with nulls (if less than papersPerRow)
    while (row.papers.length < papersPerRow) {
      row.papers.push(null);
    }
    // Enforce paper array length = papersPerRow (truncate any extras)
    row.papers = row.papers.slice(0, papersPerRow);
  });

  // 3. Return the grouped rows as an array, ready for table consumption
  return Object.values(grouped);
}
