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
 * Displays a single row in the Principal's papers table,
 * with subject code and a set of paper "slots" (button per paper if available).
 *
 * Props:
 * - row:    Object containing { subject_code, papers: [...] }
 * - rowIdx: Numeric index for UI and loading tracking
 * - onDownload: Callback to trigger download (parent will perform lock/update/UI)
 * - PAPER_SLOTS: How many "paper columns" should always be rendered
 * - isLoading: Boolean, true if this row is in-progress of downloading
 * - downloaded: Boolean, true if this subject/row is already locked (disable download)
 */
function PrincipalRow({
  row, // contains subject_code and list of papers for this subject
  rowIdx, // the index of this row (used for per-row loading UI)
  onDownload, // parent callback for downloading a paper
  PAPER_SLOTS, // number of columns/slots to show, for layout consistency
  isLoading,
  downloaded,
}) {
  // Destructure data for convenience
  const { subject_code, papers = [] } = row;

  // Always display PAPER_SLOTS columns:
  // If fewer than PAPER_SLOTS papers, pad with null (so every row is aligned)
  const paddedPapers = [
    ...papers,
    ...Array(Math.max(0, PAPER_SLOTS - papers.length)).fill(null),
  ];

  // Trigger the per-paper download logic
  function handleDownload(paper) {
    if (!downloaded && !isLoading) {
      // Optionally open file immediately—actual locked download
      // logic (lockout/UI update) always handled in parent after backend response
      window.open(paper.qp_file_url, "_blank");
      onDownload(paper, rowIdx);
    }
  }

  // Render table row: first cell is subject code, the rest are paper slots with download buttons or dashes
  return (
    <Table.Row>
      {/* Subject Code column */}
      <SubCode>{subject_code}</SubCode>
      {/* Render PAPER_SLOTS columns, each as button if real paper or dash if empty */}
      {paddedPapers.map((paper, idx) => (
        <div
          key={
            paper
              ? `${subject_code}-${paper.id}` // Unique key for actual paper
              : `${subject_code}-slot-${idx}` // Key for filler/blank column
          }
        >
          {paper ? (
            <>
              {paper.qp_file_url && (
                <Button
                  as="button"
                  // Disable if this subject/row is locked out or row is currently loading
                  disabled={downloaded || isLoading}
                  // Initiate download when clicked
                  onClick={() => handleDownload(paper, rowIdx)}
                >
                  Download QP
                </Button>
              )}
            </>
          ) : (
            // Show a dash for filler/empty slots (keeps table aligned)
            "-"
          )}
        </div>
      ))}
    </Table.Row>
  );
}

export default PrincipalRow;
