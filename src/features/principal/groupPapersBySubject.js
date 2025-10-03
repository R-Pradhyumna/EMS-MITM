/**
 * Paper Grouping Utility for Principal Table
 *
 * Utility function that transforms flat array of examination papers into
 * subject-grouped rows optimized for Principal's daily download table rendering.
 * Each row represents one subject with fixed number of paper slots.
 *
 * @module groupPapersBySubject
 */

/**
 * Groups exam papers by subject_code for Principal table row-wise rendering.
 *
 * Transforms a flat array of papers into grouped rows where each row represents
 * a single subject with multiple paper "slots" (columns). This structure is
 * specifically designed for Principal's daily paper download interface where:
 * - Each row = one subject
 * - Each column = one paper slot (download opportunity)
 * - Empty slots are filled with null for consistent UI rendering
 *
 * Grouping process:
 * 1. Groups papers by subject_code into subject rows
 * 2. Sorts papers within each group by created_at (oldest first)
 * 3. Pads paper arrays to exact length with nulls (for empty slots)
 * 4. Truncates excess papers if more than papersPerRow
 * 5. Adds download status from optional map
 *
 * Download status tracking:
 * - downloadedSubjectsMap marks entire subject rows as downloaded
 * - Used to disable download buttons for already-downloaded subjects
 * - Prevents duplicate downloads while keeping slots visible
 *
 * Row structure guarantees:
 * - All rows have exactly papersPerRow elements in papers array
 * - Empty slots represented by null (not undefined)
 * - Consistent structure for table rendering without conditionals
 *
 * @param {Array<Object>} papers - Flat array of paper objects from database query
 * @param {Object} papers[].id - Paper unique identifier
 * @param {string} papers[].subject_code - Subject code for grouping
 * @param {string} papers[].subject_name - Subject name
 * @param {string|number} papers[].academic_year - Academic year
 * @param {string} papers[].semester - Semester value
 * @param {string} papers[].created_at - ISO timestamp for sorting
 * @param {string} papers[].status - Paper status (Locked, Downloaded, etc.)
 * @param {Object} [downloadedSubjectsMap={}] - Map of subject_code to download status (true if downloaded)
 * @param {number} [papersPerRow=5] - Number of paper slots per row (table columns)
 * @returns {Array<Object>} Array of subject-grouped row objects
 *
 * @example
 * // Basic usage with papers array
 * const papers = [
 *   { subject_code: 'CS501', subject_name: 'Data Structures', created_at: '2025-01-01', ... },
 *   { subject_code: 'CS501', subject_name: 'Data Structures', created_at: '2025-01-02', ... },
 *   { subject_code: 'CS502', subject_name: 'Algorithms', created_at: '2025-01-01', ... }
 * ];
 *
 * const grouped = groupPapersBySubject(papers);
 * // Result:
 * // [
 * //   {
 * //     subject_code: 'CS501',
 * //     subject_name: 'Data Structures',
 * //     academic_year: '2024',
 * //     semester: '5',
 * //     papers: [paper1, paper2, null, null, null], // 5 slots
 * //     downloaded: false
 * //   },
 * //   {
 * //     subject_code: 'CS502',
 * //     subject_name: 'Algorithms',
 * //     papers: [paper3, null, null, null, null],
 * //     downloaded: false
 * //   }
 * // ]
 *
 * @example
 * // With download status tracking
 * const downloadedMap = {
 *   'CS501': true,  // This subject already downloaded
 *   'CS502': false
 * };
 *
 * const grouped = groupPapersBySubject(papers, downloadedMap);
 * // CS501 row will have downloaded: true (disables download button)
 *
 * @example
 * // Custom number of slots per row
 * const grouped = groupPapersBySubject(papers, {}, 3);
 * // Each row will have exactly 3 paper slots
 *
 * @example
 * // Usage in Principal table component
 * function PrincipalPapersTable({ papers, downloadedSubjects }) {
 *   const rows = groupPapersBySubject(papers, downloadedSubjects, 5);
 *
 *   return (
 *     <table>
 *       <thead>
 *         <tr>
 *           <th>Subject</th>
 *           <th>Slot 1</th>
 *           <th>Slot 2</th>
 *           <th>Slot 3</th>
 *           <th>Slot 4</th>
 *           <th>Slot 5</th>
 *         </tr>
 *       </thead>
 *       <tbody>
 *         {rows.map(row => (
 *           <tr key={row.subject_code}>
 *             <td>{row.subject_name}</td>
 *             {row.papers.map((paper, idx) => (
 *               <td key={idx}>
 *                 {paper ? (
 *                   <DownloadButton
 *                     paper={paper}
 *                     disabled={row.downloaded}
 *                   />
 *                 ) : (
 *                   <EmptySlot />
 *                 )}
 *               </td>
 *             ))}
 *           </tr>
 *         ))}
 *       </tbody>
 *     </table>
 *   );
 * }
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
