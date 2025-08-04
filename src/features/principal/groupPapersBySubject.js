/**
 * Groups papers by subject_code for PrincipalTable row-wise rendering.
 * @param {Array} papers - flat array of paper objects as returned by the db
 * @param {Object} downloadedSubjectsMap - Optional. Map of subject_code -> true if already downloaded
 * @returns {Array} Array of objects: { subject_code, subject_name, papers: [paper, ...], downloaded }
 */
export function groupPapersBySubject(
  papers,
  downloadedSubjectsMap = {},
  papersPerRow = 5 // default to 5 slots
) {
  const grouped = {};

  for (const paper of papers) {
    const code = paper.subject_code;
    if (!grouped[code]) {
      grouped[code] = {
        subject_code: code,
        subject_name: paper.subject_name,
        academic_year: paper.academic_year,
        semester: paper.semester,
        papers: [],
        downloaded: !!downloadedSubjectsMap[code],
      };
    }
    grouped[code].papers.push(paper);
  }

  // Always return fixed number of slots per subject
  Object.values(grouped).forEach((row) => {
    row.papers.sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
    // Fill up to N slots with nulls if needed
    while (row.papers.length < papersPerRow) {
      row.papers.push(null);
    }
    // Optionally, trim to max allowed
    row.papers = row.papers.slice(0, papersPerRow);
  });

  return Object.values(grouped);
}
