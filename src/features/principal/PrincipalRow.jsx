import styled from "styled-components";
import Button from "../../ui/Button";
import Table from "../../ui/Table";

const SubCode = styled.div`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-600);
  font-family: "Sono";
`;

function PrincipalRow({
  row, // One "grouped" subject row from PrincipalTable (contains subject_code, papers[])
  rowIdx, // The index of this row in the parent table (used for per-row loading/tracking)
  onDownload, // Callback to parent to be invoked when a paper download is triggered
  PAPER_SLOTS, // Number of paper columns (max papers per subject row to render)
  isLoading, // Boolean: Is this row currently in its "downloading" state (used to disable button)
  downloaded, // Boolean: Has the download for this subject/row been completed (disables button)
}) {
  // Destructure the subject code and list of papers for this subject row
  const { subject_code, papers = [] } = row;

  // Ensure we display exactly PAPER_SLOTS columns always:
  // - Fill in nulls if fewer than PAPER_SLOTS actual papers (for blank UI cells)
  const paddedPapers = [
    ...papers,
    ...Array(Math.max(0, PAPER_SLOTS - papers.length)).fill(null),
  ];

  // Handles the download logic for one paper
  function handleDownload(paper) {
    // Only allow download if not already downloaded and not currently downloading (per-row)
    if (!downloaded && !isLoading) {
      // Optionally: still open the file in the UI, but usually this should be done after backend records download
      window.open(paper.qp_file_url, "_blank"); // (Optional, as final download should come after API says "OK")

      // Call the parent's onDownload handler, passing the paper object and the row index for tracking
      // Parent handles locking, tracking, state updates, download API mutation, etc.
      onDownload(paper, rowIdx);
    }
  }

  // Render all paper download buttons for this subject/row
  return (
    <Table.Row>
      {/* Show subject code in the first cell */}
      <SubCode>{subject_code}</SubCode>
      {/* For each paper slot (real or blank), map and render its download cell */}
      {paddedPapers.map((paper, idx) => (
        <div
          key={
            paper
              ? `${subject_code}-${paper.id}` // Unique key if real paper
              : `${subject_code}-slot-${idx}` // Unique key if blank filler cell
          }
        >
          {paper ? (
            <>
              {paper.qp_file_url && (
                <Button
                  as="button"
                  // Button is disabled if already downloaded (lock) or if loading is active for this row
                  disabled={downloaded || isLoading}
                  // On click, initiate download of this paper (send to parent logic)
                  onClick={() => handleDownload(paper, rowIdx)}
                >
                  Download QP
                </Button>
              )}
            </>
          ) : (
            // If the slot is empty, show a dash for layout/empty cell
            "-"
          )}
        </div>
      ))}
    </Table.Row>
  );
}

// function PrincipalRow({ row, onDownload, PAPER_SLOTS }) {
//   const { subject_code, papers = [], downloaded } = row;

//   // Pad papers array to fixed slots length for consistent column layout
//   const paddedPapers = [
//     ...papers,
//     ...Array(Math.max(0, PAPER_SLOTS - papers.length)).fill(null),
//   ];

//   return (
//     <Table.Row>
//       <div>{subject_code}</div>
//       {paddedPapers.map((paper, idx) => (
//         <div
//           key={
//             paper
//               ? `${subject_code}-${paper.id}`
//               : `${subject_code}-slot-${idx}`
//           }
//         >
//           {paper ? (
//             <>
//               {paper.qp_file_url && (
//                 <Button
//                   as="a"
//                   href={paper.qp_file_url}
//                   download
//                   target="_blank"
//                   style={{ marginRight: ".5rem" }}
//                 >
//                   Download QP
//                 </Button>
//               )}
//             </>
//           ) : (
//             "-"
//           )}
//         </div>
//       ))}
//     </Table.Row>
//   );
// }

export default PrincipalRow;
