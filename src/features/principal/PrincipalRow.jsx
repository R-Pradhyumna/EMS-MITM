import styled from "styled-components";
import Button from "../../ui/Button";
import Table from "../../ui/Table";

// Styled cell for subject code: large font, bold, gray
const SubCode = styled.div`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-600);
  font-family: "Sono";
`;

/**
 * PrincipalRow
 * -------------
 * Displays a single row in the Principal's papers table:
 * - Shows subject code
 * - Renders a set of paper "slots" (always PAPER_SLOTS per row, for grid alignment)
 *
 * Behavior:
 * - Once any paper for this subject is downloaded (for the current session/tab),
 *   ALL download buttons for this row become disabled for that session.
 * - Already downloaded papers, if shown, display as "Downloaded".
 *
 * Props:
 * - row:        { subject_code, papers: [...] }
 * - rowIdx:     Row's index in the table, for loading spinner
 * - onDownload: Callback to parent (should invoke backend and handle session lock)
 * - PAPER_SLOTS: Number of paper columns (table stays aligned even if fewer papers)
 * - isLoading:  True when download API call is in progress (disables buttons)
 * - downloaded: True if this subject has been "locked" for this session (UI disables all slots)
 */
function PrincipalRow({
  row, // Contains subject_code and array of papers
  rowIdx, // Numeric index for row-specific logic/UI
  onDownload, // Parent callback for downloading a paper
  PAPER_SLOTS, // Table columns to always render
  isLoading, // If true, this row is in-loading state (api call in progress)
  downloaded, // If true, this subject is locked for this session (all buttons disabled)
}) {
  // Parse row data
  const { subject_code, papers = [] } = row;

  // Always show PAPER_SLOTS columns: pad with nulls if not enough papers
  const paddedPapers = [
    ...papers,
    ...Array(Math.max(0, PAPER_SLOTS - papers.length)).fill(null),
  ];

  // Download handler (calls parent; disables all slots for this subject after one download in this session)
  function handleDownload(paper) {
    // Only allow if NOT locked in this session, and not already loading
    if (!downloaded && !isLoading) {
      onDownload(paper, rowIdx);
    }
  }

  // (Optional utility: checks if any paper is marked as downloaded in DB.
  // Not directly used in disabling since 'downloaded' prop handles session lock.)
  const anyDownloaded = papers.some((p) => p && p.is_downloaded);

  // Render table row:
  // - First cell: subject code
  // - The rest: paper slots (button per paper, dash for filler slots)
  return (
    <Table.Row>
      {/* Subject Code column (bold, left) */}
      <SubCode>{subject_code}</SubCode>

      {/* Render fixed number PAPER_SLOTS columns.
          Each slot: button if real paper, dash if empty
          All buttons disabled if:
            - 'downloaded' (session lock for subject)
            - 'isLoading' (API busy)
            - 'paper.is_downloaded' (this slot downloaded in DB)
      */}
      {paddedPapers.map((paper, idx) => (
        <div
          key={
            paper
              ? `${subject_code}-${paper.id}` // Unique key for real paper
              : `${subject_code}-slot-${idx}` // Key for filler slot
          }
        >
          {paper ? (
            <Button
              as="button"
              // Button disabling logic:
              // - 'downloaded' disables all slots for the subject in this session
              // - 'isLoading' disables during download API
              // - 'paper.is_downloaded' disables this particular paper by DB flag
              disabled={downloaded || isLoading || paper.is_downloaded}
              onClick={() => handleDownload(paper)}
            >
              {/* Button label: 
                  - "Downloaded" for already-downloaded papers
                  - "Download QP" for available papers */}
              {paper.is_downloaded ? "Downloaded" : "Download QP"}
            </Button>
          ) : (
            // Render dash if slot is just a grid filler
            "-"
          )}
        </div>
      ))}
    </Table.Row>
  );
}

export default PrincipalRow;
