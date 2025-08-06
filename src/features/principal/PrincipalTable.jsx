import { useState, useEffect } from "react";

import Table from "../../ui/Table";
import Noexam from "./../../ui/Noexam";
import Spinner from "../../ui/Spinner";
import Pagination from "../../ui/Pagination";
import PrincipalRow from "./PrincipalRow";

import { usePPapers } from "./usePPapers";
import { PAPER_SLOTS } from "../../utils/constants";
import { useDownloadPaper } from "./useDownloadPaper";

function PrincipalTable() {
  // Fetch papers for the current user/view with a custom React Query hook
  // 'isLoading' - true while papers are being fetched
  // 'papers' (aliased as 'rows') - the subject-grouped/processed papers
  // 'count' - total number of paginated subject rows
  const { isLoading, papers: rows, count } = usePPapers();

  // State: Which subject_codes have already been downloaded (for lock UI)
  // Set<String> where each entry is a subject_code for which download is locked
  const [downloadedSubjectCodes, setDownloadedSubjectCodes] = useState(
    new Set()
  );

  // State: Which row is currently being downloaded, for per-row loading disable
  // null or integer (row's index)
  const [currentDownloading, setCurrentDownloading] = useState(null);

  // Setup: Get mutation function and its loading state for performing download-paper action
  // 'mutate' - function to call to trigger a download record insert
  // 'isLoading' (aliased to 'isDownloading') - true while a download action is in-flight
  const { mutate: downloadPaperMutate, isLoading: isDownloading } =
    useDownloadPaper({
      onSuccess: ({ qp_file_url, subject_code }) => {
        // <<< IMMEDIATELY lock out this subject from further download
        setDownloadedSubjectCodes((prev) => {
          const next = new Set(prev);
          next.add(subject_code);
          return next;
        });
        sessionStorage.setItem("downloaded_" + subject_code, "1");
        window.open(qp_file_url, "_blank");
      },
      onError: (error, variables) => {
        // <<< ALSO lock out if duplicate error comes from backend!
        if (
          error.message &&
          error.message.includes("already downloaded") &&
          variables.subject_code
        ) {
          setDownloadedSubjectCodes((prev) => {
            const next = new Set(prev);
            next.add(variables.subject_code);
            return next;
          });
          sessionStorage.setItem("downloaded_" + variables.subject_code, "1");
        }
      },
    });

  // Effect: On mount, check sessionStorage for previously downloaded subject_codes for this session,
  // and restore that lockout state (so locked buttons stay disabled after refresh)
  useEffect(() => {
    if (!rows || rows.length === 0) return;

    // Build a new set of locked subject codes
    const restored = new Set();
    rows.forEach((row) => {
      if (sessionStorage.getItem("downloaded_" + row.subject_code)) {
        restored.add(row.subject_code);
      }
    });

    // Only update state if changed (prevent infinite loop)
    const restoredStr = Array.from(restored).sort().join(",");
    const currentStr = Array.from(downloadedSubjectCodes).sort().join(",");
    if (restoredStr !== currentStr) {
      setDownloadedSubjectCodes(restored);
    }
    // eslint-disable-next-line
  }, [rows]);

  // If papers are still loading, show a spinner (UI block)
  if (isLoading) return <Spinner />;
  // If there are no subject rows at all, show empty state UI
  if (!rows.length) return <Noexam />;

  // This function is passed to each PrincipalRow as 'onDownload'
  // It is called when a Download QP button is clicked
  // - Sets which row is being downloaded for loading UI
  // - Calls the download mutation with all required data about the paper
  function handleDownload(paper, rowIdx) {
    setCurrentDownloading(rowIdx); // Mark this row as "busy"
    downloadPaperMutate({
      principal_employee_id: "emp123", // Hardcoded for testing; should come from logged-in user!
      subject_id: paper.subject_id,
      exam_date: paper.exam_datetime, // Check that paper has correct exam_date or get from parent row!
      downloaded_paper_id: paper.id,
      subject_code: paper.subject_code,
      rowIdx, // Pass index for UI tracking (not used in backend)
      qp_file_url: paper.qp_file_url, // Used for opening file after success only
    });
  }

  // Render the table of subjects and paper download slots
  return (
    <Table columns={`1fr ${"1fr ".repeat(PAPER_SLOTS)}`.trim()}>
      <Table.Header>
        <div>Subject Code</div>
        {[...Array(PAPER_SLOTS)].map((_, idx) => (
          <div key={idx}>Paper-{idx + 1}</div>
        ))}
      </Table.Header>
      <Table.Body
        data={rows} // All subject rows processed and grouped
        render={(row, idx) => (
          <PrincipalRow
            key={idx} // Row index (useful/correct because order never changes on this page)
            row={row} // Row data (grouped subject with list of paper objects)
            rowIdx={idx} // Pass the index for loading state and lock
            PAPER_SLOTS={PAPER_SLOTS} // Number of available download slots/papers per subject row
            onDownload={handleDownload} // Called when user clicks Download QP
            downloaded={downloadedSubjectCodes.has(row.subject_code)} // Is this row locked out?
            isLoading={currentDownloading === idx && isDownloading} // Only show loading on the correct button
          />
        )}
      />
      <Table.Footer>
        <Pagination count={count} />
      </Table.Footer>
    </Table>
  );
}

// function PrincipalTable({ onDownload }) {
//   const { isLoading, papers: rows, count } = usePPapers();

//   if (isLoading) return <Spinner />;
//   if (!rows.length) return <Empty resourceName="papers" />;

//   return (
//     <Table columns={`1fr ${"1fr ".repeat(PAPER_SLOTS)}`.trim()}>
//       <Table.Header>
//         <div>Subject Code</div>
//         {[...Array(PAPER_SLOTS)].map((_, idx) => (
//           <div key={idx}>Paper-{idx + 1}</div>
//         ))}
//       </Table.Header>
//       <Table.Body
//         data={rows}
//         render={(row) => (
//           <PrincipalRow
//             key={row.id}
//             row={row}
//             onDownload={onDownload}
//             PAPER_SLOTS={PAPER_SLOTS}
//           />
//         )}
//       />
//       <Table.Footer>
//         <Pagination count={count} />
//       </Table.Footer>
//     </Table>
//   );
// }

export default PrincipalTable;
